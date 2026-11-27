# Ronald 26-11: «si te mencionamos en algún grupo… que tú puedas responder» + «SOLO si lo pregunta Ronaldo; a nadie más» (el filtro está en wa_grupo.js).
# wa_grupo.js llama este programa cuando alguien menciona al agente (@) en un grupo. Responde corto, como una persona del equipo,
# SOLO con información (números del día, reglas, qué hizo cada líder). No hace acciones (no confirma, no cancela, no promete plata):
# lo que pida una acción lo anota como tarea para la vuelta del robot. Usa la API de OpenAI (el proxy pone la clave).
# Uso: echo '{"pregunta":"…","quien":"Karen","grupo":"<jid>","grupo_nombre":"…"}' | python3 -I responder.py
import json, os, sys, time, urllib.request, collections
p = json.load(sys.stdin)
R = '/home/user/vision360-ui-kit/toro-verde/robot-despacho'
def leer(f, d=None):
    try: return json.load(open(f))
    except Exception: return d
lid = leer(f'{R}/datos/reportes_lideres.json', {}) or {}
hoy = leer('/tmp/dropi/hoy.json', []) or []
hoy_s = time.strftime('%Y-%m-%d', time.gmtime(time.time() - 5 * 3600))
dia = [o for o in hoy if (o.get('created') or '')[:10] == hoy_s]
def _tag(o): return any((t if isinstance(t, str) else (t or {}).get('tag_name')) == 'CONFIRMADO AGENTE' for t in (o.get('tags') or []))
conf_hoy = [o for o in dia if o.get('status') not in ('PENDIENTE CONFIRMACION', 'CANCELADO')]
robot = sum(1 for o in conf_hoy if _tag(o)); humano = len(conf_hoy) - robot
pend_hoy = sum(1 for o in dia if o.get('status') == 'PENDIENTE CONFIRMACION')
est = collections.Counter(o.get('status') for o in hoy)
can_hoy = sum(1 for o in dia if o.get('status') == 'CANCELADO')
qreg0 = leer('/tmp/dropi/quejas_reg.json', {}) or {}
q_hoy = sum(1 for v in qreg0.values() if v.get('ultima', 0) >= time.time() - ((time.time() - 5 * 3600) % 86400))
_ay = time.strftime('%Y-%m-%d', time.gmtime(time.time() - 29 * 3600)); _hh = time.strftime('%H:%M', time.gmtime(time.time() - 5 * 3600))
ayer_hora = sum(1 for o in hoy if (o.get('created') or '')[:10] == _ay and (o.get('created') or '')[11:16] <= _hh)
valor_hoy = sum(float(o.get('total') or 0) for o in dia if o.get('status') != 'CANCELADO')
datos = (f"VENTAS DE HOY (= pedidos de hoy; úsalo si preguntan por ventas): {len(dia)} pedidos, valor sin cancelados ${valor_hoy/1e6:.1f} millones; ayer a esta misma hora iban {ayer_hora}. "
         f"HOY: pedidos {len(dia)}; CONFIRMADOS HOY {len(conf_hoy)} = robot {robot} + equipo/humano {humano}; pendientes por confirmar {pend_hoy}; CANCELADOS HOY {can_hoy} (el robot NUNCA cancela: los cancela el cliente o una persona); "
         f"quejas al CAS puestas hoy {q_hoy}.\nEstados de TODOS los pedidos de los ÚLTIMOS 45 DÍAS (no son de hoy): " +
         ', '.join(f'{k} {v}' for k, v in est.most_common(8)) + ".\nLíderes:\n" +
         '\n'.join(f"- {k}: nuevo: {v.get('nuevo')}; problema: {v.get('problema')}; solución: {v.get('solucion')}" for k, v in lid.items() if not k.startswith('_')))
# Ronald 26-11: «por medio de este número podemos conocer información también, cosas que están pasando en la oficina»
try:
    est_md = open('/home/user/vision360-ui-kit/toro-verde/ESTADO.md', encoding='utf-8').read()[-3500:]
