# Ronald 26-11: «si yo respondo por WhatsApp "confirmado", o "sí está el dinero", o "aprobado", o algo positivo, tú puedes
# despacharlo y registrarlo en el Excel de comprobantes» + «subir el comprobante según el mes» (Drive: Ingresos › Abonos de dinero › MES).
# Lee /tmp/wa/respuestas/*.json (respuestas en el grupo «Comprobantes de Pago CDR» que CITAN un comprobante del robot; whatsapp/wa_grupo.js).
# Vale la respuesta de Ronald, Karen o Leidy (Ronald 26-11: «yo confirmo o alguien del equipo»). Sin IA:
#   POSITIVA con valor («aprobado 50000», «sí llegó 269.000 nequi») → en Dropi: total = total − abono (si queda algo por cobrar),
#       estado PENDIENTE (confirmado) + etiqueta CONFIRMADO AGENTE; avisa en el grupo y deja el abono listo para el registro.
#   POSITIVA sin valor → pregunta en el grupo «¿de cuánto fue el abono?» (no adivina plata).
#   Abono igual o mayor al total (pagó todo) → no lo toca: pide en el grupo que Karen lo marque SIN RECAUDO (cambio de forma de pago).
#   NEGATIVA («no ha llegado», «no está») → no despacha; lo anota y avisa en el grupo.
# El registro (fila en REGISTRO DE ABONOS 2026, hoja EL TORO, y la foto en la carpeta del mes) lo hace la vuelta de los :19
# con los conectores de Google, leyendo /tmp/wa/abonos_registro.json. Uso: python3 -I abonos.py [--enviar]
import json, os, re, sys, glob, time, datetime, subprocess
ENVIAR = '--enviar' in sys.argv
EQUIPO = {'3218940042': 'Ronald', '94502349988013': 'Ronald', '3234209080': 'Leidy', '3206357423': 'Karen'}  # Ronald 26-11: «yo confirmo o alguien del equipo»
W = '/tmp/wa'; D = '/tmp/dropi'; REG = f'{W}/abonos_registro.json'; HECHOS = f'{W}/abonos_hechos.json'
reg = json.load(open(REG)) if os.path.exists(REG) else []
hechos = json.load(open(HECHOS)) if os.path.exists(HECHOS) else {}
POS = re.compile(r'confirm|aprob|\bs[ií]+\b|\bok\b|listo|lleg[oó]|est[aá] (el |la )?(dinero|plata|pago)|recibid|correcto|despach|✅|👍|💯', re.I)
NEG = re.compile(r'\bno\b|falta|no ha llegado|no est[aá]|rechaz|nada', re.I)
BANCO = re.compile(r'nequi|bancolombia|daviplata|davivienda|efectivo|addi', re.I)
def monto(t):
    t2 = re.sub(r'(\d)[.,](\d{3})', r'\1\2', t)
    m = re.search(r'(\d+)\s*(mil|k)\b', t2, re.I)
    if m: return int(m.group(1)) * 1000
    ns = [int(x) for x in re.findall(r'\d{4,7}', t2)]
    ns = [n for n in ns if 1000 <= n < 3000000]
    return ns[0] if ns else None
def es_equipo(r):
    q = (r.get('quien_pn') or '') + ' ' + (r.get('quien') or '')
    for n, nom in EQUIPO.items():
        if n in q: return nom
    m = re.search(r'ronald|karen|leidy', r.get('nombre') or '', re.I)
    return m.group(0).title() if m else None
def al_grupo(texto, karen=False):
    if not ENVIAR: return
    os.makedirs(f'{W}/salida', exist_ok=True)
    json.dump({'texto': texto, 'mencionar': ['573206357423'] if karen else []}, open(f'{W}/salida/{int(time.time()*1000)}_abono.json', 'w'), ensure_ascii=False)
def node(*a, t=150):
    try: return subprocess.run(['node', *a], cwd=D, capture_output=True, text=True, timeout=t).stdout
    except Exception as e: return 'ERROR ' + str(e)[:60]

