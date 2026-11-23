# Casino La Bodeguita: manda el enlace del casino a quien escribió por un anuncio hace entre 6 y 23 h
# y NUNCA ha comprado (ningún pedido en todo el embudo 705299 «Pedidos - Chat»).
# Cada persona recibe el premio del producto por el que escribió (p=<producto> en el enlace, 10 % máx.).
#
# Uso:
#   python3 -I casino_envio.py                      -> solo cuenta (no envía nada)
#   python3 -I casino_envio.py --prueba 57XXXXXXXXXX -> manda SOLO a ese número (mensaje de prueba para Ronald)
#   python3 -I casino_envio.py --enviar [--max N]   -> envía de verdad (SOLO con el visto bueno de Ronald)
#
# La clave de Lucid de Master Importer la pone el proxy del espacio «La Bodeguita» (nunca en archivos).
import json, os, sys, time, urllib.request, urllib.error, urllib.parse, datetime, re, random

os.chdir(os.path.dirname(os.path.abspath(__file__)))
API = 'https://panel.lucidbot.co/api'
ENVIAR = '--enviar' in sys.argv
PRUEBA = sys.argv[sys.argv.index('--prueba') + 1] if '--prueba' in sys.argv else ''
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 400
REG = 'enviados.json'  # {contacto: fecha ISO del último envío}  (no se sube al repo)
reg = json.load(open(REG)) if os.path.exists(REG) else {}
PAGINA = 'https://casino-labodeguita.vercel.app/'
IMAGEN = 'https://raw.githubusercontent.com/roanldo1524/vision360-ui-kit/88206144584444f3bef84988300b8813a6eb6956/bodeguita/casino/web/casino-wa.jpg'

# Producto del catálogo del bot -> clave del casino (ver CAT en pagina-premios-bodeguita.html)
SLUG = {'AFILADOR DE CADENA': 'afilador', 'DETECTOR DE METALES': 'detector', 'IMAN': 'iman',
        'Duo pelador raspador de verduras': 'pelador', 'Duo pelador de verduras': 'pelador',
        'VENTILADOR SOLAR': 'ventilador', 'TENSOR DE CADENA': 'tensor', 'SH CUBRE CANAS + OBSEQUIO': 'canas',
        'LUCES MANDALA SOLAR': 'mandala', 'AFILADOR DE BROCAS': 'brocas',
        'Luz Led Trasera Para Bicicleta Con Adver': 'bici', 'YUNABI': 'yunabi'}


def pide(req):
    for t in range(6):  # Lucid responde 429 si se va muy rápido
        try:
            return json.loads(urllib.request.urlopen(req, timeout=40).read().decode())
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(3 * (t + 1))
    raise RuntimeError('Lucid sigue frenando (429)')


def get(path):
    return pide(urllib.request.Request(API + path, headers={'X-ACCESS-TOKEN': 'proxy-injected'}))


def post(path, body):
    return pide(urllib.request.Request(API + path, data=json.dumps(body).encode(), method='POST',
                headers={'X-ACCESS-TOKEN': 'proxy-injected', 'Content-Type': 'application/json'}))


# 0) Seguridad: esta clave tiene que ser de La Bodeguita, nunca de Toro Verde.
me = get('/accounts/me')
if 'bodeguita' not in str(me.get('name', '')).lower():
    sys.exit('PARADO: la clave de Lucid no es la de La Bodeguita (' + str(me.get('name')) + ')')

# 1) Todo el que tiene un pedido en el historial completo del embudo 705299 = ya compró (se excluye)
compraron, o = set(), 0
while o < 50000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={o}')
    d = d.get('data', d) if isinstance(d, dict) else d
    compraron |= {str(r.get('contact_id')) for r in d}
    if len(d) < 100:
        break
    o += 100

# 2) Anuncios de cada producto (mapa del bot, campo 892889), leído del último cliente con pedido
mapa = {}
for r in get(f'/pipelines/705299/opportunities?limit=100&offset={max(0, o - 100)}').get('data', [])[::-1][:15]:
    try:
        v = get(f"/contacts/{r['contact_id']}/custom_fields/892889")
        v = (v.get('data', v) or {}).get('value') or ''
        if 'match_de_producto' in v:
            mapa = json.loads(v)
            break
    except Exception:
        pass
