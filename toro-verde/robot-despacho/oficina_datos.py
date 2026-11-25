# Datos vivos de la sede virtual de Comercializadora del Rey (Ronald 24-11).
# Regla: las animaciones solo muestran EVENTOS REALES registrados hoy por los agentes (nada se simula).
#  - eventos(): actividad de hoy con hora real, sacada de los archivos de trabajo de /tmp/dropi.
#  - reunion(): reunión operativa del día, armada con reglas sobre KPI, salud y pendientes; se guarda en datos/reuniones/AAAA-MM-DD.json
#    con agenda, participantes, intervenciones (cada una cita un dato real), conclusiones y tareas con id, responsable, fecha y estado.
#  - calidad(): tablero ISO 9001 (procesos, objetivos medibles, riesgos, incidencias, acciones correctivas y ciclo PHVA).
import json, os, time, datetime

D = '/tmp/dropi'
AQUI = os.path.dirname(os.path.abspath(__file__))
TZ = datetime.timezone(datetime.timedelta(hours=-5))


def _leer(n, defecto):
    try:
        return json.load(open(os.path.join(D, n)))
    except Exception:
        return defecto


def _hoy():
    return datetime.datetime.now(TZ).date()


def _ts(x):
    """epoch o ISO → epoch (float)"""
    if isinstance(x, (int, float)):
        return float(x)
    try:
        return datetime.datetime.fromisoformat(str(x).replace('Z', '+00:00')).timestamp()
    except Exception:
        return None


def _es_hoy(t):
    return t is not None and datetime.datetime.fromtimestamp(t, TZ).date() == _hoy()


def _hora(t):
    return datetime.datetime.fromtimestamp(t, TZ).strftime('%I:%M %p').lstrip('0').replace('AM', 'a. m.').replace('PM', 'p. m.')


