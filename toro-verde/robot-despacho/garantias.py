# Agente «Sofía · Garantías» (Ronald 26-11: «metamos un asistente de garantías, créalo full a la perfección»).
# Lee los casos abiertos del embudo «Garantía» de Lucid (419593), lee el chat de cada cliente y, SIN IA (reglas):
#   1) Clasifica el caso:  💰 PLATA (pago, cancelado, reembolso, llegó dañado/derramado → decide Ronald)
#                          📞 LLAMAR (bravo, quiere devolver, aplicó bien y no funcionó → llamada de Karen/Ronald)
#                          🧪 DOSIS (le echó menos de 130 ml por bomba de 20 L o no agitó) → se le explica la dosis
#                          ⏳ PACIENCIA (lleva menos de 7 días) → se le explica que el efecto se ve en 3 a 7 días
#                          ❓ FALTAN DATOS (no ha contado cómo aplicó) → se le hacen las preguntas de diagnóstico
#   2) Si el chat NO está en modo humano y está abierto (<23 h), y son las 5 a. m.–8 p. m., le escribe al cliente
#      (preguntas de diagnóstico o la explicación de la dosis). Si está en modo humano, NO escribe: deja la ficha
#      con la respuesta sugerida para Karen. Nunca promete reposición ni devolución de plata (eso es de Ronald).
#   3) Deja /tmp/dropi/garantias.md (fichas para el panel) y /tmp/dropi/garantia_contactos.txt (para que el casino y
#      el remarketing NO les manden promociones a clientes en garantía).
# Uso: python3 -I robot/garantias.py [--enviar]   (sin --enviar solo clasifica y escribe las fichas)
import json, os, re, sys, time, datetime, urllib.request
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
ENVIAR = '--enviar' in sys.argv
EST = '/tmp/dropi/garantias_estado.json'; est = json.load(open(EST)) if os.path.exists(EST) else {}
DIAS = 20  # casos creados en los últimos 20 días
ahora = datetime.datetime.utcnow() - datetime.timedelta(hours=5)

def get(p): r = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read()); return r.get('data', r) if isinstance(r, dict) else r
def post(p, b): return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(b).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def chat(c):
    t = get(f'/contacts/{c}/messages?limit=60'); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    return [(m.group(1), m.group(2), m.group(3).strip()) for m in re.finditer(r'(?:^|\n)(Yo|Usuario) \((\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}[ap]m)\): (.*?)(?=\n(?:Yo|Usuario) \(\d{4}-|\Z)', t, re.S)]

PLATA = re.compile(r'comprobante|reembols|devu[eé]lv\w* (la|mi) plata|me (cobraron|descontaron)|pagu[eé]|cancelad|lleg[oó] (roto|da[ñn]ado|derramado|vac[ií]o|incompleto|abierto)|se (derram|reg[oó])|fuga|tapa (rota|abierta)', re.I)
BRAVO = re.compile(r'estafa|robo|enga[ñn]|no sirve|no sirvi[oó]|perd[ií] (mi )?(tiempo|plata)|devolver|denunci|mentir|decepcion|muy mal|p[eé]simo|demanda', re.I)
ML = re.compile(r'(\d{2,3})\s*(ml|mililitros|cc|cent[ií]metros|centimetros)|\b(\d{2,3})\s*(con|por|en|a)\s*(la\s*)?bomba', re.I)
NOAGITO = re.compile(r'no (lo )?agit[eé]|sin agitar|no lo bati|no sab[ií]a que (hab[ií]a que|toca) agitar', re.I)
DIAS_RX = re.compile(r'(hace|lleva\w*|van|pasaron|ya)\s+(\d{1,2}|un|una|dos|tres|cuatro|cinco|seis)\s*(d[ií]as?|semanas?)', re.I)
NUM = {'un': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6}

