# Ronald 23-11: «si está 48 horas sin movimiento se solicita atención al CAS, se coloca la queja» (problema de la transportadora, no del cliente).
# Lee /tmp/dropi/quietas.json (quietas.js) y arma la cola de quejas: guías en camino con 48 h o más sin movimiento que NO están en devolución.
# Hoy el usuario del robot NO tiene credenciales del CAS (Confío) en Dropi: la cola va al resumen para Karen. Cuando se active, el robot la pone sola.
# Una misma guía no se repite antes de 48 h. Uso: python3 -I robot/quejas_cas.py
import json, os, time
Q = '/tmp/dropi/quietas.json'; REG = '/tmp/dropi/quejas_reg.json'
reg = json.load(open(REG)) if os.path.exists(REG) else {}
EN_CAMINO = ('EN REPARTO', 'EN BODEGA TRANSPORTADORA', 'EN BODEGA DESTINO', 'EN BODEGA ORIGEN', 'DESPACHADA', 'EN TRANSPORTE', 'TRANSITO', 'EN ESPERA DE RUTA DOMESTICA', 'EN REEXPEDICION', 'SIN MOVIMIENTOS', 'INTENTO DE ENTREGA')
cola = []
for x in json.load(open(Q)) if os.path.exists(Q) else []:
    st = (x.get('status') or '').upper()
    if 'DEVOL' in st or not any(s in st for s in EN_CAMINO) or x.get('horas', 0) < 48: continue
    k = str(x['id']); prev = reg.get(k)
    if prev and time.time() - prev['ultima'] < 48 * 3600: continue
    vez = (prev or {}).get('veces', 0) + 1
    texto = (f"Guía {x.get('guia')} ({x.get('dc')}) · pedido {x['id']} · {x.get('city')} · lleva {x['horas']} horas en «{st}» (desde {x.get('desde')}) sin cambiar de estado; último movimiento de la transportadora: {x.get('ult_mov') or '-'}. "
             f"No es por el cliente. Por favor gestionar la entrega o reprogramar." + (' (segunda solicitud)' if vez > 1 else ''))
    cola.append({'id': x['id'], 'guia': x.get('guia'), 'dc': x.get('dc'), 'dias': x['dias'], 'estado': st, 'ciudad': x.get('city'), 'vez': vez, 'texto': texto})
    reg[k] = {'ultima': time.time(), 'veces': vez}
json.dump(cola, open('/tmp/dropi/quejas_cas.json', 'w'), ensure_ascii=False, indent=1)
json.dump(reg, open(REG, 'w'))
print('QUEJAS_CAS', len(cola), '(CAS sin credenciales para el robot: van al resumen de Karen)')
for q in sorted(cola, key=lambda q: -q['dias'])[:15]: print(' ·', q['texto'])
