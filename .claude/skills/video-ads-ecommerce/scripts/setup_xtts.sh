#!/usr/bin/env bash
# Instala XTTS-v2 (voz IA local, gratis, clona voces) en un entorno aparte, porque
# necesita versiones fijas de torch/torchaudio que chocan con otras librerías.
# Una sola vez: bash setup_xtts.sh   (descarga ~1 GB de librerías + 1.8 GB de modelo al primer uso)
set -euo pipefail
V="${XTTS_VENV:-$HOME/.xtts-venv}"
command -v uv >/dev/null || pip install -q uv
uv venv -q -p 3.12 "$V"
VIRTUAL_ENV="$V" uv pip install -q "torch==2.8.0" "torchaudio==2.8.0" --index-url https://download.pytorch.org/whl/cpu
VIRTUAL_ENV="$V" uv pip install -q coqui-tts "transformers<4.57"
"$V/bin/python" -c "import TTS, torch; print('XTTS listo con torch', torch.__version__)"
