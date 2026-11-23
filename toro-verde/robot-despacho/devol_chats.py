# Lee el chat de Lucid de cada devolución (el contacto que compró, por shop_order_id) y busca señales de que la culpa fue de la transportadora.
import json, re, urllib.request, os, concurrent.futures as cf
os.chdir('/tmp/robot'); K = open('lucidbot.key').read().strip(); API = 'https://panel.lucidbot.co/api'
def get(p):
    try: return json.loads(urllib.request.urlopen(urllib.request.Request(API + p, headers={'X-ACCESS-TOKEN': K}), timeout=40).read())
    except Exception: return None
CULPA_DC = re.compile(r'nadie (vino|lleg|me llam)|no (ha|han) (llegado|venido|pasado)|no me (ha|han) (llegado|llamado|entregado)|no lleg[oó]|sigo esperando|estoy esperando|todav[ií]a no (llega|me llega)|a[uú]n no (llega|me llega)|cu[aá]ndo (llega|me llega)|no me llamaron|no vinieron|estuve (en casa|todo el d[ií]a)|nunca (lleg|vin|me llam)|no ha pasado|d[oó]nde est[aá] mi pedido|mi pedido', re.I)
NO_QUIERE = re.compile(r'cancel|no lo (quiero|necesito)|ya no|no (lo )?voy a recibir|devu[eé]lv|no tengo (plata|dinero)|me arrepent', re.I)
def una(x):
    so = x.get('shop_order_id')
    c = get(f'/contacts/find_by_custom_field?field_id=18848&value={so}') if so else None
    cid = None
    if isinstance(c, dict):
        dd = c.get('data', c); dd = dd[0] if isinstance(dd, list) and dd else dd
        cid = (dd or {}).get('id') if isinstance(dd, dict) else None
    if not cid: cid = '57' + x['phone']
    m = get(f'/contacts/{cid}/messages?limit=60'); t = m.get('data', m) if isinstance(m, dict) else m
    t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    usr = [l for l in re.split(r'\n(?=(?:Yo|Usuario) \()', t or '') if l.startswith('Usuario')]
    culpa = [l[:160].replace('\n', ' ') for l in usr if CULPA_DC.search(l)]
    noq = [l[:160].replace('\n', ' ') for l in usr if NO_QUIERE.search(l)]
    return x['id'], {'chat': cid, 'n_usr': len(usr), 'culpa_dc': culpa[-4:], 'no_quiere': noq[-3:]}
d = json.load(open('/tmp/dropi/devol.json'))
with cf.ThreadPoolExecutor(6) as ex: r = dict(ex.map(una, d))
json.dump(r, open('/tmp/dropi/devol_chats.json', 'w'), ensure_ascii=False)
print('chats', sum(1 for v in r.values() if v['n_usr']), 'con señal culpa transportadora', sum(1 for v in r.values() if v['culpa_dc'] and not v['no_quiere']), 'cliente no quería', sum(1 for v in r.values() if v['no_quiere']))
