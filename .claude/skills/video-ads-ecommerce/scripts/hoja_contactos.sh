#!/usr/bin/env bash
# Crea una imagen con fotogramas del video y su marca de tiempo, para revisar
# rápido qué pasa en pantalla (textos quemados, cortes, producto) sin verlo entero.
# Uso: hoja_contactos.sh video.mp4 salida.png [cada_cuantos_segundos=1] [columnas=8]
set -euo pipefail
in="$1"; out="$2"; step="${3:-1}"; cols="${4:-8}"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
n=$(python3 -c "import math;print(max(1,math.ceil($dur/$step)))")
rows=$(( (n + cols - 1) / cols ))
font=$(fc-match -f '%{file}' 'DejaVu Sans' 2>/dev/null || echo /usr/share/fonts/truetype/dejavu/DejaVuSans.ttf)
ffmpeg -v error -y -i "$in" -vf "fps=1/$step,scale=200:-1,drawtext=fontfile=$font:text='%{pts\:hms}':fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.7,tile=${cols}x${rows}" -frames:v 1 "$out"
echo "ok: $out ($n fotogramas, ${cols}x${rows})"
