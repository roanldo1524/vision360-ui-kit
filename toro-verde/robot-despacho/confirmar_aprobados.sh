#!/bin/bash
# Paso final después de que Claude leyó las fichas y vetó lo dudoso: confirma lo aprobado y etiqueta lo demás.
cd "$(dirname "$0")/.." && (cd /tmp/dropi && node confirmar.js) | awk -F' \\| ' '{print $1}' | sort | uniq -c
python3 -I -c "
import json,os
E='/tmp/dropi/etiquetados.json';ya=set(json.load(open(E))) if os.path.exists(E) else set()
p=json.load(open('/tmp/dropi/plan.json'));json.dump(sorted(ya|{x['id'] for x in p.get('etiquetar',[])}),open(E,'w'))"
python3 -I robot/avisar_equipo.py
python3 -I robot/notas_revisar.py 2>&1 | tail -1  # Ronald 27-11: notas en Dropi con el porqué y qué hacer de cada pedido frenado
