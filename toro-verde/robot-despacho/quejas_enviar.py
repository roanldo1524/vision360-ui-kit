# Pone por el CAS las quejas de /tmp/dropi/quejas_cas.json (quejas_cas.py). Ronald 23-11: «presionar más a las transportadoras… que se entreguen los paquetes».
# Primera vez: queja «Ordenes sin movimiento» con el pantallazo del historial; si el agente de IA de Dropi la cierra sin gestión, se reabre pidiendo ASESOR HUMANO.
# Si la guía sigue quieta 48 h después: se reabre el mismo caso con un mensaje de seguimiento. Solo se registra lo que de verdad quedó puesto.
# Uso: python3 -I robot/quejas_enviar.py   (3 a la vez)
import json, os, time, subprocess, concurrent.futures as cf
REG = '/tmp/dropi/quejas_reg.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
cola = json.load(open('/tmp/dropi/quejas_cas.json')) if os.path.exists('/tmp/dropi/quejas_cas.json') else []
def node(*a, t=240):
    try: out = subprocess.run(['node', *a], cwd='/tmp/dropi', capture_output=True, text=True, timeout=t).stdout.strip().splitlines()
    except Exception as e: return 'ERROR ' + str(e)[:80]
    return out[-1] if out else 'ERROR sin salida'
# Mensajes con la redacción de Karen (así logra que la IA de Dropi pase el caso a un asesor humano).
def humano(q):
    return (f"Solicitamos por favor su intervención, con el fin de agilizar los procesos internos pendientes y permitir que la guía {q['guia']} continúe su movimiento hasta llegar a destino. "
            f"Lleva {q['horas']} horas en «{q['estado'][:30]}» desde el {q['desde']} sin ningún cambio. Agradecemos su pronta gestión y apoyo para evitar mayores retrasos.")
def seguir(q):
    return (f"Buen día. Seguimos sin movimiento en la guía {q['guia']}: {q['horas']} horas en «{q['estado'][:30]}» desde el {q['desde']}. "
            f"Solicitamos por favor su intervención con {q['dc']} para agilizar la entrega al destinatario. Agradecemos su pronta gestión y apoyo para evitar mayores retrasos.")
def una(q):
    i = str(q['id'])
    if q['vez'] == 1:
        r = node('quejar_cas.js', i, q['texto'])
        if r.startswith('QUEJA_OK'):
            time.sleep(25); r2 = node('reabrir_cas.js', i, humano(q), 'ia'); return q, 'nueva', r + ' | ' + r2
        if r.startswith('QUEJA_YA_ABIERTA'):
            r2 = node('reabrir_cas.js', i, seguir(q), 'seguir'); return q, 'seguimiento', r2
        return q, 'error', r
    r2 = node('reabrir_cas.js', i, seguir(q), 'seguir'); return q, 'seguimiento', r2
hechas, fallas = [], []
with cf.ThreadPoolExecutor(3) as ex:
    for q, tipo, r in ex.map(una, cola):
        ok = 'QUEJA_OK' in r or 'REABIERTA_OK' in r
        print(('OK ' if ok else 'FALLA ') + tipo, q['id'], q['dc'], q['ciudad'], '·', r[:160], flush=True)
        if ok:
            reg[str(q['id'])] = {'ultima': time.time(), 'veces': q['vez']}; hechas.append(q)
        else: fallas.append((q, r))
        json.dump(reg, open(REG, 'w'))
json.dump({'fecha': time.strftime('%Y-%m-%d %H:%M'), 'hechas': [{k: q[k] for k in ('id', 'guia', 'dc', 'ciudad', 'horas', 'estado', 'vez')} for q in hechas],
           'fallas': [{'id': q['id'], 'r': r[:120]} for q, r in fallas]}, open('/tmp/dropi/quejas_resultado.json', 'w'), ensure_ascii=False, indent=1)
print('QUEJAS_PUESTAS', len(hechas), 'FALLAS', len(fallas))
