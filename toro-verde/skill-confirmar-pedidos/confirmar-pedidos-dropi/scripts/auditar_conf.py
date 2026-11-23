# Revisa los pedidos que confirmó el robot: ¿el cliente de verdad confirmó en el chat?
import json, re, time, urllib.request, urllib.error, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip()
def get(p):
    for i in range(4):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request('https://panel.lucidbot.co/api' + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 3: raise
            time.sleep(70)
SI = re.compile(r'(gracias por confirmar tu pedido|procederemos a gestionar y subir tu pedido)', re.I)
CONF_BOTON = re.compile(r'^Usuario \([^)]*\):\s*confirmar pedido', re.I | re.M)
ids = {int(i) for i in open('/tmp/dropi/ids_confirmados_robot.txt').read().split()}
conf = {x['id']: x for x in json.load(open('/tmp/dropi/confirmados.json'))}
malos = []
for i in sorted(ids):
    x = conf.get(i)
    if not x: continue
    c = '57' + str(x.get('phone'))[-10:]
    try: t = get(f'/contacts/{c}/messages?limit=40'); t = t.get('data', t); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: t = ''
    landing = 'confirmacion_landing' in t or 'CONFIRMAR PEDIDO' in t
    ok = bool(SI.search(t) or CONF_BOTON.search(t))
    if not ok: malos.append((i, x['name'], c, 'landing' if landing else 'chat', t[-200:].replace('\n', ' ')))
for m in malos: print('SIN_CONFIRMAR', m[0], m[1], m[2], m[3], '|', m[4])
json.dump([m[0] for m in malos], open('/tmp/dropi/sin_confirmar.json', 'w'))
print('REVISADOS', len(ids), 'SIN_CONFIRMACION_DEL_CLIENTE', len(malos))
