# Pedidos con número diferente: si el teléfono del pedido en Dropi no tiene chat en Lucid, busca la conversación por el NOMBRE
# Primero por el número de pedido de Lucid Sales (shop_order_id de Dropi = campo «Id_lucidsales» del contacto, config lucid.campo_id_lucidsales que compró; exacto).
# Si no, por el nombre (resumen de los pedidos en los embudos de Lucid de los últimos 10 días) y, si hay UNA sola coincidencia clara (nombre + ciudad), pone en Dropi el
# número desde el que compró y deja el original en las notas. Si no aparece (compras desde computador u otro medio), deja el número original.
# Uso: python3 -I robot/telefonos.py   (corre después de detalle.js)
import json, os, re, subprocess, unicodedata, datetime, urllib.request, urllib.error, time
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
EMBUDOS = [str(e) for e in ['__EMBUDO_LUCID__'] + __EMBUDOS_EXTRA__ if str(e) not in ('', '0')]  # embudos de pedidos de Lucid (WhatsApp, página…)
def get(p):
    for i in range(4):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
            return d.get('data', d) if isinstance(d, dict) else d
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(60); continue
            raise
def norm(s): return [w for w in re.findall(r'[a-zñ]+', unicodedata.normalize('NFKD', (s or '').lower()).encode('ascii', 'ignore').decode()) if len(w) > 2]
def tiene_chat(c):
    try: r = get(f'/contacts/{c}'); return isinstance(r, dict) and 'error' not in r and bool(r.get('id'))
    except Exception: return False
det = json.load(open('/tmp/dropi/detalle.json'))
cambios = []
def por_pedido(d):
    if str('__CAMPO_ID_LUCIDSALES__') in ('', '0'): return None  # sin el campo Id_lucidsales configurado, solo se busca por nombre
    sid = str(d.get('shop_order_id') or '').strip()
    if not sid.isdigit(): return None
    try: r = get(f'/contacts/find_by_custom_field?field_id=__CAMPO_ID_LUCIDSALES__&value={sid}')
    except Exception: return None
    ids = {str(x.get('id')) for x in (r if isinstance(r, list) else []) if x.get('id')}
    return ids.pop() if len(ids) == 1 else None
sin = []
for d in det:
    c = por_pedido(d)  # el WhatsApp desde el que se hizo ESTE pedido (exacto)
    if c: d['chat'] = c  # el robot lee la conversación de ESTE contacto
    if c and not re.fullmatch(r'573\d{9}', c): print('TEL_OTRO_CANAL', d['id'], d['name'], d['phone'], 'compró por Messenger/Instagram', c, '(se deja el teléfono del pedido)'); continue
    if c and c[2:] != d['phone']: cambios.append((d['id'], c[2:])); print('TEL_POR_PEDIDO', d['id'], d['name'], d['phone'], '->', c[2:]); continue
    if not c and not tiene_chat('57' + d['phone']): sin.append(d)
desde = (datetime.datetime.utcnow() - datetime.timedelta(days=10)).strftime('%Y-%m-%d')
cands = []
for e in (EMBUDOS if sin else []):
    o = 0
    while o < 5000:
        lote = get(f'/pipelines/{e}/opportunities?limit=100&offset={o}') or []
        for r in lote:
            if r.get('created_at', '') < desde: continue
            t = r.get('title') or ''
            nom = re.search(r'Nombre:\*?\s*(?:👤)?\s*([^\n*]+)', t); ciu = re.search(r'Ciudad:\*?\s*(?:🏙️)?\s*([^\n*]+)', t)
            if nom: cands.append({'c': str(r['contact_id']), 'nom': norm(nom.group(1)), 'ciu': norm(ciu.group(1) if ciu else '')})
        if len(lote) < 100: break
        o += 100
for d in sin:
    n = set(norm((d.get('name') or '') + ' ' + (d.get('surname') or ''))); city = set(norm(d.get('city')))
    if len(n) < 2: continue
    hits = {x['c'] for x in cands if len(n & set(x['nom'])) >= 2 and (not x['ciu'] or not city or city & set(x['ciu']))}
    hits = {h for h in hits if re.fullmatch(r'573\d{9}', h) and h[2:] != d['phone'] and tiene_chat(h)}
    if len(hits) == 1:
        nuevo = hits.pop()[2:]; cambios.append((d['id'], nuevo)); print('TEL_ENCONTRADO', d['id'], d['name'], d['phone'], '->', nuevo)
    else: print('TEL_SIN_CHAT', d['id'], d['name'], d['phone'], 'coincidencias', len(hits))
json.dump(det, open('/tmp/dropi/detalle.json', 'w'), ensure_ascii=False) if not os.environ.get('SECO') else None
if cambios and not os.environ.get('SECO'):  # SECO=1 solo muestra, no cambia
    open('/tmp/dropi/tel.tsv', 'w').write(''.join(f'{i}\t{t}\n' for i, t in cambios))
    out = subprocess.run(['node', 'tel_lote.js', '/tmp/dropi/tel.tsv'], cwd='/tmp/dropi', capture_output=True, text=True).stdout
    print(out.strip())
    ok = {int(l.split()[1]): l.split()[4] for l in out.splitlines() if l.startswith('TEL_OK')}
    for d in det:
        if d['id'] in ok: d['phone'] = ok[d['id']]
    json.dump(det, open('/tmp/dropi/detalle.json', 'w'), ensure_ascii=False)
print('TELEFONOS revisados', len(det), 'sin chat ni pedido', len(sin), 'corregidos', len(cambios))
