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
# Solo cuenta lo que confirma el CLIENTE (nunca el aviso de Lucid «Tu pedido se ha subido», que en landing sale antes de que confirme)
SI = re.compile(r'(gracias por confirmar tu pedido|procederemos a gestionar y subir tu pedido)', re.I)
SI_CLIENTE = re.compile(r'^Usuario \([^)]*\):\s*(confirmar pedido|s[ií]\b|si,? es correcto|es correcto|correcto|confirmo|listo|ok\b|dale|de una|m[aá]nd(e|al)o)', re.I | re.M)


# Ronald 21-11 (no negociable): transportadora que pide el cliente, pedidos de Shopify y carritos recuperados.
TRANS_CLIENTE = re.compile(r'(?:por|con|en|transportadora|empresa|mensajer[ií]a)\s+(?:la\s+de\s+|de\s+)?(env[ií]a|interrap\w*|inter\b|servientrega|coordinadora|tcc|domina)', re.I)
def trans_pedida(usuario):
    m = list(TRANS_CLIENTE.finditer(usuario))
    if not m: return ''
    x = m[-1].group(1).lower()
    return 'ENVIA' if x.startswith('env') else 'INTERRAPIDISIMO' if x.startswith('inter') else x.upper()
def marcas(c):
    try: tg = get(f'/contacts/{c}/tags'); tg = tg.get('data', tg) if isinstance(tg, dict) else tg
    except Exception: tg = []
    nombres = [str(x.get('name', '')) for x in tg if isinstance(x, dict)]
    shop = any(n in ('Shopify', 'Subido Shopify', 'SHOPIFY_WEBHOOK') for n in nombres) or bool(campo(c, '448359'))
    rec = campo(c, '731835')
    carrito = any('carrito' in n.lower() for n in nombres) or bool(re.search(r's[ií]|true|1|lograd', rec or '', re.I))
    return shop, carrito
def confirmo_boton(t): return bool(re.search(r'^Usuario \([^)]*\):\s*confirmar pedido', t, re.I | re.M) or SI.search(t))

ops = []; o = 0
while o < 30000:
    d = get(f'/pipelines/705299/opportunities?limit=100&offset={o}'); d = d.get('data', d); ops += d
    if len(d) < 100: break
    o += 100
subidos = [r for r in ops if r['created_at'] >= DESDE and r['stage']['name'] == 'Pedidos Subidos']
if '--contactos' in sys.argv:  # solo estos contactos (p. ej. los pendientes de confirmar en Dropi), con todos sus pedidos de 7 días
    quiero = set(open(sys.argv[sys.argv.index('--contactos') + 1]).read().split())
    if os.path.exists('/tmp/dropi/extra_contactos.txt'): quiero |= set(open('/tmp/dropi/extra_contactos.txt').read().split())
    hace7 = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).strftime('%Y-%m-%d %H:%M')
    subidos = [r for r in ops if str(r['contact_id']) in quiero and r['created_at'] >= hace7]
por_contacto = {}
for r in sorted(subidos, key=lambda r: r['created_at']):
    por_contacto.setdefault(str(r['contact_id']), []).append(r)

