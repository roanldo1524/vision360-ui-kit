#!/bin/bash
# Etiqueta en Lucid los pedidos de la promo 10 % del 17 nov (solo ese día)
cd "$(dirname "$0")"; K=$(cat lucidbot.key)
[ "$(TZ=America/Bogota date +%F)" \> "2026-11-19" ] && exit 0
: > rmk2/pipe_hoy.json
o=0; while [ $o -lt 6000 ]; do r=$(curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/pipelines/705299/opportunities?limit=100&offset=$o"); echo "$r" >> rmk2/pipe_hoy.json; n=$(echo "$r" | python3 -c "import json,sys;d=json.load(sys.stdin);d=d.get('data',d);print(len(d))" 2>/dev/null || echo 0); [ "$n" -lt 100 ] && break; o=$((o+100)); done
python3 - <<'PY' > rmk2/promo_compras.txt
import json
promo=set(open('rmk2/enviados.txt').read().split())
out=set()
for l in open('rmk2/pipe_hoy.json'):
  l=l.strip()
  if not l: continue
  try: d=json.loads(l); d=d.get('data',d)
  except Exception: continue
  for r in d:
    if r['contact_id'] in promo and r['created_at']>='2026-11-18 12:35': out.add(r['contact_id'])
print("\n".join(sorted(out)))
PY
touch rmk2/etiquetados.txt
for c in $(cat rmk2/promo_compras.txt); do grep -qx "$c" rmk2/etiquetados.txt && continue; curl -s -o /dev/null -X POST -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/tags/218934" && echo $c >> rmk2/etiquetados.txt && echo "PROMO_TAG $c"; done