def clasificar(msgs):
    u = '\n'.join(t for q, _, t in msgs if q == 'Usuario')
    if PLATA.search(u): return 'PLATA', PLATA.search(u).group(0)
    if BRAVO.search(u): return 'LLAMAR', BRAVO.search(u).group(0)
    ml = [int(a or b) for a, _, b, _, _ in ML.findall(u) if (a or b)]
    if NOAGITO.search(u) or (ml and min(ml) < 130): return 'DOSIS', f'{min(ml)} ml' if ml else 'no agitó el envase'
    d = DIAS_RX.search(u)
    if d:
        n = NUM.get(d.group(2).lower(), None) or int(d.group(2)) if d.group(2).isdigit() or d.group(2).lower() in NUM else 99
        if 'semana' in d.group(3).lower(): n *= 7
        if n < 7: return 'PACIENCIA', d.group(0)
    if ml: return 'LLAMAR', f'aplicó {max(ml)} ml y dice que no funcionó'
    return 'FALTAN_DATOS', 'no ha contado cómo aplicó'

def texto(cat, nom, ent=None):
    # Textos de la política «POLITICAS GARANTIAS» (Drive), con la dosis de la marca: mínimo 130 ml por bomba de 20 L y agitar el envase.
    nom = nom or 'compita'
    ped = ''
    if ent and len(ent) == 1: ped = f"Vemos tu pedido entregado del *{ent[0]['fecha']}*. "
    if ent and len(ent) > 1:
        ped = ("Vemos que tienes varios pedidos con nosotros:\n" + '\n'.join(f"• {o['fecha']} · {o['producto'] or 'Toro Verde'}" for o in ent[:5]) +
               "\n*¿Cuál de ellos fue el que no te funcionó?*\n\n")
    if cat == 'SIN_COMPRA':
        # Puede ser que compró con otro número o a nombre de otra persona: se pregunta con respeto, sin acusar. No se abre garantía hasta comprobarlo.
        return (f"Hola {nom} 👋 Te escribe Sofía, del área de garantías de Toro Verde. Para revisar tu caso necesitamos ubicar tu compra, "
                "pero no la encontramos con este número de WhatsApp. Por favor cuéntanos:\n\n"
                "1️⃣ ¿Con qué número de celular hiciste el pedido?\n2️⃣ ¿A nombre de quién llegó?\n3️⃣ ¿En qué fecha lo recibiste y en qué municipio?\n\n"
                "📸 Si tienes una foto de la guía o del paquete, mándanosla también. ¡Gracias! 🌱")
    if cat == 'FALTAN_DATOS':
        # Ronald 26-11: encuesta corta con preguntas ABIERTAS para saber si es problema de la aplicación o del producto
        # (dosis según la maleza, limón según el agua del municipio, agitar, agua, clima, quién aplicó, boquilla).
        return (f"Hola {nom} 👋 Te escribe Sofía, del área de garantías de Toro Verde. Lamentamos que el resultado no fuera el esperado "
                "y queremos entender bien qué pasó para darte una solución. " + (ped or "¿En qué fecha recibiste tu pedido? ") + "Cuéntanos con tus palabras:\n\n"
                "1️⃣ ¿Qué día aplicaste y cómo preparaste la mezcla? (cuánta agua, cuántos ml de Toro Verde, si le echaste limón y cuánto, y si agitaste el envase)\n"
                "2️⃣ ¿Qué maleza querías controlar y qué tan grande o dura estaba?\n"
                "3️⃣ ¿Cómo estaba el día cuando aplicaste y qué le pasó a la maleza en los días siguientes?\n"
                "4️⃣ ¿Quién hizo la aplicación, con qué bomba o boquilla, y de dónde sacaron el agua?\n"
                "5️⃣ ¿En qué municipio está el lote?\n\n"
                "📸 *Lo más importante son las evidencias* (sin ellas no podemos revisar la garantía):\n"
                "• Fotos claras o un video corto del lote donde aplicaste (de día, que se vea la maleza de cerca y el lote completo)\n"
                "• Una foto clara del *envase* de Toro Verde donde se vea la etiqueta y el número de lote\n\n"
                "Con eso revisamos tu caso y te damos la solución. ¡Gracias! 🌱")
    if cat == 'DOSIS':
        return (f"{nom}, gracias por contarnos 🙏 Ya vimos qué pasó: la dosis mínima es *130 ml por bomba de 20 litros* "
                "(150 ml si la maleza es grande y dura, 200 ml si es dura y alta) y hay que *agitar el envase* antes de usarlo.\n\n"
                "Hagamos una prueba controlada en un pedacito del lote para ver el resultado real:\n"
                "✅ Agua limpia\n✅ El limón que corresponde al agua de tu municipio (te decimos cuánto)\n✅ Agitar bien el envase\n"
                "✅ Mínimo 130 ml por bomba de 20 litros (150 ml si la maleza es grande y dura, 200 ml si es dura y alta)\n"
                "✅ Boquilla de alto descargue, día soleado y sin lluvia\n✅ No mezclar con otros químicos\n\n"
                "Cuéntanos qué día lo vas a hacer y al día 7 nos mandas fotos 📸 ¡Estamos aquí para guiarte! 🌱")
    if cat == 'PACIENCIA':
        return (f"{nom}, gracias por escribirnos 🙏 El efecto se ve entre 3 y 7 días después de aplicar: primero la maleza se pone "
                "amarilla y luego se seca. Recuerda: mínimo *130 ml por bomba de 20 litros* y *agitar el envase*.\n\n"
                "Al día 7 mándanos fotos del lote 📸 y una del frasco, y revisamos juntos cómo va.")
    return None