if not mapa:
    sys.exit('PARADO: no se pudo leer el mapa de anuncios (campo 892889)')
ads = {a: SLUG[p['nombre_del_producto'].strip()] for p in mapa.get('match_de_producto', [])
       if p['nombre_del_producto'].strip() in SLUG for a in p['ad_ids']}

ahora = datetime.datetime.now(datetime.timezone.utc)
tibios = {}
if PRUEBA:
    tibios[PRUEBA] = ('Ronald', 'afilador')
else:
    for ad, slug in ads.items():
        try:
            d = get(f'/contacts/find_by_custom_field?field_id=728462&value={ad}')
        except Exception:
            continue
        for c in d.get('data', []) or []:
            try:
                t = datetime.datetime.fromisoformat((c.get('last_interaction') or '').replace('Z', '+00:00'))
            except Exception:
                continue
            # Ventana de WhatsApp abierta (<23 h) y al menos 6 h callado (si no, está comprando con el bot)
            if 6 * 3600 <= (ahora - t).total_seconds() < 23 * 3600:
                tibios[str(c['id'])] = (c.get('first_name') or '', slug)
        time.sleep(0.25)

hace3 = (ahora - datetime.timedelta(days=3)).isoformat()
lista = [(c, n, p) for c, (n, p) in tibios.items()
         if PRUEBA or (c not in compraron and reg.get(c, '') < hace3)]
print('ANUNCIOS', len(ads), 'TIBIOS_6_A_23H', len(tibios), 'YA_COMPRARON', sum(1 for c in tibios if c in compraron),
      'PARA_ENVIAR', len(lista))
print('POR_PRODUCTO', {p: sum(1 for x in lista if x[2] == p) for p in sorted({x[2] for x in lista})})
if not (ENVIAR or PRUEBA):
    sys.exit(0)

MENSAJES = [
    "{s} 🎰 *Hoy juegas GRATIS en el Casino La Bodeguita*\n\nTienes 3 tiros para ganar *hasta 10% de descuento* en tu {prod} 💰\n\n👉 *Toca aquí y juega:* {u}\n\n⏰ Tus tiros vencen hoy a medianoche",
    "{s} 💰 *Te regalamos 3 tiros gratis* en la máquina de La Bodeguita\n\nPuedes ganar *hasta 10% de descuento* en tu {prod} 🎰\n\n👉 *Juega aquí:* {u}\n\n⏰ Solo por hoy · Pagas al recibir",
]
NOMBRE = {'afilador': 'afilador de cadena', 'detector': 'detector de metales', 'iman': 'imán', 'pelador': 'dúo pelador',
          'ventilador': 'ventilador solar', 'tensor': 'tensor de cadena', 'canas': 'shampoo cubre canas',
          'mandala': 'luces mandala', 'brocas': 'afilador de brocas', 'bici': 'luz para bicicleta', 'yunabi': 'Yunabi'}
ok = fail = 0
for i, (c, nom, p) in enumerate(lista[:MAX]):
    n = re.sub(r'[^A-Za-zÁÉÍÓÚáéíóúÑñ ]', '', nom).strip().split(' ')[0].capitalize() if nom else ''
    u = PAGINA + '?n=' + urllib.parse.quote(n) + '&p=' + p + '&utm_source=whatsapp&utm_campaign=casino_bodeguita'
    s = f"¡Hola {n}! 👋" if n else "¡Hola! 👋"
    if not PRUEBA:
        # Revisión justo antes de enviar: si escribió en las últimas 6 h, está comprando: no se toca.
        try:
            info = get(f'/contacts/{c}'); info = info.get('data', info)
            if time.time() - float(info.get('last_interaction') or 0) / 1000 < 6 * 3600 or c in compraron:
                continue
        except Exception:
            continue
    txt = random.choice(MENSAJES).format(s=s, u=u, prod=NOMBRE[p])
    try:
        r = post(f'/contacts/{c}/send_content', {'messages': [
            {'message': {'attachment': {'type': 'image', 'payload': {'url': IMAGEN}}}},
            {'message': {'text': txt}}]})
        if 'true' in json.dumps(r).lower():
            ok += 1
            if not PRUEBA:
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
