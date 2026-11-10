#!/usr/bin/env python3
"""Quema subtítulos estilo anuncio (TikTok/Reels) en un video.

Estilos:
  palabras  - bloques cortos de 2-4 palabras en MAYÚSCULAS, centrados (estilo Hormozi/UGC viral)
  frase     - frase completa abajo con borde (más sobrio, para testimonios largos)
  caja      - texto blanco sobre caja negra semitransparente (tapa texto viejo, muy legible)

También puede TAPAR texto quemado del original (ej. textos en inglés) con un
desenfoque en una zona y poner encima el texto nuevo: usa --tapar con un JSON
[{"x":50,"y":150,"w":260,"h":70,"start":0,"end":3,"text":"Texto nuevo","size":16}]
(coordenadas en píxeles del video real; mídelas con hoja_contactos.sh).

Uso: python3 subtitulos.py video.mp4 segmentos.json salida.mp4 [--estilo palabras]
       [--fuente Montserrat|Anton] [--color FFFFFF] [--resaltado 00E5FF] [--pos 0.62] [--tapar zonas.json]
--pos = altura del texto (0 arriba, 1 abajo). Deja libres los bordes: arriba ~12% y
abajo ~20% los tapan los botones de Reels/TikTok.
"""
import argparse, json, os, subprocess

def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def bgr(hexrgb, alpha="00"):
    r, g, b = hexrgb[0:2], hexrgb[2:4], hexrgb[4:6]
    return f"&H{alpha}{b}{g}{r}".upper()

def trocear(seg, n):
    w = seg["text"].split()
    trozos = [" ".join(w[i:i + n]) for i in range(0, len(w), n)] or [""]
    tot = sum(len(c) + 1 for c in trozos); t = seg["start"]; out = []
    for c in trozos:
        d = (seg["end"] - seg["start"]) * (len(c) + 1) / tot
        out.append((t, t + d, c)); t += d
    return out

def dims(video):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height", "-of", "csv=p=0", video], capture_output=True, text=True).stdout
    w, h = o.strip().split(",")[:2]; return int(w), int(h)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("segmentos"); ap.add_argument("salida")
    ap.add_argument("--estilo", default="palabras", choices=["palabras", "frase", "caja"])
    ap.add_argument("--fuente", default="Montserrat")
    ap.add_argument("--color", default="FFFFFF")
    ap.add_argument("--resaltado", default=None, help="color hex para resaltar 1 de cada 3 bloques")
    ap.add_argument("--pos", type=float, default=None)
    ap.add_argument("--tamano", type=float, default=None, help="tamaño relativo al ancho (por defecto según estilo)")
    ap.add_argument("--tapar", default=None)
    ap.add_argument("--crf", default="18")
    a = ap.parse_args()
    W, H = dims(a.video)
    segs = json.load(open(a.segmentos)) if a.segmentos != "-" else []
    size = int(W * (a.tamano or {"palabras": 0.075, "frase": 0.05, "caja": 0.045}[a.estilo]))
    pos = a.pos if a.pos is not None else {"palabras": 0.55, "frase": 0.74, "caja": 0.74}[a.estilo]
    bold = -1
    border = 1 if a.estilo != "caja" else 3
    outline = max(2, size // 9) if a.estilo != "caja" else max(4, size // 4)
    back = "&H00000000" if a.estilo != "caja" else "&H50000000"
    oc = "&H00000000" if a.estilo != "caja" else "&H50000000"
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,{a.fuente},{size},{bgr(a.color)},{bgr(a.color)},{oc},{back},{bold},0,0,0,100,100,0,0,{border},{outline},{0 if a.estilo=='caja' else 2},5,{int(W*0.07)},{int(W*0.07)},0,1
Style: Tapa,{a.fuente},{int(W*0.045)},&H00FFFFFF,&H00FFFFFF,&H50000000,&H50000000,-1,0,0,0,100,100,0,0,3,{max(4,int(W*0.012))},0,5,10,10,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    x, y = W // 2, int(H * pos)
    pop = r"{\fscx80\fscy80\t(0,90,\fscx105\fscy105)\t(90,160,\fscx100\fscy100)}"  # efecto "pop" al entrar
    for s in segs:
        if a.estilo == "palabras":
            for i, (t0, t1, c) in enumerate(trocear(s, 3)):
                col = r"{\c" + bgr(a.resaltado) + "}" if a.resaltado and i % 3 == 1 else ""
                ev.append(f"Dialogue: 0,{ts(t0)},{ts(t1)},Sub,,0,0,0,,{{\\pos({x},{y})}}{pop}{col}{c.upper()}")
        else:
            ev.append(f"Dialogue: 0,{ts(s['start'])},{ts(s['end'])},Sub,,0,0,0,,{{\\pos({x},{y})}}{s['text']}")
    zonas = json.load(open(a.tapar)) if a.tapar else []
    for z in zonas:
        if z.get("text"):
            fs = r"{\fs" + str(int(z["size"] * W / 360)) + "}" if z.get("size") else ""
            ev.append(f"Dialogue: 1,{ts(z['start'])},{ts(z['end'])},Tapa,,0,0,0,,{{\\pos({z['x']+z['w']//2},{z['y']+z['h']//2})}}{fs}{z['text']}")
    ass = os.path.splitext(a.salida)[0] + ".ass"
    open(ass, "w").write(hdr + "\n".join(ev) + "\n")
    fg = "[0:v]null[v0]"
    for i, z in enumerate(zonas):
        lr = max(1, min(20, z["h"] // 2 - 1)); cr = max(1, min(10, z["h"] // 4 - 1))
        fg += (f";[v{i}]split[m{i}][c{i}];[c{i}]crop={z['w']}:{z['h']}:{z['x']}:{z['y']},"
               f"boxblur=lr={lr}:lp=4:cr={cr}:cp=4[b{i}];[m{i}][b{i}]overlay={z['x']}:{z['y']}:"
               f"enable='between(t,{z['start']},{z['end']})'[v{i+1}]")
    fonts = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "fonts")
    fg += f";[v{len(zonas)}]ass={ass}:fontsdir={fonts}[out]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-filter_complex", fg, "-map", "[out]",
                    "-map", "0:a?", "-c:v", "libx264", "-preset", "medium", "-crf", a.crf, "-pix_fmt", "yuv420p",
                    "-c:a", "copy", "-movflags", "+faststart", a.salida], check=True)
    print(f"ok: {a.salida}  (subtítulos editables en {ass})")

if __name__ == "__main__":
    main()
