# Casino Toro Verde: manda el enlace del casino a los tibios de las últimas 24 h que NUNCA han comprado.
# Uso: python3 -I casino_envio.py [--enviar] [--max N]
# Sin --enviar solo cuenta (prueba). Nunca repite a la misma persona en 3 días. Alterna 4 mensajes distintos.
import json, os, sys, time, glob, urllib.request, urllib.error, urllib.parse, datetime, re, random
os.chdir(os.path.dirname(os.path.abspath(__file__)))
K = open('lucidbot.key').read().strip()
API = 'https://panel.lucidbot.co/api'
ENVIAR = '--enviar' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 400
os.makedirs('casino', exist_ok=True)
REG = 'casino/enviados.json'  # {contacto: fecha ISO del último envío}
reg = json.load(open(REG)) if os.path.exists(REG) else {}

def get(path):
    req = urllib.request.Request(API + path, headers={'X-ACCESS-TOKEN': K})
    return json.loads(urllib.request.urlopen(req, timeout=40).read().decode())

def post(path, body):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST')
    return urllib.request.urlopen(req, timeout=40).read().decode()

NO_RE = re.compile(r'\b(no (me )?(interesa|mand|escrib|molest)|no m[aá]s|ya no|stop|salir|spam|bloque|deja de|dejen de|no gracias)', re.I)
def pidio_no(c):
    # Lucid devuelve el chat como texto: «Yo (fecha): …» / «Usuario (fecha): …». Se mira el último mensaje del cliente.
    try:
        t = get(f'/contacts/{c}/messages?limit=15'); t = t.get('data', t)
        t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
        us = [l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t) if l.startswith('Usuario')]
        return bool(us) and bool(NO_RE.search(us[-1]) or re.fullmatch(r'Usuario \([^)]*\):\s*no\.?\s*', us[-1].strip(), re.I))
    except Exception:
        return False

# 1) Todo el que tiene un pedido en el historial completo del embudo 705299 = ya compró (se excluye)
compraron = set()
o = 0
while o < 20000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={o}')
    d = d.get('data', d)
    for r in d:
        # Ronald 23-11: el casino también es para clientes que ya compraron (recompra).
        # Solo se excluye a quien hizo un pedido en los últimos 15 días: puede estar en camino (posventa) o cancelaría para pedirlo con descuento.
        if (r.get('created_at') or '') >= (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=15)).isoformat():
            compraron.add(str(r.get('contact_id')))
    if len(d) < 100:
        break
    o += 100

# 2) Tibios: contactos que llegaron por anuncios y hablaron en las últimas 24 h
ads = set()
for f in glob.glob('rmk/ad_*.json') + glob.glob('rmk2/ad_*.json') + glob.glob('rmk2/now/*.json') + glob.glob('casino/ads.txt'):
    m = re.search(r'(\d{15,})', f)
    if m:
        ads.add(m.group(1))
if os.path.exists('casino/ads.txt'):
    ads |= set(open('casino/ads.txt').read().split())
ahora = datetime.datetime.now(datetime.timezone.utc)
tibios = {}
for ad in ads:
    try:
        d = get(f'/contacts/find_by_custom_field?field_id=728462&value={ad}')
    except Exception:
        continue
    for c in d.get('data', []) or []:
        li = c.get('last_interaction') or ''
        try:
            t = datetime.datetime.fromisoformat(li.replace('Z', '+00:00'))
        except Exception:
            continue
        # Ventana de WhatsApp abierta (<23 h) y la persona lleva al menos 6 h callada.
        # Si escribió hace menos de 6 h todavía está comprando con el bot: el descuento ahí
        # regala plata (Ronald, 20-11: casos Marilu y Mane).
        if 6 * 3600 <= (ahora - t).total_seconds() < 23 * 3600:
            tibios[str(c['id'])] = c.get('first_name') or ''

