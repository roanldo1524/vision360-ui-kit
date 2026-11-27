# Ronald 27-11: «¿no es posible que se coloquen las notas sobre el pedido directo en Dropi, de qué se debe hacer? Ejemplo: llamar por
# esto y esto; así, las acciones que debe hacer cada persona». → A cada pedido en REVISAR HUMANO se le escribe en las NOTAS de Dropi:
#   🤖 ROBOT dd/mm hh:mm · POR QUÉ: <motivo> · QUÉ HACER: <acción> · QUIÉN: <persona>
# Sin IA. Si el pedido ya tenía una nota del robot, se reemplaza (no se acumulan); las notas de las personas se respetan.
# Uso: python3 -I robot/notas_revisar.py   (después de plan.py / confirmar_aprobados.sh)
import json, os, re, subprocess, datetime
D = '/tmp/dropi'
# Ronald 27-11: «que la extensión nos diga qué hacer, qué solución debe hacer el humano». Cada motivo → un PASO concreto y,
# si hay que hablarle al cliente, el MENSAJE listo para mandarle por WhatsApp (en tono de Karen). Sin «·» ni «|» en los textos.
# (patrón, paso, mensaje al cliente o '', quién, ¿se puede confirmar al final?)
ACC = [
    (r'modo humano', 'Abrir el chat en Lucid, terminar la conversación y devolverla al bot', '', 'quien atiende el chat', True),
    (r'pago anticipado|transferencia|addi|cuotas|comprobante', 'Revisar en el banco que llegó la plata (grupo Comprobantes de Pago CDR) y descontar el abono del total', 'Hola {n}, soy Karen de Toro Verde 🌱 ¿Me compartes por favor la foto del comprobante del pago para despachar tu pedido hoy mismo?', 'Karen', True),
    (r'oficina de Interrap\w* y con Interrap\w* recibe', 'Llamar y preguntar si de verdad va a ir a la oficina de Interrapidísimo a reclamarlo', 'Hola {n}, soy Karen de Toro Verde 🌱 Tu pedido sale hoy para la oficina de Interrapidísimo. ¿Me confirmas que pasas a reclamarlo apenas llegue? Lo guardan pocos días.', 'Karen', True),
    (r'recibe solo|devuelve|riesgos|cr[ií]tica', 'NO confirmar todavía: pedir el abono. Si solo tiene una devolución de más y no responde, el robot le manda el audio sin anticipo', 'Hola {n}, soy Karen de Toro Verde 🌱 Para despachar tu pedido te pedimos un abono por Nequi o Bancolombia; el resto lo pagas al recibir. ¿Te comparto los datos?', 'Karen', False),
    (r'no veo la confirmaci|no ha tocado|no confirma|aún no confirma', 'Escribir o llamar al cliente para que diga sí o no', 'Hola {n}, soy Karen de Toro Verde 🌱 Tu pedido ya está listo para despachar hoy. ¿Me confirmas con un SÍ para enviarlo?', 'Karen', True),
    (r'descuento|ruleta|casino', 'Ya había comprado y le dieron precio de descuento: Ronald decide si se respeta o va a precio normal', '', 'Ronald', False),
    (r'rural|nomenclatura|vereda|no encuentro la oficina', 'Preguntar en qué oficina de Interrapidísimo del municipio lo reclama y poner esa dirección en Dropi', 'Hola {n}, soy Karen de Toro Verde 🌱 Para que tu pedido llegue sin problema, ¿lo reclamas en la oficina de Interrapidísimo de tu municipio? Si es a domicilio, mándame la dirección con número de casa y un punto de referencia.', 'Karen', True),
    (r'direcci[oó]n', 'Pedir la dirección completa (calle, número, barrio y punto de referencia) y corregirla en Dropi', 'Hola {n}, soy Karen de Toro Verde 🌱 Para despachar tu pedido me falta la dirección completa: calle, número de casa, barrio y un punto de referencia. ¿Me la compartes?', 'Karen', True),
    (r'repetido|otro pedido abierto', 'Preguntar si son dos pedidos o si uno está repetido (el robot no cancela)', 'Hola {n}, soy Karen de Toro Verde 🌱 Vemos dos pedidos a tu nombre. ¿Quieres recibir los dos o es uno solo?', 'Karen', True),
    (r'flete', 'Flete sobre el tope: cambiar a una transportadora más barata en Dropi; si no hay, decide Ronald', '', 'Karen', True),
    (r'producto distinto|cantidad|pide \d+ L', 'Confirmar con el cliente producto y cantidad del último resumen y corregirlo en Dropi', 'Hola {n}, soy Karen de Toro Verde 🌱 ¿Me confirmas cuántos litros quieres en tu pedido para dejarlo exacto?', 'Karen', True),
    (r'nombre raro', 'Pedir el nombre completo como aparece en la cédula y corregirlo', 'Hola, soy Karen de Toro Verde 🌱 ¿Me confirmas tu nombre completo como aparece en la cédula para el envío?', 'Karen', True),
    (r'dijo que no', 'El cliente dijo que no: llamarlo y confirmar si de verdad no lo quiere', '', 'Karen', False),
    (r'etiquetas', 'Una persona ya le puso etiquetas: revisar y terminar ese pedido', '', 'Karen', True),
]
def accion(m, nombre=''):
    n = (nombre or '').split(' ')[0].title()
    pasos, decir, quien, confirmar = [], '', 'Karen', True
    pd = re.search(r'precio distinto: Dropi (\d+), chat (\d+)', m)
    if pd: pasos.append(f"Cambiar el precio en Dropi a ${int(pd.group(2)):,} (lo que aceptó en el chat; hoy dice ${int(pd.group(1)):,})".replace(',', '.'))
    pc = re.search(r'producto distinto: en el chat (\d+) L[^,;]*, en Dropi (\d+) L', m)
    if pc: pasos.append(f'Cambiar la cantidad en Dropi a {pc.group(1)} litro(s) (lo del chat; hoy dice {pc.group(2)})')
    for parte in [x.strip() for x in m.split(';') if x.strip()]:
        for pat, paso, msj, q, conf in ACC:
            if re.search(pat, parte, re.I):
                if paso not in pasos: pasos.append(paso)
                if msj and not decir: decir = msj.replace('{n}', n or '')
                if q != 'Karen': quien = q
                confirmar = confirmar and conf
                break
    if not pasos: pasos.append('Revisar el chat en Lucid y decidir si confirmar o preguntarle al cliente')
    if confirmar: pasos.append('Si todo queda bien, tocar Confirmar pedido')
    texto = ' '.join(f'{k}) {p}.' for k, p in enumerate(pasos, 1))
    return texto, quien, decir

