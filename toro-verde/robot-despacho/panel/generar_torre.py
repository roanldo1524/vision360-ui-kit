# Torre Toro Verde: edificio 3D donde cada piso es un departamento y cada robot un agente REAL (Ronald 24-11:
# «quiero tener los agentes así, hagámoslo realidad»). Lee los archivos de trabajo de /tmp/dropi y del robot,
# arma los números de hoy por agente y los mete en la plantilla torre.html.
# Uso: python3 -I generar_torre.py <salida.html>
import json, os, sys, datetime, collections

D = '/tmp/dropi'
AQUI = os.path.dirname(os.path.abspath(__file__))
ahora = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)
HOY = ahora.strftime('%Y-%m-%d')
ini_hoy = datetime.datetime.strptime(HOY, '%Y-%m-%d').replace(tzinfo=datetime.timezone(datetime.timedelta(hours=-5))).timestamp()


def leer(nombre, defecto):
    try:
        return json.load(open(os.path.join(D, nombre)))
    except Exception:
        return defecto


def nombre_tag(t):
    return t.get('tag_name') if isinstance(t, dict) else str(t)


pedidos = leer('hoy.json', [])
pedidos = pedidos if isinstance(pedidos, list) else pedidos.get('orders', [])
de_hoy = [o for o in pedidos if str(o.get('created', '')).startswith(HOY)]
validos = [o for o in de_hoy if o.get('status') != 'CANCELADO']
vendido = sum(o.get('total') or 0 for o in validos)
tags = collections.Counter(nombre_tag(t) for o in de_hoy for t in (o.get('tags') or []))
conf_robot = tags.get('CONFIRMADO AGENTE', 0)
revisar = sum(1 for o in de_hoy if o.get('status') in ('PENDIENTE CONFIRMACION',) and any(nombre_tag(t) == 'REVISAR HUMANO' for t in o.get('tags') or []))
pend = sum(1 for o in de_hoy if o.get('status') == 'PENDIENTE CONFIRMACION')
guias = sum(1 for o in de_hoy if o.get('status') == 'GUIA_GENERADA')

quejas = leer('quejas_reg.json', {})
quejas_hoy = sum(1 for v in quejas.values() if (v.get('ultima') or 0) >= ini_hoy)
quietas = leer('quietas.json', [])
quietas = quietas if isinstance(quietas, list) else quietas.get('quietas', [])
pend_cas = leer('cas_pendientes.json', {'responder': [], 'escalar': []})
bandeja = leer('cas_bandeja.json', [])
cas_activos = sum(1 for x in bandeja if x.get('estado') in ('active', 'queues'))
devol = leer('devol_reg.json', {})
fletes = sum(v.get('flete') or 0 for v in devol.values())
tickets = sorted({str(v.get('ticket')) for v in devol.values() if v.get('ticket')})
aclar = leer('aclaraciones.json', {})
vetos = leer('vetos.json', {})
anticipos = leer('anticipos.json', {})
rep = leer('reporte_datos.json', {})
try:
    subidos = sum(1 for _ in open('/tmp/robot/ya_subidos.txt'))
except Exception:
    subidos = 0

