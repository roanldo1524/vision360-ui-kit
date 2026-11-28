# Ronald 26-11: «si hay algún comprobante o algo que el equipo no ha confirmado, debes enviarlo directamente al grupo; yo confirmo o alguien
# del equipo, y de ahí, si confirmamos, autorizas despachar el pedido y lo subes al Excel».
# Busca, SIN IA, pedidos que siguen SIN CONFIRMAR en Dropi (PENDIENTE CONFIRMACION) cuyo cliente mandó una FOTO en el chat de Lucid después
# de que se le pidió pagar por transferencia (Bancolombia, Nequi, cuenta, consignar, anticipo, abono). Cada uno se publica UNA vez en el grupo
# «Comprobantes de Pago CDR» (whatsapp/wa_grupo.js) con la foto y los datos. La aprobación del equipo la procesa abonos.py.
# Uso: python3 -I comprobantes_pend.py [--enviar] [--max 10]
import json, os, re, sys, time, urllib.request
ENVIAR = '--enviar' in sys.argv
MAX = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 10
D = '/tmp/dropi'; W = '/tmp/wa'; EST = f'{W}/comprobantes_enviados.json'
est = json.load(open(EST)) if os.path.exists(EST) else {}
try: K = open('/tmp/robot/lucidbot.key').read().strip()
except Exception: K = 'x'
PIDE_PAGO = re.compile(r'bancolombia|nequi|daviplata|n[uú]mero de cuenta|cuenta de ahorros|consign|transfer|anticipo|abono|comprobante', re.I)
def chat(tel):
    t = json.loads(urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/57{tel}/messages?limit=40', headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
    t = t.get('data', t) if isinstance(t, dict) else t; t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    return re.split(r'\n(?=(?:Yo|Usuario) \()', t)
# pedidos sin confirmar: detalle.json (los que revisa el robot) + los ya avisados por el audio de anticipo
ped = {}
for f in ('detalle.json',):
    try:
        for o in json.load(open(f'{D}/{f}')): ped[str(o['id'])] = {'id': o['id'], 'tel': (o.get('phone') or '')[-10:], 'nombre': ((o.get('name') or '') + ' ' + (o.get('surname') or '')).strip().title(), 'total': o.get('total'), 'status': o.get('status')}
    except Exception: pass
try:
    for c, r in json.load(open(f'{D}/anticipos.json')).items():
        ped.setdefault(str(r['pedido']), {'id': r['pedido'], 'tel': c[2:], 'nombre': r.get('nombre', ''), 'total': r.get('total'), 'status': 'PENDIENTE CONFIRMACION'})
except Exception: pass
try:  # el estado real de hoy: si ya se confirmó o canceló, no se manda
    est_hoy = {str(o['id']): o['status'] for o in json.load(open(f'{D}/hoy.json'))}
except Exception: est_hoy = {}
# no repetir lo que ya salió al grupo por otro camino (p. ej. pedir_anticipo.py)
import glob
for f in glob.glob(f'{W}/enviados/*.json') + glob.glob(f'{W}/salida/*.json'):
    try:
        j = json.load(open(f)); m = re.search(r'Pedido Dropi:\s*(\d+)', j.get('texto') or '')
        for x in (j.get('pedido'), m and m.group(1)):
            if x: est.setdefault(str(x), time.time())
    except Exception: pass
enviados = 0
for pid, p in ped.items():
    if enviados >= MAX: break
    if pid in est or not p['tel']: continue
    if est_hoy.get(pid, p.get('status')) not in ('PENDIENTE CONFIRMACION', None): continue
    try: L = chat(p['tel'])
    except Exception: continue
    pidio = max([i for i, l in enumerate(L) if l.startswith('Yo') and PIDE_PAGO.search(l)] or [-1])
    if pidio < 0: continue
    fotos = [re.search(r'https?://\S+', l).group(0) for l in L[pidio + 1:] if l.startswith('Usuario') and '[Image]' in l and re.search(r'https?://\S+', l)]
    if not fotos: continue
    img = f'{W}/comp_{pid}.jpg'
    try: open(img, 'wb').write(urllib.request.urlopen(fotos[-1], timeout=40).read())
    except Exception: img = ''
    texto = (f"💰 Comprobante de pago POR VALIDAR\nCliente: {p['nombre']}\nCelular: {p['tel']}\nPedido Dropi: {pid}\n"
             f"Valor del pedido: ${(p.get('total') or 0):,.0f}".replace(',', '.') +
             "\n\n👉 Respondan CITANDO este mensaje: «aprobado VALOR BANCO» (ej.: aprobado 50000 nequi) y el robot descuenta el abono y lo despacha. Si no llegó: «no ha llegado».")
    if ENVIAR:
        os.makedirs(f'{W}/salida', exist_ok=True)
        json.dump({'grupo': '', 'imagen': img, 'texto': texto, 'pedido': pid, 'cel': p['tel'], 'nombre': p['nombre'], 'total': p.get('total')},
                  open(f'{W}/salida/{int(time.time()*1000)}_{pid}.json', 'w'), ensure_ascii=False)
        est[pid] = time.time()
    enviados += 1
    print('COMPROBANTE', pid, p['nombre'], p['tel'], 'foto' if img else 'sin foto')
if ENVIAR: json.dump(est, open(EST, 'w'))
print('COMPROBANTES_PEND revisados', len(ped), '| al grupo', enviados, '|', 'ENVIADO' if ENVIAR else 'PRUEBA')