plan = json.load(open(f'{D}/plan.json')) if os.path.exists(f'{D}/plan.json') else {}
mot = {}
nombres = {}
for k in ('etiquetar', 'revisar_total', 'etiquetar_extra'):
    for x in plan.get(k, []) or []:
        if x.get('id') and x.get('motivo'): mot.setdefault(int(x['id']), x['motivo'])
        if x.get('id') and x.get('nombre'): nombres[int(x['id'])] = x['nombre']
try:
    for k, v in (json.load(open(f'{D}/vetos.json')) or {}).items():
        m = v.get('motivo') if isinstance(v, dict) else v
        if m: mot[int(k)] = m   # el veto (razonado) manda sobre el motivo de las reglas
except Exception: pass
REG = f'{D}/notas_revisar.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
hora = (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).strftime('%d/%m %I:%M %p')
filas = []
for i, m in mot.items():
    m = re.sub(r'\s+', ' ', m).strip()[:220]
    if reg.get(str(i)) == 'v2:' + m: continue   # misma nota ya puesta (v2 = con pasos y mensaje)
    que, quien, decir = accion(m, nombres.get(i, ''))
    filas.append({'id': i, 'nota': f'🤖 ROBOT {hora} · POR QUÉ: {m} · QUÉ HACER: {que} · QUIÉN: {quien}' + (f' · DECIR: {decir}' if decir else ''), 'motivo': m})
if filas:
    json.dump(filas, open(f'{D}/notas_revisar_lote.json', 'w'), ensure_ascii=False)
    out = subprocess.run(['node', 'notas_lote.js', 'notas_revisar_lote.json'], cwd=D, capture_output=True, text=True, timeout=600).stdout
    for l in out.splitlines():
        if l.startswith('NOTA_OK'):
            i = l.split()[1]; reg[i] = 'v2:' + next(f['motivo'] for f in filas if str(f['id']) == i)
    json.dump(reg, open(REG, 'w'), ensure_ascii=False)
    print('NOTAS', sum(1 for l in out.splitlines() if l.startswith('NOTA_OK')), 'de', len(filas), out.count('SALTO'), 'saltados')
else: print('NOTAS 0 nuevas')