n = 0
for f in sorted(glob.glob(f'{W}/respuestas/*.json')):
    r = json.load(open(f)); ref = r.get('ref') or {}; texto = (r.get('texto') or '').strip()
    pedido = ref.get('pedido') or (re.search(r'Pedido Dropi:\s*(\d+)', ref.get('texto') or '') or [None, None])[1]
    cel = ref.get('cel') or (re.search(r'Celular:\s*(\d{10})', ref.get('texto') or '') or [None, None])[1]
    nombre = ref.get('nombre') or (re.search(r'Cliente:\s*([^\n]+)', ref.get('texto') or '') or [None, ''])[1]
    clave = os.path.basename(f)
    if clave in hechos: continue
    aprobo = es_equipo(r)
    if not pedido or not aprobo:
        hechos[clave] = 'ignorada (no es del equipo o sin pedido)'; continue
    if NEG.search(texto) and not re.search(r'no hay problema', texto, re.I):
        hechos[clave] = 'negativa'; al_grupo(f"❌ Anotado: el abono de {nombre} (pedido {pedido}) NO está. El pedido sigue frenado; no se despacha."); n += 1; continue
    if not POS.search(texto):
        hechos[clave] = 'no entendida'; continue
    v = monto(texto); banco = (BANCO.search(texto).group(0).upper() if BANCO.search(texto) else '')
    ver = node('reemplazo.js', 'ver', str(pedido))
    try: o = json.loads(ver.strip().splitlines()[-1])
    except Exception: hechos[clave] = 'no se pudo leer el pedido en Dropi'; continue
    total = int(float(o.get('total') or 0))
    if v is None:
        al_grupo(f"Ronald, ¿de cuánto fue el abono de {nombre} (pedido {pedido}, total ${total:,.0f})? Respóndeme citando el comprobante, por ejemplo: «aprobado 50000 nequi».".replace(',', '.'))
        hechos[clave] = 'falta valor'; n += 1; continue
    if v >= total:
        al_grupo(f"✅ {aprobo} aprobó el pago COMPLETO de {nombre} (pedido {pedido}, ${v:,.0f}). Karen: márcalo SIN RECAUDO en Dropi y despáchalo (el robot no cambia la forma de pago).".replace(',', '.'), karen=True)
        estado = 'pago completo: Karen marca SIN RECAUDO'
    else:
        nuevo = total - v
        if ENVIAR:
            out = node('editar.js', str(pedido), json.dumps({'total_order': nuevo, 'status': 'PENDIENTE'}))
            ok = 'AHORA PENDIENTE' in out and str(nuevo) in out.replace('.00', '')
            open(f'{D}/uno_ids.txt', 'w').write(str(pedido)); node('etiq_lote.js', f'{D}/uno_ids.txt', '93483')
        else: ok = True
        estado = 'despachado' if ok else 'ERROR al editar en Dropi'
        al_grupo((f"✅ Despachado: {nombre} (pedido {pedido}). Abono ${v:,.0f} descontado: el cliente paga ${nuevo:,.0f} al recibir." if ok else
                  f"⚠️ No pude actualizar el pedido {pedido} en Dropi. Karen, revísalo: descontar ${v:,.0f} del total y confirmar.").replace(',', '.'), karen=not ok)
    hoy = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5))
    reg.append({'fecha': hoy.strftime('%d/%m/%Y'), 'mes': hoy.month, 'cliente': nombre, 'telefono': cel, 'pedido': pedido, 'producto': '',
                'abono': v, 'banco': banco, 'motivo': 'A/ VOLUNTARIO', 'imagen': ref.get('imagen', ''), 'estado': estado, 'aprobo': aprobo, 'registrado': False})
    hechos[clave] = estado; n += 1
if ENVIAR:
    json.dump(reg, open(REG, 'w'), ensure_ascii=False); json.dump(hechos, open(HECHOS, 'w'), ensure_ascii=False)
print('ABONOS procesadas', n, '| pendientes de registrar en Drive', sum(1 for x in reg if not x.get('registrado')), '|', 'ENVIADO' if ENVIAR else 'PRUEBA')
