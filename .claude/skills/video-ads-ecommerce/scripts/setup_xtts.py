#!/usr/bin/env python3
"""Instala XTTS-v2 (voz IA local, gratis, clona voces) en un entorno aparte, porque necesita
versiones fijas de torch/torchaudio que chocan con otras librerías. Una sola vez.
Descarga ~1 GB de librerías y, al primer uso, ~1.8 GB de modelo.
Uso: python3 setup_xtts.py        (con NVIDIA: python3 setup_xtts.py --cuda)
"""
import os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import python_venv, leer_config, guardar_config

def main():
    cuda = "--cuda" in sys.argv
    venv = os.environ.get("XTTS_VENV", os.path.join(os.path.expanduser("~"), ".xtts-venv"))
    py = python_venv(venv)
    if not os.path.exists(py):
        subprocess.run([sys.executable, "-m", "venv", venv], check=True)
    pip = [py, "-m", "pip", "install", "-q"]
    subprocess.run(pip + ["--upgrade", "pip"], check=True)
    idx = "https://download.pytorch.org/whl/cu126" if cuda else "https://download.pytorch.org/whl/cpu"
    subprocess.run(pip + ["torch==2.8.0", "torchaudio==2.8.0", "--index-url", idx], check=True)
    subprocess.run(pip + ["coqui-tts", "transformers<4.57"], check=True)
    subprocess.run([py, "-c", "import TTS, torch; print('XTTS listo. torch', torch.__version__, 'GPU:', torch.cuda.is_available())"], check=True)
    c = leer_config(); c["xtts_python"] = py; guardar_config(c)
    print("Guardado en la configuración:", py)

if __name__ == "__main__":
    main()
