# Le escribe al cliente por Lucid cuando la dirección o el nombre no son claros (una vez por pedido, 7 a. m.–9 p. m., ventana de 24 h abierta).
import json, os, time, urllib.request, urllib.parse, datetime
FLUJO_ACLARAR, CAMPO_DATO2 = '1795794788926', '608743'  # plantilla aclarar_dato_pedido_tv (Ronald 27-11) y campo «Robot dato 2»
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); REG = '/tmp/dropi/aclaraciones.json'
reg = json.load(open(REG)) if os.path.exists(REG) else {}
h = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-5))).hour
if not 7 <= h < 21: print('ACLARAR fuera de horario'); raise SystemExit
det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
def get(p): return json.loads(urllib.request.urlopen(urllib.request.Request('https://panel.lucidbot.co/api' + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
n = 0
for a in json.load(open('/tmp/dropi/acciones.json')):
    if a['accion'] != 'REVISAR' or str(a['id']) in reg: continue
    m = a['motivo']
    if not ('dirección' in m or 'nombre raro' in m or 'ciudad' in m or 'oficina' in m) or 'dijo que no' in m or 'persona' in m: continue
    d = det.get(a['id'], {}); c = d.get('chat') or '57' + d.get('phone', '')
    try:
        info = get(f'/contacts/{c}'); info = info.get('data', info)
        if info.get('live_chat'): continue
        cerrado = (time.time() - float(info.get('last_interaction') or 0) / 1000) > 23 * 3600
    except Exception: continue
    if cerrado:
        # Ronald 27-11 creó la plantilla «aclarar_dato_pedido_tv» (flujo «Robot - aclarar dato»): «…solo me falta un dato para despacharlo: {{2}}»
        dato = ('tu nombre completo como aparece en la cédula' if 'nombre raro' in m else
                f"¿lo envío a tu casa o lo reclamas en la oficina de Interrapidísimo de {(d.get('city') or '').title()}? Si es a tu casa, mándame la dirección con número y un punto de referencia")
        try:
            urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/custom_fields/{CAMPO_DATO2}', data=urllib.parse.urlencode({'value': dato}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/x-www-form-urlencoded'}, method='POST'), timeout=40).read()
            r = urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/send/{FLUJO_ACLARAR}', data=b'{}', headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
        except Exception as e: print('ACLARAR_PLANTILLA_ERROR', a['id'], str(e)[:60]); continue
        if 'true' in r: reg[str(a['id'])] = {'contacto': c, 'enviado': time.time(), 'motivo': m, 'via': 'plantilla'}; n += 1
        continue
    nom = (d.get('name') or '').split(' ')[0].capitalize()
    if 'nombre raro' in m: t = f"¡Hola {nom}! 🌱 Para despachar tu pedido de Toro Verde, confírmame por favor tu nombre completo como aparece en la cédula 🙏"
    else: t = f"¡Hola {nom}! 🌱 Para que tu pedido de Toro Verde llegue sin problema, ¿me confirmas la dirección completa con el número de la puerta? Ej.: Calle 12 # 5-30, y una referencia. Si prefieres reclamarlo en la oficina de Interrapidísimo de {(d.get('city') or '').title()}, dime y lo dejo así 🚚"
    r = urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/send_content', data=json.dumps({'messages': [{'message': {'text': t}}]}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
    if 'true' in r: reg[str(a['id'])] = {'contacto': c, 'enviado': time.time(), 'motivo': m}; n += 1
json.dump(reg, open(REG, 'w'), ensure_ascii=False)
print('ACLARAR enviados', n, 'esperando respuesta', len(reg))
