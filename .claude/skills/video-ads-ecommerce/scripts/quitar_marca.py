#!/usr/bin/env python3
"""Quita marcas de agua, logos o textos fijos de un video (también los que saltan de
posición, como el de TikTok, que cambia de esquina a mitad del video).

Úsalo con material propio o con permiso (videos de tu proveedor, tus versiones viejas,
tu propio logo). Quitar la marca de agua de un video ajeno no te da derecho a usarlo:
ver references/cumplimiento.md.

Detección automática: busca bordes que se quedan quietos mientras el resto del video
cambia, por ventanas de tiempo, en las franjas superior/inferior y laterales.
Métodos para borrar:
  delogo   interpola los píxeles de alrededor (rápido, bueno para marcas pequeñas)
  blur     desenfoque fuerte de la zona (para marcas grandes o sobre fondos con textura)
  recorte  hace un zoom mínimo que saca la marca del encuadre (si está pegada al borde)

Uso:
  python3 quitar_marca.py video.mp4 salida.mp4                 (auto + delogo)
  python3 quitar_marca.py video.mp4 salida.mp4 --metodo blur
  python3 quitar_marca.py video.mp4 salida.mp4 --zona 20,40,220,70 [--zona x,y,w,h,t0,t1 ...]
  python3 quitar_marca.py video.mp4 - --solo-detectar          (muestra las zonas, no edita)
Revisa SIEMPRE un fotograma del resultado: la detección automática puede fallar en
videos con cámara fija (todo está quieto) o marcas muy transparentes; ahí usa --zona.
"""
import argparse, json, subprocess, sys
import numpy as np

def info(v):
    o = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height:format=duration", "-of", "json", v], capture_output=True, text=True).stdout)
    return o["streams"][0]["width"], o["streams"][0]["height"], float(o["format"]["duration"])

def fotogramas(v, t0, t1, n, w):
    """n fotogramas en gris, reducidos a ancho w, entre t0 y t1."""
    W, H, _ = info(v); h = int(H * w / W) // 2 * 2
    fps = n / max(0.5, t1 - t0)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.2f}", "-t", f"{t1 - t0:.2f}", "-i", v, "-vf",
                          f"fps={fps:.3f},scale={w}:{h},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8)
    k = len(fr) // (w * h)
    return fr[: k * w * h].reshape(k, h, w).astype(np.float32), h

def bordes(f):
    gx = np.abs(np.diff(f, axis=1, prepend=f[:, :1])); gy = np.abs(np.diff(f, axis=0, prepend=f[:1, :]))
    return gx + gy

