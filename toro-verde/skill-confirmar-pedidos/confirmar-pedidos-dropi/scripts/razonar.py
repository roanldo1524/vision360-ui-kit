import os
# Paso 2: decide pedido por pedido como lo haría una persona. Reglas NO NEGOCIABLES del dueño (todas salen de config.json):
#  1) Si el cliente devuelve más de max_devolucion (historial Dropi, todas las tiendas) no se confirma: se le pide un abono (pedir_anticipo.py).
#     Sin historial = se confirma.
#  2) Transportadora: la que mejor recibe ese cliente (oficina = siempre Interrapidísimo).
#  3) Precio: el que se negoció en el chat (si Dropi tiene otro y es un precio válido, se edita al del chat).
#  4) Chat: intención de compra confirmada, sin arrepentimiento, sin pago por adelantado sin validar.
#  5) Producto, presentación y cantidad: los del último resumen que aceptó el cliente.
#  6) Flete mayor al tope de envío del dueño (+ tolerancia_flete): no se confirma, revisión humana.
#  7) Dirección rural o sin nomenclatura: va a la oficina de Interrapidísimo del municipio; si no se conoce, revisión humana.
# Nunca cancela: lo dudoso queda en REVISAR con el motivo.
import json, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import oficinas as _ofi
TR = {int(k): v for k, v in json.load(open('/tmp/dropi/transportadoras.json')).items()}
UI = {'INTERRAPIDISIMO': 'Interrapidisimo', 'ENVIA': 'Envia', 'COORDINADORA': 'Coordinadora', 'SERVIENTREGA': 'Servientrega', 'TCC': 'Tcc', 'DOMINA': 'Domina', 'VELOCES': 'Veloces'}
PRECIOS = __PRECIOS_VALIDOS__
DESC = __PRECIOS_DESCUENTO__  # precios con descuento: solo para quien NUNCA ha comprado
PRECIO_UNIDADES = __PRECIOS_POR_UNIDADES__  # {unidades: [totales válidos]} para corregir la cantidad sola
UNIDADES = __PRESENTACIONES__
MIN_ENTREGA = __MIN_ENTREGA__  # para escoger transportadora: solo las que entregan MÁS que esta proporción
MAX_DEVOLUCION = __MAX_DEVOLUCION__  # si devuelve MÁS que esto (0.5 = 50 %), no se confirma: se pide abono
FLETE_MAX = __TOPE_ENVIO_GENERAL__  # envío máximo para confirmar solo
TOPES = __TOPES_ENVIO__  # tope por presentación o por unidades
TOLERANCIA = __TOLERANCIA_FLETE__  # se acepta este % por encima del tope (0.15 = 15 %)
GRANDE = __PEDIDO_GRANDE__  # {"unidades": N, "min_entrega": 0.7}: más de N unidades solo si el cliente recibe al menos ese %

def unidades_pres(pres):
    p = (pres or '').upper().replace('Ó', 'O')
    return next((v for k, v in sorted(UNIDADES.items(), key=lambda kv: -len(kv[0])) if k.replace('Ó', 'O') in p), 0)
def unidades_dropi(d): return sum((i['q'] or 0) * unidades_pres(i['pres']) for i in d['items'])
# Tope de envío del dueño: primero por presentación (p. ej. CAJA), si no por unidades totales (p. ej. 1 o 2 unidades), si no el general.
def tope_flete(d):
    pres = [(i['pres'] or '').upper() for i in d['items']]
    for k, v in (TOPES.get('presentaciones') or {}).items():
        if any(k.upper() in x for x in pres): return v
    return (TOPES.get('unidades') or {}).get(str(unidades_dropi(d)), FLETE_MAX)
det = json.load(open('/tmp/dropi/detalle.json'))
luc = {f['contacto']: f for f in json.load(open('robot/decision.json'))}

def unidades_chat(txt):
    tot = 0
    for q, pres in re.findall(r'\((\d+)\s*x[^)]*?(?:Presentacion|Presentación)\s*:?\s*([A-ZÁÉÍÓÚ0-9 ]+)', txt or '', re.I):
        tot += int(q) * unidades_pres(pres)
    return tot