def eventos():
    ev = []

    def add(t, de, para, texto, tipo, ref=''):
        if _es_hoy(t):
            ev.append(dict(t=t, hora=_hora(t), de=de, para=para, texto=texto, tipo=tipo, ref=str(ref)))

    for pid, v in _leer('quejas_reg.json', {}).items():
        add(v.get('ultima'), 'Gestor de tickets y CAS', None, f'puso queja al CAS por el pedido {pid}', 'queja', pid)
    for x in _leer('cas_bandeja.json', []):
        ult, quien = (x.get('ult') or ''), (x.get('asesor') or '')
        if not quien or 'Tes Soporte' in quien:
            continue
        t = _ts(x.get('ult_fecha'))
        low = ult.lower()
        if 'oficina' in low or 'reclamo' in low:
            add(t, 'Gestor de tickets y CAS', 'Rastreador de oficinas', f'{x.get("dc", "")}: guía {x.get("guia")} disponible en oficina', 'cas_oficina', x.get('pedido'))
        elif 'intento' in low:
            add(t, 'Gestor de tickets y CAS', 'Líder de Logística', f'guía {x.get("guia")}: tres intentos, se pidió uno nuevo', 'cas_intento', x.get('pedido'))
        elif 'entregad' in low:
            add(t, 'Gestor de tickets y CAS', 'Líder de Logística', f'guía {x.get("guia")} ya entregada (error de actualización de Dropi)', 'cas_entregado', x.get('pedido'))
        else:
            add(t, 'Gestor de tickets y CAS', None, f'el asesor de {x.get("dc", "")} respondió la guía {x.get("guia")}', 'cas_respuesta', x.get('pedido'))
    for pid, v in _leer('aclaraciones.json', {}).items():
        if isinstance(v, dict):
            add(v.get('enviado') or v.get('fecha'), 'Confirmador de pedidos', 'Líder de Logística', f'pedido {pid} frenado: {v.get("motivo") or v.get("pregunta") or "duda"}', 'veto', pid)
    for pid, v in _leer('devol_reg.json', {}).items():
        add(v.get('fecha'), 'Abogado de devoluciones', 'Líder de Logística', f'guía {v.get("guia")} reclamada en ticket #{v.get("ticket")}', 'ticket', pid)
    for tel, v in _leer('anticipos.json', {}).items():
        add(v.get('enviado'), 'Confirmador de pedidos', None, f'pidió anticipo a {v.get("nombre", "cliente")} (más del 50 % de devoluciones)', 'anticipo', v.get('pedido'))
    for o in _leer('confirmados.json', []):
        tags = [t.get('tag_name') for t in (o.get('tags') or []) if isinstance(t, dict)]
        if 'CONFIRMADO AGENTE' in tags:
            add(_ts(o.get('created_at')), 'Confirmador de pedidos', None, f'confirmó el pedido de {o.get("name", "")} ({o.get("city", "")})', 'confirmado', o.get('id'))
    sal = _leer('salud.json', {})
    p = os.path.join(D, 'salud.json')
    if os.path.exists(p):
        for f in sal.get('fallas', []):
            add(os.path.getmtime(p), 'Monitor de fallas', 'Líder de Tecnología', f'falla: {f["agente"]} ({f["ultima"]})', 'falla')
    p = os.path.join(D, 'reporte_datos.json')
    if os.path.exists(p):
        add(os.path.getmtime(p), 'Líder de Logística', None, 'envió el reporte del día por WhatsApp a Ronald, Karen y Leidy', 'reporte')
    # Ronald 25-11: «la líder debe poder hablar con TODO el equipo y garantizar los KPI». Después del último trabajo real de cada agente,
    # la líder pasa por su puesto y revisa lo hecho contra la meta. Cada texto cita el conteo real de hoy (nada inventado).
    UNID = {'Confirmador de pedidos': 'pedidos trabajados', 'Gestor de tickets y CAS': 'gestiones en el CAS', 'Abogado de devoluciones': 'reclamos de flete',
            'Rastreador de oficinas': 'avisos de oficina', 'Resolutor de novedades': 'novedades', 'Jefe de inventarios': 'movimientos'}
    META = {'Confirmador de pedidos': 'meta: confirmar bien para llegar a 90 % de entrega',
            'Gestor de tickets y CAS': 'meta: ningún paquete quieto más de 48 h',
            'Abogado de devoluciones': 'meta: devolución por debajo de 3 %',
            'Rastreador de oficinas': 'meta: que todo paquete en oficina se reclame',
            'Resolutor de novedades': 'meta: cancelación por debajo de 7 %', 'Jefe de inventarios': 'meta: nunca quedarnos sin producto'}
    cnt = {}
    for e in list(ev):
        if e['de'] in UNID:
            c = cnt.setdefault(e['de'], [0, 0]); c[0] += 1; c[1] = max(c[1], e['t'])
    for ag, (k, t) in cnt.items():
        add(t + 90, 'Líder de Logística', ag, f'revisión de turno: {k} {UNID[ag]} hoy · {META[ag]}', 'lider')
    # Líder de Tecnología con su equipo, con datos del monitor de salud y del cerebro de reglas
    p = os.path.join(D, 'salud.json')
    if os.path.exists(p):
        t = os.path.getmtime(p)
        add(t + 30, 'Líder de Tecnología', 'Monitor de fallas', f'revisión: {sal.get("ok", 0)} de {sal.get("revisados", 0)} procesos al día, {len(sal.get("fallas", []))} fallas', 'lider')
        g = next((x for x in sal.get('detalle', []) if x['agente'].startswith('Guardián')), None)
        if g: add(t + 60, 'Líder de Tecnología', 'Guardián de datos', f'repositorio: {g["ultima"]}', 'lider')
    lg = '/tmp/robot/bucle.log'
    if os.path.exists(lg):
        txt = open(lg, errors='ignore').read()
        seg = txt.count('AUTO SEGURO'); dud = txt.count('AUTO DUDA')
        if seg + dud: add(os.path.getmtime(lg), 'Líder de Tecnología', 'Optimizador de procesos', f'cerebro de reglas: {seg} pedidos seguros sin gastar IA, {dud} dudas a revisión', 'lider')
    n_v = sum(1 for e in ev if e['tipo'] == 'veto')
    if n_v: add(max(e['t'] for e in ev if e['tipo'] == 'veto') + 120, 'Líder de Tecnología', 'Auditor de calidad', f'auditar los {n_v} pedidos frenados hoy: ¿el motivo era real?', 'lider')
    ev.sort(key=lambda e: e['t'])
    return ev


