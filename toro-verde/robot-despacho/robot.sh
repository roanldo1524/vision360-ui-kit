#!/bin/bash
# Robot de despacho (v2): lee Dropi → razona con el chat de Lucid y las reglas de Ronald → edita (precio/transportadora) → confirma → etiqueta lo demás.
cd "$(dirname "$0")/.." || exit 1
# Una sola vuelta a la vez (Ronald 23-11: robot cada 15 min): si otra sigue corriendo, esta no arranca.
if [ -z "$ROBOT_SEGUNDA" ]; then exec 9>/tmp/dropi/robot.lock; flock -n 9 || { echo ROBOT_OCUPADO; exit 0; }; fi  # la segunda vuelta ya tiene el candado de la primera
(cd /tmp/dropi && node detalle.js) | tail -1 | tee /tmp/dropi/ultimo.txt
# Si Dropi cerró la sesión, vuelve a entrar solo con DU/DP del entorno (Ronald 22-11) y lo intenta una vez más.
# Si la sesión venció a mitad (los pedidos llegan sin cantidad), también se vuelve a entrar.
python3 -I -c "
import json,sys
d=json.load(open('/tmp/dropi/detalle.json'))
sys.exit(1 if d and all(any(i.get('q') is None for i in x['items']) for x in d) else 0)" || echo SESION_DROPI_CAIDA >> /tmp/dropi/ultimo.txt
if grep -q SESION_DROPI_CAIDA /tmp/dropi/ultimo.txt; then
  (cd /tmp/dropi && node entrar.js </dev/null) | tail -1
  (cd /tmp/dropi && node detalle.js) | tail -1 | tee /tmp/dropi/ultimo.txt
  grep -q SESION_DROPI_CAIDA /tmp/dropi/ultimo.txt && { echo "SESION_DROPI_CAIDA"; exit 2; }
fi
# Ronald 23-11: pedidos con otro teléfono → busca el WhatsApp que compró (número de pedido de Lucid Sales; si no, nombre) y lo pone en Dropi con el original en notas
timeout 900 python3 -W ignore -I robot/telefonos.py | grep -E "^TEL_|^TELEFONOS"
python3 -I -c "import json;open('robot/contactos_dropi.txt','w').write('\n'.join(d.get('chat') or '57'+d['phone'] for d in json.load(open('/tmp/dropi/detalle.json'))))"
timeout 1200 python3 -W ignore -I robot/decidir.py --contactos robot/contactos_dropi.txt | head -1
python3 -I robot/razonar.py | head -1
# Ediciones (precio del chat / transportadora con la que recibe): Dropi crea un ID nuevo; se confirma en la siguiente vuelta tras volver a razonar.
python3 -I -c "
import json;a=json.load(open('/tmp/dropi/acciones.json'))
for x in a:
  if x['accion']=='EDITAR_Y_CONFIRMAR': print(x['id'],x['editar'].get('precio','-'),x['editar'].get('transportadora','-'),x.get('dc','-'))" | while read id precio trans dc; do
  [ "$precio" = "-" ] && precio=""; [ "$trans" = "-" ] && trans=
  r=$(cd /tmp/dropi && node ui_editar3.js "$id" "$precio" "$trans" guardar "$dc" </dev/null 2>&1 | grep -E "COTIZA|SIN_CAMBIO|CHEQUEO|NO_GUARDO|API POST 200 https://api.dropi.co/api/orders/myorders " | cut -c1-160); echo "$id $r"
  echo "$r" | grep -q NO_GUARDO && echo "$id" >> /tmp/dropi/no_editados.txt
  echo "$r" | grep -q SIN_CAMBIO && echo "$id" >> /tmp/dropi/sin_cambio.txt
  echo "$r" | grep -q "api/orders/myorders " && echo "$id" >> /tmp/dropi/editados_vuelta.txt; done
