# Ronald 24-11: «notificas mucho por WhatsApp; solo al abrir el día y a las 9 de la noche un reporte: cuántos confirmaste,
# cuántos confirmó el humano, novedades resueltas, tickets puestos, y ya». Karen revisa por etiquetas en Dropi.
# Uso: python3 -I reporte.py manana|noche   (mañana = cómo cerró ayer; noche = cómo va hoy hasta las 9 p. m.)
import json, os, sys, time, datetime, subprocess, urllib.request, urllib.parse
BOG = datetime.timezone(datetime.timedelta(hours=-5)); ahora = datetime.datetime.now(BOG)
modo = sys.argv[1] if len(sys.argv) > 1 else 'noche'
hoy0 = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
desde, hasta = (hoy0 - datetime.timedelta(days=1), hoy0) if modo == 'manana' else (hoy0, ahora)
z = lambda d: d.astimezone(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
out = subprocess.run(['node', 'reporte_datos.js'], cwd='/tmp/dropi', env={**os.environ, 'DESDE': z(desde), 'HASTA': z(hasta)}, capture_output=True, text=True, timeout=2700).stdout
if 'SESION_DROPI_CAIDA' in out or not os.path.exists('/tmp/dropi/reporte_datos.json'): print('SESION_DROPI_CAIDA'); raise SystemExit(1)
r = json.load(open('/tmp/dropi/reporte_datos.json'))
def reg(f):
    for p in (f'/tmp/dropi/{f}', f'/home/user/vision360-ui-kit/toro-verde/robot-despacho/datos/{f}'):
        if os.path.exists(p): return json.load(open(p))
    return {}
a, b = desde.timestamp(), hasta.timestamp()
q = [v for v in reg('quejas_reg.json').values() if a <= v.get('ultima', 0) < b]
dv = [v for v in reg('devol_reg.json').values() if a <= v.get('fecha', 0) < b]
tk = sorted({v.get('ticket') for v in dv if v.get('ticket')})
conf = r['conf_robot'] + r['conf_humano']; pct = round(100 * r['conf_robot'] / conf) if conf else 0
dia = 'ayer' if modo == 'manana' else 'hoy'
t = (f"{'☀️ Buenos días' if modo == 'manana' else '🌙 Cierre del día'} · Toro Verde\n"
     f"✅ Confirmados {dia}: {conf} → robot {r['conf_robot']} ({pct} %) · Karen/humano {r['conf_humano']}\n"
     f"🔧 Novedades resueltas {dia}: {r['nov_sol']} · abiertas ahora: {r['nov_abiertas']}\n"
     f"📨 Tickets puestos {dia}: {len(q)} quejas a transportadoras (CAS)"
     + (f" · {len(dv)} devoluciones injustificadas (ticket {', '.join('#' + x for x in tk)})" if dv else '') + "\n"
     f"🏷️ En REVISAR HUMANO ahora: {r['en_revision']} de {r['pendientes']} pendientes por confirmar")
print(t)
if '--enviar' not in sys.argv: raise SystemExit
os.chdir('/tmp/robot'); K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
EQUIPO = ['573218940042', '573234209080', '573206357423']  # Ronald, Leidy, Karen
def get(p): x = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read()); return x.get('data', x) if isinstance(x, dict) else x
def post(p, body=None): return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(body or {}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def campo(c, f, v): return urllib.request.urlopen(urllib.request.Request(f'{API}/contacts/{c}/custom_fields/{f}', data=urllib.parse.urlencode({'value': v}).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/x-www-form-urlencoded'}, method='POST'), timeout=40).read()
for c in EQUIPO:
    try:
        li = float(get(f'/contacts/{c}').get('last_interaction') or 0) / 1000
        if time.time() - li < 23 * 3600: via = 'texto' if 'true' in post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': t}}]}) else 'falló'
        else:  # chat cerrado: plantilla de administrador con el reporte adentro (sin saltos de línea)
            for f, v in (('169820', 'Reporte del día'), ('276603', t.split('\n')[0]), ('470472', ' · '.join(t.split('\n')[1:])[:900])): campo(c, f, v)
            via = 'plantilla' if 'true' in post(f'/contacts/{c}/send/1753286864407') else 'falló'
        print('REPORTE', c[-4:], via)
    except Exception as e: print('REPORTE error', c[-4:], str(e)[:80])
