# Ronald 23-11: «si está 48 horas sin movimiento se solicita atención al CAS, se coloca la queja» (problema de la transportadora, no del cliente).
# Lee /tmp/dropi/quietas.json (quietas.js) y arma la cola de quejas: guías en camino con 48 h o más sin movimiento que NO están en devolución.
# CAS activo desde el 23-11: quejas_enviar.py pone cada queja y la registra SOLO si quedó puesta.
# Una misma guía no se repite antes de 48 h; si sigue quieta, la segunda vez se reabre el caso (seguimiento). Uso: python3 -I robot/quejas_cas.py
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
    d = (x.get('desde') or '')[5:10]; d = d[3:5] + '/' + d[0:2] if len(d) == 5 else d
    um = (x.get('ult_mov') or '').strip()[:45]
    texto = (f"Guía {x.get('guia')} ({x.get('dc')}): lleva {x['horas']} h en «{st[:30]}» desde el {d} sin movimiento." + (f" Último: {um}." if um and um.upper() != st else '') +
             " No es por el cliente. Favor gestionar la entrega.")[:200]
    cola.append({'id': x['id'], 'guia': x.get('guia'), 'dc': x.get('dc'), 'dias': x['dias'], 'horas': x['horas'], 'estado': st, 'desde': d, 'ciudad': x.get('city'), 'vez': vez, 'texto': texto})
json.dump(cola, open('/tmp/dropi/quejas_cas.json', 'w'), ensure_ascii=False, indent=1)
print('QUEJAS_CAS', len(cola))
for q in sorted(cola, key=lambda q: -q['dias'])[:15]: print(' ·', q['texto'])
