#!/bin/bash
# Pedidos ya confirmados (PENDIENTE, sin guía, a domicilio): si el cliente recibe más con otra transportadora
# (Envía o Interrapidísimo, más entregas y >50 %), se cambia y se vuelve a CONFIRMAR al momento (Ronald 21-11).
cd /tmp/dropi || exit 1
node buscar_conf.js >/dev/null 2>&1
python3 -I -c "
import json
for o in json.load(open('confirmados.json')):
  if o.get('status')=='PENDIENTE' and not o.get('shipping_guide') and 'OFICINA' not in (o.get('dir') or '').upper() and not any(t.get('key_base_data')==93484 for t in o.get('tags') or []):
    print(o['id'],o['phone'],(o.get('distribution_company') or {}).get('name'))" > rev_tels.txt
[ -s rev_tels.txt ] || exit 0
node huella.js $(awk '{print $2}' rev_tels.txt) >/dev/null 2>&1
python3 -I -c "
import json
h=json.load(open('huellas.json'));N={2:'ENVIA',3:'INTERRAPIDISIMO'}
for l in open('rev_tels.txt'):
  i,t,dc=l.split();x=((h.get(t) or {}).get('j') or {}).get('data') or {};bc={}
  for k in ('my_shop','other_shops'):
    for c in ((x.get('context_analysis') or {}).get(k) or {}).get('by_courier') or []:
      n=N.get(c['courier_id']);
      if n: bc.setdefault(n,[0,0]);bc[n][0]+=c['delivered'];bc[n][1]+=c['returned']
  if not bc: continue
  m=max(bc,key=lambda n:(bc[n][0],-bc[n][1]));d,r=bc[m]
  if m!=dc and d>bc.get(dc,[0,0])[0] and d/(d+r)>0.5: print(i,t,'Envia' if m=='ENVIA' else 'Interrapidisimo')" | while read id tel trans; do
  r=$(node ui_editar3.js "$id" "" "$trans" guardar </dev/null 2>&1 | grep -E "NO_GUARDO|API PUT 200")
  if echo "$r" | grep -q "API PUT 200"; then sleep 3
    nuevo=$(node reemplazo.js buscar "$tel" </dev/null | awk '$3=="PENDIENTE" && $4=="CONFIRMACION"{print $2; exit}')
    [ -n "$nuevo" ] && node editar.js "$nuevo" '{"status":"PENDIENTE"}' </dev/null | grep -q "AHORA PENDIENTE" && echo "$nuevo" > uno_ids.txt && node etiq_lote.js uno_ids.txt 93483 >/dev/null && echo "CAMBIO_Y_RECONFIRMO $id -> $nuevo $trans"
  else echo "$id" > uno_ids.txt; node etiq_lote.js uno_ids.txt 93484 >/dev/null; echo "NO_PUDO_CAMBIAR $id $trans (REVISAR HUMANO)"; fi
done
