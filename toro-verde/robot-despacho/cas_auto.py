# Ronald 26-11: «chatear con las personas del CAS es una prioridad: que funcione en automático con razonamiento; si piden evidencia,
# lograrla, escribirle al cliente, todo lo necesario para que funcione sin humanos»; «sin consumo agresivo de tokens»; «la operación
# debe resistir 1.000 ventas al día». → Agente del CAS en CÓDIGO (sin IA). Lee lo que dijo el asesor (sobre todo el CAS_SOLVED,
# donde dejan la solución), lo clasifica con reglas y actúa:
#   OFICINA      → avisa al cliente por Lucid (dirección del punto, cédula, contra entrega). Chat cerrado: queda para la plantilla de rastreo.
#   EVIDENCIA    → pide al cliente fotos por Lucid + responde al CAS con el pantallazo del pedido (y fotos del cliente si ya hay).
#   DATOS        → responde al CAS con nombre, celular y dirección del pedido.
#   DEVOLUCION / NOVEDAD_CLIENTE → pide NO devolver y un nuevo ofrecimiento con los datos correctos.
#   ESPERA (reparto, despachada, reexpedición, novedad operativa) → nada; si a las 48 h la guía sigue quieta, seguimiento con fecha.
#   ENTREGADO    → nada.      OTRO → una línea corta para que la IA lo razone (lo único que gasta tokens).
# Nunca cancela ni edita pedidos. Máximo un mensaje al CAS por caso cada 24 h. Uso: python3 -I cas_auto.py [--enviar] [--max 30]
import json, os, re, sys, time, subprocess, datetime, urllib.request
ENVIAR = '--enviar' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 30
D = '/tmp/dropi'; EST = f'{D}/cas_auto_estado.json'
est = json.load(open(EST)) if os.path.exists(EST) else {}
ahora = time.time(); hora = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)).hour
try: K = open('/tmp/robot/lucidbot.key').read().strip()
except Exception: K = 'x'
API = 'https://panel.lucidbot.co/api'

