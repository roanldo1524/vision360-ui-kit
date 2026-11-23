#!/bin/bash
# Pedidos ya confirmados (PENDIENTE, sin guía, a domicilio): si el cliente recibe más con otra transportadora
# (Envía o Interrapidísimo, más entregas y >50 %), se cambia y se vuelve a CONFIRMAR al momento (el dueño 21-11).
cd /tmp/dropi || exit 1
node buscar_conf.js >/dev/null 2>&1
python3 -I -c "
import json
for o in json.load(open('confirmados.json')):
  if o.get('status')=='PENDIENTE' and not o.get('shipping_guide') and 'OFICINA' not in (o.get('dir') or '').upper() and not any(t.get('key_base_data')==__TAG_REVISAR__ for t in o.get('tags') or []):
    print(o['id'],o['phone'],(o.get('distribution_company') or {}).get('name'))" > rev_tels.txt
[ -s rev_tels.txt ] || exit 0
node huella.js $(awk '{print $2}' rev_tels.txt) >/dev/null 2>&1
python3 -I -c "
import json
h=json.load(open('huellas.json'));N={2:'ENVIA',3:'INTERRAPIDISIMO'}
for l in open('rev_tels.txt'):
  i,t_,dc=l.split();x=((h.get(t_) or {}).get('j') or {}).get('data') or {};bc={}
  for k in ('my_shop','other_shops'):
    for c in ((x.get('context_analysis') or {}).get(k) or {}).get('by_courier') or []:
      n=N.get(c['courier_id']);
      if n: bc.setdefault(n,[0,0]);bc[n][0]+=c['delivered'];bc[n][1]+=c['returned']
  if not bc: continue
  t=lambda z:z[0]/(z[0]+z[1]) if sum(z) else 0
  if all(bc.get(n,[0,0])[0]>=2 and t(bc[n])>=0.8 for n in N.values()): print(i,t_,'BARATA',dc); continue
  m=max(bc,key=lambda n:(bc[n][0],-bc[n][1]));d,r=bc[m]
  if m!=dc and d>bc.get(dc,[0,0])[0] and d/(d+r)>0.5: print(i,t_,'Envia' if m=='ENVIA' else 'Interrapidisimo',dc)" | while read id tel trans dc; do
  r=$(node ui_editar3.js "$id" "" "$trans" guardar "$dc" </dev/null 2>&1 | grep -E "SIN_CAMBIO|NO_GUARDO|API PUT 200")
  echo "$r" | grep -q SIN_CAMBIO && continue
  if echo "$r" | grep -q "API PUT 200"; then sleep 3
    nuevo=$(node reemplazo.js buscar "$tel" </dev/null | awk '$3=="PENDIENTE" && $4=="CONFIRMACION"{print $2; exit}')
    [ -n "$nuevo" ] && node editar.js "$nuevo" '{"status":"PENDIENTE"}' </dev/null | grep -q "AHORA PENDIENTE" && echo "$nuevo" > uno_ids.txt && node etiq_lote.js uno_ids.txt __TAG_CONFIRMADO__ >/dev/null && echo "CAMBIO_Y_RECONFIRMO $id -> $nuevo $trans"
  else echo "$id" > uno_ids.txt; node etiq_lote.js uno_ids.txt __TAG_REVISAR__ >/dev/null; echo "NO_PUDO_CAMBIAR $id $trans (REVISAR HUMANO)"; fi
done
