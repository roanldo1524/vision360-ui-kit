# Monitor de fallas (cargo: Líder de Tecnología → Felipe Ortiz). Ronald 24-11: «que todo el equipo trabaje en armonía, bien engranado, 24/7».
# Revisa, sin tocar nada, que cada agente haya trabajado a su hora mirando la última vez que dejó su huella en /tmp/dropi.
# Escribe /tmp/dropi/salud.json y lo imprime. Lo que salga con FALLA se relanza en la vuelta siguiente.
# Uso: python3 -I salud.py
import json, os, time, datetime, subprocess

D = '/tmp/dropi'
ahora = time.time()
bog = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)
h = bog.hour + bog.minute / 60
ini_hoy = ahora - (bog.hour * 3600 + bog.minute * 60 + bog.second)


def edad(nombre):
    p = os.path.join(D, nombre)
    return (ahora - os.path.getmtime(p)) / 60 if os.path.exists(p) else None


def hora_txt(minutos):
    if minutos is None:
        return 'nunca'
    if minutos < 60:
        return f'hace {int(minutos)} min'
    return f'hace {minutos / 60:.1f} h'


def revisar(agente, archivo, max_min, desde, hasta, despues_de=None):
    """ok si el archivo se tocó hace menos de max_min durante su horario; fuera de horario solo informa."""
    e = edad(archivo)
    en_horario = desde <= h <= hasta and (despues_de is None or h >= despues_de)
    if not en_horario:
        estado = 'descanso'
    elif e is None or e > max_min:
        estado = 'falla'
    else:
        estado = 'ok'
    return dict(agente=agente, estado=estado, ultima=hora_txt(e))


def hecho_hoy(agente, archivo, despues_de):
    e = edad(archivo)
    toco_hoy = e is not None and (ahora - e * 60) >= ini_hoy
    estado = 'ok' if toco_hoy else ('falla' if h >= despues_de + .5 else 'pendiente')
    return dict(agente=agente, estado=estado, ultima=hora_txt(e))


R = [
    revisar('Sesión de Dropi (llavero)', 'hoy.json', 120, 5, 21),
    revisar('Confirmador (vueltas cada 15 min)', 'plan.json', 40, 5.1, 20.9),
    revisar('Rescate de Lucid', 'fichas.md', 70, 5.3, 20.9),
    hecho_hoy('Quejas al CAS (8:47 y 2:47)', 'quejas_resultado.json', 8.8),
    revisar('Negociador del CAS (10:23 a 6:23)', 'cas_bandeja.json', 150, 10.4, 19.5),
    hecho_hoy('Reclamador de fletes (12:43)', 'devol_reclamos.json', 12.75),
    hecho_hoy('Reporte de la mañana (6:57)', 'reporte_datos.json', 7),
]
# guardián de datos: que el repositorio no tenga cambios sin subir
try:
    pend = subprocess.run(['git', '-C', '/home/user/vision360-ui-kit', 'status', '--porcelain'], capture_output=True, text=True, timeout=20).stdout.strip()
    R.append(dict(agente='Guardián de datos (repositorio al día)', estado='ok' if not pend else 'falla', ultima='sin cambios pendientes' if not pend else f'{len(pend.splitlines())} archivos sin subir'))
except Exception as ex:
    R.append(dict(agente='Guardián de datos (repositorio al día)', estado='falla', ultima=str(ex)[:60]))

activos = [r for r in R if r['estado'] in ('ok', 'falla')]
res = dict(hora=bog.strftime('%I:%M %p'), revisados=len(activos), ok=sum(r['estado'] == 'ok' for r in activos), descanso=len(R) - len(activos),
           fallas=[r for r in R if r['estado'] == 'falla'], detalle=R)
json.dump(res, open(os.path.join(D, 'salud.json'), 'w'), ensure_ascii=False, indent=1)
for r in R:
    print(('✅' if r['estado'] == 'ok' else '⚠️' if r['estado'] == 'falla' else '💤'), r['agente'], '·', r['ultima'], '·', r['estado'])
print('SALUD', res['ok'], 'ok de', res['revisados'], '· FALLAS', len(res['fallas']))
