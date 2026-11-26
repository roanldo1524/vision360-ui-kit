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

def texto(cat, nom):
    # Textos de la política «POLITICAS GARANTIAS» (Drive), con la dosis de la marca: mínimo 130 ml por bomba de 20 L y agitar el envase.
    nom = nom or 'compita'
    if cat == 'FALTAN_DATOS':
        return (f"Hola {nom} 👋 Te escribe Sofía, del área de garantías de Toro Verde. Gracias por escribirnos. "
                "Para darte una solución rápida y precisa necesitamos unas pregunticas sobre cómo aplicaste:\n\n"
                "1️⃣ ¿Cuántos ml de producto le echaste a cada bomba y con cuánta agua?\n"
                "2️⃣ ¿Agitaste bien el envase antes de usarlo?\n"
                "3️⃣ ¿Le agregaste algo más al agua (corrector de pH, fertilizante, otro químico)?\n"
                "4️⃣ ¿Qué maleza querías controlar, de qué tamaño estaba y cómo estuvo el clima? ¿Llovió ese día o después?\n"
                "5️⃣ ¿Cómo reaccionó la maleza en los días siguientes y cuántos días han pasado?\n"
                "6️⃣ ¿Lo aplicaste tú mismo o alguien más? ¿Con qué boquilla?\n"
                "7️⃣ ¿El agua era limpia (sin barro ni residuos)?\n\n"
                "📸 Por favor mándanos *fotos o video del lote* donde aplicaste y *una foto del frasco* (para revisar el lote del producto). "
                "Apenas tengamos tus respuestas te damos la solución. ¡Estamos para ayudarte! 💪")
    if cat == 'DOSIS':
        return (f"{nom}, gracias por contarnos 🙏 Ya vimos qué pasó: la dosis mínima es *130 ml por bomba de 20 litros* "
                "(150 ml si la maleza está grande o fuerte) y hay que *agitar el envase* antes de usarlo.\n\n"
                "Hagamos una prueba controlada en un pedacito del lote para ver el resultado real:\n"
                "✅ Agua limpia\n✅ Mínimo 130 ml por bomba de 20 litros\n✅ Boquilla de alto descargue\n"
                "✅ Día soleado, sin lluvia\n✅ No mezclar con otros químicos\n✅ Agitar bien el envase antes de aplicar\n\n"
                "Cuéntanos qué día lo vas a hacer y al día 7 nos mandas fotos 📸 ¡Estamos aquí para guiarte! 🌱")
    if cat == 'PACIENCIA':
        return (f"{nom}, gracias por escribirnos 🙏 El efecto se ve entre 3 y 7 días después de aplicar: primero la maleza se pone "
                "amarilla y luego se seca. Recuerda: mínimo *130 ml por bomba de 20 litros* y *agitar el envase*.\n\n"
                "Al día 7 mándanos fotos del lote 📸 y una del frasco, y revisamos juntos cómo va.")
    return None

SUGERIDO = {'PLATA': 'Ronald: revisar el pago o el daño (foto) y decidir reposición o devolución. El robot no promete nada.',
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

hora = ahora.hour; fichas = []; enviados = 0; cont = {}; filas = []
for r in sorted(casos, key=lambda x: x['created_at'], reverse=True):
    c = r['contact_id']
    try:
        info = get(f'/contacts/{c}'); msgs = chat(c)
    except Exception as e:
        continue
    cat, por = clasificar(msgs); cont[cat] = cont.get(cat, 0) + 1
    nom = (info.get('first_name') or '').split(' ')[0].title()
    e = est.setdefault(c, {'creado': r['created_at'], 'enviado': {}})
    humano = bool(info.get('live_chat')); li = float(info.get('last_interaction') or 0) / 1000
    abierto = time.time() - li < 23 * 3600
    t = texto(cat, nom); accion = ''
    if t and cat not in e['enviado'] and not humano and abierto and 5 <= hora < 20:
        if ENVIAR:
            try:
                if 'true' in post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': t}}]}): e['enviado'][cat] = time.time(); enviados += 1; accion = 'MENSAJE ENVIADO'
            except Exception as ex: accion = 'ERROR AL ENVIAR'
        else: accion = 'LISTO PARA ENVIAR'
    elif t and humano: accion = 'modo humano: respuesta sugerida para Karen'
    e.update(categoria=cat, motivo=por, revisado=time.time())
    GEST = {'PLATA': 'Ronald decide (plata/daño)', 'LLAMAR': 'Llamar al cliente', 'DOSIS': 'Reaplicación guiada', 'PACIENCIA': 'Esperar 7 días + fotos', 'FALTAN_DATOS': 'Pedir datos y fotos'}
    filas.append({'contacto': c, 'fecha': r['created_at'][:10], 'nombre': (info.get('full_name') or nom), 'telefono': c[2:], 'producto': r['title'][:80],
                  'valor': float(r['value'] or 0), 'categoria': cat, 'motivo': por, 'gestion': GEST[cat], 'accion': accion or ('modo humano' if humano else ''),
                  'fotos': 'pedidas' if cat in ('FALTAN_DATOS', 'DOSIS', 'PACIENCIA') and e['enviado'] else ''})
    ult = next((t2 for q, _, t2 in reversed(msgs) if q == 'Usuario'), '')[:220].replace('\n', ' ')
    ico = {'PLATA': '💰', 'LLAMAR': '📞', 'DOSIS': '🧪', 'PACIENCIA': '⏳', 'FALTAN_DATOS': '❓'}[cat]
    fichas.append(f"## {ico} {cat} · {nom or '-'} · {c[2:]} · {r['title'][:50]} (${float(r['value'] or 0):,.0f})\n".replace(',', '.') +
                  f"Caso del {r['created_at'][:10]} · por: «{por}» · {'modo humano' if humano else 'bot'} · {accion}\n"
                  f"Último mensaje del cliente: «{ult}»\n" + (f"Qué hacer: {SUGERIDO[cat]}\n" if cat in SUGERIDO else f"Respuesta: {(t or '')[:160]}…\n"))
json.dump(est, open(EST, 'w'), ensure_ascii=False)
json.dump(filas, open('/tmp/dropi/garantias_filas.json', 'w'), ensure_ascii=False)
orden = {'💰': 0, '📞': 1, '🧪': 2, '⏳': 3, '❓': 4}
fichas.sort(key=lambda f: orden.get(f[3], 9))
open('/tmp/dropi/garantias.md', 'w').write(f"# Garantías · {ahora:%d-%m %H:%M} · {len(casos)} casos abiertos de los últimos {DIAS} días\n\n" + '\n'.join(fichas))
print('GARANTIAS casos', len(casos), 'por tipo', cont, 'mensajes', enviados, '→ /tmp/dropi/garantias.md')
