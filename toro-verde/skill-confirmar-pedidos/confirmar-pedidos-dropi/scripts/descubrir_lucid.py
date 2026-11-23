# Muestra los IDs de Lucid Bot que pide config.json: embudos, campos y flujos. Uso: python3 -I descubrir_lucid.py
import json, urllib.request
K = open('/tmp/robot/lucidbot.key').read().strip()
def get(p):
    d = json.loads(urllib.request.urlopen(urllib.request.Request('https://panel.lucidbot.co/api' + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
    return d.get('data', d) if isinstance(d, dict) else d
print('== EMBUDOS (el de pedidos subidos va en lucid.embudo_pedidos)')
for x in get('/pipelines'): print(' ', x['id'], x['name'])
print('== CAMPOS que parecen útiles')
pistas = ('resumen', 'pedido', 'order', 'lucidsales', 'shopify', 'carrito', 'recuperacion', 'notificacion', 'tipo_notif', 'titulo')
for x in get('/accounts/custom_fields'):
    if any(p in x['name'].lower() for p in pistas): print(' ', x['id'], x['name'])
print('== FLUJOS con «admin», «notific» o «confirm» en el nombre')
for x in get('/accounts/flows'):
    if any(p in x['name'].lower() for p in ('admin', 'notific', 'confirm')): print(' ', x['id'], x['name'])
