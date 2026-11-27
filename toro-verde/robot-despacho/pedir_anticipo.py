# Ronald 23-11: a los clientes frenados SOLO porque devuelven mucho, se les manda el flujo de Lucid «AUDIO PEDIDO CON DEVOLUCION»
# (audio + datos para consignar el anticipo). Una vez por cliente, 7 a. m.–9 p. m., solo con la ventana de 24 h abierta y sin modo humano.
# Después vigila el chat: si el cliente manda una imagen (comprobante), avisa al equipo para que valide la plata y confirme descontando el abono.
# El pedido sigue en REVISAR HUMANO: el robot nunca confirma un pago anticipado solo. Uso: python3 -I robot/pedir_anticipo.py
import json, os, re, time, datetime, urllib.request, base64, uuid, subprocess
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
FLUJO = '1795460736971'  # AUDIO PEDIDO  CON DEVOLUCION
REG = '/tmp/dropi/anticipos.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
AV = '/tmp/dropi/avisos_equipo.json'
DEVUELVE = re.compile(r'recibe solo|devuelve|riesgosa|cr[ií]tica', re.I)
def get(p):
    d = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
    return d.get('data', d) if isinstance(d, dict) else d
def post_json(p, b): return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(b).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def post(p): return urllib.request.urlopen(urllib.request.Request(API + p, data=b'{}', headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def foto_historial(tel):
    # Ronald 23-11: antes del audio se le manda al cliente la captura REAL de su «Historial del comprador» de Dropi (solo la tarjeta de él).
    # Se sube con nombre aleatorio a un alojamiento temporal (se borra solo a los 3 días) y la copia local se borra al enviar. Sin IA.
    png = f'/tmp/dropi/h_{uuid.uuid4().hex}.png'
    try:
        out = subprocess.run(['node', 'foto_huella.js', tel, png], cwd='/tmp/dropi', capture_output=True, text=True, timeout=150).stdout
        if 'FOTO_OK' not in out or not os.path.exists(png): return None
        b64 = 'data:image/png;base64,' + base64.b64encode(open(png, 'rb').read()).decode()
        r = json.loads(urllib.request.urlopen(urllib.request.Request('https://kieai.redpandaai.co/api/file-base64-upload', data=json.dumps({'base64Data': b64, 'uploadPath': 'tv-h', 'fileName': uuid.uuid4().hex + '.png'}).encode(), headers={'Content-Type': 'application/json', 'Authorization': 'Bearer x'}, method='POST'), timeout=60).read())
        return (r.get('data') or {}).get('downloadUrl')
    except Exception: return None
    finally:
        if os.path.exists(png): os.remove(png)
def imagenes(c):
    try: t = get(f'/contacts/{c}/messages?limit=20'); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: return None, []
    usr = [l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t) if l.startswith('Usuario')]
    return len([l for l in usr if '[Image]' in l]), [re.search(r'https?://\S+', l).group(0) for l in usr if '[Image]' in l and re.search(r'https?://\S+', l)]

h = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-5))).hour
det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
enviados = 0
if 7 <= h < 21:
    for a in json.load(open('/tmp/dropi/acciones.json')):
        if a['accion'] != 'REVISAR': continue
        partes = [p.strip() for p in a['motivo'].split(';') if p.strip()]
        if not partes or not all(DEVUELVE.search(p) for p in partes): continue  # solo si el ÚNICO problema es que devuelve
        d = det.get(a['id'], {}); c = d.get('chat') or '57' + d.get('phone', '')
        # Ronald 24-11: «no puedes mandar a clientes que tienen buena entrega, solo a clientes con devoluciones altas, más del 50 %».
        # Se mira el historial COMPLETO del cliente en Dropi (todas las tiendas), no solo una transportadora o la etiqueta de riesgo.
        lt = (((d.get('huella') or {}).get('global_profile') or {}).get('lifetime_totals') or {})
        ent, dev = int(lt.get('delivered') or 0), int(lt.get('returned') or 0)
        if ent + dev == 0 or dev / (ent + dev) <= 0.5: continue
        if c in reg: continue
        try:
            info = get(f'/contacts/{c}')
            if info.get('live_chat') or (time.time() - float(info.get('last_interaction') or 0) / 1000) > 23 * 3600: continue
        except Exception: continue
        n_img, _ = imagenes(c)
        url = foto_historial(d.get('phone', ''))
        if url:
            try: post_json(f'/contacts/{c}/send_content', {'messages': [{'message': {'attachment': {'type': 'image', 'payload': {'url': url}}}}]})
            except Exception: pass
        if 'true' in post(f'/contacts/{c}/send/{FLUJO}'):
            reg[c] = {'foto': bool(url), 'pedido': a['id'], 'ent': ent, 'dev': dev, 'nombre': (d.get('name') or '').title(), 'total': d.get('total'), 'enviado': time.time(), 'imagenes': n_img or 0}
            enviados += 1

