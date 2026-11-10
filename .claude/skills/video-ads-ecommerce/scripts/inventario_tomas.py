#!/usr/bin/env python3
"""Inventario de tomas para videos "Frankenstein": de varios videos saca cada toma (plano)
por separado, con lo que se dice en ella, y una hoja numerada para elegir cuáles usar.

Salida en la carpeta destino:
  tomas/t001.mp4 ...        cada toma sin audio, lista para editar_auto.py montaje --en-orden
  inventario.json           [{id, origen, ini, fin, dur, texto, archivo}]
  hoja_tomas.png            miniaturas numeradas (abre esta imagen para elegir tomas)

Luego: escribe el guion nuevo, elige las tomas por número que ilustran cada frase y arma con
  python3 editar_auto.py montaje --clips tomas/t004.mp4 tomas/t011.mp4 ... --en-orden --voz ...

Uso: python3 inventario_tomas.py salida/ video1.mp4 video2.mp4 ... [--umbral 0.30] [--min 0.6] [--sin-texto]
"""
import argparse, json, os, re, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout or 0)

def cambios_de_plano(v, umbral):
    out = subprocess.run(["ffmpeg", "-i", v, "-vf", f"select='gt(scene,{umbral})',showinfo", "-an", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return [float(m) for m in re.findall(r"pts_time:([\d.]+)", out)]

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("salida"); ap.add_argument("videos", nargs="+")
    ap.add_argument("--umbral", type=float, default=0.30, help="sensibilidad de cambio de plano (0.2-0.4)")
    ap.add_argument("--min", type=float, default=0.6, help="duración mínima de una toma")
    ap.add_argument("--max", type=float, default=6.0, help="tomas más largas se parten")
    ap.add_argument("--sin-texto", action="store_true", help="no transcribir (más rápido)")
    a = ap.parse_args()
    os.makedirs(os.path.join(a.salida, "tomas"), exist_ok=True)
    trans = {}
    if not a.sin_texto:
        sys.path.insert(0, AQUI)
        from transcribir import cargar_audio
        from faster_whisper import WhisperModel
        from comun import whisper_opciones
        dev, ct, mod = whisper_opciones()
        m = WhisperModel(mod, device=dev, compute_type=ct)
        for v in a.videos:
            segs, _ = m.transcribe(cargar_audio(v), vad_filter=True)
            trans[v] = [(s.start, s.end, s.text.strip()) for s in segs]
    inv, n = [], 0
    for v in a.videos:
        D = dur(v); cortes = [0.0] + [c for c in cambios_de_plano(v, a.umbral) if 0.2 < c < D - 0.2] + [D]
        tramos = []
        for s, e in zip(cortes, cortes[1:]):
            while e - s > a.max: tramos.append((s, s + a.max / 2)); s += a.max / 2
            if e - s >= a.min: tramos.append((s, e))
        for s, e in tramos:
            n += 1; tid = f"t{n:03d}"; f = os.path.join(a.salida, "tomas", tid + ".mp4")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.3f}", "-t", f"{e - s:.3f}", "-i", v, "-an",
                            "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-x264-params", "no-info=1",
                            "-fflags", "+bitexact", "-flags:v", "+bitexact", f], check=True)
            texto = " ".join(t for (a0, a1, t) in trans.get(v, []) if a0 < e and a1 > s)
            inv.append(dict(id=tid, origen=os.path.basename(v), ini=round(s, 2), fin=round(e, 2), dur=round(e - s, 2),
                            texto=texto, archivo=os.path.relpath(f, a.salida)))
    json.dump(inv, open(os.path.join(a.salida, "inventario.json"), "w"), ensure_ascii=False, indent=1)
    # hoja numerada: un fotograma del medio de cada toma
    cols = 6; filas = (len(inv) + cols - 1) // cols
    sys.path.insert(0, AQUI)
    from comun import ff_ruta, fuente_texto
    font = "'" + ff_ruta(fuente_texto()) + "'"
    lista = []
    for t in inv:
        img = os.path.join(a.salida, "tomas", t["id"] + ".jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t['dur'] / 2:.2f}", "-i", os.path.join(a.salida, t["archivo"]),
                        "-frames:v", "1", "-vf", f"scale=180:320:force_original_aspect_ratio=increase,crop=180:320,"
                        f"drawtext=fontfile={font}:text='{t['id']} {t['dur']:.1f}s':fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.7:x=4:y=4",
                        img], check=True)
        lista.append(img)
    if lista:
        negro = os.path.join(a.salida, "tomas", "_vacio.jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=black:s=180x320", "-frames:v", "1", negro], check=True)
        lista += [negro] * (cols * filas - len(lista))
        args = sum([["-i", x] for x in lista], [])
        fc = "".join(f"[{i}:v]" for i in range(len(lista)))
        fc += f"xstack=inputs={len(lista)}:layout=" + "|".join(f"{(i % cols) * 180}_{(i // cols) * 320}" for i in range(len(lista))) + "[o]"
        if len(lista) == 1: fc = "[0:v]null[o]"
        subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", fc, "-map", "[o]", "-frames:v", "1",
                        os.path.join(a.salida, "hoja_tomas.png")], check=True)
    print(f"ok: {len(inv)} tomas de {len(a.videos)} videos → {a.salida}/inventario.json y hoja_tomas.png")
    for t in inv: print(f"  {t['id']} {t['origen'][:30]:30s} {t['ini']:6.2f}-{t['fin']:6.2f}  {t['texto'][:70]}")

if __name__ == "__main__":
    main()
