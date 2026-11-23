# Ronald 21-11: «entre más pedidos puedas confirmar, mejor». Pedidos frenados SOLO porque el cliente no ha confirmado
# (página/Shopify sin «CONFIRMAR PEDIDO» o sin «sí» después del resumen): se le recuerda UNA vez para que confirme.
# Ventana de 24 h abierta: texto. Ventana cerrada: plantilla «confirmar_pedido_robot» (si FLUJO_CONFIRMAR tiene el flujo).
import json, os, re, time, datetime, urllib.request, urllib.parse
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
# Ronald 23-11: con la ventana cerrada se usa la plantilla aprobada «confirmar_pedido_robot» (flujo de Lucid). Vacío = apagado.
FLUJO_CONFIRMAR = ''  # pon aquí el número del flujo «Robot - Confirmar pedido» cuando Meta apruebe la plantilla
CAMPO_RESUMEN = '198260'  # Resumen_confirmacion_pedido: {{2}} de la plantilla
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
        elif FLUJO_CONFIRMAR:
            dirx = (d.get('dir') or '').strip()
            donde = f"para reclamar en la oficina de Interrapidísimo de {(d.get('city') or '').title()}" if re.search(r'reclama', dirx, re.I) else f"a {dirx}, {(d.get('city') or '').title()}"
            res = re.sub(r'\s+', ' ', f"{prod} por ${d.get('total',0):,.0f}".replace(',', '.') + f", {donde}").strip()[:300]
            urllib.request.urlopen(urllib.request.Request(f'{API}/contacts/{c}/custom_fields/{CAMPO_RESUMEN}', data=urllib.parse.urlencode({'value': res}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/x-www-form-urlencoded'}, method='POST'), timeout=40).read()
            r = post(f'/contacts/{c}/send/{FLUJO_CONFIRMAR}'); via = 'plantilla'
        else:
            continue  # ventana cerrada y todavía no hay plantilla aprobada
    except Exception as e:
        continue
    if 'true' in r or 'success' in r:
        reg[str(a['id'])] = {'contacto': c, 'enviado': time.time(), 'via': via}; n += 1
json.dump(reg, open(REG, 'w'))
print('RECORDAR_CONFIRMAR enviados', n)
