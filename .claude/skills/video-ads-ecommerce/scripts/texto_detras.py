#!/usr/bin/env python3
"""Texto DETRÁS de la persona o del producto (efecto "text behind subject" de CapCut/Reels).

Recorta al sujeto principal cuadro por cuadro (rembg, sin créditos ni internet después de la
primera descarga del modelo) y lo vuelve a poner ENCIMA del texto: la letra queda entre el
fondo y el sujeto. Funciona mejor con un sujeto claro (persona, producto en la mano) que tapa
parte de la letra; si el sujeto taparía casi todo el texto, el editor lo deja delante.

Uso desde código (editar_auto.py lo llama solo para el gancho y para los textos del plan con
"detras": true):
    m = mascara(video, t0, t1, salida_mask.mp4)      → video gris (blanco = sujeto)
    y = altura_sugerida(m_info, alto_texto)           → dónde poner el texto para que el sujeto lo tape un poco
Uso suelto (prueba):
    python3 texto_detras.py video.mp4 "¿TODAVÍA AFILA A MANO?" salida.mp4 [--t0 0 --t1 3] [--modelo u2net_human_seg]
Modelos: u2net (cualquier sujeto, por defecto), u2net_human_seg (personas), isnet-general-use (bordes finos, más lento).
"""
import argparse, os, subprocess, sys
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
_SES = {}


def _sesion(modelo):
    if modelo not in _SES:
        from rembg import new_session
        _SES[modelo] = new_session(modelo, providers=["CPUExecutionProvider"])
    return _SES[modelo]