hoy_promo = set(open('rmk2/enviados.txt').read().split()) if ahora.strftime('%Y-%m-%d') <= '2026-11-19' else set()
garantia = {'57'+l.split('|')[1].strip() for l in open('quejas.txt') if '|' in l} if os.path.exists('quejas.txt') else set()
if '--incluir-promo' in sys.argv: hoy_promo = set()
# Quien recibió el empujón sin descuento (empujon.py) hace poco no recibe el casino el mismo día: dos mensajes seguidos cansan.
if os.path.exists('empujon_hecho.txt') and (time.time() - os.path.getmtime('empujon_hecho.txt')) < 20 * 3600:
    hoy_promo |= set(open('empujon_hecho.txt').read().split())
# Ronald 23-11: que no nos reporten por spam. Máximo 1 casino por persona cada 7 días y nunca a quien dijo que no.
hace3 = (ahora - datetime.timedelta(days=7)).isoformat()
negados = set(json.load(open('casino/negados.json'))) if os.path.exists('casino/negados.json') else set()
lista = [(c, n) for c, n in tibios.items() if c not in compraron and c not in negados and c not in garantia and c not in hoy_promo and reg.get(c, '') < hace3]
print('TIBIOS_24H', len(tibios), 'PEDIDO_ULTIMOS_15_DIAS', sum(1 for c in tibios if c in compraron), 'PARA_ENVIAR', len(lista))
if not ENVIAR:
    sys.exit(0)

# Mensaje del primer día (precios tachados + «dime tu municipio») unido al casino. Corto: Ronald pidió textos breves.
IMAGEN = 'https://cdn.shopify.com/s/files/1/0687/6096/1211/files/casino-wa-777.jpg?v=1795398353'
MENSAJES = [
    "{s} 🎰 *Ganaste 3 tiros GRATIS en el Casino Toro Verde*\n\nCon el 7-7-7 te llevas *hasta $26.900 de descuento* + semilla de maíz criollo de regalo 💰🌽\n\n👉 *Juega ya, toma 10 segundos:* {u}\n\n⏰ Tus tiros se borran hoy a la medianoche · Pagas al recibir\n\n_Si no quieres recibir premios, responde NO_",
    "{s} 💰 *Tienes un premio esperándote*: 3 tiros gratis para ganar *hasta $26.900 de descuento* en tu Toro Verde + semilla de regalo 🎰\n\n👉 *Toca y juega ahora:* {u}\n\n⏰ Solo hoy hasta la medianoche · Pagas cuando te llegue 📦\n\n_Si no quieres recibir premios, responde NO_",
]
JUEGO = ['', '']
ok = fail = 0
for i, (c, nom) in enumerate(lista[:MAX]):
    n = re.sub(r'[^A-Za-zÁÉÍÓÚáéíóúÑñ ]', '', nom).strip().split(' ')[0].capitalize() if nom else ''
    k = random.randrange(len(MENSAJES))
    u = 'https://toroverde.co/pages/premios?n=' + urllib.parse.quote(n) + JUEGO[k] + '&utm_source=whatsapp&utm_campaign=casino'
    s = f"¡Hola {n}! 👋" if n else "¡Hola! 👋"
    # Revisión justo antes de enviar: si escribió en las últimas 6 h, está comprando: no se toca.
    try:
        info = get(f'/contacts/{c}'); info = info.get('data', info)
        # /contacts/{id} da la hora en milisegundos (p. ej. "1795224511995"), no en fecha ISO.
        li = float(info.get('last_interaction') or 0) / 1000
        if time.time() - li < 6 * 3600:
            continue
        if pidio_no(c):
            negados.add(c); json.dump(sorted(negados), open('casino/negados.json', 'w'))
            continue
    except Exception:
        continue
    try:
        r = post(f'/contacts/{c}/send_content', {'messages': [{'message': {'attachment': {'type': 'image', 'payload': {'url': IMAGEN}}}}, {'message': {'text': MENSAJES[k].format(s=s, u=u)}}]})
        if 'success' in r and 'true' in r:
            ok += 1
            reg[c] = ahora.isoformat()
        else:
            fail += 1
    except Exception:
        fail += 1
    if i % 20 == 0:
        json.dump(reg, open(REG, 'w'))
    time.sleep(0.5)
json.dump(reg, open(REG, 'w'))
print('ENVIADOS', ok, 'FALLOS', fail)
