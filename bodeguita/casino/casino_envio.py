# Casino La Bodeguita: manda el enlace del casino a quien escribió por un anuncio hace entre 6 y 23 h
# y NUNCA ha comprado (ningún pedido en todo el embudo 705299 «Pedidos - Chat»).
# Cada persona recibe el premio del ÚLTIMO producto que preguntó en el chat (si no se sabe, el del anuncio).
# Productos y precios salen solos del catálogo del bot: los productos nuevos entran sin tocar nada. 10 % máx.
#
# Uso:
#   python3 -I casino_envio.py                      -> solo cuenta (no envía nada)
#   python3 -I casino_envio.py --prueba 57XXXXXXXXXX -> manda SOLO a ese número (mensaje de prueba para Ronald)
#   python3 -I casino_envio.py --enviar [--max N]   -> envía de verdad (SOLO con el visto bueno de Ronald)
#
# La clave de Lucid de Master Importer la pone el proxy del espacio «La Bodeguita» (nunca en archivos).
import json, os, sys, time, urllib.request, urllib.error, urllib.parse, datetime, re, random, ast, unicodedata

os.chdir(os.path.dirname(os.path.abspath(__file__)))
API = 'https://panel.lucidbot.co/api'
ENVIAR = '--enviar' in sys.argv
PRUEBA = sys.argv[sys.argv.index('--prueba') + 1] if '--prueba' in sys.argv else ''
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 400
REG = 'enviados.json'  # {contacto: fecha ISO del último envío}  (no se sube al repo)
reg = json.load(open(REG)) if os.path.exists(REG) else {}
PAGINA = 'https://casino-labodeguita.vercel.app/'
IMAGEN = 'https://raw.githubusercontent.com/roanldo1524/vision360-ui-kit/88206144584444f3bef84988300b8813a6eb6956/bodeguita/casino/web/casino-wa.jpg'

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

# 2) Catálogo del bot (campo 312704) y mapa anuncio→producto (892889), leídos de un cliente reciente.
#    Así cada producto nuevo que se cree en el catálogo entra solo al casino, con su precio.
mapa, cat = {}, []
for r in get(f'/pipelines/705299/opportunities?limit=100&offset={max(0, o - 100)}').get('data', [])[::-1][:15]:
    try:
        v1 = get(f"/contacts/{r['contact_id']}/custom_fields/892889"); v1 = (v1.get('data', v1) or {}).get('value') or ''
        v2 = get(f"/contacts/{r['contact_id']}/custom_fields/312704"); v2 = (v2.get('data', v2) or {}).get('value') or ''
        if 'match_de_producto' in v1 and 'catalogo_de_productos' in v2:
            mapa, cat = json.loads(v1), json.loads(v2)['catalogo_de_productos']
            break
    except Exception:
        pass
if not mapa or not cat:
    sys.exit('PARADO: no se pudo leer el catálogo o el mapa de anuncios del bot')


def norm(t):
    t = unicodedata.normalize('NFD', str(t)).encode('ascii', 'ignore').decode().upper()
    return re.sub(r'[^A-Z0-9 ]', ' ', t)


def lit(x):
    if isinstance(x, (dict, list)):
        return x
    try:
        return ast.literal_eval(x) if x else {}
    except Exception:
        return {}


def opciones(p):
    """Opciones de compra con su precio, sacadas del catálogo (máx. 3, de mayor a menor)."""
    pt = lit(p.get('precios_totales'))
    if not pt:
        for v in lit(p.get('variantes')) or []:
            if isinstance(v, dict) and any(int(re.sub(r'\D', '', str(x)) or 0) for x in (v.get('precios_totales') or {}).values()):
                pt = v['precios_totales']; break
    op = {}
    for k, v in (pt or {}).items():
        n = int(re.match(r'(\d+)', k).group(1)) if re.match(r'(\d+)', k) else 1
        pr = int(re.sub(r'\D', '', str(v)) or 0)
        if pr >= 10000:
            op[n] = pr
    if not op:
        return []
    p1 = op.get(1) or min(op.values())
    # Fuera precios mal cargados (ej. «2 unidades 94.500» que en realidad es el precio por unidad)
    op = {n: pr for n, pr in op.items() if n == 1 or pr >= p1 * 1.2 or pr == p1}
    # Si dos cantidades tienen el mismo precio (ej. mandala 1 y 3 = 109.900), se deja la mayor
    por_precio = {}
    for n, pr in op.items():
        por_precio[pr] = max(n, por_precio.get(pr, 0))
    lista = sorted(((n, pr) for pr, n in por_precio.items()), key=lambda x: -x[1])[:3]
    return [(f'{n} unidad' if n == 1 else f'{n} unidades', pr) for n, pr in lista]


def bonito(nombre):
    n = re.sub(r'\s+', ' ', nombre.replace('+ OBSEQUIO', '').replace('SH ', 'SHAMPOO ')).strip()
    return n[:1].upper() + n[1:].lower()