def mascara(video, t0, t1, salida, modelo="u2net", fps_calc=15, ancho_calc=384, W=1080, H=1920, FPS=30):
    """Escribe un video en gris (W x H, FPS) con la máscara del sujeto entre t0 y t1.
    Devuelve dict(cobertura=máscara media 0-1 por fila (lista de H/16 valores), area=fracción del cuadro)."""
    from rembg import remove
    from PIL import Image, ImageFilter
    d = max(0.1, t1 - t0)
    h_calc = int(ancho_calc * H / W) // 2 * 2
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{d:.3f}", "-i", video, "-vf",
                          f"fps={fps_calc},scale={ancho_calc}:{h_calc}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    n = len(raw) // (ancho_calc * h_calc * 3)
    ses = _sesion(modelo)
    masks = []
    for i in range(n):
        fr = np.frombuffer(raw, np.uint8, ancho_calc * h_calc * 3, i * ancho_calc * h_calc * 3).reshape(h_calc, ancho_calc, 3)
        m = remove(Image.fromarray(fr), session=ses, only_mask=True, post_process_mask=True)
        masks.append(np.asarray(m, dtype=np.float32) / 255.0)
    if not masks:
        masks = [np.zeros((h_calc, ancho_calc), np.float32)]
    # suavizado temporal (evita que el borde "tiemble") y salida a tamaño real
    sal = []
    for i in range(len(masks)):
        vec = masks[max(0, i - 1): i + 2]
        sal.append(np.mean(vec, axis=0))
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{ancho_calc}x{h_calc}",
                          "-r", str(fps_calc), "-i", "-", "-vf",
                          f"scale={W}:{H}:flags=bicubic,gblur=sigma=2.5,fps={FPS},format=gray",
                          "-t", f"{d:.3f}", "-c:v", "libx264", "-qp", "0", "-pix_fmt", "yuv420p", salida], stdin=subprocess.PIPE)
    for m in sal:
        p.stdin.write((np.clip(m, 0, 1) * 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
    M = np.mean(sal, axis=0)
    filas = M.reshape(16, -1, M.shape[1]).mean(axis=(1, 2)) if M.shape[0] % 16 == 0 else \
        np.array([M[int(k * M.shape[0] / 16): int((k + 1) * M.shape[0] / 16)].mean() for k in range(16)])
    return dict(media=M, maximo=np.max(sal, axis=0), area=float(M.mean()), filas=filas.tolist())


def altura_sugerida(info, alto_rel=0.12, min_y=0.10, max_y=0.5):
    """Altura (0-1) del centro del texto. Regla de legibilidad: la mitad de ARRIBA de la letra
    queda libre en todo momento y el sujeto tapa solo la parte de abajo (15-60%), como en los
    reels: la cabeza/el producto "se mete" por debajo del texto. Devuelve (y, tapado) o (None, 0)
    si no hay un lugar donde se lea bien (entonces el texto va delante)."""
    M = info["media"] > 0.5; Mx = info.get("maximo", info["media"]) > 0.5; h, w = M.shape
    x0, x1 = int(w * 0.06), int(w * 0.94)
    mejor = None
    for y in np.arange(min_y, max_y + 1e-6, 0.01):
        a, b = int((y - alto_rel / 2) * h), int((y + alto_rel / 2) * h)
        m = a + int((b - a) * 0.55)
        arriba = float(Mx[max(0, a):m, x0:x1].mean())          # peor caso en el tiempo
        abajo = float(M[m:b, x0:x1].mean())
        if arriba <= 0.06 and 0.15 <= abajo <= 0.6:
            costo = abs(abajo - 0.35) + (y - min_y) * 0.2
            if mejor is None or costo < mejor[0]:
                mejor = (costo, float(y), abajo)
    return (mejor[1], mejor[2]) if mejor else (None, 0.0)


def main():
    sys.path.insert(0, AQUI)
    from comun import FONTS, codificador, ff_ruta
    from subtitulos import ts
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video"); ap.add_argument("texto"); ap.add_argument("salida")
    ap.add_argument("--t0", type=float, default=0); ap.add_argument("--t1", type=float, default=3)
    ap.add_argument("--modelo", default="u2net"); ap.add_argument("--fuente", default="Anton")
    ap.add_argument("--color", default="FFFFFF")
    a = ap.parse_args()
    W, H = 1080, 1920
    tmp = os.path.splitext(a.salida)[0]
    mk = tmp + "_mask.mp4"
    info = mascara(a.video, a.t0, a.t1, mk, a.modelo)
    y, tap = altura_sugerida(info, 0.12 if len(a.texto) <= 12 else 0.22)
    delante = y is None
    if delante:
        print("no hay un lugar donde el texto detrás se lea bien; va delante, arriba"); y = 0.18
    print(f"sujeto: {info['area']:.0%} del cuadro · texto a {y:.2f} de la altura · tapado {tap:.0%}")
    ass = tmp + "_detras.ass"
    r, g, b = a.color[0:2], a.color[2:4], a.color[4:6]
    open(ass, "w").write(f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: D,{a.fuente},{int(W*0.2)},&H00{b}{g}{r},&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,0,6,5,30,30,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,{ts(a.t0)},{ts(a.t1)},D,,0,0,0,,{{\\pos({W//2},{int(H*y)})\\fscx130\\fscy130\\t(0,160,\\fscx100\\fscy100)}}{a.texto.upper()}
""")
    fc = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30,format=yuv420p,split[a][b];"
          f"[a]ass='{ff_ruta(ass)}':fontsdir='{ff_ruta(FONTS)}'[t];"
          f"[b]trim=start={a.t0}:end={a.t1},setpts=PTS-STARTPTS[bw];[1:v]format=gray[m];"
          f"[bw][m]alphamerge,setpts=PTS+{a.t0}/TB[fg];[t][fg]overlay=eof_action=pass,format=yuv420p[o]")
    if delante: fc = fc.split(";[b]")[0].replace("split[a][b]", "null[a]") + ";[t]format=yuv420p[o]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-i", mk, "-filter_complex", fc, "-map", "[o]",
                    "-map", "0:a?", *codificador("rapido"), "-c:a", "copy", a.salida], check=True)
    print("ok:", a.salida)


if __name__ == "__main__":
    main()