# Si no se pudo editar (la transportadora no llega allá o el flete pasa de $27.000), va a revisión humana.
[ -s /tmp/dropi/no_editados.txt ] && (cd /tmp/dropi && sort -u no_editados.txt > ne.txt && node etiq_lote.js ne.txt 93484 && rm -f no_editados.txt)
python3 -I -c "
import json,os
a=json.load(open('/tmp/dropi/acciones.json'));E='/tmp/dropi/etiquetados.json'
ya=set(json.load(open(E))) if os.path.exists(E) else set()
sc=set(int(i) for i in open('/tmp/dropi/sin_cambio.txt').read().split()) if os.path.exists('/tmp/dropi/sin_cambio.txt') else set()
plan={'confirmar':[{'id':x['id'],'n':x['nombre']} for x in a if x['accion']=='CONFIRMAR' or (x['accion']=='EDITAR_Y_CONFIRMAR' and x['id'] in sc and not x['editar'].get('precio'))],'etiquetar':[{'id':x['id'],'motivo':x['motivo']} for x in a if x['accion']=='REVISAR' and x['id'] not in ya],'revisar_total':[x for x in a if x['accion']=='REVISAR']}
json.dump(plan,open('/tmp/dropi/plan.json','w'),ensure_ascii=False)
print('PLAN confirmar',len(plan['confirmar']),'etiquetar_nuevos',len(plan['etiquetar']),'revisar_total',len(plan['revisar_total']))"
# Motivos de revisión guardados entre vueltas (para el panel y los avisos)
python3 -I -c "
import json,os
M='/tmp/dropi/motivos.json';m=json.load(open(M)) if os.path.exists(M) else {}
for x in json.load(open('/tmp/dropi/plan.json')).get('revisar_total',[]): m[str(x['id'])]=x['motivo']
json.dump(m,open(M,'w'),ensure_ascii=False)"
python3 -I robot/aclarar.py
( python3 -I robot/pedir_anticipo.py > /tmp/dropi/anticipo.log 2>&1 & )  # foto + audio de anticipo APARTE: no frena la confirmación (Ronald 23-11)
# Ronald 23-11: novedades de Dropi → fichas para que Claude las solucione (solucionar_nov.js). Si el cliente no ha respondido, se le pregunta una vez.
# Ronald 23-11 (tarde): «novedades y todo eso lo resuelve el bot, no es tu función en este chat». Apagado.
# (cd /tmp/dropi && timeout 300 node novedades.js </dev/null | tail -1) && python3 -I robot/novedades.py --escribir
python3 -I robot/recordar_confirmar.py
# Ronald 21-11: pedidos de carritos recuperados de Shopify llevan la etiqueta CARRITORECUPERADOLUC (49501) en Dropi.
python3 -I -c "
import json
dec={f['contacto']:f for f in json.load(open('robot/decision.json'))}
for d in json.load(open('/tmp/dropi/detalle.json')):
  f=dec.get(d.get('chat') or '57'+d['phone'])
  if f and f.get('carrito') and 'CARRITORECUPERADOLUC' not in (d.get('tags') or []): print(d['id'])" > /tmp/dropi/carritos.txt
[ -s /tmp/dropi/carritos.txt ] && (cd /tmp/dropi && echo "CARRITOS $(wc -l < carritos.txt)" && node etiq_lote.js carritos.txt 49501 </dev/null | tail -1)
# Dirección clara: quita el barrio repetido y le pone «BARRIO» antes de confirmar (no reemplaza el pedido)
python3 -I robot/limpiar_dirs.py | while IFS=$'\t' read id dir; do (cd /tmp/dropi && node editar.js "$id" "$(python3 -c 'import json,sys;print(json.dumps({"dir":sys.argv[1]}))' "$dir")" </dev/null 2>&1 | grep -c '^PUT 200' | sed "s/^/DIR_LIMPIA $id /"); done
# Ronald 23-11: pedidos de oficina llevan la dirección de la oficina de Interrapidísimo del municipio + «RECLAMA EN OFICINA INTERRAPIDÍSIMO»
python3 -I robot/oficinas.py > /tmp/dropi/ofi.tsv; [ -s /tmp/dropi/ofi.tsv ] && (cd /tmp/dropi && node dir_lote.js ofi.tsv </dev/null 2>&1 | grep -c OK | sed 's/^/OFICINAS_DIR /')
rm -f /tmp/dropi/sin_cambio.txt
EDITADOS=$(grep -c "" /tmp/dropi/editados_vuelta.txt 2>/dev/null || echo 0); rm -f /tmp/dropi/editados_vuelta.txt
# Ronald 21-11: «cerebro izquierdo y derecho». Con ROBOT_PAUSA=1 el robot (reglas) se detiene antes de confirmar:
# deja las fichas para que Claude lea cada chat como una persona, vete lo dudoso y luego corra robot/confirmar_aprobados.sh.
if [ -n "$ROBOT_PAUSA" ]; then
  if [ "${EDITADOS:-0}" -gt 0 ] && [ -z "$ROBOT_SEGUNDA" ]; then echo "SEGUNDA_VUELTA $EDITADOS editados"; sleep 10; ROBOT_SEGUNDA=1 bash "$0"; exit; fi
  bash robot/corregir_confirmados.sh; python3 -I robot/fichas.py; rm -f /tmp/dropi/vetados.txt; echo ESPERA_REVISION_DEL_AGENTE; exit 0
fi
(cd /tmp/dropi && node confirmar.js) | awk -F' \\| ' '{print $1}' | sort | uniq -c
python3 -I -c "
import json,os
E='/tmp/dropi/etiquetados.json';ya=set(json.load(open(E))) if os.path.exists(E) else set()
p=json.load(open('/tmp/dropi/plan.json'));json.dump(sorted(ya|{x['id'] for x in p.get('etiquetar',[])}),open(E,'w'))"
python3 -I robot/avisar_equipo.py
bash robot/corregir_confirmados.sh
# Ronald 21-11: «cada vez que cambias de transportadora debes volver a darle confirmar».
# Dropi deja el pedido nuevo en PENDIENTE CONFIRMACION: se vuelve a razonar y se confirma en esta misma vuelta (una sola vez).
if [ "${EDITADOS:-0}" -gt 0 ] && [ -z "$ROBOT_SEGUNDA" ]; then echo "SEGUNDA_VUELTA $EDITADOS pedidos editados: volver a confirmar"; sleep 10; ROBOT_SEGUNDA=1 bash "$0"; fi
