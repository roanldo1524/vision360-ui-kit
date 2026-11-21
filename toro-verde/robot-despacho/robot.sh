#!/bin/bash
# Robot de despacho: lee Dropi, decide con los chats de Lucid, confirma lo bueno y etiqueta lo demás.
cd "$(dirname "$0")/.." || exit 1
out=$(cd /tmp/dropi && node api.js 2>&1 | grep STATUS)
echo "$out"; echo "$out" | grep -q "STATUS 200" || { echo "SESION_DROPI_CAIDA"; exit 2; }
python3 -I -c "import json;o=json.load(open('/tmp/dropi/pendientes.json'));open('robot/contactos_dropi.txt','w').write('\n'.join('57'+str(x.get('phone') or '')[-10:] for x in o))"
timeout 1200 python3 -W ignore -I robot/decidir.py --contactos robot/contactos_dropi.txt | head -1
python3 -I robot/plan.py
(cd /tmp/dropi && node confirmar.js) | awk -F' \\| ' '{print $1}' | sort | uniq -c
