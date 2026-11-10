#!/usr/bin/env bash
# Adapta un video a otro formato de anuncio sin deformarlo: el video queda centrado
# y el espacio sobrante se rellena con una versión desenfocada del mismo video.
# Uso: reformatear.sh entrada.mp4 salida.mp4 formato
#   formato: 9x16 (1080x1920 Reels/TikTok/Stories) | 4x5 (1080x1350 feed) | 1x1 (1080x1080) | 16x9 (1920x1080 YouTube)
set -euo pipefail
in="$1"; out="$2"
case "$3" in
  9x16) W=1080; H=1920 ;; 4x5) W=1080; H=1350 ;; 1x1) W=1080; H=1080 ;; 16x9) W=1920; H=1080 ;;
  *) echo "formato no válido: $3"; exit 1 ;;
esac
ffmpeg -v error -y -i "$in" -filter_complex \
 "[0:v]split[a][b];[a]scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,boxblur=25:2,eq=brightness=-0.08[bg];[b]scale=$W:$H:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]" \
 -map "[v]" -map 0:a? -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$out"
echo "ok: $out (${W}x${H})"
