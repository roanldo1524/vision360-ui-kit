#!/usr/bin/env python3
"""Separa la voz de la música/ambiente con Demucs (IA, local, gratis). Deja:
  <salida>/voz.wav    (sirve como muestra para clonar la voz o revisar lo que dice)
  <salida>/fondo.wav  (música y ambiente sin voz: base para doblar)
También sirve para sacar la música de un video de referencia (usa fondo.wav).
Uso: python3 separar_voz.py video_o_audio carpeta_salida
Requiere: pip install demucs (la primera vez descarga el modelo, ~80 MB). Con NVIDIA va más rápido.
"""
import os, shutil, subprocess, sys, tempfile

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    ent, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp()
    try:
        wav = os.path.join(tmp, "audio.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", ent, "-vn", "-ac", "2", "-ar", "44100", wav], check=True)
        r = subprocess.run([sys.executable, "-m", "demucs", "--two-stems=vocals", "-n", "htdemucs", "-o",
                            os.path.join(tmp, "sep"), wav], capture_output=True, text=True)
        if r.returncode != 0: sys.exit("Demucs falló:\n" + r.stderr[-1500:])
        base = os.path.join(tmp, "sep", "htdemucs", "audio")
        shutil.copy(os.path.join(base, "vocals.wav"), os.path.join(out, "voz.wav"))
        shutil.copy(os.path.join(base, "no_vocals.wav"), os.path.join(out, "fondo.wav"))
        print(f"ok: {os.path.join(out, 'voz.wav')} y {os.path.join(out, 'fondo.wav')}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

if __name__ == "__main__":
    main()