def detectar(v, ventana=3.0, w=360, paso=1.0):
    from scipy import ndimage
    W, H, D = info(v); zonas = []
    esc = W / w
    t = 0.0
    while t < D - 0.3:
        t1 = min(D, t + ventana)
        fr, h = fotogramas(v, t, t1, 12, w)
        if len(fr) < 4: break
        E = np.stack([bordes(f) for f in fr])
        persistente = (E > 18).mean(0) > 0.85          # borde presente casi siempre
        quieto = fr.std(0) < 10                          # píxel que casi no cambia
        cambia = fr.std(0).mean() > 6                    # la escena sí se mueve
        m = persistente & quieto
        # las marcas viven en franjas arriba/abajo (no en el centro, donde van textos del anuncio)
        banda = np.zeros_like(m); bh = int(h * 0.22)
        banda[:bh] = banda[-bh:] = True
        m &= banda
        m = ndimage.binary_dilation(m, iterations=3)
        lab, n = ndimage.label(m)
        if cambia:
            for sl in ndimage.find_objects(lab):
                y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
                area = (y1 - y0) * (x1 - x0)
                if area < 40 or area > 0.08 * w * h: continue
                zonas.append(dict(x=int(x0 * esc) - 6, y=int(y0 * esc) - 6, w=int((x1 - x0) * esc) + 12,
                                  h=int((y1 - y0) * esc) + 12, start=round(t, 2), end=round(t1, 2)))
        if t1 >= D: break
        t += paso
    # unir zonas iguales de ventanas seguidas (se traslapan)
    res = []
    for z in zonas:
        for r in res:
            if abs(r["x"] - z["x"]) < 40 and abs(r["y"] - z["y"]) < 40 and z["start"] - r["end"] < 0.1:
                x1 = max(r["x"] + r["w"], z["x"] + z["w"]); y1 = max(r["y"] + r["h"], z["y"] + z["h"])
                r["x"] = min(r["x"], z["x"]); r["y"] = min(r["y"], z["y"])
                r["w"] = x1 - r["x"]; r["h"] = y1 - r["y"]; r["end"] = max(r["end"], z["end"]); break
        else:
            res.append(dict(z))
    for z in res:  # dentro del cuadro
        z["x"] = max(1, z["x"]); z["y"] = max(1, z["y"])
        z["w"] = min(z["w"], W - z["x"] - 1); z["h"] = min(z["h"], H - z["y"] - 1)
    # descartar apariciones de menos de 1.5 s (suelen ser textos del propio anuncio)
    return [z for z in res if z["end"] - z["start"] >= 1.5]

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video"); ap.add_argument("salida")
    ap.add_argument("--zona", action="append", default=[], help="x,y,w,h[,t0,t1] en píxeles del video")
    ap.add_argument("--metodo", default="delogo", choices=["delogo", "blur", "recorte"])
    ap.add_argument("--solo-detectar", action="store_true")
    a = ap.parse_args()
    W, H, D = info(a.video)
    if a.zona:
        zonas = []
        for z in a.zona:
            p = [float(x) for x in z.split(",")]
            zonas.append(dict(x=int(p[0]), y=int(p[1]), w=int(p[2]), h=int(p[3]),
                              start=p[4] if len(p) > 4 else 0, end=p[5] if len(p) > 5 else D))
    else:
        zonas = detectar(a.video)
    print("zonas:", json.dumps(zonas))
    if a.solo_detectar or not zonas:
        if not zonas: print("No detecté marcas. Si la ves, pásala con --zona x,y,w,h (mídela con hoja_contactos.sh).")
        return
    if a.metodo == "recorte":
        # zoom mínimo para que todas las zonas queden fuera del cuadro, manteniendo el centro
        m = 0.0
        for z in zonas:
            m = max(m, min(z["x"] + z["w"], W - z["x"]) / W if z["x"] < W * 0.3 or z["x"] + z["w"] > W * 0.7 else 0,
                    min(z["y"] + z["h"], H - z["y"]) / H if z["y"] < H * 0.25 or z["y"] + z["h"] > H * 0.75 else 0)
        f = 1 / max(0.5, 1 - 2 * m)
        if f > 1.35: print(f"aviso: el recorte necesario es grande ({f:.2f}x); mejor usa --metodo delogo o blur")
        vf = f"scale=iw*{f:.3f}:-2,crop={W}:{H}"
    else:
        vf, cur, partes = "", "0:v", []
        for i, z in enumerate(zonas):
            en = f"enable='between(t,{z['start']},{z['end']})'"
            if a.metodo == "delogo":
                partes.append(f"delogo=x={z['x']}:y={z['y']}:w={z['w']}:h={z['h']}:{en}")
            else:
                lr = max(2, min(30, z["h"] // 2 - 1)); cr = max(1, min(15, z["h"] // 4 - 1))
                partes.append(None)
                vf += (f"[{cur}]split[m{i}][c{i}];[c{i}]crop={z['w']}:{z['h']}:{z['x']}:{z['y']},boxblur={lr}:4:{cr}:4[b{i}];"
                       f"[m{i}][b{i}]overlay={z['x']}:{z['y']}:{en}[o{i}];"); cur = f"o{i}"
        if a.metodo == "delogo":
            vf = ",".join(partes)
        else:
            vf = vf + f"[{cur}]null"
    sub = ["-vf", vf] if a.metodo != "blur" else ["-filter_complex", vf.rstrip(";") + "[out]", "-map", "[out]", "-map", "0:a?"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, *sub, "-c:v", "libx264", "-preset", "medium",
                    "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", a.salida], check=True)
    print("ok:", a.salida)

if __name__ == "__main__":
    main()
