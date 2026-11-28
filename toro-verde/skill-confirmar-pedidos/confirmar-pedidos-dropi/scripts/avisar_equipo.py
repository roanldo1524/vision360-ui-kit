# Después de cada vuelta del robot, resumen corto por Lucid Bot al equipo (lo que confirmó, lo que cambió y lo que queda para revisar).
# Chat abierto (habló en 23 h) → texto. Chat cerrado → plantilla «Mensaje administrador» (flujo __FLUJO_PLANTILLA_ADMIN__) CON el resumen en sus variables (máx. 1 por hora) y el resumen queda guardado
# para mandarlo apenas responda (al responder «REVISADO» se abre otra vez la ventana de 24 h; cada aviso se lo recuerda). Uso: python3 -I robot/avisar_equipo.py
import json, os, time, datetime, urllib.request, urllib.parse
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
EQUIPO = __EQUIPO__  # celulares del equipo que reciben el resumen (57 + número)
FLUJO_PLANTILLA = '__FLUJO_PLANTILLA_ADMIN__'
CADA_VUELTA = __AVISO_CADA_VUELTA__  # False = solo se avisan los comprobantes de anticipo (💰), que son plata por validar
REG = '/tmp/dropi/avisos_equipo.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
if not CADA_VUELTA:
    for v in reg.values(): v['pendiente'] = [x for x in v.get('pendiente', []) if x.startswith('💰')]
def get(p): r = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read()); return r.get('data', r) if isinstance(r, dict) else r
def post(p, b=None): return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(b or {}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def campo(c, f, v): return urllib.request.urlopen(urllib.request.Request(f'{API}/contacts/{c}/custom_fields/{f}', data=urllib.parse.urlencode({'value': v}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/x-www-form-urlencoded'}, method='POST'), timeout=40).read()
plan = json.load(open('/tmp/dropi/plan.json')) if os.path.exists('/tmp/dropi/plan.json') else {}
conf = plan.get('confirmar', []); nuevos = plan.get('etiquetar', []); total_rev = len(plan.get('revisar_total', []))
vet = [l.split('\t') for l in open('/tmp/dropi/vetados.txt').read().splitlines()] if os.path.exists('/tmp/dropi/vetados.txt') else []
novedad = bool(conf or nuevos or vet) and CADA_VUELTA
if not novedad and not any(v.get('pendiente') for v in reg.values()): print('AVISO sin novedades'); raise SystemExit
hora = (datetime.datetime.utcnow() - datetime.timedelta(hours=5)).strftime('%I:%M %p').lstrip('0').lower()
t = f"🤖 Robot de despacho · {hora}\n✅ Confirmados: {len(conf)}"
if conf: t += ' (' + ', '.join(x['n'].split(' ')[0].title() for x in conf[:12]) + ('…' if len(conf) > 12 else '') + ')'
if vet: t += f"\n✋ Frenados por revisión del agente: {len(vet)}"
if nuevos:
    t += f"\n⚠️ Nuevos para REVISAR HUMANO: {len(nuevos)}"
    for x in nuevos[:6]: t += f"\n• {x['id']}: {x['motivo'][:70]}"
t += f"\n📋 Total en revisión humana: {total_rev}\nTodo queda con etiqueta en Dropi."
n = 0
for c in EQUIPO:
    r = reg.setdefault(c, {'pendiente': [], 'plantilla': 0})
    if novedad: r['pendiente'] = (r['pendiente'] + [t])[-5:]
    if not r['pendiente']: continue
    try:
        info = get(f'/contacts/{c}'); li = float(info.get('last_interaction') or 0) / 1000
        if time.time() - li < 23 * 3600:
            txt = '\n\n'.join(r['pendiente'])[:3400] + '\n\n👉 Responde *REVISADO* para que te sigan llegando los avisos.'
            res = post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': txt}}]})
            if 'true' in res: r['pendiente'] = []; n += 1
        elif novedad and time.time() - r['plantilla'] > 3600:
            # la plantilla lleva el resumen (variables Tipo/Título/Resumen notificación; WhatsApp no deja saltos de línea en variables)
            res1 = ' · '.join(l.strip() for l in t.split('\n')[1:] if l.strip())
            res1 = (res1[:850] + ' · Responde REVISADO para recibir el detalle.').replace('  ', ' ')
            for f, v in (('__CAMPO_TIPO_NOTIF__', 'Robot de despacho'), ('__CAMPO_TITULO_NOTIF__', 'Robot de despacho ' + hora), ('__CAMPO_RESUMEN_NOTIF__', res1)): campo(c, f, v)
            if 'true' in post(f'/contacts/{c}/send/{FLUJO_PLANTILLA}'): r['plantilla'] = time.time()
    except Exception as e: print('AVISO error', c, str(e)[:80])
json.dump(reg, open(REG, 'w'), ensure_ascii=False)
print('AVISO enviados', n, 'pendientes', {c: len(v['pendiente']) for c, v in reg.items()})