except Exception: est_md = ''
cas = (leer('/tmp/dropi/cas_auto.json', {}) or {}).get('conteo', {})
gar = leer('/tmp/dropi/garantias_filas.json', []) or []
ab = leer('/tmp/wa/abonos_registro.json', []) or []
comp = leer('/tmp/wa/comprobantes_enviados.json', {}) or {}
datos += (f"\nCAS hoy: {cas}. Garantías abiertas: {len(gar)} (" + ', '.join(f'{k} {v}' for k, v in collections.Counter(g.get('categoria') for g in gar).items()) +
          f"). Comprobantes publicados en el grupo: {len(comp)}; abonos aprobados: {len(ab)}.\nÚLTIMO EN LA OFICINA (bitácora):\n{est_md}")
# Ronald 26-11: «de varias cosas: CAS, tecnología, etc.» → más detalle por área
try: inn = open(f'{R}/datos/innovaciones.md', encoding='utf-8').read()[-1500:]
except Exception: inn = ''
quietas = leer('/tmp/dropi/quietas.json', []) or []
plan_cas = (leer('/tmp/dropi/cas_auto.json', {}) or {}).get('plan', [])
qreg = leer('/tmp/dropi/quejas_reg.json', {}) or {}
datos += ("\nCAS (transportadoras): " + f"{len(quietas)} guías quietas; quejas registradas {len(qreg)}; últimas acciones del robot en el CAS: " +
          '; '.join(f"{a.get('tipo')} pedido {a.get('pedido')} ({a.get('dc')})" for a in plan_cas[:8]) +
          f"\nTECNOLOGÍA (innovaciones):\n{inn}")
reglas = ("Reglas: nunca decir orgánico, ecológico, natural, sin veneno ni no tóxico; uso: mínimo 130 ml por bomba de 20 litros y agite el envase; "
          "descuentos solo a quien nunca compró; abono si el cliente devuelve más del 50 %; flete hasta 15 % sobre el tope (1 L $28.750, 2 L $33.350, galón $40.250); "
          "nunca se cancelan pedidos; la plata (reenvíos, devoluciones, aprobar abonos) la decide Ronald o el equipo en el grupo de comprobantes.")
sistema = ("Eres el Agente de Confirmaciones de Comercializadora del Rey (tienda El Toro, herbicida Toro Verde, Colombia), miembro del equipo en WhatsApp. "
           "Respondes en español sencillo, cálido y corto (máximo 6 líneas), como una persona del equipo. Usa solo los datos que te doy y distingue bien HOY de los últimos 45 días; si no tienes el dato, "
           "dilo y di que lo revisas en la próxima vuelta. No inventes números. No prometas plata ni hagas acciones: si te piden algo (confirmar, revisar un pedido, "
           "cambiar algo), di que quedó anotado como tarea y que la vuelta del robot lo hace. " + reglas)
msg = [{'role': 'system', 'content': sistema + '\n\nDATOS DE HOY:\n' + datos},
       {'role': 'user', 'content': (f"Ronald está respondiendo a este mensaje tuyo (hilo de conversación):\n«{p['contexto']}»\n\n" if p.get('contexto') else '') + f"{p.get('quien') or 'Alguien'} pregunta en el grupo «{p.get('grupo_nombre', '')}»: {p.get('pregunta', '')}"}]
try:
    req = urllib.request.Request('https://api.openai.com/v1/chat/completions', method='POST',
        data=json.dumps({'model': 'gpt-4o-mini', 'messages': msg, 'max_tokens': 350, 'temperature': 0.3}).encode(),
        headers={'Authorization': 'Bearer x', 'Content-Type': 'application/json'})
    r = json.loads(urllib.request.urlopen(req, timeout=60).read())['choices'][0]['message']['content'].strip()
except Exception as e:
    r = 'Ya vi tu mensaje 🙌 Lo reviso en la próxima vuelta y te respondo aquí.'
for mala in ('orgánico', 'ecológico', 'sin veneno', 'no tóxico'):
    r = r.replace(mala, '')
os.makedirs('/tmp/wa/salida', exist_ok=True)
json.dump({'grupo': p.get('grupo'), 'texto': r, 'mencionar': [p['quien_num']] if p.get('quien_num') else []},
          open(f'/tmp/wa/salida/{int(time.time()*1000)}_resp.json', 'w'), ensure_ascii=False)
# lo que pida una acción queda como tarea para la vuelta de los :19
os.makedirs('/tmp/wa/preguntas', exist_ok=True)
json.dump({**p, 'respuesta': r, 'cuando': time.time()}, open(f'/tmp/wa/preguntas/{int(time.time()*1000)}.json', 'w'), ensure_ascii=False)
print('RESPONDIDO', r[:120])
