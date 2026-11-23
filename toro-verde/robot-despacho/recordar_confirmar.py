# Ronald 21-11: «entre más pedidos puedas confirmar, mejor». Pedidos frenados SOLO porque el cliente no ha confirmado
# (página/Shopify sin «CONFIRMAR PEDIDO» o sin «sí» después del resumen): se le recuerda UNA vez para que confirme.
# Solo con la ventana de 24 h abierta (texto). Con la ventana cerrada no hay cómo escribirle gratis: queda para Karen.
import json, os, re, time, datetime, urllib.request
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
REG = '/tmp/dropi/recordados_conf.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
hora = (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).hour
if not 8 <= hora < 20: print('RECORDAR_CONFIRMAR fuera de horario'); raise SystemExit
def get(p): return json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
def post(p, body=None):
    return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(body or {}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
FALTA = re.compile(r'no veo la confirmación del cliente|no ha tocado «CONFIRMAR PEDIDO»|aún no confirma en el chat')
n = 0
for a in json.load(open('/tmp/dropi/acciones.json')):
    if a['accion'] != 'REVISAR' or str(a['id']) in reg: continue
    partes = [m.strip() for m in a['motivo'].split(';')]
    if not partes or not all(FALTA.search(m) for m in partes): continue  # solo si lo único que falta es la confirmación
    d = det.get(a['id'], {}); c = d.get('chat') or '57' + d.get('phone', '')
    try:
        info = get(f'/contacts/{c}'); info = info.get('data', info)
        if info.get('live_chat'): continue
        li = float(info.get('last_interaction') or 0) / 1000
    except Exception: continue
    nom = (d.get('name') or '').split(' ')[0].capitalize()
    prod = ', '.join(f"{i['q']} {i['pres'].lower()}" for i in d.get('items', []))
    try:
        if time.time() - li < 23 * 3600:
            t = (f"¡Hola {nom}! 🌱 Tu pedido de Toro Verde está listo para salir: *{prod}* por *${d.get('total',0):,.0f}*".replace(',', '.') +
                 f", a {(d.get('dir') or '').strip()}, {(d.get('city') or '').title()}. Pagas al recibir 🚚\n\n¿Me confirmas que te lo despachamos? Responde *SÍ* y sale de una 🙌")
            r = post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': t}}]}); via = 'texto'
        else:
            continue  # ventana cerrada: el flujo «Confirmacion landing» no se deja reenviar por la API (probado 21-11, no sale nada)
    except Exception as e:
        continue
    if 'true' in r or 'success' in r:
        reg[str(a['id'])] = {'contacto': c, 'enviado': time.time(), 'via': via}; n += 1
json.dump(reg, open(REG, 'w'))
print('RECORDAR_CONFIRMAR enviados', n)
