#!/usr/bin/env bash
# Separa la voz de la música/ambiente con Demucs (IA). Deja dos pistas:
#   <salida>/voz.wav  y  <salida>/fondo.wav
# El fondo sirve para doblar (pones voz nueva encima) y la voz como muestra para clonar.
# Uso: separar_voz.sh video_o_audio salida_dir
# Requiere: pip install demucs  (la primera vez descarga el modelo, ~80 MB)
set -euo pipefail
in="$1"; outdir="$2"; mkdir -p "$outdir"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
ffmpeg -v error -y -i "$in" -vn -ac 2 -ar 44100 "$tmp/audio.wav"
python3 -m demucs --two-stems=vocals -n htdemucs -o "$tmp/sep" "$tmp/audio.wav" >/dev/null 2>&1
cp "$tmp/sep/htdemucs/audio/vocals.wav" "$outdir/voz.wav"
cp "$tmp/sep/htdemucs/audio/no_vocals.wav" "$outdir/fondo.wav"
echo "ok: $outdir/voz.wav y $outdir/fondo.wav"
