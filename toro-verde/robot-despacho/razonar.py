# Paso 2: decide pedido por pedido como lo haría una persona. Reglas NO NEGOCIABLES de Ronald (21-11):
#  1) Solo se confirma si el cliente recibe MÁS del 50 % (historial Dropi, todas las tiendas). Sin historial = se confirma.
#  2) Transportadora: la que mejor recibe ese cliente (oficina = siempre Interrapidísimo).
#  3) Precio: el que se negoció en el chat (si Dropi tiene otro, se edita al del chat).
#  4) Chat: intención de compra confirmada, sin arrepentimiento, sin pago por adelantado sin validar.
#  5) Producto, presentación y cantidad: los que pidió el cliente.
#  6) Flete mayor a $27.000: no se confirma, revisión humana.
import json, re
TR = {int(k): v for k, v in json.load(open('/tmp/dropi/transportadoras.json')).items()}
UI = {'INTERRAPIDISIMO': 'Interrapidisimo', 'ENVIA': 'Envia', 'COORDINADORA': 'Coordinadora', 'SERVIENTREGA': 'Servientrega', 'TCC': 'Tcc', 'DOMINA': 'Domina', 'VELOCES': 'Veloces'}
PRECIOS = {99000, 169000, 269000, 89100, 152100, 242100, 995000, 895500}
LITROS = {'LITRO': 1, 'GALON': 4, 'POMA': 20, '2 LITROS': 2}
FLETE_MAX = 27000
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
    f = luc.get('57' + d['phone'])
    oficina = bool(re.search(r'oficina|reclama|interrap', (d['dir'] or '').lower()))
    # 7) Dirección y nombre: si algo se ve raro, no se confirma (Ronald 21-11)
    dirx = re.sub(r'\s+', ' ', (d['dir'] or '')).strip(' ,').lower()
    es_oficina_std = bool(re.search(r'(reclama|recoge|retira)\w* en (la )?oficina|^oficina (de )?interrap|oficina interrap', dirx))
    tiene_via = bool(re.search(r'\b(calle|cl|cll|carrera|cra|cr|kr|kra|carera|avenida|av|diagonal|dg|diag|transversal|tv|trans|manzana|mz|mza|vereda|vda|finca|corregimiento|barrio|km|kil[oó]metro|sector|lote|casa)\b', dirx)) and bool(re.search(r'\d', dirx) or re.search(r'vereda|finca|corregimiento|sector', dirx))
    if re.search(r'servientrega|coordinadora|\benv[ií]a\b|\btcc\b|deprisa|\b472\b|domina|veloces', dirx): motivos.append(f'la dirección nombra otra transportadora (solo enviamos a oficinas de Interrapidísimo): «{(d["dir"] or "").strip()[:70]}»')
    if oficina and not es_oficina_std: motivos.append(f'dirección rara para oficina: «{d["dir"].strip()[:70]}»')
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
        lc = litros_chat(f.get('producto', '')); ld = sum(i['q'] * next((v for k, v in LITROS.items() if k in (i['pres'] or '').upper()), 0) for i in d['items'])
        if lc and ld and lc != ld: motivos.append(f'producto distinto: en el chat {lc} L, en Dropi {ld} L')
    if f and f.get('origen') == 'pagina' and round(d['total']) not in PRECIOS: motivos.append(f'pedido de la página con precio raro: {d["total"]:.0f}')
    # 3) Precio del chat
    if f and not motivos:
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
    if oficina:
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
    if d['flete'] > FLETE_MAX and 'transportadora' not in editar: motivos.append(f'flete ${d["flete"]:,.0f} mayor a $27.000'.replace(',', '.'))
    if motivos: acc.append({'id': d['id'], 'accion': 'REVISAR', 'motivo': '; '.join(motivos), 'nombre': d['name']})
    elif editar: acc.append({'id': d['id'], 'accion': 'EDITAR_Y_CONFIRMAR', 'editar': editar, 'nombre': d['name'], 'dc': UI.get(TR.get(d['dc'], ''), '')})
    else: acc.append({'id': d['id'], 'accion': 'CONFIRMAR', 'nombre': d['name']})
json.dump(acc, open('/tmp/dropi/acciones.json', 'w'), ensure_ascii=False)
from collections import Counter
print('ACCIONES', dict(Counter(a['accion'] for a in acc)))
for a in acc: print(' -', a['accion'], a['id'], a['nombre'], a.get('editar') or a.get('motivo') or '')
