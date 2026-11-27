# Ronald 26-11: «el de rastreo me parece bien para que INSISTA al cliente en caso de que se hayan enviado plantillas y este no contesta aún nada».
# Lucid ya manda sus propias plantillas por estado (guía, oficina, reparto, con video). Este programa NO las repite:
# solo INSISTE cuando el paquete lleva 2 días en «RECLAME EN OFICINA» y el cliente no ha escrito nada desde entonces
# (2.º intento a los 4 días). Así se evita que la transportadora lo devuelva. Código, sin IA.
# Chat abierto (<23 h, sin modo humano) → texto. Chat cerrado → plantilla «rastreo_pedido_tv» (FLUJO_RASTREO, con los campos Robot dato 2 y 3).
# Mensajes solo de 7 a. m. a 8 p. m. Uso: python3 -I rastreo.py [--enviar] [--max 40]
import json, os, re, sys, time, datetime, urllib.request, urllib.parse
sys.path.insert(0, '/tmp/robot/robot')
ENVIAR = '--enviar' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 40
# Ronald 27-11 creó la plantilla «rastreo_oficina_guia» en el flujo «Rastreo oficina - sin reclamar»:
#   Hola {{1}} 📦 Tu pedido de Toro Verde ya está en la oficina de Interrapidísimo de {{2}} ({{3}}). 📋 Guía: {{4}} 💵 Valor a pagar: ${{5}} …
# Solo sirve para Interrapidísimo. CAMPOS = IDs de los campos de Lucid que el flujo usa en {{2}}…{{5}} (falta que Ronald diga cuáles).
FLUJO_RASTREO = '1795789863193'
CAMPOS = {'ciudad': '', 'direccion': '', 'guia': '', 'valor': ''}
D = '/tmp/dropi'; EST = f'{D}/rastreo_estado.json'; COLA = f'{D}/rastreo_plantilla.json'
est = json.load(open(EST)) if os.path.exists(EST) else {}
est = {k: v for k, v in est.items() if isinstance(v, dict)}  # formato viejo (lista de etapas) ya no sirve
cola = json.load(open(COLA)) if os.path.exists(COLA) else {}
ahora = time.time(); hoy = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)
try: K = open('/tmp/robot/lucidbot.key').read().strip()
except Exception: K = 'x'
def lucid(p, body=None, form=None):
    data = json.dumps(body).encode() if body is not None else (urllib.parse.urlencode(form).encode() if form else None)
    req = urllib.request.Request('https://panel.lucidbot.co/api' + p, data=data, method='POST' if data else 'GET',
                                 headers={'X-ACCESS-TOKEN': K, **({'Content-Type': 'application/json'} if body is not None else {})})
    r = json.loads(urllib.request.urlopen(req, timeout=40).read()); return r.get('data', r) if isinstance(r, dict) else r
try: import oficinas as _of
except Exception: _of = None

def plata(v): return f"${(v or 0):,.0f}".replace(',', '.')
# Ronald 27-11: «ojo con lo de pagas al recibirlo, no si es anticipado» → pedido SIN RECAUDO (ya pagó) no se le cobra nada
def pagado(o): return 'SIN' in (o.get('rate') or '').upper() or not (o.get('total') or 0)
def pago(o): return 'Tu pedido ya está pagado: no tienes que pagar nada al recibirlo.' if pagado(o) else f"Lleva {plata(o.get('total'))} para pagar al recibirlo."
def dir_oficina(o):
    if not (_of and 'INTER' in (o.get('dc') or '').upper()): return ''
    try: d = _of.dir_oficina(o.get('state', ''), _of.muni(o.get('city', '')), '') or ''
    except Exception: d = ''
    return d.split(', RECLAMA')[0].split(' - RECLAMA')[0]
def etapa(o):
    d = dir_oficina(o); dc = (o.get('dc') or 'la transportadora').title(); ciu = (o.get('city') or '').title()
    return f"Tu pedido ya está en la oficina de {dc} de {ciu}" + (f" ({d})" if d else '')
def texto(o, intento):
    n = (o.get('name') or '').split(' ')[0].title() or 'compita'
    cab = f"Hola {n} 👋 Soy Karen, de Toro Verde. " + ("Te escribo de nuevo porque es importante: " if intento == 2 else "")
    return (cab + f"{etapa(o)} 📦\n\nLleva tu cédula original. {pago(o)}\n\n"
            "⏳ La transportadora solo lo guarda unos pocos días y, si no se recibe, lo devuelve. ¿Te ayudamos a recibirlo? "
            "Si no puedes ir, lo puede reclamar un familiar con una autorización y copia de tu cédula.")
