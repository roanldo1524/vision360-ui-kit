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
fletes = sum(float(str(v.get('flete') or 0).replace(',', '').replace('$', '') or 0) for v in devol.values())
tickets = sorted({str(v.get('ticket')) for v in devol.values() if v.get('ticket')})
aclar = leer('aclaraciones.json', {})
vetos = leer('vetos.json', {})
anticipos = leer('anticipos.json', {})
rep = leer('reporte_datos.json', {})
p30 = leer('hoy30.json', [])
p30 = p30 if isinstance(p30, list) else p30.get('orders', [])
st30 = collections.Counter(o.get('status') for o in p30)
ent, dev = st30.get('ENTREGADO', 0), st30.get('DEVOLUCION', 0) + st30.get('RECHAZADO', 0) + st30.get('DESTRUCCION - SALVAMENTO - DONACION', 0)
can = st30.get('CANCELADO', 0); fin = ent + dev + can
pct = lambda x: round(100 * x / fin, 1) if fin else 0
kpi = dict(entrega=pct(ent), devolucion=pct(dev), cancelacion=pct(can), oficina=st30.get('RECLAME EN OFICINA', 0), base=fin)
try:
    subidos = sum(1 for _ in open('/tmp/robot/ya_subidos.txt'))
except Exception:
    subidos = 0

