# Imprime «id<TAB>dirección limpia» para los pedidos a confirmar (o para --ids archivo con pedidos ya confirmados).
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dir_limpia import limpiar
if '--ids' in sys.argv:
    ids = {int(i) for i in open(sys.argv[sys.argv.index('--ids') + 1]).read().split()}
    pedidos = [x for x in json.load(open('/tmp/dropi/confirmados.json')) if x['id'] in ids]
else:
    ok = {a['id'] for a in json.load(open('/tmp/dropi/acciones.json')) if a['accion'] == 'CONFIRMAR'}
    pedidos = [d for d in json.load(open('/tmp/dropi/detalle.json')) if d['id'] in ok]
for p in pedidos:
    n = limpiar(p.get('dir'), p.get('colonia') or '')
    if n: print(f"{p['id']}\t{n}")
