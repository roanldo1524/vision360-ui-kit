#!/usr/bin/env python3
"""Una imagen con fotogramas del video y su tiempo, para revisar rápido qué pasa en pantalla
(textos quemados, cortes, producto, gancho, CTA) sin ver el video entero.
Uso: python3 hoja_contactos.py video.mp4 salida.png [cada_cuantos_segundos=1] [columnas=8]
"""
import math, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import dur, ff_ruta, fuente_texto

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    v, out = sys.argv[1], sys.argv[2]
    paso = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
    n = max(1, math.ceil(dur(v) / paso)); filas = (n + cols - 1) // cols
    vf = (f"fps=1/{paso},scale=200:-2,drawtext=fontfile='{ff_ruta(fuente_texto())}':text='%{{pts\\:hms}}':"
          f"fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.7,tile={cols}x{filas}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v, "-vf", vf, "-frames:v", "1", out], check=True)
    print(f"ok: {out} ({n} fotogramas, {cols}x{filas})")

if __name__ == "__main__":
    main()