SUGERIDO = {'SIN_COMPRA': 'NO hay pedido ENTREGADO con ese celular en Dropi: se le pidió número, nombre y fecha del pedido. No hay garantía hasta comprobar la compra (posible estafa).',
            'VERIFICAR': 'No se pudo consultar Dropi: revisar la compra a mano antes de responder.',
            'PLATA': 'Ronald: revisar el pago o el daño (foto) y decidir reposición o devolución. El robot no promete nada.',
            'LLAMAR': 'Llamar al cliente: escuchar, revisar cómo aplicó (ml por bomba, agitó, agua limpia, lluvia, boquilla, quién aplicó) y pedir fotos del lote y del frasco. Según la política: reaplicación guiada, reenvío 50 % (cliente paga envío) o 100 % (Toro paga) si cumplió todo — eso lo decide Ronald.'}

# 1) casos del embudo de garantía
rows, o = [], 0
while o < 3000:
    d = get(f'/pipelines/419593/opportunities?limit=100&offset={o}'); d = d if isinstance(d, list) else []
    rows += d
    if len(d) < 100: break
    o += 100
desde = (ahora - datetime.timedelta(days=DIAS)).strftime('%Y-%m-%d')
casos = {}
for r in sorted(rows, key=lambda x: x['created_at']):
    if r.get('status') == 'open' and r['created_at'][:10] >= desde: casos[r['contact_id']] = r  # un caso por cliente (el más reciente)
casos = list(casos.values())
open('/tmp/dropi/garantia_contactos.txt', 'w').write('\n'.join(sorted({r['contact_id'] for r in rows if r.get('status') == 'open'})) + '\n')

# Ronald 26-11: «siempre debemos validar que la persona realmente tiene compras con nosotros en Dropi (puede ser un estafador que
# dice que nos compró); si tiene varios pedidos, preguntar cuál no le sirvió; preguntar la fecha en que compró».
# Se buscan TODOS los pedidos del celular en Dropi (~15 meses). Solo hay garantía con un pedido ENTREGADO.
import subprocess
compras = {}
try:
    subprocess.run(['node', 'compras_tel.js'] + [r['contact_id'][2:] for r in casos], cwd='/tmp/dropi', capture_output=True, timeout=60 + 25 * len(casos))
    compras = json.load(open('/tmp/dropi/compras_tel.json'))
except Exception as ex: print('COMPRAS_ERROR', str(ex)[:80])
def entregados(tel):
    x = compras.get(tel)
    if x is None or isinstance(x, dict): return None  # no se pudo consultar → revisión manual, no se escribe
    return [o for o in x if o.get('status') == 'ENTREGADO']

