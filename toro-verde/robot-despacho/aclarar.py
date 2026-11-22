# Le escribe al cliente por Lucid cuando la dirección o el nombre no son claros (una vez por pedido, 7 a. m.–9 p. m., ventana de 24 h abierta).
import json, os, time, urllib.request, datetime
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
    d = det.get(a['id'], {}); c = '57' + d.get('phone', '')
    try:
        info = get(f'/contacts/{c}'); info = info.get('data', info)
        if info.get('live_chat') or (time.time() - float(info.get('last_interaction') or 0) / 1000) > 23 * 3600: continue
    except Exception: continue
    nom = (d.get('name') or '').split(' ')[0].capitalize()
    if 'nombre raro' in m: t = f"¡Hola {nom}! 🌱 Para despachar tu pedido de Toro Verde, confírmame por favor tu nombre completo como aparece en la cédula 🙏"
    else: t = f"¡Hola {nom}! 🌱 Para que tu pedido de Toro Verde llegue sin problema, ¿me confirmas la dirección completa con el número de la puerta? Ej.: Calle 12 # 5-30, y una referencia. Si prefieres reclamarlo en la oficina de Interrapidísimo de {(d.get('city') or '').title()}, dime y lo dejo así 🚚"
    r = urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/send_content', data=json.dumps({'messages': [{'message': {'text': t}}]}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
    if 'true' in r: reg[str(a['id'])] = {'contacto': c, 'enviado': time.time(), 'motivo': m}; n += 1
json.dump(reg, open(REG, 'w'), ensure_ascii=False)
print('ACLARAR enviados', n, 'esperando respuesta', len(reg))
