# Santiago (tecnología) 27-11: fuga de recompra. De 60 clientes ENTREGADOS hace 32-45 días, solo 3 recibieron algún mensaje
# después del día 25: el flujo «RC S4 - Dia 30 otro lote» casi no está saliendo. Solo 8,1 % vuelve a comprar en 45 días.
# Este programa, una vez al día, busca a quien recibió hace 28 a 35 días y no ha vuelto a pedir, y le dispara ese flujo de Lucid.
# Reglas: precio normal (son clientes que ya compraron: nada de descuentos); nunca a quien tiene queja, garantía, RESCATE,
# OPT_OUT o chat en modo humano; una sola vez por cliente; horario 8 a. m. a 7 p. m.
# MODO PRUEBA (ACTIVO = False): no envía nada, solo deja la lista en /tmp/dropi/recompra_hoy.json.
# Uso: DIAS=60 SALIDA=/tmp/dropi/d60.json node hoy.js  →  python3 -I recompra.py [/tmp/dropi/d60.json]
import json, os, re, sys, time, datetime, collections, urllib.request
ACTIVO = False            # Ronald: pásalo a True cuando confirmes que el flujo RC S4 no lleva descuento
FLUJO = '1791407991298'   # «RC S4 - Dia 30 otro lote»
MAX_DIA = 80              # tope de envíos por día
API = 'https://panel.lucidbot.co/api'; K = 'x'   # el proxy pone la clave real
REG = '/tmp/dropi/recompra_reg.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
FUENTE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/dropi/d60.json'
ahora = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5); ahora = ahora.replace(tzinfo=None)
def tel(t): return re.sub(r'\D', '', str(t or ''))[-10:]
def get(p):
    try: return json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=30).read())
    except Exception: return {}
def post(p): return urllib.request.urlopen(urllib.request.Request(API + p, data=b'{}', headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=30).read().decode()

por = collections.defaultdict(list)
for o in json.load(open(FUENTE)):
    if o.get('status') in ('CANCELADO', 'GUIA_ANULADA', 'RECHAZADO'): continue
    por[tel(o.get('phone'))].append(o)
# Lo que haya quedado en el embudo de Lucid después (pedido nuevo que aún no llega a Dropi) también cuenta como «ya volvió».
ult_lucid = collections.defaultdict(str); off = 0
while off < 10000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={off}'); d = d.get('data', d) if isinstance(d, dict) else d
    if not isinstance(d, list): break
    for p in d: t = tel(p.get('contact_id')); ult_lucid[t] = max(ult_lucid[t], (p.get('created_at') or '')[:10])
    if len(d) < 100: break
    off += 100
quejas = set()
for f in ('/tmp/dropi/quejas_reg.json', '/tmp/dropi/garantias_reg.json'):
    try: quejas |= {tel(k) for k in json.load(open(f))}
    except Exception: pass
lista = []
for t, L in por.items():
    L.sort(key=lambda o: o['created']); u = L[-1]
    if u.get('status') != 'ENTREGADO' or not t: continue
    dias = (ahora - datetime.datetime.fromisoformat(u['created'][:19])).days
    if not 28 <= dias <= 35 or t in reg or t in quejas: continue
    if ult_lucid.get(t, '') > u['created'][:10]: continue
    if float(u.get('total') or 0) >= 800000: continue   # poma: compró para toda la temporada (seguimiento del día 90, no del 30)
    lista.append({'tel': t, 'nombre': u.get('name'), 'dias': dias, 'total': u.get('total'), 'pedidos': len(L)})
lista.sort(key=lambda x: -x['dias'])
enviados = saltados = 0
for x in lista[:MAX_DIA]:
    c = '57' + x['tel']; i = get(f'/contacts/{c}'); i = i.get('data', i) if isinstance(i, dict) else {}
    tags = {(g.get('name') if isinstance(g, dict) else str(g)).upper() for g in (i.get('tags') or [])}
    if not i.get('id') or i.get('live_chat') or i.get('blocked') or str(i.get('subscribed')) == '0' or tags & {'OPT_OUT', 'RESCATE', 'EVENTO_ADVERSO', 'NOVEDAD'}:
        x['salto'] = 'contacto no apto'; saltados += 1; continue
    x['contacto'] = c
    if ACTIVO and 8 <= ahora.hour < 19:
        try: x['r'] = post(f'/contacts/{c}/send/{FLUJO}')[:80]; reg[x['tel']] = ahora.strftime('%Y-%m-%d'); enviados += 1
        except Exception as e: x['error'] = str(e)[:80]
json.dump(lista, open('/tmp/dropi/recompra_hoy.json', 'w'), ensure_ascii=False, indent=0)
json.dump(reg, open(REG, 'w'))
print('RECOMPRA', 'ACTIVO' if ACTIVO else 'PRUEBA', 'candidatos', len(lista), 'aptos', sum(1 for x in lista[:MAX_DIA] if x.get('contacto')), 'saltados', saltados, 'enviados', enviados)
