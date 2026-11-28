# «Entre más pedidos puedas confirmar, mejor». Pedidos frenados SOLO porque el cliente no ha confirmado
# (página/Shopify sin «CONFIRMAR PEDIDO» o sin «sí» después del resumen): se le recuerda UNA vez para que confirme.
# Ventana de 24 h abierta: texto. Ventana cerrada: plantilla aprobada por Meta (si config.json trae el flujo de Lucid; si no, no se envía nada).
import json, os, re, time, datetime, urllib.request, urllib.parse
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
# Con la ventana cerrada se usa una plantilla aprobada (flujo de Lucid). 0 = apagado.
FLUJO_CONFIRMAR = str(__FLUJO_RECORDAR__ or '')  # flujo «Robot - Confirmar pedido» (plantilla con una variable para el resumen)
CAMPO_RESUMEN = str(__CAMPO_RESUMEN_RECORDAR__ or '')  # campo de Lucid donde va el resumen para esa plantilla
FLUJO_SHOPIFY = str(__FLUJO_RECORDAR_SHOPIFY__ or '')  # plantilla para pedidos de Shopify/página con la ventana cerrada
TIENDA = '__NOMBRE_TIENDA__'
def TXT_SHOPIFY(nom, prod, donde, total):
    # Mensaje seguro de la compra (no la pone en duda): el pedido ya está listo y solo falta su respuesta.
    return (f"Hola {nom} 🎉 ¡Gracias por tu compra en {TIENDA}!\n\n"
            "Tu pedido ya está empacado y sale hoy mismo 🚚📦\n" + f"• {prod}\n• {donde}\n" + f"• Total: ${total:,.0f}".replace(',', '.') + ", pagas cuando lo recibes\n\n" +
            "Apenas salga te compartimos el número de guía para que lo sigas\n"
            "Respóndenos *Perfecto* y lo dejamos en camino. Si necesitas cambiar algo, escríbenos aquí. 🙌")
REG = '/tmp/dropi/recordados_conf.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
hora = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)).hour
if not 6 <= hora < 20: print('RECORDAR_CONFIRMAR fuera de horario'); raise SystemExit
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
    prod = ', '.join(f"{int(i['q'] or 1)} x {(i['pres'] or '').lower()}" for i in d.get('items', []))
    shopify = any('CONFIRMAR PEDIDO' in m for m in partes)
    try:
        if shopify:
            dirx = (d.get('dir') or '').strip()
            donde = f"Reclamas en la oficina de Interrapidísimo de {(d.get('city') or '').title()}" if re.search(r'reclam|oficina', dirx, re.I) else f"Llega a {dirx}, {(d.get('city') or '').title()}"
            if time.time() - li < 23 * 3600: r = post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': TXT_SHOPIFY(nom or 'cliente', prod, donde, d.get('total') or 0)}}]}); via = 'texto_shopify'
            elif FLUJO_SHOPIFY: r = post(f'/contacts/{c}/send/{FLUJO_SHOPIFY}'); via = 'plantilla_shopify'
            else: continue  # ventana cerrada y la plantilla aún no está aprobada
        elif time.time() - li < 23 * 3600:
            t = (f"¡Hola {nom}! 🌱 Tu pedido de __NOMBRE_TIENDA__ está listo para salir: *{prod}* por *${d.get('total',0):,.0f}*".replace(',', '.') +
                 f", a {(d.get('dir') or '').strip()}, {(d.get('city') or '').title()}. Pagas al recibir 🚚\n\n¿Me confirmas que te lo despachamos? Responde *SÍ* y sale de una 🙌")
            r = post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': t}}]}); via = 'texto'
        elif FLUJO_CONFIRMAR and CAMPO_RESUMEN:
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