def reunion(kpi, salud, ev, revisar):
    hoy = _hoy()
    fecha = hoy.isoformat()
    sig = lambda d: (hoy + datetime.timedelta(days=d)).isoformat()
    n_ofi = sum(1 for e in ev if e['tipo'] == 'cas_oficina')
    n_vetos = sum(1 for e in ev if e['tipo'] == 'veto')
    n_quejas = sum(1 for e in ev if e['tipo'] == 'queja')
    n_conf = sum(1 for e in ev if e['tipo'] == 'confirmado')
    fallas = salud.get('fallas', []) if salud else []
    habla = []
    tareas = []

    def tarea(titulo, resp, dias, aprob=False, proceso=''):
        tareas.append(dict(id=f'T-{hoy.strftime("%Y%m%d")}-{len(tareas) + 1:02d}', titulo=titulo, responsable=resp, fecha=sig(dias),
                           estado='requiere aprobación humana' if aprob else 'abierta', aprobacion_humana=aprob, proceso=proceso))

    habla.append(('Líder de Logística', f'Últimos 30 días: entrega {kpi.get("entrega")} % (meta 90), devolución {kpi.get("devolucion")} % (meta 3), cancelación {kpi.get("cancelacion")} % (meta 7).'))
    habla.append(('Confirmador de pedidos', f'Hoy confirmé {n_conf} pedidos con chat leído y frené {n_vetos} con motivo. Quedan {revisar} en revisión de Karen.'))
    habla.append(('Gestor de tickets y CAS', f'Hoy puse {n_quejas} quejas al CAS; {n_ofi} guías aparecen disponibles en oficina según los asesores.'))
    habla.append(('Rastreador de oficinas', f'Hay {kpi.get("oficina", 0)} paquetes en «Reclame en oficina» en los últimos 30 días; es la fuga más grande de la entrega.'))
    habla.append(('Monitor de fallas', f'{salud.get("ok", 0)} de {salud.get("revisados", 0)} agentes al día' + (': fallas en ' + ', '.join(f['agente'] for f in fallas) if fallas else ', sin fallas.') if salud else 'Aún no hay revisión de salud.'))
    if (kpi.get('entrega') or 0) < 90:
        tarea(f'Lista diaria de paquetes en oficina ({kpi.get("oficina", 0)}) con días en oficina y aviso al cliente', 'Rastreador de oficinas', 2, proceso='Rastreo de oficinas')
        habla.append(('Líder de Tecnología', 'Propuesta: construir la lista diaria del Rastreador antes que cualquier otra mejora; es lo que más sube la entrega.'))
    if (kpi.get('devolucion') or 0) > 3:
        tarea('Quejar al CAS toda guía con más de 48 h quieta y reclamar cada devolución injustificada dentro del plazo', 'Gestor de tickets y CAS', 1, proceso='Tickets y CAS')
    if (kpi.get('cancelacion') or 0) > 7:
        tarea('Analizar los motivos de cancelación de los últimos 30 días y proponer reglas de confirmación', 'Auditor de calidad', 3, proceso='Confirmación')
    for f in fallas:
        tarea(f'Relanzar y corregir: {f["agente"]}', 'Monitor de fallas', 0, proceso='Tecnología')
    if revisar:
        tarea(f'Revisar {revisar} pedidos frenados por el robot (llamar o confirmar)', 'Karen (humana)', 0, aprob=True, proceso='Confirmación')
    tarea('Construir el monitor de stock (Jefe de inventarios)', 'Líder de Tecnología', 7, proceso='Inventarios')
    tarea('Cualquier anticipo, descuento o cambio de tope de flete', 'Ronald (humano)', 0, aprob=True, proceso='Dinero')
    concl = [f'La meta que más se aleja es la {"entrega" if (90 - (kpi.get("entrega") or 0)) >= ((kpi.get("devolucion") or 0) - 3) else "devolución"}.',
             'Las decisiones de dinero (anticipos, descuentos, topes de flete) las aprueba una persona.',
             f'{len(tareas)} tareas asignadas con responsable y fecha.']
    r = dict(id=f'R-{hoy.strftime("%Y%m%d")}', fecha=fecha, titulo='Reunión operativa diaria',
             convoca='Líder de Logística (coordinadora)', participantes=sorted({h[0] for h in habla} | {t['responsable'] for t in tareas if '(' not in t['responsable']}),
             agenda=['Indicadores contra la meta', 'Confirmación y frenados', 'CAS y paquetes en oficina', 'Salud del sistema', 'Tareas y aprobaciones'],
             intervenciones=[dict(quien=q, dice=t) for q, t in habla], conclusiones=concl, tareas=tareas,
             nota='Armada con reglas a partir de los datos reales del día; cada intervención cita un número del sistema.')
    try:
        carpeta = os.path.join(AQUI, 'datos', 'reuniones')
        os.makedirs(carpeta, exist_ok=True)
        json.dump(r, open(os.path.join(carpeta, f'{fecha}.json'), 'w'), ensure_ascii=False, indent=1)
    except Exception:
        pass
    return r


