#!/usr/bin/env python3
"""Adapta un video a otro formato sin deformarlo: queda centrado y el espacio sobrante se
rellena con el mismo video desenfocado.
Uso: python3 reformatear.py entrada.mp4 salida.mp4 formato
  formato: 9x16 (1080x1920 Reels/TikTok/Stories) | 4x5 (1080x1350 feed) | 1x1 (1080x1080) | 16x9 (1920x1080)
"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import codificador, limpiar_metadatos

MEDIDAS = {"9x16": (1080, 1920), "4x5": (1080, 1350), "1x1": (1080, 1080), "16x9": (1920, 1080)}

def reformatear(entrada, salida, formato, modo="final"):
    W, H = MEDIDAS[formato]
    fc = (f"[0:v]split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=25:2,"
          f"eq=brightness=-0.08[bg];[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];"
          f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", entrada, "-filter_complex", fc, "-map", "[v]", "-map", "0:a?",
                    *codificador(modo), "-c:a", "aac", "-b:a", "192k", "-fflags", "+bitexact", "-flags:v", "+bitexact",
                    "-flags:a", "+bitexact", "-movflags", "+faststart", salida], check=True)
    limpiar_metadatos(salida)

def main():
    if len(sys.argv) < 4 or sys.argv[3] not in MEDIDAS: sys.exit(__doc__)
    reformatear(*sys.argv[1:4]); print(f"ok: {sys.argv[2]} ({sys.argv[3]})")

if __name__ == "__main__":
    main()
