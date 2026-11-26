#!/bin/bash
# Ronald 25-11: el robot sigue trabajando aunque se acabe el cupo de IA. Corre la vuelta cada 15 min de 5 a 9 a. m. y cada hora hasta las 9 p. m. SIN Claude:
# las reglas confirman lo seguro y lo dudoso pasa a Karen a las 2 h si la IA no lo revisa. Uso: setsid nohup bash robot/bucle.sh &
S="$(cd "$(dirname "$0")/.." && pwd)"; echo $$ > /tmp/robot/bucle.pid
while true; do
  bash "$S/robot/vuelta_liviana.sh" >> /tmp/robot/bucle.log 2>&1
  # Equipo de tecnología: salud del sistema y pantallas al día en cada vuelta (las páginas se publican en la vuelta de los :19)
  R=/home/user/vision360-ui-kit/toro-verde/robot-despacho; V=/tmp/claude-0/-home-user-vision360-ui-kit/e5356e22-aa29-59c6-b4c4-4ff8cf2bcd7f/scratchpad/visual
  H=$(TZ=America/Bogota date +%H)
  if [ "$H" -ge 5 ] && [ "$H" -lt 21 ]; then (cd /tmp/dropi && timeout 400 node hoy.js >/dev/null 2>&1); fi
  # Ronald 26-11: «el CAS es prioridad, automático, sin consumo agresivo de tokens»: agente del CAS en código cada 2 h de 8 a. m. a 6 p. m.
  if [ "$H" -ge 8 ] && [ "$H" -le 18 ] && [ $((10#$H % 2)) -eq 0 ] && [ "$(cat /tmp/dropi/cas_auto.hora 2>/dev/null)" != "$(date +%F)-$H" ]; then
    echo "$(date +%F)-$H" > /tmp/dropi/cas_auto.hora
    (cd /tmp/dropi && cp $R/cas_auto.py $R/cas_hilos.js . && timeout 600 node cas_bandeja.js >/dev/null 2>&1 && python3 -I $R/cas_conversar.py >/dev/null 2>&1 && timeout 1800 python3 -I cas_auto.py --enviar --max 25 >> /tmp/robot/cas_auto.log 2>&1)
  fi
  # Rastreo humanizado al cliente (sin IA)
  # Ronald 26-11: Lucid ya avisa por estado; rastreo.py solo INSISTE (2 y 4 días en oficina sin que el cliente responda).
  if [ "$H" -ge 7 ] && [ "$H" -lt 20 ]; then (cd /tmp/dropi && cp $R/dropi/oficina_desde.js . && timeout 1500 python3 -I $R/rastreo.py --enviar >> /tmp/robot/rastreo.log 2>&1); fi
  # Ronald 26-11: WhatsApp del equipo (310 846 7560, grupo «Comprobantes de Pago CDR»): si el servidor se reinició, se vuelve a encender solo
  cp $R/abonos.py /tmp/wa/ 2>/dev/null
  # Ronald 26-11: todo comprobante sin confirmar va al grupo; el equipo aprueba y el robot despacha (abonos.py)
  if [ "$H" -ge 6 ] && [ "$H" -lt 21 ] && [ -f /tmp/wa/auth/creds.json ]; then timeout 600 python3 -I $R/comprobantes_pend.py --enviar >> /tmp/robot/comprobantes.log 2>&1; (cd /tmp/wa && timeout 300 python3 -I abonos.py --enviar >> /tmp/robot/comprobantes.log 2>&1); fi
  if [ -f /tmp/wa/auth/creds.json ] && ! kill -0 $(cat /tmp/wa/wa.pid 2>/dev/null) 2>/dev/null; then (cd /tmp/wa && cp $R/whatsapp/wa_grupo.js . && setsid nohup node wa_grupo.js >> wa.log 2>&1 < /dev/null & echo $! > /tmp/wa/wa.pid); fi
  python3 -I $R/salud.py >/dev/null 2>&1
  mkdir -p $V && python3 -I $R/panel/generar_panel.py $V/robot-despacho.html >/dev/null 2>&1
  (cd $R/panel && python3 -I generar_torre.py $V/sede.html sede.html >/dev/null 2>&1)
  echo "--- $(TZ=America/Bogota date '+%d-%m %H:%M') fin de vuelta" >> /tmp/robot/bucle.log
  # Ronald 26-11: «a las 9 a. m. todo confirmado»: cada 15 min de 5 a 9 a. m.; después, cada 30 min (Ronald 26-11 1 p. m.: «veo que estás confirmando pocas»)
  if [ "$(TZ=America/Bogota date +%-H)" -lt 9 ]; then sleep 900; else sleep 1800; fi
done
