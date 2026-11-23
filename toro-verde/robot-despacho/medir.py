# Medición diaria del robot (Ronald 23-11: meta 80-90 % confirmado sin persona).
# Guarda el historial de motivos (motivos.json se sobrescribe) y cruza con el estado actual de Dropi (hoy.json).
# Uso: cd /tmp/dropi && node hoy.js && python3 -I <repo>/toro-verde/robot-despacho/medir.py
import json, os, re, collections, datetime
os.chdir('/tmp/dropi')
hist = json.load(open('motivos_hist.json')) if os.path.exists('motivos_hist.json') else {}
for k, v in (json.load(open('motivos.json')) if os.path.exists('motivos.json') else {}).items():
    hist.setdefault(k, v)
json.dump(hist, open('motivos_hist.json', 'w'), ensure_ascii=False)
def cat(m):
    m = m.lower()
    for k, r in [('modo humano', 'modo humano'), ('flete', 'flete sobre el tope'), ('recibe solo', 'recibe poco'),
                 ('confirmar pedido|no veo la confirmaci|aún no confirma', 'sin «confirmar» en el chat'),
                 ('sin número de puerta|no es clara', 'dirección sin número'), ('rara|incompleta', 'dirección rara'),
                 ('riesgosa', 'Dropi riesgosa'), ('addi|cuota|transfer|anticipo', 'forma de pago'), ('agente', 'revisión del agente')]:
        if re.search(k, m): return r
    return 'otro'
def tg(o): return ' '.join(str(x.get('tag_name') or '') if isinstance(x, dict) else str(x) for x in o['tags']).upper()
H = {str(o['id']): o for o in json.load(open('hoy.json'))}
t = collections.defaultdict(collections.Counter)
for i, m in hist.items():
    o = H.get(i)
    if not o: continue
    s = o['status']
    k = 'cancelado' if 'CANCEL' in s else 'esperando' if s == 'PENDIENTE CONFIRMACION' else 'robot' if 'CONFIRMADO AGENTE' in tg(o) else 'persona aprobó'
    t[cat(m)][k] += 1
print('MOTIVO: total → persona aprobó / cancelado / esperando')
for m, c in sorted(t.items(), key=lambda x: -x[1]['persona aprobó']):
    print(f"{m}: {sum(c.values())} → {c['persona aprobó']} / {c['cancelado']} / {c['esperando']}")
hoy = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)).strftime('%Y-%m-%d')
d = [o for o in H.values() if o['created'].startswith(hoy) and 'CANCEL' not in o['status'] and o['status'] != 'PENDIENTE CONFIRMACION']
rob = sum(1 for o in d if 'CONFIRMADO AGENTE' in tg(o))
print(f'HOY {hoy}: salieron {len(d)}, confirmados por el robot {rob} ({100*rob//max(1,len(d))} %)')

# Tasa de ENTREGA (Ronald 23-11: «garantizar la tasa de entrega, ya que es contra entrega»).
# Por semana de creación: confirmados por el robot (CONFIRMADO AGENTE) frente a aprobados por una persona.
# Solo cuenta pedidos ya resueltos (entregado o devuelto); el resto va «en camino». hoy.json trae 10 días.
FIN_OK = {'ENTREGADO'}
FIN_MAL = {'DEVOLUCION', 'RECHAZADO', 'DEVOLUCION EN BODEGA', 'DEVUELTO'}
sem = collections.defaultdict(lambda: collections.defaultdict(collections.Counter))
for o in H.values():
    s = o['status']
    if 'CANCEL' in s or s in ('PENDIENTE CONFIRMACION', 'PENDIENTE', 'TELEMERCADEO'): continue
    quien = 'robot' if 'CONFIRMADO AGENTE' in tg(o) else 'persona'
    w = datetime.date.fromisoformat(o['created'][:10]).isocalendar()
    k = 'entregado' if s in FIN_OK else 'devuelto' if s in FIN_MAL else 'en camino'
    sem[f'{w[0]}-S{w[1]:02d}'][quien][k] += 1
print('ENTREGA por semana (entregado / devuelto / en camino → % entregado de los resueltos):')
for w in sorted(sem):
    for quien in ('robot', 'persona'):
        c = sem[w][quien]; r = c['entregado'] + c['devuelto']
        print(f"{w} {quien}: {c['entregado']} / {c['devuelto']} / {c['en camino']} → {100*c['entregado']//r if r else '-'} %")
