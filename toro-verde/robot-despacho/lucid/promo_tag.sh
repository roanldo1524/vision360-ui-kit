#!/bin/bash
# Etiqueta en Lucid los pedidos de la promo 10 % del 17 nov (solo ese día)
cd "$(dirname "$0")"; K=$(cat lucidbot.key)
[ "$(TZ=America/Bogota date +%F)" \> "2026-11-18" ] && exit 0
: > rmk/pipe_hoy.json
o=0; while [ $o -lt 6000 ]; do r=$(curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/pipelines/705299/opportunities?limit=100&offset=$o"); echo "$r" >> rmk/pipe_hoy.json; n=$(echo "$r" | python3 -c "import json,sys;d=json.load(sys.stdin);d=d.get('data',d);print(len(d))" 2>/dev/null || echo 0); [ "$n" -lt 100 ] && break; o=$((o+100)); done
python3 - <<'PY' > rmk/promo_compras.txt
import json
promo=set(open('rmk/enviados.txt').read().split())
out=set()
for l in open('rmk/pipe_hoy.json'):
  l=l.strip()
  if not l: continue
  try: d=json.loads(l); d=d.get('data',d)
  except Exception: continue
  for r in d:
    if r['contact_id'] in promo and r['created_at']>='2026-11-17 15:45': out.add(r['contact_id'])
print("\n".join(sorted(out)))
PY
touch rmk/etiquetados.txt
for c in $(cat rmk/promo_compras.txt); do grep -qx "$c" rmk/etiquetados.txt && continue; curl -s -o /dev/null -X POST -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/tags/218934" && echo $c >> rmk/etiquetados.txt && echo "PROMO_TAG $c"; done
