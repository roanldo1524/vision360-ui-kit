#!/bin/bash
# Robot de despacho (v2): lee Dropi → razona con el chat de Lucid y las reglas de Ronald → edita (precio/transportadora) → confirma → etiqueta lo demás.
cd "$(dirname "$0")/.." || exit 1
(cd /tmp/dropi && node detalle.js) | tail -1 | tee /tmp/dropi/ultimo.txt
grep -q SESION_DROPI_CAIDA /tmp/dropi/ultimo.txt && { echo "SESION_DROPI_CAIDA"; exit 2; }
python3 -I -c "import json;open('robot/contactos_dropi.txt','w').write('\n'.join('57'+d['phone'] for d in json.load(open('/tmp/dropi/detalle.json'))))"
timeout 1200 python3 -W ignore -I robot/decidir.py --contactos robot/contactos_dropi.txt | head -1
python3 -I robot/razonar.py | head -1
# Ediciones (precio del chat / transportadora con la que recibe): Dropi crea un ID nuevo; se confirma en la siguiente vuelta tras volver a razonar.
python3 -I -c "
import json;a=json.load(open('/tmp/dropi/acciones.json'))
for x in a:
  if x['accion']=='EDITAR_Y_CONFIRMAR': print(x['id'],x['editar'].get('precio',''),x['editar'].get('transportadora',''))" | while read id precio trans; do
  r=$(cd /tmp/dropi && node ui_editar3.js "$id" "$precio" "$trans" guardar 2>&1 | grep -E "CHEQUEO|NO_GUARDO|API POST 200 https://api.dropi.co/api/orders/myorders " | cut -c1-160); echo "$r"
  echo "$r" | grep -q NO_GUARDO && echo "$id" >> /tmp/dropi/no_editados.txt; done
# Si no se pudo editar (la transportadora no llega allá o el flete pasa de $27.000), va a revisión humana.
[ -s /tmp/dropi/no_editados.txt ] && (cd /tmp/dropi && sort -u no_editados.txt > ne.txt && node etiq_lote.js ne.txt 93484 && rm -f no_editados.txt)
python3 -I -c "
import json,os
a=json.load(open('/tmp/dropi/acciones.json'));E='/tmp/dropi/etiquetados.json'
ya=set(json.load(open(E))) if os.path.exists(E) else set()
plan={'confirmar':[{'id':x['id'],'n':x['nombre']} for x in a if x['accion']=='CONFIRMAR'],'etiquetar':[{'id':x['id'],'motivo':x['motivo']} for x in a if x['accion']=='REVISAR' and x['id'] not in ya],'revisar_total':[x for x in a if x['accion']=='REVISAR']}
json.dump(plan,open('/tmp/dropi/plan.json','w'),ensure_ascii=False);json.dump(sorted(ya|{x['id'] for x in a if x['accion']=='REVISAR'}),open(E,'w'))
print('PLAN confirmar',len(plan['confirmar']),'etiquetar_nuevos',len(plan['etiquetar']),'revisar_total',len(plan['revisar_total']))"
python3 -I robot/aclarar.py
(cd /tmp/dropi && node confirmar.js) | awk -F' \\| ' '{print $1}' | sort | uniq -c