def ultimo_del_cliente(tel):
    try:
        t = lucid(f'/contacts/57{tel}/messages?limit=20'); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
        f = re.findall(r'Usuario \((\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}[ap]m)\)', t)
        return datetime.datetime.strptime(f[-1], '%Y-%m-%d %I:%M%p').timestamp() + 5 * 3600 if f else 0
    except Exception: return 0

try: ped = json.load(open(f'{D}/hoy.json'))
except Exception: print('RASTREO sin hoy.json'); sys.exit(0)
ofi = {str(o['id']): o for o in ped if o.get('status') == 'RECLAME EN OFICINA' and o.get('phone')}
for pid in list(est):            # ya salió de oficina (entregado, devuelto…) → se olvida
    if pid not in ofi: est.pop(pid)
# fecha REAL de llegada a la oficina (dropi/oficina_desde.js); si no se sabe, se cuenta desde que este programa lo vio
import subprocess
try: subprocess.run(['node', 'oficina_desde.js'], cwd=D, capture_output=True, timeout=900)
except Exception: pass
try: real = json.load(open(f'{D}/oficina_desde.json'))
except Exception: real = {}
def _ts(x):
    try: return datetime.datetime.strptime(x[:16], '%Y-%m-%d %H:%M').timestamp() + 5 * 3600
    except Exception: return None
for pid in ofi:
    e = est.setdefault(pid, {'desde': ahora, 'intentos': 0})
    r = _ts(real.get(pid, '')) if real.get(pid) else None
    if r and r < e['desde']: e['desde'] = r
env = cerr = 0; tocar = []
for pid, o in ofi.items():
    e = est[pid]; horas = (ahora - e['desde']) / 3600
    if (e['intentos'] == 0 and horas >= 48) or (e['intentos'] == 1 and horas >= 96): tocar.append((pid, o))
if 7 <= hoy.hour < 20:
    for pid, o in tocar[:MAX]:
        e = est[pid]; tel = o['phone'][-10:]
        if ultimo_del_cliente(tel) > e['desde']: e['intentos'] = 9; continue   # el cliente ya respondió algo: no se insiste
        try:
            i = lucid(f'/contacts/57{tel}')
            abierto = (not i.get('live_chat')) and (ahora - float(i.get('last_interaction') or 0) / 1000) < 23 * 3600
            humano = bool(i.get('live_chat'))
        except Exception: continue
        if humano: continue
        t = texto(o, e['intentos'] + 1)
        if abierto:
            if ENVIAR and 'true' in json.dumps(lucid(f'/contacts/57{tel}/send_content', {'messages': [{'message': {'text': t}}]})): env += 1
        elif FLUJO_RASTREO and all(CAMPOS.values()) and 'INTER' in (o.get('dc') or '').upper() and dir_oficina(o) and o.get('guia'):
            # «Valor a pagar: ${{5}}»: si ya pagó por anticipo (Ronald 27-11), sale «$0 (ya está pagado, no pagas nada)»
            val = {'ciudad': (o.get('city') or '').title(), 'direccion': dir_oficina(o), 'guia': str(o['guia']),
                   'valor': '0 (ya está pagado, no pagas nada)' if pagado(o) else plata(o.get('total')).lstrip('$')}
            if ENVIAR:
                try:
                    for k, cid in CAMPOS.items(): lucid(f'/contacts/57{tel}/custom_fields/{cid}', form={'value': val[k]})
                    if 'true' in json.dumps(lucid(f'/contacts/57{tel}/send/{FLUJO_RASTREO}', {})): env += 1
                except Exception: continue
        else:
            cerr += 1; cola[tel] = {'pedido': o['id'], 'nombre': o.get('name'), 'texto': t, 'cuando': ahora}
        if ENVIAR: e['intentos'] += 1; e['ultimo'] = ahora
if ENVIAR: json.dump(est, open(EST, 'w')); json.dump(cola, open(COLA, 'w'), ensure_ascii=False)
print('RASTREO', hoy.strftime('%d-%m %H:%M'), '| en oficina', len(ofi), '| para insistir', len(tocar), '| enviados', env,
      '| chat cerrado sin plantilla aún', cerr, '|', 'ENVIADO' if ENVIAR else 'PRUEBA')
