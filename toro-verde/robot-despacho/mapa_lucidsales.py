# Une el número de pedido de Lucid Sales (shop_order_id en Dropi) con el contacto de Lucid. Guarda caché.
import json, os, re, time, datetime, urllib.request, urllib.error
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip()
C = 'robot/mapa_lucidsales.json'
mapa = json.load(open(C)) if os.path.exists(C) else {}
vistos = set(mapa.values())
def get(p):
    for i in range(4):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request('https://panel.lucidbot.co/api' + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 3: raise
            time.sleep(70)
ops = json.load(open('casino/ops.json'))
desde = (datetime.datetime.utcnow() - datetime.timedelta(days=10)).strftime('%Y-%m-%d')
cont = {str(r['contact_id']) for r in ops if r['created_at'] >= desde }
falta = [c for c in cont if c not in vistos]
for c in falta:
    try: d = get(f'/contacts/{c}/custom_fields/386920'); d = d.get('data', d); v = d.get('value') or ''
    except Exception: continue
    for i in re.findall(r'"id":"?(\d+)', v): mapa[i] = c
    vistos.add(c)
json.dump(mapa, open(C, 'w'))
print('MAPA', len(mapa), 'nuevos', len(falta))