def lucid(p, body=None):
    req = urllib.request.Request(API + p, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST' if body is not None else 'GET')
    r = json.loads(urllib.request.urlopen(req, timeout=40).read()); return r.get('data', r) if isinstance(r, dict) else r

def chat_abierto(tel):
    try:
        i = lucid(f'/contacts/57{tel}')
        return (not i.get('live_chat')) and (ahora - float(i.get('last_interaction') or 0) / 1000) < 23 * 3600
    except Exception: return False

def al_cliente(tel, texto):
    if not (5 <= hora < 20) or not chat_abierto(tel): return 'chat_cerrado'
    if not ENVIAR: return 'listo'
    try: return 'enviado' if 'true' in json.dumps(lucid(f'/contacts/57{tel}/send_content', {'messages': [{'message': {'text': texto}}]})) else 'fallo'
    except Exception: return 'fallo'

# datos de pedidos (nombre, celular, ciudad, total, estado actual) de las bajadas de Dropi
ped = {}
for f in ('hoy45.json', 'hoy35.json', 'hoy30.json', 'hoy.json'):
    try:
        for o in json.load(open(f'{D}/{f}')): ped[o['id']] = o
    except Exception: pass
quietas = {}
try: quietas = {q['id']: q for q in json.load(open(f'{D}/quietas.json'))}
except Exception: pass
def ver(pid):  # dirección completa (solo cuando hace falta)
    try:
        out = subprocess.run(['node', 'reemplazo.js', 'ver', str(pid)], cwd=D, capture_output=True, text=True, timeout=120).stdout
        return json.loads(out.strip().splitlines()[-1])
    except Exception: return {}

CIERRE = re.compile(r'se da por finalizada|damos por finalizada|espero que la informaci[oó]n|quedo atent|que tengas un excelente|gusto atender|^¡?hola|cordial saludo|te escribe|soy \w+, tu asesor|gracias por comunicarte|no quedaste conforme|te transfiero', re.I)
NOSOTROS = ('CONFIRMADO', 'Ronaldo', 'Karen', 'SMANTA', 'Dropshipper')
REGLAS = [
    ('ENTREGADO', r'(fue|ha sido|qued[oó]|se encuentra) entregad|entrega (exitosa|efectiva)|estado:? *entregad'),
    ('EVIDENCIA', r'evidencia|soporte|adjunt|fotograf|foto |c[eé]dula|certificaci|pantallazo|captura'),
    ('DATOS', r'(confirmar|validar|suministr|indic|envi|compart)\w* .{0,50}(direcci|tel[eé]fono|celular|n[uú]mero de contacto|barrio|datos)'),
    ('OFICINA', r'disponible para (ser )?reclam|reclamar? en (la )?oficina|en (la )?oficina|centro de servicio|punto de (venta|servicio)|para retiro'),
    ('DEVOLUCION', r'devoluci[oó]n|devuelt|retorno a (origen|remitente)|en devoluci'),
    ('NOVEDAD_CLIENTE', r'no (contesta|responde|se encontr)|direcci[oó]n (errada|incorrecta|incompleta|no existe)|destinatario (ausente|no|desconocido)|validar con el cliente|rehus|cerrado'),
    ('CICLO', r'intentos? de entrega fallidos|no es posible programar|cumplido (su|el) ciclo|agot\w+ (los )?intentos'),
    ('ESPERA', r'reexpedi|reparto|despachad|programad|en ruta|novedad operativa|inconvenientes operativos|regional|escala|en tr[aá]nsito|pr[oó]xim\w* d[ií]as|recomend|nuevo intento|intentos? de entrega|tardar|d[ií]as h[aá]biles|ingresad\w* a bodega|atento al movimiento'),
]

def ultimo_util(h):
    sol = [m for m in h if m['tipo'] == 'CAS_SOLVED' and m['msg']]
    msgs = [m for m in h if m['tipo'] == 'MESSAGE' and m['msg'] and not CIERRE.search(m['msg'][:80]) and not any(n in m['quien'] for n in NOSOTROS) and 'Dropshipper' not in m['msg']]
    txt = ' '.join([CIERRE.sub('', m['msg']) for m in msgs[-2:]] + [s['msg'] for s in sol[-1:]])
    asesor = next((m['quien'].split()[0] for m in reversed(h) if m['tipo'] == 'MESSAGE' and not any(n in m['quien'] for n in NOSOTROS) and 'Tes Soporte' not in m['quien'] and m['quien']), '')
    return txt, asesor

def clasificar(txt):
    for k, rx in REGLAS:
        if re.search(rx, txt, re.I): return k
    return 'OTRO'

def oficina(txt):
    m = re.search(r'oficina\s+([A-Z0-9/ .#\-]{6,80}?)(?:\s*,|\s+agradec|\s+en horario|$)', txt)
    if not m: return ''
    s = m.group(1).strip(' ,.'); return s.split('/')[-1].strip() if '/' in s else s

pend = json.load(open(f'{D}/cas_pendientes.json'))
casos = pend['responder'] + pend['escalar']
subprocess.run(['node', 'cas_hilos.js'] + [c['chat'] for c in casos], cwd=D, capture_output=True, timeout=60 + 6 * len(casos))
hilos = json.load(open(f'{D}/cas_hilos.json'))

plan, para_ia, cont = [], [], {}
for c in casos:
    pid, h = c['pedido'], hilos.get(c['chat'])
    if not isinstance(h, list): continue
    o = ped.get(pid, {}); q = quietas.get(pid, {}); e = est.setdefault(str(pid), {})
    estado_hoy = o.get('status') or q.get('status') or ''
    if estado_hoy in ('ENTREGADO', 'DEVOLUCION', 'CANCELADO'): cont['ya_cerrado'] = cont.get('ya_cerrado', 0) + 1; continue
    txt, asesor = ultimo_util(h)
    if c in pend['escalar']: tipo = 'ESCALAR'
    else: tipo = clasificar(txt)
    cont[tipo] = cont.get(tipo, 0) + 1
    nom = (o.get('name') or q.get('name') or '').title(); tel = (o.get('phone') or q.get('phone') or '')[-10:]
    guia = c.get('guia') or q.get('guia') or ''; dc = c.get('dc') or ''
    # Ronald 27-11: «siempre de soluciones; háblale a la gente del CAS como si fuera un humano, como si fuera Karen».
    sal = f"{'Hola ' + asesor.split(' ')[0] + ', b' if asesor else 'B'}{'uen día' if hora < 12 else 'uenas tardes' if hora < 18 else 'uenas noches'}, te escribe Karen de Toro Verde. "
    fin = ' ¡Mil gracias por tu ayuda! 🙏'
    reciente = ahora - e.get('cas_msg', 0) < 24 * 3600
    acc = {'pedido': pid, 'tipo': tipo, 'nombre': nom, 'tel': tel, 'guia': guia, 'dc': dc}
    if tipo == 'ENTREGADO': continue
    if tipo == 'ESCALAR' and not reciente:
        acc['cas'] = (sal + f"Te pido el favor de que un asesor me ayude con la guía {guia} de {dc.title()}: " +
                      (f"lleva {q.get('dias', '?')} días en «{q.get('status', estado_hoy)}» sin moverse. " if q else '') +
                      "¿Me ayudas a ubicar el paquete con la transportadora y darme una fecha de entrega? Así le aviso al cliente." + fin)
    elif tipo == 'OFICINA':
        dirof = oficina(txt)
        # Ronald 26-11: Lucid ya manda su plantilla de oficina (con video) cuando Dropi pasa a RECLAME EN OFICINA → aquí solo si Dropi aún NO lo marca así.
        if not e.get('cliente_oficina') and estado_hoy != 'RECLAME EN OFICINA':
            total = o.get('total') or 0
            if 'SIN' in (o.get('rate') or '').upper(): total = 0   # Ronald 27-11: pedido pagado por anticipo → no se cobra al recibir
            acc['cliente'] = (f"Hola {nom.split(' ')[0] if nom else ''} 👋 Te escribe Karen de Toro Verde. ¡Tu pedido ya llegó! 📦\n"
                              f"Está disponible para reclamar en la oficina de {dc.title()}" + (f": *{dirof}*" if dirof else '') +
                              f" ({(o.get('city') or q.get('city') or '').title()}).\n"
                              "Lleva tu *cédula original*" + (f" y el pago contra entrega de *${total:,.0f}*".replace(',', '.') if total else ' (tu pedido ya está pagado, no pagas nada)') +
                              ". Ve en horario de oficina.\nSi no puedes ir, cuéntanos y lo puede reclamar un familiar con autorización. 🌱")
        if not reciente and not e.get('gracias_oficina'):
            acc['cas'] = sal + 'Mil gracias por confirmarme que ya está en la oficina. Ya le aviso al cliente para que pase hoy mismo con su cédula.' + ' ¡Feliz día! 🙏'
            e['gracias_oficina'] = ahora
    elif tipo == 'EVIDENCIA' and not reciente:
        if not e.get('cliente_evid'):
            acc['cliente'] = (f"Hola {nom.split(' ')[0] if nom else ''} 👋 Te escribe Karen de Toro Verde. La transportadora nos pide evidencia para "
                              "agilizar la entrega de tu pedido. ¿Nos ayudas con una foto de la fachada de tu casa (que se vea la nomenclatura) "
                              "y nos confirmas tu dirección completa y un teléfono donde te encuentren? 🙏")
        acc['adjunto'] = 'pantallazo'
        acc['cas'] = sal + f"Te comparto el pantallazo del pedido con el estado de la guía {guia}. Ya le pedí al cliente las fotos y te las paso apenas me lleguen; mientras tanto, ¿me ayudas a seguir con la entrega?" + fin
    elif tipo in ('DATOS', 'DEVOLUCION', 'NOVEDAD_CLIENTE') and not reciente:
        v = ver(pid); dirc = f"{v.get('dir', '')}, {(v.get('city') or '').title()}, {(v.get('state') or '').title()}".strip(', ')
        datos = f"destinatario {nom}, celular {v.get('phone') or tel}, dirección {dirc}"
        acc['cas'] = sal + (f"Claro que sí, aquí van los datos: {datos}. " if tipo == 'DATOS' else
                            f"Te pido el favor de no devolver el paquete: el cliente sí lo quiere recibir. Hagamos un nuevo ofrecimiento con estos datos confirmados: {datos}. ") + \
                     "¿Me confirmas la fecha de entrega para avisarle?" + fin
    elif tipo == 'CICLO' and not reciente:
        # Ronald 26-11 (aprendido de Coordinadora): sin más intentos → pedir custodia en oficina para que el cliente lo reclame, no devolver
        acc['cas'] = (sal + "Gracias por contarme. Para no perder el envío, ¿me ayudas a dejar el paquete en custodia en la oficina más cercana al cliente "
                      f"(guía {guia})? Él lo reclama con su cédula. Pásame la dirección de esa oficina y yo le aviso de una." + fin)
    elif tipo == 'ESPERA' and not reciente and q and q.get('horas', 0) >= 48:
        acc['cas'] = (sal + f"Gracias por la gestión. Te cuento que la guía {guia} sigue en «{q.get('status')}» desde {q.get('desde', '')} "
                      f"({q.get('dias', '?')} días sin moverse) y el cliente está pendiente. ¿Me ayudas a escalarla con la regional y darme una fecha de entrega?" + fin)
    elif tipo == 'OTRO':
        para_ia.append(f"{pid} {dc} | {txt[:220]}")
    if 'cas' in acc or 'cliente' in acc: plan.append(acc)

hechos = {'cas': 0, 'cliente': 0}
for a in plan[:MAX]:
    e = est[str(a['pedido'])]
    if 'cliente' in a and a['tel']:
        r = al_cliente(a['tel'], a['cliente']); a['res_cliente'] = r
        if r == 'chat_cerrado':
            cola = json.load(open(f'{D}/rastreo_plantilla.json')) if os.path.exists(f'{D}/rastreo_plantilla.json') else {}
            cola[a['tel']] = {'pedido': a['pedido'], 'nombre': a['nombre'], 'tipo': a['tipo'], 'texto': a['cliente'], 'cuando': ahora}
            json.dump(cola, open(f'{D}/rastreo_plantilla.json', 'w'), ensure_ascii=False)
        if r == 'enviado':
            hechos['cliente'] += 1; e['cliente_oficina' if a['tipo'] == 'OFICINA' else 'cliente_evid'] = ahora
    if 'cas' in a:
        if not ENVIAR: a['res_cas'] = 'listo'; continue
        env = dict(os.environ)
        if a.get('adjunto'):
            subprocess.run(['node', 'pantallazo_pedido.js', str(a['pedido'])], cwd=D, capture_output=True, timeout=150)
            fotos = [f'{D}/evidencias/pedido_{a["pedido"]}.png'] + [os.path.join(f'{D}/evidencias/{a["tel"]}', f) for f in (os.listdir(f'{D}/evidencias/{a["tel"]}') if os.path.isdir(f'{D}/evidencias/{a["tel"]}') else [])][:3]
            env['ADJUNTO'] = ','.join(f for f in fotos if os.path.exists(f))
        try: out = subprocess.run(['node', 'reabrir_cas.js', str(a['pedido']), a['cas'], 'seguir'], cwd=D, env=env, capture_output=True, text=True, timeout=240).stdout.strip().splitlines()
        except Exception as ex: out = ['ERROR ' + str(ex)[:50]]
        a['res_cas'] = out[-1] if out else 'sin salida'
        if 'OK' in a['res_cas']: hechos['cas'] += 1; e['cas_msg'] = ahora
json.dump(est, open(EST, 'w'), ensure_ascii=False)
json.dump({'plan': plan, 'para_ia': para_ia, 'conteo': cont}, open(f'{D}/cas_auto.json', 'w'), ensure_ascii=False, indent=1)
print('CAS_AUTO casos', len(casos), 'tipos', cont, '| acciones', len(plan), '| CAS enviados', hechos['cas'], '| clientes avisados', hechos['cliente'], '|', 'ENVIADO' if ENVIAR else 'PRUEBA')
for a in plan[:MAX]: print(' ', a['tipo'], a['pedido'], a['nombre'][:18], '| CAS:', a.get('res_cas', '-'), '| cliente:', a.get('res_cliente', '-'))
if para_ia: print('PARA_IA (razonar solo estos):'); [print('  ', l) for l in para_ia]
