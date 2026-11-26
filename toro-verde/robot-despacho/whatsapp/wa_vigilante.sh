#!/bin/bash
# Mantiene vivo el WhatsApp del equipo: si wa_grupo.js se cae (desconexión 428 de WhatsApp), lo vuelve a encender en 5 s.
cd /tmp/wa; echo $$ > /tmp/wa/vigilante.pid
while true; do
  node wa_grupo.js >> wa.log 2>&1 < /dev/null
  echo "$(date -u +%FT%T) SALIO codigo=$? → reinicio en 5 s" >> wa.log; sleep 5
done
