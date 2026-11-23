# Ronald 23-11: «tú solucionas las novedades de manera efectiva, que no lo hagamos manualmente».
# Arma /tmp/dropi/fichas_novedades.md: por cada novedad sin solucionar (novedades.js), la novedad, la aclaración de la transportadora,
# la dirección de Dropi y el chat del cliente (el WhatsApp que compró, por el número de pedido de Lucid Sales). Claude lee cada ficha y decide:
#   - el cliente dio/confirmó dirección, referencia u hora → node solucionar_nov.js <id> '{"solucion","nombre","direccion","celular"}' (vuelve a ofrecer)
#   - no ha respondido → se le escribe (aquí, si la ventana de 24 h está abierta) y se espera
#   - no lo quiere / problema raro / la transportadora solo ofrece devolución (Coordinadora) → aviso al equipo. Nunca se elige devolución solo.
# Uso: python3 -I robot/novedades.py [--escribir]
import json, os, re, sys, time, urllib.request
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
REG = '/tmp/dropi/novedades_reg.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
def get(p):
    d = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
    return d.get('data', d) if isinstance(d, dict) else d
def post(p, b): return urllib.request.urlopen(urllib.request.Request(API + p, data=json.dumps(b).encode(), headers={'X-ACCESS-TOKEN': K, 'Content-Type': 'application/json'}, method='POST'), timeout=40).read().decode()
def contacto(n):
    sid = str(n.get('shop_order_id') or '')
    if sid.isdigit():
        try:
            r = get(f'/contacts/find_by_custom_field?field_id=18848&value={sid}')
            ids = {str(x['id']) for x in r if x.get('id')} if isinstance(r, list) else set()
            if len(ids) == 1: return ids.pop()
        except Exception: pass
    return '57' + n['phone']
out = []; escritos = 0
for n in json.load(open('/tmp/dropi/novedades.json')):
    c = contacto(n)
    try: info = get(f'/contacts/{c}'); t = get(f'/contacts/{c}/messages?limit=25'); t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    except Exception: info, t = {}, ''
    abierta = bool(info.get('id')) and (time.time() - float(info.get('last_interaction') or 0) / 1000) < 23 * 3600
    humano = bool(info.get('live_chat'))
    k = str(n['id'])
    # Si el cliente no ha escrito nada desde la novedad y la ventana está abierta, se le pregunta UNA vez (Lucid ya mandó su plantilla de novedad).
    if '--escribir' in sys.argv and abierta and not humano and k not in reg and 7 <= time.localtime(time.time() - 5 * 3600).tm_hour < 21:
        nom = (n['name'] or '').split(' ')[0].capitalize()
        msg = (f"¡Hola {nom}! 🚚 La transportadora reporta una novedad con tu pedido de Toro Verde: «{n['novedad'].capitalize()}». "
               f"Para que te lo vuelvan a llevar, confírmame por favor: 1) la dirección completa con número de casa y barrio, 2) un punto de referencia y 3) a qué hora te encuentran. "
               f"Si prefieres, lo reclamas en la oficina de Interrapidísimo de tu municipio.")
        try:
            if 'true' in post(f'/contacts/{c}/send_content', {'messages': [{'message': {'text': msg}}]}): reg[k] = {'contacto': c, 'preguntado': time.time()}; escritos += 1
        except Exception: pass
    partes = re.split(r'\n(?=(?:Yo|Usuario) \()', t)[-16:]
    out.append(f"## {n['id']} · {n['name']} · {n['phone']} · chat {c}{' · MODO HUMANO' if humano else ''}{' · ventana abierta' if abierta else ' · ventana cerrada'}\n"
               f"Novedad ({n['transportadora']}, guía {n['guia']}, {n['fecha']}): {n['novedad']}\n"
               f"Aclaración de la transportadora: {n.get('aclaracion') or '-'}\n"
               f"Dirección en Dropi: {n['dir']} — {n['city']} ({n['state']}) · total ${n['total']:,.0f}\n".replace(',', '.') +
               f"Movimientos: {' | '.join(n['movs'][-4:])}\n"
               f"{'Ya se le preguntó por el robot' if k in reg else ''}\n"
               f"Chat (últimos mensajes):\n" + '\n'.join(p[:400] for p in partes) + '\n')
json.dump(reg, open(REG, 'w'))
open('/tmp/dropi/fichas_novedades.md', 'w').write('\n'.join(out))
print('NOVEDADES fichas', len(out), 'preguntados ahora', escritos)
