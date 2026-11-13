cd "$(dirname "$0")"; [ -s lucidbot.key ] || { echo "SIN_LLAVE"; echo FIN; exit 0; }
K=$(cat lucidbot.key); rm -rf oh; mkdir oh
for off in $(seq 0 100 3000); do curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/pipelines/705299/opportunities?limit=100&offset=$off" > oh/$off.json; n=$(python3 -c "import json;print(len(json.load(open('oh/$off.json')).get('data',[])))" 2>/dev/null); [ "$n" = "100" ] || break; done
python3 -W ignore -c "
import json,glob,datetime as dt
o={}
for f in glob.glob('oh/*.json'):
  for x in json.load(open(f)).get('data',[]): o[x['id']]=x
now=dt.datetime.utcnow()
for x in o.values():
  t=dt.datetime.strptime(x['created_at'],'%Y-%m-%d %H:%M:%S')
  if x['stage']['name']=='Error al subir' and now-t<dt.timedelta(hours=26): print(x['contact_id'])
" | sort -u > errs.txt
FIX=""
touch ya_subidos.txt
for c in $(grep -vxFf no_subir.txt errs.txt); do
  if grep -qx "$c" ya_subidos.txt; then echo "OJO_YA_SUBIDO $c (ya se subió una vez: no se resube para no duplicar)"; continue; fi
  v=$(curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/custom_fields/386920" | python3 -c 'import json,sys;d=json.load(sys.stdin);d=d.get("data",d);print(d.get("value",""))')
  case "$v" in *'"ok":true'*) continue;; esac
  q=$(curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/messages" | python3 -I -W ignore cancela.py)
  case "$q" in CANCELA*) echo "CANCELA $c $q"; continue;; esac
  curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/custom_fields/880500" | python3 -c "import json,sys;d=json.load(sys.stdin);d=d.get('data',d);json.dump(d,open('regalo/$c.json','w'))"
  echo "ERR $c $v"; python3 -c "import json;print('RES', json.load(open('regalo/$c.json'))['value'])"
  if python3 -c "import json,re,sys;v=json.load(open('regalo/$c.json'))['value'];sys.exit(0 if re.search(r'1 x [^)]*(Poma|Gal[oó]n|[2-9]0? [Ll]itros)',v) else 1)"; then echo "OJO_CANTIDAD $c (se pasa a N unidades)"; fi
  case "$v" in *'Producto 2'*|*'Faltan campos'*|*'Ciudad o departamento'*|*'quantity'*|*'variation'*) if python3 -I regalo/fix2.py $c >/dev/null; then curl -s -o /dev/null -H "X-ACCESS-TOKEN: $K" --data-urlencode "value@regalo/${c}_nuevo.txt" "https://panel.lucidbot.co/api/contacts/$c/custom_fields/880500"; curl -s -o /dev/null -X POST -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/send/1773882547097"; FIX="$FIX $c"; fi;; esac
  [ -z "$v" ] && { curl -s -o /dev/null -X POST -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/send/1773882547097"; FIX="$FIX $c"; }
done
[ -n "$FIX" ] && sleep 55
for c in $FIX; do echo "$c" >> ya_subidos.txt; echo "OK? $c $(curl -s -H "X-ACCESS-TOKEN: $K" "https://panel.lucidbot.co/api/contacts/$c/custom_fields/386920" | python3 -c 'import json,sys;d=json.load(sys.stdin);d=d.get("data",d);print(d["value"][:120])')"; done
echo FIN
