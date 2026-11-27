# Ronald 27-11: «¿no es posible que se coloquen las notas sobre el pedido directo en Dropi, de qué se debe hacer? Ejemplo: llamar por
# esto y esto; así, las acciones que debe hacer cada persona». → A cada pedido en REVISAR HUMANO se le escribe en las NOTAS de Dropi:
#   🤖 ROBOT dd/mm hh:mm · POR QUÉ: <motivo> · QUÉ HACER: <acción> · QUIÉN: <persona>
# Sin IA. Si el pedido ya tenía una nota del robot, se reemplaza (no se acumulan); las notas de las personas se respetan.
# Uso: python3 -I robot/notas_revisar.py   (después de plan.py / confirmar_aprobados.sh)
import json, os, re, subprocess, datetime
D = '/tmp/dropi'
ACC = [  # (patrón del motivo, qué hacer, quién)
    (r'oficina de Interrap\w* y con Interrap\w* recibe', 'Con Interrapidísimo ha recibido la mitad o menos: llamar y confirmar que sí va a ir a la oficina; si confirma, confirmar el pedido.', 'Karen'),
    (r'modo humano', 'Terminar la conversación en Lucid y devolverla al bot. Si el cliente ya aceptó el resumen, confirmar.', 'quien atiende el chat'),
    (r'pago anticipado|transferencia|addi|cuotas|comprobante', 'Validar en el banco que llegó la plata (grupo Comprobantes de Pago CDR) y confirmar descontando el abono.', 'Karen'),
    (r'recibe solo|devuelve|riesgos|cr[ií]tica', 'Cliente que devuelve: esperar el abono. Si tiene solo una devolución de más y no responde, el robot le manda el audio. No confirmar sin abono.', 'Karen'),
    (r'no veo la confirmaci|no ha tocado|no confirma|aún no confirma', 'Llamar o escribir al cliente para que confirme el pedido (sí o no).', 'Karen'),
    (r'descuento|ruleta|casino', 'Cliente que ya compró con descuento del casino: decide Ronald si se respeta el precio o va normal.', 'Ronald'),
    (r'direcci[oó]n|rural|nomenclatura|vereda|oficina', 'Llamar al cliente: pedir dirección exacta o confirmar la oficina de Interrapidísimo del municipio.', 'Karen'),
    (r'repetido|otro pedido abierto', 'Preguntar al cliente si son dos pedidos o uno repetido. El robot no cancela.', 'Karen'),
    (r'flete', 'Flete sobre el tope (+15 %): probar otra transportadora más barata; si no hay, decide Ronald.', 'Karen'),
    (r'producto distinto|cantidad|pide \d+ L', 'Confirmar con el cliente producto y cantidad del último resumen y corregir en Dropi.', 'Karen'),
    (r'nombre raro', 'Confirmar el nombre completo como aparece en la cédula.', 'Karen'),
    (r'tel[eé]fono|n[uú]mero', 'Buscar en Lucid el WhatsApp desde el que compró; dejarlo en Dropi y el otro en notas.', 'Karen'),
    (r'dijo que no', 'El cliente dijo que no: llamar para confirmar si de verdad no lo quiere.', 'Karen'),
    (r'etiquetas', 'Ya tiene etiquetas de una persona: revisar y terminar ese pedido.', 'Karen'),
]
def accion(m):
    for pat, que, quien in ACC:
        if re.search(pat, m, re.I): return que, quien
    return 'Revisar el chat en Lucid y decidir: confirmar o preguntar al cliente.', 'Karen'

plan = json.load(open(f'{D}/plan.json')) if os.path.exists(f'{D}/plan.json') else {}
mot = {}
for k in ('etiquetar', 'revisar_total', 'etiquetar_extra'):
    for x in plan.get(k, []) or []:
        if x.get('id') and x.get('motivo'): mot.setdefault(int(x['id']), x['motivo'])
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
    if reg.get(str(i)) == m: continue   # misma nota ya puesta
    que, quien = accion(m)
    filas.append({'id': i, 'nota': f'🤖 ROBOT {hora} · POR QUÉ: {m} · QUÉ HACER: {que} · QUIÉN: {quien}', 'motivo': m})
if filas:
    json.dump(filas, open(f'{D}/notas_revisar_lote.json', 'w'), ensure_ascii=False)
    out = subprocess.run(['node', 'notas_lote.js', 'notas_revisar_lote.json'], cwd=D, capture_output=True, text=True, timeout=600).stdout
    for l in out.splitlines():
        if l.startswith('NOTA_OK'):
            i = l.split()[1]; reg[i] = next(f['motivo'] for f in filas if str(f['id']) == i)
    json.dump(reg, open(REG, 'w'), ensure_ascii=False)
    print('NOTAS', sum(1 for l in out.splitlines() if l.startswith('NOTA_OK')), 'de', len(filas), out.count('SALTO'), 'saltados')
else: print('NOTAS 0 nuevas')
