#!/usr/bin/env bash
# Limpia metadatos de uno o varios videos sin recodificar (rápido, sin pérdida).
# Quita: etiquetas de formato y pista, capítulos, nombre del codificador y la
# información SEI que x264/otros encoders esconden dentro del video.
# Uso: limpiar_metadatos.sh entrada.mp4 [salida.mp4]
#      limpiar_metadatos.sh carpeta/   (limpia todos los .mp4/.mov en sitio)
set -euo pipefail
limpiar() {
  local in="$1" out="$2" tmp
  tmp="$(dirname "$out")/.tmp_$$_$(basename "$out")"
  local bsf=()
  # filter_units solo aplica a H.264/H.265 (SEI = tipo 6 en H.264, 39/40 en HEVC)
  case "$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$in")" in
    h264) bsf=(-bsf:v filter_units=remove_types=6) ;;
    hevc) bsf=(-bsf:v filter_units=remove_types=39\|40) ;;
  esac
  ffmpeg -v error -y -i "$in" -map 0:v? -map 0:a? -c copy "${bsf[@]}" \
    -map_metadata -1 -map_chapters -1 \
    -metadata:s:v encoder= -metadata:s:v handler_name= -metadata:s:a handler_name= \
    -fflags +bitexact -flags:v +bitexact -flags:a +bitexact -movflags +faststart "$tmp"
  mv "$tmp" "$out"
  local rest
  rest=$(strings "$out" | grep -c -i -E 'x264 - core|lavf[0-9]|lavc[0-9]|h264_fbv|com\.apple|android' || true)
  echo "limpio: $out (rastros encontrados: $rest)"
}
if [[ -d "${1:-}" ]]; then
  shopt -s nullglob nocaseglob
  for f in "$1"/*.mp4 "$1"/*.mov; do limpiar "$f" "$f"; done
else
  limpiar "$1" "${2:-$1}"
fi
