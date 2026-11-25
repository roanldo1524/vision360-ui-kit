import os
# Paso 2: decide pedido por pedido como lo haría una persona. Reglas NO NEGOCIABLES de Ronald (21-11):
#  1) Solo se confirma si el cliente recibe MÁS del 50 % (historial Dropi, todas las tiendas). Sin historial = se confirma.
#  2) Transportadora: la que mejor recibe ese cliente (oficina = siempre Interrapidísimo).
#  3) Precio: el que se negoció en el chat (si Dropi tiene otro, se edita al del chat).
#  4) Chat: intención de compra confirmada, sin arrepentimiento, sin pago por adelantado sin validar.
#  5) Producto, presentación y cantidad: los que pidió el cliente.
#  6) Flete mayor al tope (1 L $25.000, 2 L $29.000, galón $35.000, lo demás $30.000; Ronald 22-11): no se confirma, revisión humana.
import json, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import oficinas as _ofi
TR = {int(k): v for k, v in json.load(open('/tmp/dropi/transportadoras.json')).items()}
UI = {'INTERRAPIDISIMO': 'Interrapidisimo', 'ENVIA': 'Envia', 'COORDINADORA': 'Coordinadora', 'SERVIENTREGA': 'Servientrega', 'TCC': 'Tcc', 'DOMINA': 'Domina', 'VELOCES': 'Veloces'}
PRECIOS = {99000, 169000, 269000, 89100, 152100, 242100, 995000, 895500}
LITROS = {'LITRO': 1, 'GALON': 4, 'POMA': 20, '2 LITROS': 2}
FLETE_MAX = 30000  # Ronald 21-11: más de $30.000 de envío → revisión humana
FLETE_MAX_GALON = 35000  # Ronald 22-11: si el pedido es de galón, acepta hasta $35.000
# Ronald 22-11: tope de envío según lo que lleva el pedido: 1 litro $25.000 · 2 litros $29.000 · galón $35.000 · lo demás $30.000
def tope_flete(d):
    pres = [(i['pres'] or '').upper().replace('Ó', 'O') for i in d['items']]
    if any('POMA' in x for x in pres): return FLETE_MAX
    if any('GALON' in x for x in pres): return FLETE_MAX_GALON
    lit = sum(i['q'] * next((v for k, v in LITROS.items() if k in (i['pres'] or '').upper()), 0) for i in d['items'])
    return {1: 25000, 2: 29000}.get(lit, FLETE_MAX)
det = json.load(open('/tmp/dropi/detalle.json'))
luc = {f['contacto']: f for f in json.load(open('robot/decision.json'))}

def litros_chat(txt):
    tot = 0
    for q, pres in re.findall(r'\((\d+)\s*x[^)]*?(?:Presentacion|Presentación)\s*:?\s*([A-ZÁÉÍÓÚ0-9 ]+)', txt or '', re.I):
        p = pres.strip().upper().replace('Ó', 'O')
        tot += int(q) * next((v for k, v in LITROS.items() if k in p), 0)
    return tot