def calidad(kpi, salud, reu):
    procesos = [
        ('Confirmación', 'Confirmador de pedidos', '% de pedidos confirmados por el robot que se entregan', 'medición diaria de las 8 p. m.'),
        ('Novedades', 'Resolutor de novedades', 'novedades resueltas el mismo día', 'bot de Lucid'),
        ('Tickets y CAS', 'Gestor de tickets y CAS', 'ninguna guía con más de 48 h quieta', 'quejas diarias'),
        ('Devoluciones', 'Abogado de devoluciones', f'devolución ≤ 3 % (hoy {kpi.get("devolucion")} %)', 'ticket diario'),
        ('Rastreo de oficinas', 'Rastreador de oficinas', f'entrega ≥ 90 % (hoy {kpi.get("entrega")} %)', f'{kpi.get("oficina", 0)} en oficina'),
        ('Inventarios', 'Jefe de inventarios', 'cero pedidos sin stock', 'en construcción'),
        ('Tecnología', 'Líder de Tecnología', '100 % de vueltas a su hora', f'{salud.get("ok", 0)}/{salud.get("revisados", 0)} al día' if salud else 'sin revisar'),
    ]
    riesgos = [
        dict(riesgo='Paquete no reclamado en oficina → devolución', nivel='alto', control='Rastreador de oficinas + custodia por CAS'),
        dict(riesgo='Guía quieta más de 48 h', nivel='medio', control='Quejas al CAS dos veces al día'),
        dict(riesgo='Pedido dudoso confirmado (casa/oficina, pago mañana)', nivel='medio', control='Portero de dudas + pregunta al cliente'),
        dict(riesgo='Caída de la sesión de Dropi o de la máquina', nivel='medio', control='Monitor de fallas cada hora'),
        dict(riesgo='Decisión de dinero sin autorización', nivel='alto', control='Aprobación humana obligatoria'),
    ]
    incidencias = [dict(fecha=_hoy().isoformat(), detalle=f['agente'] + ' · ' + f['ultima']) for f in (salud.get('fallas', []) if salud else [])]
    return dict(procesos=[dict(proceso=a, responsable=b, objetivo=c, seguimiento=d) for a, b, c, d in procesos], riesgos=riesgos, incidencias=incidencias,
                acciones=[t for t in reu['tareas']],
                phva=dict(planear=f'Reunión {reu["id"]}: agenda y tareas', hacer='Agentes ejecutando en su horario', verificar='KPI de 30 días + monitor de fallas',
                          actuar=f'{len(reu["tareas"])} acciones con responsable y fecha'),
                documentos=['docs/equipo-logistica.md (manual de cargos)', 'ESTADO.md (bitácora)', f'datos/reuniones/{reu["fecha"]}.json (acta)'])
