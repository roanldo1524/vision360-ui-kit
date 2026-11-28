#!/bin/bash
# Vuelta diaria de DEVOLUCIONES INJUSTIFICADAS (Ronald 23-11: «analizarlas y que se nos exonere el costo del envío»).
# Lee las devoluciones de los últimos 35 días (historial + movimientos + chat de Lucid), aplica las causales de Dropi
# (1: no atendieron la solución de la novedad; 2: nunca hubo novedad / un solo intento; plazo 7 días Interrapidísimo, 30 las demás),
# llena el Excel de Dropi y crea el ticket «Dev_injustificadas» en el chat de soporte. Cada guía se reclama una sola vez.
R=/home/user/vision360-ui-kit; D=$R/toro-verde/robot-despacho
exec 8>/tmp/devol.lock; flock -n 8 || { echo DEVOL_OCUPADO; exit 0; }
cd "$R" && git pull -q --no-rebase origin claude/elegant-volta-3mvkiw 2>/dev/null
mkdir -p /tmp/dropi/formato /tmp/robot/robot
cp "$D"/entrar.js "$D"/devol_detalle.js "$D"/ticket_devol.js /tmp/dropi/
cp "$D"/panel/hoy.js /tmp/dropi/hoy.js
cp "$D"/devol_chats.py "$D"/devol_analizar.py "$D"/devol_excel.py /tmp/robot/robot/
[ -f /tmp/dropi/formato/formato.xlsx ] || cp "$D"/datos/formato_guias_dropi.xlsx /tmp/dropi/formato/formato.xlsx
[ -f /tmp/dropi/devol_reg.json ] || cp "$D"/datos/devol_reg.json /tmp/dropi/ 2>/dev/null
cd /tmp/dropi
node entrar.js 2>&1 | tail -1 | grep -q SESION_OK || { echo SESION_DROPI_CAIDA; exit 1; }
DIAS=35 SALIDA=/tmp/dropi/hoy35.json timeout 900 node hoy.js 2>&1 | grep "^N "
ENTRADA=/tmp/dropi/hoy35.json timeout 1500 node devol_detalle.js 2>&1 | tail -1
cd /tmp/robot && timeout 900 python3 -I robot/devol_chats.py | tail -1
python3 -I robot/devol_analizar.py
N=$(python3 -c "import json;print(len(json.load(open('/tmp/dropi/devol_reclamos.json'))))")
if [ "$N" -gt 0 ]; then
  python3 -I robot/devol_excel.py
  T=$(cd /tmp/dropi && timeout 300 node ticket_devol.js /tmp/dropi/dev_injustificadas.xlsx); echo "$T"
  ID=$(echo "$T" | grep -o 'ID del ticket | #[0-9]*' | grep -o '[0-9]*$')
  if echo "$T" | grep -q TICKET_OK; then
    python3 - "$ID" <<'EOF'
import json, time, os, sys
R = '/tmp/dropi/devol_reg.json'; reg = json.load(open(R)) if os.path.exists(R) else {}
for x in json.load(open('/tmp/dropi/devol_reclamos.json')):
    reg[str(x['id'])] = {'ticket': sys.argv[1], 'fecha': time.time(), 'guia': x['guia'], 'dc': x['dc'], 'flete': x['flete'], 'motivo': x['motivo']}
json.dump(reg, open(R, 'w')); print('REGISTRADAS', len(reg))
EOF
  fi
fi
mkdir -p "$D"/datos && cp /tmp/dropi/devol_reg.json "$D"/datos/ 2>/dev/null; exit 0