hora = ahora.hour; fichas = []; enviados = 0; cont = {}; filas = []
for r in sorted(casos, key=lambda x: x['created_at'], reverse=True):
    c = r['contact_id']
    try:
        info = get(f'/contacts/{c}'); msgs = chat(c)
    except Exception as e:
        continue
    cat, por = clasificar(msgs)
    ent = entregados(c[2:]); e0 = est.get(c, {})
    if ent is None: cat, por = 'VERIFICAR', 'no se pudo consultar Dropi'
    elif not ent: cat, por = 'SIN_COMPRA', f"sin pedido ENTREGADO en Dropi con el {c[2:]} ({len(compras.get(c[2:]) or [])} pedidos en otro estado)"
    compra_txt = ' · '.join(f"{o['fecha']} {o['producto'] or ''} ${(o['total'] or 0):,.0f}".replace(',', '.') for o in (ent or [])[:4])
    cont[cat] = cont.get(cat, 0) + 1
    nom = (info.get('first_name') or '').split(' ')[0].title()
    e = est.setdefault(c, {'creado': r['created_at'], 'enviado': {}})
    humano = bool(info.get('live_chat')); li = float(info.get('last_interaction') or 0) / 1000
    abierto = time.time() - li < 23 * 3600
    t = texto(cat, nom, ent); accion = ''
    if t and cat not in e['enviado'] and not humano and abierto and 5 <= hora < 20:
        if ENVIAR:
            try:
                if 'true' in post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': t}}]}): e['enviado'][cat] = time.time(); enviados += 1; accion = 'MENSAJE ENVIADO'
            except Exception as ex: accion = 'ERROR AL ENVIAR'
        else: accion = 'LISTO PARA ENVIAR'
    elif t and humano: accion = 'modo humano: respuesta sugerida para Karen'
    e.update(categoria=cat, motivo=por, revisado=time.time())
    GEST = {'SIN_COMPRA': 'Comprobar compra (no aparece en Dropi)', 'VERIFICAR': 'Revisar compra a mano', 'PLATA': 'Ronald decide (plata/daño)', 'LLAMAR': 'Llamar al cliente', 'DOSIS': 'Reaplicación guiada', 'PACIENCIA': 'Esperar 7 días + fotos', 'FALTAN_DATOS': 'Pedir datos y fotos'}
    filas.append({'contacto': c, 'fecha': r['created_at'][:10], 'nombre': (info.get('full_name') or nom), 'telefono': c[2:], 'producto': r['title'][:80],
                  'valor': float(r['value'] or 0), 'categoria': cat, 'motivo': por, 'gestion': GEST[cat], 'accion': accion or ('modo humano' if humano else ''),
                  'compras': compra_txt or 'SIN PEDIDO ENTREGADO', 'fotos': 'pedidas' if cat in ('FALTAN_DATOS', 'DOSIS', 'PACIENCIA') and e['enviado'] else ''})
    ult = next((t2 for q, _, t2 in reversed(msgs) if q == 'Usuario'), '')[:220].replace('\n', ' ')
    ico = {'SIN_COMPRA': '🕵️', 'VERIFICAR': '🔎', 'PLATA': '💰', 'LLAMAR': '📞', 'DOSIS': '🧪', 'PACIENCIA': '⏳', 'FALTAN_DATOS': '❓'}[cat]
    fichas.append(f"## {ico} {cat} · {nom or '-'} · {c[2:]} · {r['title'][:50]} (${float(r['value'] or 0):,.0f})\n".replace(',', '.') +
                  f"Caso del {r['created_at'][:10]} · por: «{por}» · {'modo humano' if humano else 'bot'} · {accion}\n"
                  f"Compras entregadas en Dropi: {compra_txt or 'NINGUNA'}\n" + f"Último mensaje del cliente: «{ult}»\n" + (f"Qué hacer: {SUGERIDO[cat]}\n" if cat in SUGERIDO else f"Respuesta: {(t or '')[:160]}…\n"))
json.dump(est, open(EST, 'w'), ensure_ascii=False)
json.dump(filas, open('/tmp/dropi/garantias_filas.json', 'w'), ensure_ascii=False)
orden = {'🕵️': 0, '🔎': 0, '💰': 0, '📞': 1, '🧪': 2, '⏳': 3, '❓': 4}
fichas.sort(key=lambda f: orden.get(f[3], 9))
open('/tmp/dropi/garantias.md', 'w').write(f"# Garantías · {ahora:%d-%m %H:%M} · {len(casos)} casos abiertos de los últimos {DIAS} días\n\n" + '\n'.join(fichas))
print('GARANTIAS casos', len(casos), 'por tipo', cont, 'mensajes', enviados, '→ /tmp/dropi/garantias.md')