# Ronald 27-11 (EXCEPCIÓN, con su audio): «cuando el cliente registre una devolución más que entregas efectivas, o tenga únicamente una
# devolución en su historial, y no se obtenga respuesta respecto al anticipo solicitado, se deberá enviar el siguiente audio como parte del
# proceso de confirmación». El audio dice que le damos la oportunidad SIN anticipo. Se manda una sola vez, 3 h o más después de pedir el
# anticipo, si no mandó comprobante ni escribió nada, con el chat abierto y sin modo humano. El pedido queda en excepcion_audio.json y
# razonar.py ya no lo frena por devoluciones (el resto de reglas sigue igual). Si devuelve 2 o más que lo que recibe, sigue el anticipo.
AUDIO = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audios', 'anticipo_sin_respuesta.ogg')
EXC = '/tmp/dropi/excepcion_audio.json'; exc = json.load(open(EXC)) if os.path.exists(EXC) else {}
def url_audio():
    # WhatsApp baja el audio al enviarlo: se sube al alojamiento temporal (dura 3 días) y se reusa 1 día
    cache = '/tmp/dropi/audio_excepcion_url.json'
    try:
        x = json.load(open(cache))
        if time.time() - x['t'] < 86400: return x['url']
    except Exception: pass
    b64 = 'data:audio/ogg;base64,' + base64.b64encode(open(AUDIO, 'rb').read()).decode()
    r = json.loads(urllib.request.urlopen(urllib.request.Request('https://kieai.redpandaai.co/api/file-base64-upload', data=json.dumps({'base64Data': b64, 'uploadPath': 'tv-a', 'fileName': uuid.uuid4().hex + '.ogg'}).encode(), headers={'Content-Type': 'application/json'}, method='POST'), timeout=60).read())
    u = (r.get('data') or {}).get('downloadUrl')
    if u: json.dump({'t': time.time(), 'url': u}, open(cache, 'w'))
    return u
def respondio(c, desde):
    try: t = get(f'/contacts/{c}/messages?limit=20'); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: return True
    for f in re.findall(r'Usuario \((\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}[ap]m)\)', t):
        if datetime.datetime.strptime(f, '%Y-%m-%d %I:%M%p').timestamp() + 5 * 3600 > desde: return True
    return False
excepciones = 0
if 7 <= h < 21 and os.path.exists(AUDIO):
    for c, r in reg.items():
        if r.get('comprobante') or r.get('excepcion') or str(r['pedido']) in exc: continue
        if not (3 * 3600 <= time.time() - r['enviado'] <= 3 * 86400): continue
        dd = det.get(r['pedido'])
        if not dd: continue   # el pedido ya no está pendiente
        lt = (((dd.get('huella') or {}).get('global_profile') or {}).get('lifetime_totals') or {})
        ent, dev = int(lt.get('delivered') or r.get('ent') or 0), int(lt.get('returned') or r.get('dev') or 0)
        if dev - ent != 1: continue
        if respondio(c, r['enviado']): continue
        try:
            info = get(f'/contacts/{c}')
            if info.get('live_chat') or (time.time() - float(info.get('last_interaction') or 0) / 1000) > 23 * 3600: continue
            u = url_audio()
            if not u: continue
            res = post_json(f'/contacts/{c}/send_content', {'messages': [{'message': {'attachment': {'type': 'audio', 'payload': {'url': u}}}}]})
        except Exception as e: print('EXCEPCION_ERROR', str(e)[:80]); continue
        if 'true' in res:
            r['excepcion'] = time.time(); exc[str(r['pedido'])] = {'cel': c, 'nombre': r.get('nombre'), 'ent': ent, 'dev': dev, 'cuando': time.time()}
            excepciones += 1; print('EXCEPCION audio enviado', r['pedido'], r.get('nombre'), f'{ent} entregados {dev} devueltos')
json.dump(exc, open(EXC, 'w'), ensure_ascii=False)

# Comprobantes: imagen nueva del cliente después del audio → aviso al equipo (se entrega con avisar_equipo.py)
nuevos = []
for c, r in reg.items():
    if r.get('comprobante') or time.time() - r['enviado'] > 3 * 86400: continue
    n_img, urls = imagenes(c)
    if n_img is not None and n_img > r.get('imagenes', 0):
        r['comprobante'] = time.time()
        nuevos.append(f"💰 *Comprobante de anticipo* · {r['nombre']} · pedido {r['pedido']} · cel {c[2:]}\n{urls[-1] if urls else ''}\nRevisa que la plata llegó y confirma en Dropi descontando el abono del total.")
        # Ronald 26-11: también al GRUPO de WhatsApp del equipo (agente «Mensajero del grupo», whatsapp/wa_grupo.js), con la foto
        try:
            os.makedirs('/tmp/wa/salida', exist_ok=True); img = ''
            if urls:
                img = f'/tmp/wa/comp_{c}.jpg'; open(img, 'wb').write(urllib.request.urlopen(urls[-1], timeout=40).read())
            json.dump({'grupo': os.environ.get('WA_GRUPO', ''), 'imagen': img, 'pedido': r['pedido'], 'cel': c[2:], 'nombre': r['nombre'], 'total': r.get('total'),
                       'texto': f"💰 Comprobante de anticipo\nCliente: {r['nombre']}\nCelular: {c[2:]}\nPedido Dropi: {r['pedido']}\nValor del pedido: ${(r.get('total') or 0):,.0f}".replace(',', '.') + "\nEstado: POR VALIDAR (revisar en Bancolombia)"},
                      open(f'/tmp/wa/salida/{int(time.time())}_{c}.json', 'w'), ensure_ascii=False)
        except Exception as e: print('WA_GRUPO_ERROR', str(e)[:60])
if nuevos:
    av = json.load(open(AV)) if os.path.exists(AV) else {}
    equipo = re.search(r"EQUIPO = (\[.*?\])", open('robot/avisar_equipo.py').read())
    for t in (json.loads(equipo.group(1).replace("'", '"')) if equipo else []):
        x = av.setdefault(t, {'pendiente': [], 'plantilla': 0}); x['pendiente'] = (x['pendiente'] + nuevos)[-8:]
    json.dump(av, open(AV, 'w'), ensure_ascii=False)
json.dump(reg, open(REG, 'w'), ensure_ascii=False)
print('ANTICIPO audios enviados', enviados, 'excepciones sin anticipo', excepciones, 'comprobantes nuevos', len(nuevos), 'esperando', len([r for r in reg.values() if not r.get('comprobante')]))
