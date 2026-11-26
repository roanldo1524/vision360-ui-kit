# Ronald 26-11: «el tema del rastreo es súper importante: haz un rastreo muy humanizado, con el menor consumo de token».
# Rastreo en CÓDIGO (sin IA): cuando el pedido cambia de etapa en Dropi, le escribe al cliente un mensaje cálido, como Karen:
#   empacado → en camino → hoy sale a reparto → disponible en oficina.  Una vez por etapa y por pedido.
# Novedades e intentos de entrega NO (los resuelve el bot de Lucid). Entregado NO (lo hace la plantilla de entregado / recompra).
# Solo a chats abiertos (<23 h), sin modo humano, de 7 a. m. a 8 p. m. Si el chat está cerrado, queda en /tmp/dropi/rastreo_plantilla.json
# para la plantilla de Meta «rastreo_pedido_tv» (docs/plantillas-meta.md) cuando Ronald la cree.
# Uso: python3 -I rastreo.py [--enviar] [--max 60]   (lee /tmp/dropi/hoy.json, que bucle.sh refresca)
import json, os, sys, time, datetime, urllib.request
sys.path.insert(0, '/tmp/robot/robot')
ENVIAR = '--enviar' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 60
D = '/tmp/dropi'; EST = f'{D}/rastreo_estado.json'; COLA = f'{D}/rastreo_plantilla.json'
est = json.load(open(EST)) if os.path.exists(EST) else {}
cola = json.load(open(COLA)) if os.path.exists(COLA) else {}
ahora = time.time(); hoy = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)
try: K = open('/tmp/robot/lucidbot.key').read().strip()
except Exception: K = 'x'
def lucid(p, body=None):
    req = urllib.request.Request('https://panel.lucidbot.co/api' + p, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST' if body is not None else 'GET')
    r = json.loads(urllib.request.urlopen(req, timeout=40).read()); return r.get('data', r) if isinstance(r, dict) else r
try: import oficinas as _of
except Exception: _of = None

ETAPA = {'GUIA_GENERADA': 'empacado', 'PREPARADO PARA TRANSPORTADORA': 'empacado',
         'EN BODEGA ORIGEN': 'camino', 'EN BODEGA TRANSPORTADORA': 'camino', 'DESPACHADA': 'camino', 'EN TRANSPORTE': 'camino',
         'EN TERMINAL DESTINO': 'camino', 'EN BODEGA DESTINO': 'camino', 'EN REEXPEDICION': 'camino',
         'EN REPARTO': 'reparto', 'RECLAME EN OFICINA': 'oficina'}
ORDEN = ['empacado', 'camino', 'reparto', 'oficina']

def plata(v): return f"${(v or 0):,.0f}".replace(',', '.')
def texto(et, o):
    n = (o.get('name') or '').split(' ')[0].title() or 'compita'; dc = (o.get('dc') or 'la transportadora').title(); ciu = (o.get('city') or '').title()
    if et == 'empacado':
        return (f"¡Hola {n}! 👋 Te escribe Karen de Toro Verde. Tu pedido ya está *empacado* y listo para salir con {dc} hacia {ciu}. 📦\n"
                "Te voy contando por aquí cómo va. ¡Gracias por confiar en nosotros! 🌱")
    if et == 'camino':
        return (f"{n}, buenas noticias 🚚 Tu pedido de Toro Verde ya va *en camino* a {ciu} con {dc}.\n"
                f"Ten listo el pago contra entrega de *{plata(o.get('total'))}* y el celular a la mano por si te llama el mensajero. 🙌")
    if et == 'reparto':
        return (f"¡{n}, hoy te llega! 🎉 Tu pedido de Toro Verde salió a *reparto* en {ciu}. Ten listo *{plata(o.get('total'))}* y estate pendiente del celular.\n\n"
                "Cuando lo uses: *agite el envase* y aplique *mínimo 130 ml por bomba de 20 litros*, con el limón que corresponde al agua de tu municipio. 🌱")
    if et == 'oficina':
        dir_of = ''
        if _of and 'INTER' in (o.get('dc') or '').upper():
            try: dir_of = _of.dir_oficina(o.get('state', ''), _of.muni(o.get('city', '')), '') or ''
            except Exception: dir_of = ''
        dir_of = dir_of.split(', RECLAMA')[0].split(' - RECLAMA')[0]
        return (f"¡{n}, tu pedido ya llegó! 📦 Está disponible para reclamar en la oficina de {dc} en {ciu}" + (f": *{dir_of}*" if dir_of else '') + ".\n"
                f"Lleva tu *cédula original* y *{plata(o.get('total'))}* para el pago contra entrega. Tienen pocos días de custodia, así que ve apenas puedas. 🙏\n"
                "Si no puedes ir, cuéntanos y lo puede reclamar un familiar con autorización.")

try: ped = json.load(open(f'{D}/hoy.json'))
except Exception: print('RASTREO sin hoy.json'); sys.exit(0)
desde = (hoy - datetime.timedelta(days=12)).strftime('%Y-%m-%d')
todo = []
for o in ped:
    et = ETAPA.get(o.get('status')); pid = str(o['id'])
    if not et or (o.get('created') or '') < desde or not o.get('phone'): continue
    ya = est.get(pid, [])
    if et in ya or any(ORDEN.index(x) > ORDEN.index(et) for x in ya): continue
    todo.append((ORDEN.index(et), o, et))
todo.sort(key=lambda x: -x[0])  # primero oficina y reparto: son los que evitan devoluciones
env = cerr = 0
if 7 <= hoy.hour < 20:
    for _, o, et in todo[:MAX]:
        tel = o['phone'][-10:]; pid = str(o['id']); t = texto(et, o)
        try:
            i = lucid(f'/contacts/57{tel}')
            abierto = (not i.get('live_chat')) and (ahora - float(i.get('last_interaction') or 0) / 1000) < 23 * 3600
        except Exception: abierto = False
        if not abierto:
            cerr += 1
            if et in ('oficina', 'reparto'): cola[tel] = {'pedido': o['id'], 'nombre': o.get('name'), 'tipo': et, 'texto': t, 'cuando': ahora}
            est.setdefault(pid, []).append(et); continue
        if ENVIAR:
            try:
                if 'true' in json.dumps(lucid(f'/contacts/57{tel}/send_content', {'messages': [{'message': {'text': t}}]})): env += 1
            except Exception: continue
        est.setdefault(pid, []).append(et)
    if ENVIAR:
        json.dump(est, open(EST, 'w')); json.dump(cola, open(COLA, 'w'), ensure_ascii=False)
print('RASTREO', hoy.strftime('%d-%m %H:%M'), '| por avisar', len(todo), '| enviados', env, '| chat cerrado', cerr, '| en cola para plantilla', len(cola), '|', 'ENVIADO' if ENVIAR else 'PRUEBA')