acc = []
RURAL = {}  # id → oficina para direcciones rurales
for d in det:
    motivos, editar = [], {}
    f = luc.get(d.get('chat') or '57' + d['phone'])
    oficina = bool(re.search(r'oficina|reclama|interrap', (d['dir'] or '').lower()))
    # 7) Dirección y nombre: si algo se ve raro, no se confirma
    dirx = re.sub(r'\s+', ' ', (d['dir'] or '')).strip(' ,').lower()
    es_oficina_std = bool(re.search(r'(reclama|recoge|retira)\w* en (la )?oficina|^oficina (de )?interrap|oficina interrap', dirx))
    tiene_via = bool(re.search(r'\b(calle|cl|cll|carrera|cra|cr|kr|kra|carera|avenida|av|diagonal|dg|diag|transversal|tv|trans|manzana|mz|mza|vereda|vda|finca|corregimiento|barrio|km|kil[oó]metro|sector|lote|casa)\b', dirx)) and bool(re.search(r'\d', dirx) or re.search(r'vereda|finca|corregimiento|sector', dirx))
    if re.search(r'servientrega|coordinadora|\benv[ií]a\b|\btcc\b|deprisa|\b472\b|domina|veloces', dirx): motivos.append(f'la dirección nombra otra transportadora (para oficina solo se usa Interrapidísimo): «{(d["dir"] or "").strip()[:70]}»')
    # La dirección de oficina la arregla oficinas.py («dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO»); solo se frena si no se encuentra la oficina
    if oficina and not es_oficina_std and not _ofi.dir_oficina(d.get('state'), d.get('city'), d['dir']): motivos.append(f'dirección rara para oficina y no encuentro la oficina de Interrapidísimo del municipio: «{d["dir"].strip()[:70]}»')
    # Vereda, finca o dirección sin nomenclatura clara → el pedido va para reclamar en la oficina de Interrapidísimo
    # del municipio y se le avisa al cliente (revision_auto.py manda el mensaje por Lucid). Si no hay oficina conocida, revisión humana.
    rural_ofi = None
    con_numero = bool(re.search(r'#\s*\d+|\bn[oº°]\.?\s*\d+|\d+\s*[a-z]?\s*-\s*\d+|\b(mz[a]?|manzana)\.?\s*\w+\s*(cs|casa|lt|lote)\.?\s*\d+', dirx))
    # vereda, corregimiento, km, «vía a…»: siempre oficina. Finca/sector/parcela: oficina salvo que traiga nomenclatura completa (calle # número).
    rural = bool(re.search(r'\b(vereda|vda|corregimiento|km|kil[oó]metro)\b|v[ií]a a ', dirx)) or (bool(re.search(r'\b(finca|fca|sector|parcela|hacienda)\b', dirx)) and not con_numero)
    if not oficina and (rural or not con_numero or not tiene_via):
        rural_ofi = _ofi.dir_oficina(d.get('state'), d.get('city'), '')
        if not rural_ofi: motivos.append(f'dirección rural o sin nomenclatura y no encuentro la oficina de Interrapidísimo del municipio: «{(d["dir"] or "").strip()[:70]}»')
    nom = ((d.get('name') or '') + ' ' + (d.get('surname') or '')).lower()
    pal = re.findall(r'[a-záéíóúñ]+', nom)
    # Un apellido repetido es normal («López López») o viene de Lucid pegado al nombre: NO frena el pedido.
    # Solo frena si no hay nombre, si es muy corto o si una palabra está pegada a sí misma («juanjuan»).
    if not pal or re.search(r'([a-záéíóúñ]{4,})\1', nom) or len(nom.strip()) < 4: motivos.append(f'nombre raro: «{(d.get("name") or "")} {(d.get("surname") or "")}»')
    otras = [t for t in (d.get('tags') or []) if t and t not in ('CONFIRMADO AGENTE', 'REVISAR HUMANO')]
    if otras: motivos.append('una persona ya le puso etiquetas en Dropi (' + ', '.join(otras) + '): no lo toco')
    # 4) Chat
    if not f: motivos.append('no encontré el chat de este teléfono en Lucid')
    elif f['decision'] != 'SALE': motivos += f['motivos']
    # 1) Historial de entregas: devoluciones ÷ (entregados + devoluciones). Más de MAX_DEVOLUCION → pedir abono (pedir_anticipo.py).
    gp = ((d.get('huella') or {}).get('global_profile') or {}); lt = gp.get('lifetime_totals') or {}
    ent, dev = lt.get('delivered', 0) or 0, lt.get('returned', 0) or 0
    if ent + dev > 0 and dev / (ent + dev) > MAX_DEVOLUCION: motivos.append(f'recibe solo el {round(100*ent/(ent+dev))} % ({ent} entregados, {dev} devueltos): pedir abono')
    if re.search(r'riesgosa|cr[ií]tica', gp.get('risk_label') or '', re.I): motivos.append(f'Dropi lo marca {gp.get("risk_label")}')
    # Repetido en Dropi
    abiertos = [o for o in d.get('otros', []) if not re.search(r'CANCELADO|ENTREGADO|DEVOLUCION|DEVUELTO|ANULAD|RECHAZ|INDEMNIZ|REEMPLAZADA', o['status'] or '')]
    if abiertos: motivos.append('tiene otro pedido abierto en Dropi: ' + ', '.join(f"{o['id']} ({o['status']})" for o in abiertos))
    # 5) Producto y cantidad: tal cual el último resumen del chat, con su valor.
    if f:
        uc = unidades_chat(f.get('producto', '')); ud = unidades_dropi(d)
        if uc and ud and uc != ud:
            # Solo se corrige sola la cantidad si el pedido es de UNA presentación de 1 unidad y el valor del chat es justo el precio
            # de esa cantidad (precios_por_unidades). Cambiar de presentación (kit, caja) va a revisión humana.
            try: vcc = float(re.sub(r'[^\d.]', '', f.get('valor') or '') or 0)
            except Exception: vcc = 0
            una = len(d['items']) == 1 and unidades_pres(d['items'][0]['pres']) == 1
            cuadra = [int(x) for x in PRECIO_UNIDADES.get(str(uc), [])]  # el valor del chat tiene que ser el de esa cantidad
            if una and vcc and int(vcc) in cuadra: editar.update(cantidad=uc, precio=int(vcc))
            elif una and vcc: motivos.append(f'producto distinto: en el chat {uc} unidades por ${vcc:,.0f}, en Dropi {ud}: aclarar con el cliente'.replace(',', '.'))
            else: motivos.append(f'producto distinto: en el chat {uc} unidades, en Dropi {ud}')
    # Pedido grande (opcional): más de N unidades solo si el cliente recibe al menos min_entrega de TODOS sus pedidos. Nunca se cancela.
    if (GRANDE.get('unidades') or 0) > 0:
        umax = max(unidades_dropi(d), unidades_chat(f.get('producto', '')) if f else 0)
        if umax > GRANDE['unidades']:
            tot, entr = lt.get('orders', 0) or 0, lt.get('delivered', 0) or 0
            pct = entr / tot if tot else 0
            if pct < float(GRANDE.get('min_entrega', 0.7)): motivos.append(f'pide {umax} unidades (más de {GRANDE["unidades"]}) y recibe {round(100*pct)} % ({entr} entregados de {tot} pedidos); mínimo {round(100*float(GRANDE.get("min_entrega", 0.7)))} %')
    if f and f.get('origen') == 'pagina' and round(d['total']) not in PRECIOS and round(d['total']) not in DESC: motivos.append(f'pedido de la página con precio raro: {d["total"]:.0f}')
    # Lo que el agente ya frenó al leer el chat no se vuelve a proponer (hasta que una persona lo resuelva)
    _V = '/tmp/dropi/vetos.json'
    if os.path.exists(_V) and str(d['id']) in json.load(open(_V)): motivos.append('revisión del agente: ' + json.load(open(_V))[str(d['id'])])
    # Regla fija: el descuento es SOLO para quien nunca ha comprado. Si ya recibió pedidos de la tienda, precio normal: decide una persona.
    ms = ((d.get('huella') or {}).get('context_analysis') or {}).get('my_shop') or {}
    ya_compro = sum(k.get('delivered', 0) for k in ms.get('by_courier') or []) or ms.get('period_delivered', 0)
    if round(d['total']) in DESC and ya_compro: motivos.append(f'ya nos había comprado ({ya_compro} entregados) y lleva precio con descuento ${d["total"]:,.0f}: decidir el precio'.replace(',', '.'))
    # 3) Precio del chat (el robot nunca pone un descuento por su cuenta: solo precios válidos que el cliente aceptó)
    if f and not motivos and 'cantidad' not in editar:
        try: vc = float(re.sub(r'[^\d.]', '', f['valor']) or 0)
        except Exception: vc = 0
        if vc and abs(vc - d['total']) > 1:
            if vc in PRECIOS and len(d['items']) == 1: editar['precio'] = int(round(vc / max(1, d['items'][0]['q'])))
            else: motivos.append(f'precio distinto: Dropi {d["total"]:.0f}, chat {vc:.0f}')
    # 2) Transportadora con la que mejor recibe
    ca = (d.get('huella') or {}).get('context_analysis') or {}; hc = {}
    for sec in (ca.get('my_shop') or {}, ca.get('other_shops') or {}):
        for k in sec.get('by_courier') or []:
            z = hc.setdefault(k['courier_id'], [0, 0]); z[0] += k.get('delivered', 0); z[1] += k.get('returned', 0)
    tasa = lambda z: z[0] / (z[0] + z[1]) if sum(z) else None
    act = hc.get(d['dc'], [0, 0])
    # La que más entregas tiene para este cliente, solo entre las que recibe bien
    buenas = [(z[0], tasa(z), i) for i, z in hc.items() if z[0] > 0 and tasa(z) > MIN_ENTREGA and TR.get(i) in UI]
    mejor = max(buenas) if buenas else None
    tc = (f or {}).get('trans_cliente') or ''
    if tc:
        # No negociable: si el cliente dijo con qué transportadora, va por esa.
        idc = {'ENVIA': 2, 'INTERRAPIDISIMO': 3}.get(tc)
        zc = hc.get(idc, [0, 0]) if idc else [0, 0]
        if not idc: motivos.append(f'el cliente pidió la transportadora {tc}: revisarlo a mano')
        elif oficina and tc != 'INTERRAPIDISIMO': motivos.append('el cliente pidió Envía pero la dirección es de oficina Interrapidísimo: preguntar')
        elif sum(zc) and tasa(zc) <= MIN_ENTREGA: motivos.append(f'el cliente pidió {tc} pero con esa recibe solo {zc[0]} de {sum(zc)}')
        elif idc != d['dc'] and not motivos: editar['transportadora'] = UI[TR[idc]]
    elif oficina:
        if sum(act) and tasa(act) <= MIN_ENTREGA: motivos.append(f'es para oficina de Interrapidísimo y con Interrapidísimo recibe solo {act[0]} de {sum(act)}')
    # Si recibe muy bien con las dos (Envía e Interrapidísimo: 2+ entregas y 80 %+ con cada una), va por la más barata.
    elif all(hc.get(i, [0, 0])[0] >= 2 and tasa(hc[i]) >= 0.8 for i in (2, 3)):
        if not motivos: editar['transportadora'] = 'BARATA'
    elif mejor and mejor[2] != d['dc'] and mejor[0] > act[0]:
        if not motivos: editar['transportadora'] = UI[TR[mejor[2]]]
    elif not hc and not motivos:
        # Sin historial de entregas y a domicilio: la más barata entre Envía e Interrapidísimo
        editar['transportadora'] = 'BARATA'
    elif sum(act) and tasa(act) <= MIN_ENTREGA: motivos.append(f'con {TR.get(d["dc"])} devuelve y no hay otra transportadora con buen historial')
    # 6) Flete: tope del dueño + tolerancia (p. ej. 15 %)
    tope = round(tope_flete(d) * (1 + TOLERANCIA))
    if d['flete'] > tope and 'transportadora' not in editar: motivos.append(f'flete ${d["flete"]:,.0f} mayor a ${tope:,.0f}'.replace(',', '.'))
    if rural_ofi and not motivos:
        if d['dc'] != 3: editar['transportadora'] = UI['INTERRAPIDISIMO']  # Dropi crea ID nuevo; en la próxima vuelta ya es Inter y pasa a oficina
        else:
            editar.pop('transportadora', None); RURAL[str(d['id'])] = {'dir': rural_ofi, 'antes': (d['dir'] or '').strip(), 'chat': d.get('chat') or '57' + (d.get('phone') or ''), 'nombre': d['name'], 'ciudad': d.get('city')}
    if motivos: acc.append({'id': d['id'], 'accion': 'REVISAR', 'motivo': '; '.join(motivos), 'nombre': d['name']})
    elif editar: acc.append({'id': d['id'], 'accion': 'EDITAR_Y_CONFIRMAR', 'editar': editar, 'nombre': d['name'], 'dc': UI.get(TR.get(d['dc'], ''), '')})
    else: acc.append({'id': d['id'], 'accion': 'CONFIRMAR', 'nombre': d['name']})
json.dump(acc, open('/tmp/dropi/acciones.json', 'w'), ensure_ascii=False)
json.dump(RURAL, open('/tmp/dropi/rural.json', 'w'), ensure_ascii=False)
from collections import Counter
print('ACCIONES', dict(Counter(a['accion'] for a in acc)))
for a in acc: print(' -', a['accion'], a['id'], a['nombre'], a.get('editar') or a.get('motivo') or '')