acc = []
for d in det:
    motivos, editar = [], {}
    f = luc.get(d.get('chat') or '57' + d['phone'])
    oficina = bool(re.search(r'oficina|reclama|interrap', (d['dir'] or '').lower()))
    # 7) Dirección y nombre: si algo se ve raro, no se confirma (Ronald 21-11)
    dirx = re.sub(r'\s+', ' ', (d['dir'] or '')).strip(' ,').lower()
    es_oficina_std = bool(re.search(r'(reclama|recoge|retira)\w* en (la )?oficina|^oficina (de )?interrap|oficina interrap', dirx))
    tiene_via = bool(re.search(r'\b(calle|cl|cll|carrera|cra|cr|kr|kra|carera|avenida|av|diagonal|dg|diag|transversal|tv|trans|manzana|mz|mza|vereda|vda|finca|corregimiento|barrio|km|kil[oó]metro|sector|lote|casa)\b', dirx)) and bool(re.search(r'\d', dirx) or re.search(r'vereda|finca|corregimiento|sector', dirx))
    if re.search(r'servientrega|coordinadora|\benv[ií]a\b|\btcc\b|deprisa|\b472\b|domina|veloces', dirx): motivos.append(f'la dirección nombra otra transportadora (solo enviamos a oficinas de Interrapidísimo): «{(d["dir"] or "").strip()[:70]}»')
    # Ronald 25-11: la dirección de oficina la arregla oficinas.py («dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO»); solo se frena si no se encuentra la oficina
    if oficina and not es_oficina_std and not _ofi.dir_oficina(d.get('state'), d.get('city'), d['dir']): motivos.append(f'dirección rara para oficina y no encuentro la oficina de Interrapidísimo del municipio: «{d["dir"].strip()[:70]}»')
    elif not oficina and not (re.search(r'#\s*\d+|\bn[oº°]\.?\s*\d+|\d+\s*[a-z]?\s*-\s*\d+|\bmz[a]?\.?\s*\w+\s*(cs|casa|lt|lote)\.?\s*\d+|\b(km|kil[oó]metro)\s*\d+', dirx) or re.search(r'vereda|finca|corregimiento|v[ií]a a |sector|parcela|hacienda', dirx)):
        motivos.append(f'dirección sin número de puerta, no es clara: «{(d["dir"] or "").strip()[:70]}»')
    elif not oficina and not tiene_via: motivos.append(f'dirección incompleta o rara: «{(d["dir"] or "").strip()[:70]}»')
    nom = ((d.get('name') or '') + ' ' + (d.get('surname') or '')).lower()
    pal = re.findall(r'[a-záéíóúñ]+', nom)
    if len(pal) != len(set(pal)) or re.search(r'([a-záéíóúñ]{4,})\1', nom) or len(nom.strip()) < 4: motivos.append(f'nombre raro: «{(d.get("name") or "")} {(d.get("surname") or "")}»')
    otras = [t for t in (d.get('tags') or []) if t and t not in ('CONFIRMADO AGENTE', 'REVISAR HUMANO')]
    if otras: motivos.append('una persona ya le puso etiquetas en Dropi (' + ', '.join(otras) + '): no lo toco')
    # 4) Chat
    if not f: motivos.append('no encontré el chat de este teléfono en Lucid')
    elif f['decision'] != 'SALE': motivos += f['motivos']
    # 1) Historial de entregas
    gp = ((d.get('huella') or {}).get('global_profile') or {}); lt = gp.get('lifetime_totals') or {}
    ent, dev = lt.get('delivered', 0), lt.get('returned', 0)
    if ent + dev > 0 and ent / (ent + dev) <= 0.5: motivos.append(f'recibe solo el {round(100*ent/(ent+dev))} % ({ent} entregados, {dev} devueltos)')
    if re.search(r'riesgosa|cr[ií]tica', gp.get('risk_label') or '', re.I): motivos.append(f'Dropi lo marca {gp.get("risk_label")}')
    # Repetido en Dropi
    abiertos = [o for o in d.get('otros', []) if not re.search(r'CANCELADO|ENTREGADO|DEVOLUCION|DEVUELTO|ANULAD|RECHAZ|INDEMNIZ|REEMPLAZADA', o['status'] or '')]
    if abiertos: motivos.append('tiene otro pedido abierto en Dropi: ' + ', '.join(f"{o['id']} ({o['status']})" for o in abiertos))
    # 5) Producto y cantidad
    if f:
        lc = litros_chat(f.get('producto', '')); ld = sum((i['q'] or 0) * next((v for k, v in LITROS.items() if k in (i['pres'] or '').upper()), 0) for i in d['items'])
        if lc and ld and lc != ld:
            # Ronald 25-11: producto y cantidad tal cual el último resumen del chat, con su valor. Solo litros (1, 2 o 3 L) se corrigen solos;
            # cambiar a galón o poma es otra presentación en Dropi y va a revisión humana.
            try: vcc = float(re.sub(r'[^\d.]', '', f.get('valor') or '') or 0)
            except Exception: vcc = 0
            solo_litro = len(d['items']) == 1 and re.fullmatch(r'\s*LITRO\s*', (d['items'][0]['pres'] or '').upper().replace('PRESENTACION :', '').replace('PRESENTACION:', ''))
            cuadra = {1: (99000, 89100), 2: (169000, 152100)}.get(lc, ())  # el valor del chat tiene que ser el de esa cantidad
            if solo_litro and vcc in cuadra: editar.update(cantidad=lc, precio=int(vcc))
            elif solo_litro and vcc: motivos.append(f'producto distinto: en el chat {lc} L pero el valor del chat es ${vcc:,.0f}, en Dropi {ld} L: aclarar con el cliente'.replace(',', '.'))
            else: motivos.append(f'producto distinto: en el chat {lc} L, en Dropi {ld} L')
    if f and f.get('origen') == 'pagina' and round(d['total']) not in PRECIOS: motivos.append(f'pedido de la página con precio raro: {d["total"]:.0f}')
    # Lo que el agente ya frenó al leer el chat no se vuelve a proponer (hasta que una persona lo resuelva)
    _V = '/tmp/dropi/vetos.json'
    if os.path.exists(_V) and str(d['id']) in json.load(open(_V)): motivos.append('revisión del agente: ' + json.load(open(_V))[str(d['id'])])
    # Regla de Ronald: el descuento (10 %) es solo para quien nunca ha comprado. Si ya recibió pedidos nuestros, precio normal.
    DESC = {89100, 152100, 242100, 895500}
    ms = ((d.get('huella') or {}).get('context_analysis') or {}).get('my_shop') or {}
    ya_compro = sum(k.get('delivered', 0) for k in ms.get('by_courier') or []) or ms.get('period_delivered', 0)
    if round(d['total']) in DESC and ya_compro: motivos.append(f'ya nos había comprado ({ya_compro} entregados) y lleva precio con descuento ${d["total"]:,.0f}: decidir el precio'.replace(',', '.'))
    # 3) Precio del chat
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
    # La que más entregas tiene para este cliente, solo entre las que recibe más del 50 % (Ronald 21-11: «la que tiene más entregas»)
    buenas = [(z[0], tasa(z), i) for i, z in hc.items() if z[0] > 0 and tasa(z) > 0.5 and TR.get(i) in UI]
    mejor = max(buenas) if buenas else None
    tc = (f or {}).get('trans_cliente') or ''
    if tc:
        # Ronald 21-11 (no negociable): si el cliente dijo con qué transportadora, va por esa.
        idc = {'ENVIA': 2, 'INTERRAPIDISIMO': 3}.get(tc)
        zc = hc.get(idc, [0, 0]) if idc else [0, 0]
        if not idc: motivos.append(f'el cliente pidió la transportadora {tc}: revisarlo a mano')
        elif oficina and tc != 'INTERRAPIDISIMO': motivos.append('el cliente pidió Envía pero la dirección es de oficina Interrapidísimo: preguntar')
        elif sum(zc) and tasa(zc) <= 0.5: motivos.append(f'el cliente pidió {tc} pero con esa recibe solo {zc[0]} de {sum(zc)}')
        elif idc != d['dc'] and not motivos: editar['transportadora'] = UI[TR[idc]]
    elif oficina:
        if sum(act) and tasa(act) <= 0.5: motivos.append(f'es para oficina de Interrapidísimo y con Interrapidísimo recibe solo {act[0]} de {sum(act)}')
    # Ronald 21-11: si recibe muy bien con las dos (Envía e Interrapidísimo: 2+ entregas y 80 %+ con cada una), va por la más barata.
    elif all(hc.get(i, [0, 0])[0] >= 2 and tasa(hc[i]) >= 0.8 for i in (2, 3)):
        if not motivos: editar['transportadora'] = 'BARATA'
    elif mejor and mejor[2] != d['dc'] and mejor[0] > act[0]:
        if not motivos: editar['transportadora'] = UI[TR[mejor[2]]]
    elif not hc and not motivos:
        # Sin historial de entregas y a domicilio: la más barata entre Envía e Interrapidísimo (Ronald 21-11)
        editar['transportadora'] = 'BARATA'
    elif sum(act) and tasa(act) <= 0.5: motivos.append(f'con {TR.get(d["dc"])} devuelve y no hay otra transportadora con buen historial')
    # 6) Flete
    tope = tope_flete(d)
    if d['flete'] > tope and 'transportadora' not in editar: motivos.append(f'flete ${d["flete"]:,.0f} mayor a ${tope:,.0f}'.replace(',', '.'))
    if motivos: acc.append({'id': d['id'], 'accion': 'REVISAR', 'motivo': '; '.join(motivos), 'nombre': d['name']})
    elif editar: acc.append({'id': d['id'], 'accion': 'EDITAR_Y_CONFIRMAR', 'editar': editar, 'nombre': d['name'], 'dc': UI.get(TR.get(d['dc'], ''), '')})
    else: acc.append({'id': d['id'], 'accion': 'CONFIRMAR', 'nombre': d['name']})
json.dump(acc, open('/tmp/dropi/acciones.json', 'w'), ensure_ascii=False)
from collections import Counter
print('ACCIONES', dict(Counter(a['accion'] for a in acc)))
for a in acc: print(' -', a['accion'], a['id'], a['nombre'], a.get('editar') or a.get('motivo') or '')