PROD = {}
for p in cat:
    nom = p['nombre_del_producto'].strip()
    op = opciones(p)
    if op and nom not in PROD:
        PROD[nom] = op
VACIAS = {'DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'CON', 'PARA', 'Y', 'EN', 'X2', 'OBSEQUIO', 'SH', 'PARA', 'EL', 'UN', 'UNA'}
CLAVES = {n: [w for w in norm(n).split() if len(w) >= 3 and w not in VACIAS] for n in PROD}
cuenta = {}
for ws in CLAVES.values():
    for w in set(ws):
        cuenta[w] = cuenta.get(w, 0) + 1


def productos_en(texto):
    t = ' ' + norm(texto) + ' '
    hits = []
    for n, ws in CLAVES.items():
        m = [w for w in ws if f' {w}' in t]
        if len(m) >= min(2, len(ws)) or any(cuenta[w] == 1 for w in m):
            hits.append(n)
    return hits


def ultimo_producto(c, por_defecto):
    """Último producto del que se habló en el chat (cliente o bot). Si no se sabe, el del anuncio."""
    try:
        m = get(f'/contacts/{c}/messages?limit=40'); m = m.get('data', m)
        m = m if isinstance(m, str) else json.dumps(m, ensure_ascii=False)
    except Exception:
        return por_defecto
    for bloque in reversed(re.split(r'\n\n(?=(?:Usuario|Yo) \()', m)):
        if 'Casino La Bodeguita' in bloque or 'casino-labodeguita' in bloque:
            continue
        h = productos_en(bloque)
        if len(h) == 1:
            return h[0]
    return por_defecto


ads = {a: p['nombre_del_producto'].strip() for p in mapa.get('match_de_producto', [])
       if p['nombre_del_producto'].strip() in PROD for a in p['ad_ids']}

ahora = datetime.datetime.now(datetime.timezone.utc)
tibios = {}
if PRUEBA:
    tibios[PRUEBA] = ('Ronald', 'AFILADOR DE CADENA')
else:
    for ad, prod in ads.items():
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
                tibios[str(c['id'])] = (c.get('first_name') or '', prod)
        time.sleep(0.25)

hace3 = (ahora - datetime.timedelta(days=3)).isoformat()
lista = [(c, n, p) for c, (n, p) in tibios.items()
         if PRUEBA or (c not in compraron and reg.get(c, '') < hace3)]
print('PRODUCTOS_EN_CATALOGO', len(PROD), 'ANUNCIOS', len(ads), 'TIBIOS_6_A_23H', len(tibios),
      'YA_COMPRARON', sum(1 for c in tibios if c in compraron), 'PARA_ENVIAR', len(lista))
if '--mostrar' in sys.argv:  # muestra qué producto y premio le tocaría a los primeros, sin enviar
    for c, n, p in lista[:int(sys.argv[sys.argv.index('--mostrar') + 1])]:
        u = ultimo_producto(c, p)
        print(' …' + c[-4:], '| anuncio:', p, '| último preguntado:', u, '|', PROD[u])
        time.sleep(0.3)
if not (ENVIAR or PRUEBA):
    sys.exit(0)

MENSAJES = [
    "{s} 🎰 *Hoy juegas GRATIS en el Casino La Bodeguita*\n\nTienes 3 tiros para ganar *hasta 10% de descuento* en tu {prod} 💰\n\n👉 *Toca aquí y juega:* {u}\n\n⏰ Tus tiros vencen hoy a medianoche",
    "{s} 💰 *Te regalamos 3 tiros gratis* en la máquina de La Bodeguita\n\nPuedes ganar *hasta 10% de descuento* en tu {prod} 🎰\n\n👉 *Juega aquí:* {u}\n\n⏰ Solo por hoy · Pagas al recibir",
]
ok = fail = 0
for i, (c, nom, p) in enumerate(lista[:MAX]):
    n = re.sub(r'[^A-Za-zÁÉÍÓÚáéíóúÑñ ]', '', nom).strip().split(' ')[0].capitalize() if nom else ''
    if not PRUEBA:
        # Revisión justo antes de enviar: si escribió en las últimas 6 h, está comprando: no se toca.
        try:
            info = get(f'/contacts/{c}'); info = info.get('data', info)
            if time.time() - float(info.get('last_interaction') or 0) / 1000 < 6 * 3600 or c in compraron:
                continue
        except Exception:
            continue
    p = ultimo_producto(c, p)  # el premio va sobre el ÚLTIMO producto que preguntó
    nb = bonito(p)
    o = '|'.join(f'{l}~{pr}' for l, pr in PROD[p])
    u = PAGINA + '?' + urllib.parse.urlencode({'n': n, 't': nb, 'o': o, 'utm_source': 'whatsapp', 'utm_campaign': 'casino_bodeguita'})
    s = f"¡Hola {n}! 👋" if n else "¡Hola! 👋"
    txt = random.choice(MENSAJES).format(s=s, u=u, prod=nb.lower())
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
