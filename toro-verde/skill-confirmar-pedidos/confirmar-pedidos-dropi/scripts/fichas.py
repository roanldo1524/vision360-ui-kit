# Cerebro derecho: una ficha por pedido que el robot quiere confirmar, para que Claude la lea como lo haría una persona del equipo
# (chat completo, dirección, producto, precio, transportadora, historial) ANTES de darle confirmar.
import json, os, re, urllib.request
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip()
def chat(c):
    try:
        t = json.loads(urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/messages?limit=30', headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
        t = t.get('data', t); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: return '(no pude leer el chat)'
    partes = re.split(r'\n(?=(?:Yo|Usuario) \()', t)
    return '\n'.join(p.strip()[:350] for p in partes[-18:])
plan = json.load(open('/tmp/dropi/plan.json')); det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
acc = {a['id']: a for a in json.load(open('/tmp/dropi/acciones.json'))}
dec = {f['contacto']: f for f in json.load(open('robot/decision.json'))}
DUD = json.load(open('/tmp/dropi/plan_dudas.json')) if os.path.exists('/tmp/dropi/plan_dudas.json') else []
duda = {x['id']: x.get('motivo_duda', '') for x in DUD}  # por qué las reglas (revision_auto.py) no lo confirmaron solas
out = []
for x in plan['confirmar']:
    d = det.get(x['id'], {}); c = d.get('chat') or '57' + d.get('phone', ''); f = dec.get(c, {})
    lt = (((d.get('huella') or {}).get('global_profile') or {}).get('lifetime_totals') or {})
    items = '; '.join(f"{i['q']} x {i['pres']} ${i['precio']:,.0f}" for i in d.get('items', []))
    out.append(f"## {x['id']} · {d.get('name','')} {d.get('surname','')} · {d.get('phone','')}\n"
               f"Dropi: {items} | total ${d.get('total',0):,.0f} | {d.get('dc')} flete ${d.get('flete',0):,.0f}\n" +
               (f"⚠️ Duda de las reglas: {duda[x['id']]}\n" if duda.get(x['id']) else '') +
               f"Dirección: {d.get('dir')} — {d.get('city')} ({d.get('state')})\n"
               f"Historial: {lt.get('delivered',0)} entregados, {lt.get('returned',0)} devueltos | chat dice: {f.get('producto','')} ${f.get('valor','')} | pidió transportadora: {f.get('trans_cliente') or '-'} | Shopify: {f.get('shopify', False)}\n"
               f"Chat (últimos mensajes):\n{chat(c)}\n")
open('/tmp/dropi/fichas.md', 'w').write('\n'.join(out))
print('FICHAS', len(out), '→ /tmp/dropi/fichas.md (leerlas y vetar con robot/vetar.py antes de confirmar)')