# horario: minutos de la hora en que trabaja (hora Bogotá) y horas del día
A = lambda **k: k
pisos = [
    A(n=8, nombre='Líder de Tecnología', area='Que el sistema funcione siempre y cada proceso sea más rápido', color='#9aa7b8', agentes=[
        A(id='monitor', nombre='Monitor de fallas', hace='Vigila que cada agente corrió a su hora; si se cayó la sesión o la máquina, lo repara y relanza',
          horas=[], min=[], dato='por construir (hoy se repara a mano)'),
        A(id='optimizador', nombre='Optimizador de procesos', hace='Aprende cómo se hace cada proceso y lo hace más rápido y con menos trabajo para Karen',
          horas=[], min=[], dato='por construir'),
    ]),
    A(n=7, nombre='Líder de Logística', area='Orquesta al equipo para cumplir 90 % entrega · 3 % devolución · 7 % cancelación', color='#7aa6ff', agentes=[
        A(id='kpi', nombre='Tablero de KPI', hace=f"Últimos 30 días ({kpi['base']} pedidos terminados) contra la meta",
          horas=list(range(5, 21)), min=[19], dato=f"entrega {kpi['entrega']} % (meta 90) · devolución {kpi['devolucion']} % (meta 3) · cancelación {kpi['cancelacion']} % (meta 7) · {kpi['oficina']} en oficina"),
        A(id='reportero', nombre='Reportes y avisos', hace='2 reportes por WhatsApp a Ronald, Karen y Leidy; avisa a quien debe llamar a un cliente',
          horas=[6, 20], min=[57], dato=f"ayer: {rep.get('conf_robot', 0)} robot · {rep.get('conf_humano', 0)} Karen"),
        A(id='coordinador', nombre='Coordinador', hace='Recibe la información de Ronald, la reparte y le cuida a cada cargo su cerebro (manual + memoria de casos)',
          horas=[], min=[], dato='por construir'),
        A(id='medidor', nombre='Panel y torre', hace='Publica el panel y esta torre cada hora con los números reales',
          horas=list(range(5, 21)), min=[19], dato='publicados cada hora'),
    ]),
    A(n=6, nombre='Jefe de inventarios', area='Que nunca se confirme un pedido sin producto en bodega', color='#c9a227', agentes=[
        A(id='stock', nombre='Monitor de stock', hace='Cada 30 min: stock por bodega vs pedidos confirmados sin guía; avisa antes de agotarse',
          horas=[], min=[], dato='por construir'),
    ]),
    A(n=5, nombre='Rastreador de oficinas', area='Que todo paquete en oficina se reclame antes de que lo devuelvan', color='#ff8a65', agentes=[
        A(id='oficina', nombre='Vigía de paquetes en oficina', hace='Lista lo que está en oficina y cuántos días lleva; valida que el cliente recibió la plantilla de Lucid',
          horas=[], min=[], dato='por construir (hoy lo hace con los casos del CAS)'),
        A(id='custodia', nombre='Gestor de custodia', hace='Si el cliente no puede ir: pide al CAS ampliar custodia o que reclame un familiar',
          horas=[10, 12, 16, 18], min=[23], dato='activo dentro de la conversación del CAS'),
    ]),
    A(n=4, nombre='Abogado de devoluciones', area='Que no nos cobren fletes de devoluciones injustificadas', color='#e05a7a', agentes=[
        A(id='reclamador', nombre='Analista de causales', hace='Revisa cada devolución con las causales de Dropi y los plazos (Inter 7 días, demás 30)',
          horas=[12], min=[43], dato=f"{len(devol)} guías reclamadas"),
        A(id='ticket', nombre='Ticket Dev_injustificadas', hace='Llena el Excel de Dropi, abre el ticket y hace seguimiento con evidencia',
          horas=[12], min=[43], dato=f"tickets: {', '.join('#' + t for t in tickets) or '—'}"),
    ]),
    A(n=3, nombre='Gestor de tickets y CAS', area='Que ningún paquete se quede quieto más de 48 h', color='#f2a33a', agentes=[
        A(id='vigia', nombre='Vigía de guías quietas', hace='Lee el historial de cada guía; marca +48 h quietas y descarta errores de actualización de Dropi',
          horas=[8, 14], min=[47], dato=f'{len(quietas)} guías quietas vigiladas'),
        A(id='abogado', nombre='Quejas al CAS', hace='Pone la queja con el pantallazo del historial; si la IA la cierra, pide asesor humano',
          horas=[8, 14], min=[47], dato=f'{quejas_hoy} quejas hoy · {len(quejas)} en total'),
        A(id='conversador', nombre='Negociador con transportadoras', hace='Conversa con el asesor: fecha, nuevo intento, custodia, datos correctos',
          horas=[10, 12, 16, 18], min=[23], dato=f"{cas_activos} casos abiertos"),
    ]),
    A(n=2, nombre='Resolutor de novedades', area='Que ninguna novedad termine en devolución por falta de respuesta', color='#5ec8e5', agentes=[
        A(id='novedades', nombre='Bot de Lucid', hace='Resuelve cada novedad con el cliente y da la solución en Dropi (lo maneja el otro chat)',
          horas=list(range(6, 21)), min=list(range(0, 60, 15)), dato=f"novedades abiertas ayer: {rep.get('nov_abiertas', 0)}"),
    ]),
    A(n=1, nombre='Confirmador de pedidos', area='Que todo pedido bueno salga hoy y ninguno dudoso salga sin preguntar', color='#3ccf7e', agentes=[
        A(id='confirmador', nombre='Lector de chats', hace='Lee cada chat como Karen y confirma en Dropi con CONFIRMADO AGENTE',
          horas=list(range(5, 21)), min=[19], dato=f'{conf_robot} confirmados hoy'),
        A(id='liviana', nombre='Vuelta rápida', hace='A los :04, :34 y :49 para que nadie espere',
          horas=list(range(5, 21)), min=[4, 34, 49], dato=f'{pend} esperando confirmación'),
        A(id='portero', nombre='Portero de dudas', hace='Frena lo dudoso y le pregunta al cliente',
          horas=list(range(5, 21)), min=[4, 19, 34, 49], dato=f'{len(vetos)} frenados · {len(aclar)} preguntas abiertas'),
        A(id='anticipo', nombre='Guardián de devoluciones', hace='Anticipo solo a clientes con más del 50 % de devoluciones',
          horas=list(range(7, 21)), min=[19], dato=f'{len(anticipos)} anticipos pedidos'),
        A(id='lucid', nombre='Rescate de Lucid', hace='Vuelve a subir pedidos con «Error al subir» sin duplicar',
          horas=list(range(5, 21)), min=[19], dato=f'{subidos} rescatados'),
    ]),
]
datos = dict(
    actualizado=ahora.strftime('%d %b, %I:%M %p').replace('AM', 'a. m.').replace('PM', 'p. m.'),
    vendido=vendido, pedidos=len(validos), conf_robot=conf_robot, revisar=revisar, guias=guias,
    quejas_hoy=quejas_hoy, cas_activos=cas_activos, fletes=fletes, kpi=kpi, pisos=pisos,
)
plantilla = open(os.path.join(AQUI, 'torre.html'), encoding='utf-8').read()
html = plantilla.replace('/*DATOS*/null', json.dumps(datos, ensure_ascii=False))
salida = sys.argv[1] if len(sys.argv) > 1 else '/tmp/torre.html'
os.makedirs(os.path.dirname(salida), exist_ok=True)
open(salida, 'w', encoding='utf-8').write(html)
print('TORRE', len(validos), 'pedidos', conf_robot, 'robot', quejas_hoy, 'quejas', '→', salida)