filas = []
for c, lst in por_contacto.items():
    res = campo(c, '880500'); p = parse(res); msg = campo(c, '386920')
    try: info = get(f'/contacts/{c}'); info = info.get('data', info); en_humano = bool(info.get('live_chat'))
    except Exception: en_humano = False
    try: t = get(f'/contacts/{c}/messages?limit=25'); t = t.get('data', t); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: t = ''
    usuario = ' '.join(l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t) if l.startswith('Usuario'))
    oficina = bool(re.search(r'oficina|interrapid', (p['Dirección'] + ' ' + p['Notas']), re.I))
    motivos = []
    if en_humano: motivos.append('una persona del equipo está atendiendo este chat (modo humano en Lucid): no lo toco')
    oficina_chat = re.search(r'reclam|recog|me (mandan|env[ií]an) (el )?c[oó]digo|bajo (a|para)|voy a (la oficina|recogerlo)|en la oficina|interrapid', usuario, re.I)
    if oficina_chat and not oficina: motivos.append('en el chat habla de reclamarlo/recogerlo pero la dirección es de casa: preguntar si es oficina de Interrapidísimo')
    if len(lst) > 1: motivos.append(f'repetido ({len(lst)} pedidos en Lucid)')
    if NO.search(usuario): motivos.append('el cliente dijo que no: «' + NO.search(usuario).group(0) + '»')
    if not p['Ciudad']: motivos.append('sin ciudad')
    if not p['Departamento']: motivos.append('sin departamento')
    if not oficina and len(p['Dirección']) < 6: motivos.append('sin dirección')
    # Confirmación: mensaje de «gracias por confirmar», o el cliente dice sí/listo/ok… después del último resumen.
    tras = t[t.rfind('Resumen de tu pedido'):] if 'Resumen de tu pedido' in t else ''
    dijo_si = any((len(l.split('):',1)[-1].strip()) < 80 and re.search(r'\b(s[ií]+|ok|listo|dale|de una|confirm\w*|correct[oa]|as[ií] est[aá]|m[aá]nd\w*|env[ií]\w*|perfecto|claro|bueno|est[aá] bien)\b', l.split('):',1)[-1], re.I))
                  for l in re.split(r'\n(?=(?:Yo|Usuario) \()', tras) if l.startswith('Usuario'))
    if not (SI.search(t) or dijo_si or SI_CLIENTE.search(tras or '')): motivos.append('no veo la confirmación del cliente en el chat')
    if re.search(r'confirmacion_landing|CONFIRMAR PEDIDO', t) and not re.search(r'^Usuario \([^)]*\):\s*confirmar pedido', t, re.I | re.M) and not SI.search(t): motivos.append('pedido de la página: el cliente no ha tocado «CONFIRMAR PEDIDO»')
    # Ronald 21-11 (Evidalio): si el cliente pide Addi, cuotas o transferencia NUNCA se confirma solo, aunque Lucid diga «contra entrega».
    pago_previo = re.search(r'addi|cuotas|transferencia|consignaci|comprobante|sin recaudo|bancolombia|nequi|daviplata|no (lo )?pago (en )?contra ?entrega', p['Método de pago'] + ' ' + usuario + ' ' + (tras or ''), re.I)
    # Último resumen que el cliente vio y confirmó en el chat (manda sobre el campo de Lucid, que a veces queda viejo)
    ult = t[t.rfind('Resumen de tu pedido'):] if 'Resumen de tu pedido' in t else ''
    prod_chat = ' '.join(f'({q} x Presentacion {pr.strip()})' for q, pr in re.findall(r'(\d+)\s*x[^\n]*?Presentaci[oó]n:?\s*([A-Za-zÁÉÍÓÚ0-9 ]+)', ult[:600]))
    vt = re.search(r'Total pedido:\*?[^\d]*([\d.,]+)', ult[:800])
    valor_chat = re.sub(r'[^\d]', '', vt.group(1)) if vt else ''
    if prod_chat and p['Productos'] and prod_chat.upper().replace('Ó','O').split('PRESENTACION')[1:] != p['Productos'].upper().replace('Ó','O').split('PRESENTACION')[1:]:
        pass
    es_shop, carrito = marcas(c)
    if es_shop and not confirmo_boton(t) and not any('CONFIRMAR PEDIDO' in m for m in motivos): motivos.append('pedido de Shopify: el cliente no ha tocado «CONFIRMAR PEDIDO» en el chat')
    filas.append({'contacto': c, 'shopify': es_shop, 'carrito': carrito, 'trans_cliente': trans_pedida(usuario), 'nombre': (p['Nombre'] + ' ' + p['Apellido']).strip(), 'ciudad': f"{p['Ciudad']} ({p['Departamento']})",
                  'producto': (prod_chat or p['Productos'])[:120], 'valor': (valor_chat or p['Valor total']), 'producto_lucid': p['Productos'][:120], 'valor_lucid': p['Valor total'], 'entrega': 'Oficina Interrapidísimo' if oficina else 'Domicilio',
                  'transportadora': 'INTERRAPIDISIMO' if oficina else 'la que más entregue en el municipio', 'id_lucidsales': re.findall(r'"id":"?(\d+)', msg)[:1],
                  'decision': 'POR CANCELAR' if motivos else ('REVISAR PAGO' if pago_previo else 'SALE'), 'motivos': motivos or (['pago anticipado (transferencia o Addi): confirmar que la plata llegó'] if pago_previo else [])})
# Ronald 21-11: «cada cliente debes buscarlo en el chat y evaluar la intención de compra».
# Pedidos de la página (landing) no pasan por el embudo 705299: se lee igual su chat de Lucid (contacto = 57 + teléfono).
if '--contactos' in sys.argv:
    for c in sorted(quiero - set(por_contacto)):
        try: info = get(f'/contacts/{c}'); info = info.get('data', info)
        except Exception: continue
        try: t = get(f'/contacts/{c}/messages?limit=40'); t = t.get('data', t); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
        except Exception: t = ''
        usuario = ' '.join(l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t) if l.startswith('Usuario'))
        tras = t[t.rfind('Resumen de tu pedido'):] if 'Resumen de tu pedido' in t else ''
        motivos = []
        if info.get('live_chat'): motivos.append('una persona del equipo está atendiendo este chat (modo humano en Lucid): no lo toco')
        if NO.search(usuario): motivos.append('el cliente dijo que no: «' + NO.search(usuario).group(0) + '»')
        if re.search(r'addi|cuotas|transferencia|consignaci|comprobante|nequi|daviplata|no (lo )?pago (en )?contra ?entrega', usuario + ' ' + tras, re.I): motivos.append('pide pagar por Addi, cuotas o transferencia: se confirma a mano')
        confirmo = re.search(r'^Usuario \([^)]*\):\s*(confirmar pedido|s[ií]\b|si,? es correcto|es correcto|correcto|confirmo)', t, re.I | re.M) or SI.search(t)
        if not confirmo: motivos.append('pedido de la página: el cliente aún no confirma en el chat (no tocó «CONFIRMAR PEDIDO» ni dijo sí)')
        if re.search(r'reclam|recog|me (mandan|env[ií]an) (el )?c[oó]digo|en la oficina', usuario, re.I): motivos.append('en el chat habla de reclamar en oficina: revisar la dirección')
        es_shop, carrito = marcas(c)
        filas.append({'contacto': c, 'shopify': es_shop, 'carrito': carrito, 'trans_cliente': trans_pedida(usuario), 'nombre': info.get('first_name') or '', 'ciudad': '', 'producto': '', 'valor': '', 'producto_lucid': '', 'valor_lucid': '',
                      'entrega': '', 'transportadora': '', 'id_lucidsales': [], 'origen': 'pagina', 'decision': 'POR CANCELAR' if motivos else 'SALE', 'motivos': motivos})
json.dump(filas, open('robot/decision.json', 'w'), ensure_ascii=False, indent=1)
sale = [f for f in filas if f['decision'] == 'SALE']; can = [f for f in filas if f['decision'] != 'SALE']
print('PEDIDOS', len(filas), 'SALEN', len(sale), 'OTROS', len(can))
for f in can: print(' -', f['decision'], '|', f['nombre'], f['contacto'], f['ciudad'], '|', '; '.join(f['motivos']))
