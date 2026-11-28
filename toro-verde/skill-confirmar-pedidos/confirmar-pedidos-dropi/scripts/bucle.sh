#!/bin/bash
# Deja el robot trabajando solo, aunque no haya IA disponible: repite la vuelta liviana cada 30 minutos (de 5 a. m. a 9 p. m.).
# Uso: setsid nohup bash robot/bucle.sh >/dev/null 2>&1 &     Para detenerlo: kill $(cat /tmp/robot/bucle.pid)
# Cada cuánto: variable BUCLE_MIN (minutos, por defecto 30).
S="$(cd "$(dirname "$0")/.." && pwd)"; echo $$ > /tmp/robot/bucle.pid
while true; do
  bash "$S/robot/vuelta_liviana.sh" >> /tmp/robot/bucle.log 2>&1
  echo "--- $(TZ=America/Bogota date '+%d-%m %H:%M') fin de vuelta" >> /tmp/robot/bucle.log
  sleep $(( ${BUCLE_MIN:-30} * 60 ))
done
