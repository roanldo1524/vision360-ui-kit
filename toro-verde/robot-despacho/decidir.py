# Robot de despacho — paso 1: decide, pedido por pedido, si SALE o va «POR CANCELAR» (solo lee Lucid; no toca nada).
# Uso: python3 -I robot/decidir.py [--desde "AAAA-MM-DD HH:MM" (UTC)]
import json, os, re, sys, time, datetime, urllib.request, urllib.error
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
DESDE = sys.argv[sys.argv.index('--desde') + 1] if '--desde' in sys.argv else (datetime.datetime.utcnow() - datetime.timedelta(hours=24)).strftime('%Y-%m-%d %H:%M')

def abrir(req):
    for i in range(5):
        try: return urllib.request.urlopen(req, timeout=40).read().decode()
        except urllib.error.HTTPError as e:
            if e.code != 429 or i == 4: raise
            time.sleep(70)
get = lambda p: json.loads(abrir(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K})))

def campo(c, f):
    try: d = get(f'/contacts/{c}/custom_fields/{f}'); d = d.get('data', d); return d.get('value') or ''
    except Exception: return ''

def parse(res):
    out = {}
    for k in ['Nombre', 'Apellido', 'Productos', 'Número de teléfono', 'Valor total', 'Departamento', 'Ciudad', 'Colonia', 'Dirección', 'Notas', 'Método de pago']:
        m = re.search(re.escape(k) + r':\s*(.*?)(?:,\s*(?:Nombre|Apellido|Documento|Productos|Número de teléfono|Valor total|Departamento|Ciudad|Colonia|Dirección|Código Postal|Notas|Correo electrónico|Método de pago):|$)', res)
        out[k] = (m.group(1).strip().strip('"') if m else '')
    return out

NO = re.compile(r'\b(no tengo (ahora|plata|dinero)|ya no (lo )?(quiero|necesito)|cancel(a|e|ar|en) (el|mi) pedido|no lo (quiero|voy a recibir)|anul(a|e|ar)|no me lo (manden|envien|envíen)|mejor no|despu[eé]s le (escribo|aviso)|no estoy interesad)', re.I)
SI = re.compile(r'(gracias por confirmar tu pedido|pedido se ha subido|procederemos a gestionar)', re.I)

ops = []; o = 0
while o < 30000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={o}'); d = d.get('data', d); ops += d
    if len(d) < 100: break
    o += 100
subidos = [r for r in ops if r['created_at'] >= DESDE and r['stage']['name'] == 'Pedidos Subidos']
if '--contactos' in sys.argv:  # solo estos contactos (p. ej. los pendientes de confirmar en Dropi), con todos sus pedidos de 7 días
    quiero = set(open(sys.argv[sys.argv.index('--contactos') + 1]).read().split())
    hace7 = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
    subidos = [r for r in ops if str(r['contact_id']) in quiero and r['created_at'] >= hace7 and r['stage']['name'] in ('Pedidos Subidos', 'Corregido - Por Subir')]
por_contacto = {}
for r in sorted(subidos, key=lambda r: r['created_at']):
    por_contacto.setdefault(str(r['contact_id']), []).append(r)

filas = []
for c, lst in por_contacto.items():
    res = campo(c, '880500'); p = parse(res); msg = campo(c, '386920')
    try: t = get(f'/contacts/{c}/messages?limit=25'); t = t.get('data', t); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: t = ''
    usuario = ' '.join(l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t) if l.startswith('Usuario'))
    oficina = bool(re.search(r'oficina|interrapid', (p['Dirección'] + ' ' + p['Notas']), re.I))
    motivos = []
    if len(lst) > 1: motivos.append(f'repetido ({len(lst)} pedidos en Lucid)')
    if NO.search(usuario): motivos.append('el cliente dijo que no: «' + NO.search(usuario).group(0) + '»')
    if not p['Ciudad']: motivos.append('sin ciudad')
    if not p['Departamento']: motivos.append('sin departamento')
    if not oficina and len(p['Dirección']) < 6: motivos.append('sin dirección')
    # Confirmación: mensaje de «gracias por confirmar», o el cliente dice sí/listo/ok… después del último resumen.
    tras = t[t.rfind('Resumen de tu pedido'):] if 'Resumen de tu pedido' in t else ''
    dijo_si = any((len(l.split('):',1)[-1].strip()) < 80 and re.search(r'\b(s[ií]+|ok|listo|dale|de una|confirm\w*|correct[oa]|as[ií] est[aá]|m[aá]nd\w*|env[ií]\w*|perfecto|claro|bueno|est[aá] bien)\b', l.split('):',1)[-1], re.I))
                  for l in re.split(r'\n(?=(?:Yo|Usuario) \()', tras) if l.startswith('Usuario'))
    if not (SI.search(t + msg) or dijo_si): motivos.append('no veo la confirmación del cliente en el chat')
    pago_previo = re.search(r'addi|transferencia|consignaci|comprobante|sin recaudo|bancolombia', p['Método de pago'] + ' ' + usuario + ' ' + (tras or ''), re.I) and not re.search(r'contra ?entrega|con recaudo', p['Método de pago'], re.I)
    if pago_previo and motivos == ['no veo la confirmación del cliente en el chat']: motivos = []  # quien paga por adelantado ya confirmó con el pago
    filas.append({'contacto': c, 'nombre': (p['Nombre'] + ' ' + p['Apellido']).strip(), 'ciudad': f"{p['Ciudad']} ({p['Departamento']})",
                  'producto': p['Productos'][:70], 'valor': p['Valor total'], 'entrega': 'Oficina Interrapidísimo' if oficina else 'Domicilio',
                  'transportadora': 'INTERRAPIDISIMO' if oficina else 'la que más entregue en el municipio', 'id_lucidsales': re.findall(r'"id":"?(\d+)', msg)[:1],
                  'decision': 'POR CANCELAR' if motivos else ('REVISAR PAGO' if pago_previo else 'SALE'), 'motivos': motivos or (['pago anticipado (transferencia o Addi): confirmar que la plata llegó'] if pago_previo else [])})
json.dump(filas, open('robot/decision.json', 'w'), ensure_ascii=False, indent=1)
sale = [f for f in filas if f['decision'] == 'SALE']; can = [f for f in filas if f['decision'] != 'SALE']
print('PEDIDOS', len(filas), 'SALEN', len(sale), 'OTROS', len(can))
for f in can: print(' -', f['decision'], '|', f['nombre'], f['contacto'], f['ciudad'], '|', '; '.join(f['motivos']))