# horario: minutos de la hora en que trabaja (hora Bogotá) y horas del día
A = lambda **k: k
pisos = [
    A(n=4, nombre='Reportes', area='Lo que ve el equipo', color='#7aa6ff', agentes=[
        A(id='reportero', nombre='Reportero de WhatsApp', hace='Manda 2 reportes al día al equipo: robot vs humano, novedades y tickets',
          horas=[6, 20], min=[57], dato=f"{rep.get('conf_robot', 0)} robot · {rep.get('conf_humano', 0)} Karen (ayer)"),
        A(id='medidor', nombre='Medidor', hace='Mide % confirmado por el robot y % entregado por semana',
          horas=list(range(5, 21)), min=[19], dato='panel publicado cada hora'),
    ]),
    A(n=3, nombre='Despacho y logística', area='Que el paquete se ENTREGUE', color='#f2a33a', agentes=[
        A(id='vigia', nombre='Vigía de guías quietas', hace='Lee el historial de cada guía y marca las que llevan +48 h sin moverse',
          horas=[8, 14], min=[47], dato=f'{len(quietas)} guías quietas vigiladas'),
        A(id='abogado', nombre='Abogado de CAS', hace='Pone la queja en el CAS de Dropi con el pantallazo del historial',
          horas=[8, 14], min=[47], dato=f'{quejas_hoy} quejas hoy · {len(quejas)} en total'),
        A(id='conversador', nombre='Negociador con transportadoras', hace='Lee lo que contestan los asesores y responde: custodia, nuevo intento, fecha',
          horas=[10, 12, 16, 18], min=[23], dato=f"{len(pend_cas.get('responder', []))} respuestas leídas · {cas_activos} casos abiertos"),
        A(id='reclamador', nombre='Reclamador de fletes', hace='Analiza devoluciones injustificadas y abre el ticket para que no cobren el envío',
          horas=[12], min=[43], dato=f"{len(devol)} guías reclamadas · ticket {', '.join('#' + t for t in tickets) or '—'}"),
    ]),
    A(n=2, nombre='Confirmación', area='Pedido bueno sale hoy', color='#3ccf7e', agentes=[
        A(id='confirmador', nombre='Confirmador', hace='Lee cada chat como Karen, revisa historial, flete y dirección, y confirma en Dropi',
          horas=list(range(5, 21)), min=[19], dato=f'{conf_robot} confirmados hoy'),
        A(id='liviana', nombre='Vigilante de turno', hace='Vuelta rápida a los :04, :34 y :49 para que nadie espere',
          horas=list(range(5, 21)), min=[4, 34, 49], dato=f'{pend} esperando confirmación'),
        A(id='portero', nombre='Portero de dudas', hace='Frena lo dudoso (casa/oficina, pago mañana) y le pregunta al cliente',
          horas=list(range(5, 21)), min=[4, 19, 34, 49], dato=f'{len(vetos)} frenados con motivo · {len(aclar)} preguntas abiertas'),
        A(id='anticipo', nombre='Guardián de devoluciones', hace='Pide anticipo solo a clientes con más del 50 % de devoluciones',
          horas=list(range(7, 21)), min=[19], dato=f'{len(anticipos)} anticipos pedidos'),
    ]),
    A(n=1, nombre='Sala de máquinas', area='Conexiones Lucid ↔ Dropi', color='#b98cff', agentes=[
        A(id='lucid', nombre='Mecánico de Lucid', hace='Revisa pedidos con «Error al subir» y los vuelve a subir sin duplicar',
          horas=list(range(5, 21)), min=[19], dato=f'{subidos} pedidos rescatados'),
        A(id='sesion', nombre='Llavero de Dropi', hace='Mantiene la sesión de Dropi abierta para todos los demás',
          horas=list(range(5, 21)), min=[4, 19, 34, 49], dato='sesión activa'),
    ]),
]

datos = dict(
    actualizado=ahora.strftime('%d %b, %I:%M %p').replace('AM', 'a. m.').replace('PM', 'p. m.'),
    vendido=vendido, pedidos=len(validos), conf_robot=conf_robot, revisar=revisar, guias=guias,
    quejas_hoy=quejas_hoy, cas_activos=cas_activos, fletes=fletes, pisos=pisos,
)
plantilla = open(os.path.join(AQUI, 'torre.html'), encoding='utf-8').read()
html = plantilla.replace('/*DATOS*/null', json.dumps(datos, ensure_ascii=False))
salida = sys.argv[1] if len(sys.argv) > 1 else '/tmp/torre.html'
os.makedirs(os.path.dirname(salida), exist_ok=True)
open(salida, 'w', encoding='utf-8').write(html)
print('TORRE', len(validos), 'pedidos', conf_robot, 'robot', quejas_hoy, 'quejas', '→', salida)
