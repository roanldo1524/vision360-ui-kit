#!/bin/bash
# Ronald 25-11: el robot sigue trabajando aunque se acabe el cupo de IA. Corre la vuelta cada 15 min (5 a. m.–9 p. m.) SIN Claude:
# las reglas confirman lo seguro y lo dudoso pasa a Karen a las 2 h si la IA no lo revisa. Uso: setsid nohup bash robot/bucle.sh &
S="$(cd "$(dirname "$0")/.." && pwd)"; echo $$ > /tmp/robot/bucle.pid
while true; do
  bash "$S/robot/vuelta_liviana.sh" >> /tmp/robot/bucle.log 2>&1
  # Equipo de tecnología: salud del sistema y pantallas al día en cada vuelta (las páginas se publican en la vuelta de los :19)
  R=/home/user/vision360-ui-kit/toro-verde/robot-despacho; V=/tmp/claude-0/-home-user-vision360-ui-kit/e5356e22-aa29-59c6-b4c4-4ff8cf2bcd7f/scratchpad/visual
  H=$(TZ=America/Bogota date +%H)
  if [ "$H" -ge 5 ] && [ "$H" -lt 21 ]; then (cd /tmp/dropi && timeout 400 node hoy.js >/dev/null 2>&1); fi
  python3 -I $R/salud.py >/dev/null 2>&1
  mkdir -p $V && python3 -I $R/panel/generar_panel.py $V/robot-despacho.html >/dev/null 2>&1
  (cd $R/panel && python3 -I generar_torre.py $V/sede.html sede.html >/dev/null 2>&1)
  echo "--- $(TZ=America/Bogota date '+%d-%m %H:%M') fin de vuelta" >> /tmp/robot/bucle.log
  sleep 900
done
