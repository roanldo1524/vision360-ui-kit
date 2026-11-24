# Ventas del casino La Bodeguita: pedidos del embudo 705299 creados DESPUÉS de que el cliente recibió el casino.
# Uso: python3 -I casino_medir.py      (lee enviados.json; no envía nada)
import json, os, re, sys, datetime, urllib.request

os.chdir(os.path.dirname(os.path.abspath(__file__)))
reg = json.load(open('enviados.json')) if os.path.exists('enviados.json') else {}


def get(path):
    req = urllib.request.Request('https://panel.lucidbot.co/api' + path, headers={'X-ACCESS-TOKEN': 'proxy-injected'})
    return json.loads(urllib.request.urlopen(req, timeout=40).read().decode())


if 'bodeguita' not in str(get('/accounts/me').get('name', '')).lower():
    sys.exit('PARADO: la clave no es de La Bodeguita')

ops, o = [], 0
while o < 50000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={o}'); d = d.get('data', d)
    ops += d
    if len(d) < 100:
        break
    o += 100

BOG = datetime.timezone(datetime.timedelta(hours=-5))


def plata(t):
    m = re.search(r'Total pedido:\*?[^\d]*([\d\.\,]+)', t or '')
    return int(re.sub(r'\D', '', m.group(1))) if m else 0


ventas = []
for x in ops:
    c = str(x.get('contact_id'))
    if c not in reg:
        continue
    env = datetime.datetime.fromisoformat(reg[c])
    cre = datetime.datetime.strptime(x['created_at'], '%Y-%m-%d %H:%M:%S').replace(tzinfo=datetime.timezone.utc)
    # Lucid da created_at en UTC (verificado con el pedido de prueba); si llegara en hora de Bogotá, igual sirve: solo cuenta lo posterior
    if cre >= env and (cre - env).days < 3:
        casino = 'BODEGUITA10' in (x.get('title') or '').upper() or 'CASINO' in (x.get('title') or '').upper()
        ventas.append((env.astimezone(BOG).date().isoformat(), c, plata(x.get('title')), casino))

por_dia = {}
for c, f in reg.items():
    d = datetime.datetime.fromisoformat(f).astimezone(BOG).date().isoformat()
    por_dia.setdefault(d, [0, 0, 0, 0])[0] += 1
for d, c, p, cas in ventas:
    por_dia.setdefault(d, [0, 0, 0, 0])
    por_dia[d][1] += 1; por_dia[d][2] += p; por_dia[d][3] += cas
print('DÍA DEL ENVÍO | RECIBIERON | PIDIERON | % | PLATA | CON CÓDIGO')
for d in sorted(por_dia):
    r, v, p, k = por_dia[d]
    print(f'{d} | {r} | {v} | {100 * v / r if r else 0:.1f}% | ${p:,.0f} | {k}'.replace(',', '.'))
tot = sum(v[2] for v in por_dia.values())
print(f'TOTAL: {len(reg)} recibieron, {len(ventas)} pidieron, ${tot:,.0f}'.replace(',', '.'))
