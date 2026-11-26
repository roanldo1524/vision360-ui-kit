# Ronald 25-11: «que el sistema consuma muy poca IA, confirme bien sin errores, valide direcciones, y si se acaba el límite siga funcionando».
# Cerebro de REGLAS (sin IA) que lee el chat completo de cada pedido que el robot quiere confirmar y lo clasifica:
#   SEGURO → se confirma de una (el cliente aceptó el último resumen HOY/AYER, y ciudad, valor, casa/oficina y números de la dirección
#            del resumen cuadran con Dropi, y después no pidió cambios ni habló de otras formas de pago).
#   DUDA   → queda para que la IA (Claude) lo lea como Karen. Si en 120 min nadie lo revisa (IA sin cupo), pasa a REVISAR HUMANO.
# Uso dentro de robot.sh:  python3 -I robot/revision_auto.py partir   (antes de confirmar.js)
#                          python3 -I robot/revision_auto.py resto    (después: deja en plan.json solo las dudas, para fichas.py)
#           prueba:        python3 -I robot/revision_auto.py probar <id> ...  (solo dice qué haría, no toca nada)
import json, os, re, sys, time, datetime, unicodedata, urllib.request
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
K = open('lucidbot.key').read().strip()
P, DUD, DESDE = '/tmp/dropi/plan.json', '/tmp/dropi/plan_dudas.json', '/tmp/dropi/dudas_desde.json'
ESPERA_IA = 120 * 60   # si la IA no revisa una duda en 2 horas, va a Karen

def n(s): return re.sub(r'[^A-Z0-9 ]', ' ', unicodedata.normalize('NFKD', (s or '').upper()).encode('ascii', 'ignore').decode())
def compacto(s): return re.sub(r'\s+', '', n(s))
def chat(c):
    r = urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/messages?limit=40', headers={'X-ACCESS-TOKEN': K})
    t = json.loads(urllib.request.urlopen(r, timeout=40).read()); t = t.get('data', t)
    t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
    out = []
    for m in re.finditer(r'(?:^|\n)(Yo|Usuario) \((\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}[ap]m)\): (.*?)(?=\n(?:Yo|Usuario) \(\d{4}-|\Z)', t, re.S):
        try: f = datetime.datetime.strptime(m.group(2), '%Y-%m-%d %I:%M%p')
        except Exception: f = None
        out.append((m.group(1), f, m.group(3).strip()))
    return out

SI = re.compile(r'^\W*((es|est[aá]|todo|ok|si|s[ií],?)\s+(muy\s+)?correct|ah,?\s+listo|(muchas\s+)?gracias\W*$|s[ií]+|sip|sii|si se[ñn]or|correct|corect|perfect|confirm|listo|ok|okey|de acuerdo|dale|claro|as[ií] es|exacto|todo (est[aá] )?(bien|correcto)|est[aá]n? bien|bien|👍)', re.I)
RIESGO = re.compile(r'cambi|corrij|correg|otra direc|otra ciudad|mejor (a|en|para|lo)|no lo quiero|ya no|cancel|anul|ma[ñn]ana (te|le) (pago|confirmo)|pago (ma[ñn]ana|despu|luego)|nequi|netflix|daviplata|transfer|consign|addi|cuota|tarjeta|devolu|esper(e|a) (un|que)|despu[eé]s (le|te) (digo|confirmo)|no (estoy|voy a estar)|viaj', re.I)
HOY_MIN = 48  # horas: la aceptación tiene que ser reciente (nada de «CONFIRMAR PEDIDO» de un pedido viejo)

def revisar(d):
    """devuelve (SEGURO|DUDA, motivo)"""
    c = d.get('chat') or '57' + (d.get('phone') or '')
    try: msgs = chat(c)
    except Exception as e: return 'DUDA', f'no pude leer el chat ({str(e)[:40]})'
    if not msgs: return 'DUDA', 'chat vacío'
    ahora = datetime.datetime.utcnow() - datetime.timedelta(hours=5)
    # último resumen enviado por el bot, o «CONFIRMAR PEDIDO» del cliente (flujo de la página)
    ir = max([i for i, (q, f, t) in enumerate(msgs) if q == 'Yo' and 'Resumen de tu pedido' in t] or [-1])
    ic = max([i for i, (q, f, t) in enumerate(msgs) if q == 'Usuario' and re.fullmatch(r'\W*CONFIRMAR PEDIDO\W*', t, re.I)] or [-1])
    if ir < 0 and ic < 0: return 'DUDA', 'no hay resumen aceptado ni «CONFIRMAR PEDIDO» en el chat'
    despues = [m for m in msgs[max(ir, ic) + 1:] if m[0] == 'Usuario']
    if ic > ir:   # flujo de la página: el botón CONFIRMAR PEDIDO es la aceptación
        f = msgs[ic][1]
        if not f or (ahora - f).total_seconds() > HOY_MIN * 3600: return 'DUDA', '«CONFIRMAR PEDIDO» viejo'
        if any(RIESGO.search(t) for _, _, t in despues): return 'DUDA', 'después de confirmar escribió algo que cambia el pedido o el pago'
        return 'SEGURO', 'tocó «CONFIRMAR PEDIDO» y no pidió cambios'
    res = msgs[ir][2]
    if not despues: return 'DUDA', 'el cliente no respondió al resumen'
    acepta = next(((f, t) for _, f, t in despues if SI.search(t)), None)
    if not acepta: return 'DUDA', f'no aceptó el resumen claramente («{despues[0][2][:40]}»)'
    if not acepta[0] or (ahora - acepta[0]).total_seconds() > HOY_MIN * 3600: return 'DUDA', 'la aceptación del resumen es vieja'
    if any(RIESGO.search(t) for _, _, t in despues): return 'DUDA', 'después del resumen pidió cambios u otra forma de pago'
    # --- validaciones del resumen contra Dropi ---
    campo = lambda k: (re.search(r'\*' + k + r':\*\s*\S*\s*(.*)', res) or [None, ''])[1].strip()
    ciudad, direc, total = campo('Ciudad'), campo('Direcci[oó]n'), campo('Total pedido')
    if ciudad:
        cr, cd = compacto(re.sub(r'\(.*', '', ciudad)), compacto(re.sub(r'\(.*', '', (d.get('city') or '').replace('_', ' ')))
        if '(' in ciudad or not (cr == cd or cr in cd or cd in cr): return 'DUDA', f'ciudad del resumen «{ciudad}» ≠ Dropi «{d.get("city")}»'
    vt = re.sub(r'\D', '', total)
    if vt and int(vt) != round(d.get('total') or 0): return 'DUDA', f'valor del resumen {vt} ≠ Dropi {d.get("total")}'
    of_res = bool(re.search(r'oficina|reclam', direc, re.I)); of_dro = bool(re.search(r'oficina|reclam', d.get('dir') or '', re.I))
    if direc and of_res != of_dro: return 'DUDA', 'casa/oficina distinto entre el resumen y Dropi'
    if direc and not of_res:
        nr = set(re.findall(r'\d+', direc)); nd = set(re.findall(r'\d+', d.get('dir') or ''))
        if not nr: return 'DUDA', 'el resumen no trae números de dirección'
        if not nr <= nd: return 'DUDA', f'números de la dirección del resumen ({" ".join(sorted(nr))}) no están en Dropi'
    if not ciudad or not direc: return 'DUDA', 'resumen incompleto en el chat'
    # Ronald 25-11: producto y cantidad tal cual el último resumen («1 x … 2 Litros» = 2 litros, no 1 litro a $169.000)
    pr = {}
    for q, desc in re.findall(r'(\d+)\s*x\s*([^\n]+)', res.split('Total pedido')[0]):
        u = n(desc); m2 = re.search(r'(\d+)\s*LITROS', u)
        k = 'GALON' if 'GALON' in u else 'POMA' if 'POMA' in u else 'LITRO' if 'LITRO' in u else None
        if not k: continue
        pr[k] = pr.get(k, 0) + int(q) * (int(m2.group(1)) if (m2 and k == 'LITRO') else 1)
    pd = {}
    for it in d.get('items') or []: k = n(it.get('pres')); pd[k] = pd.get(k, 0) + int(float(it.get('q') or 0))
    if pr and pd and pr != pd: return 'DUDA', f'producto/cantidad del resumen {pr} ≠ Dropi {pd}'
    # Ronald 25-11: muchos clientes dan otro número en el chat; el del resumen aceptado es el que va en Dropi
    tc = re.sub(r'\D', '', campo('Contacto'))[-10:]
    if len(tc) == 10 and tc.startswith('3') and tc != re.sub(r'\D', '', d.get('phone') or '')[-10:]: d['_tel'] = tc
    return 'SEGURO', f'aceptó el resumen («{acepta[1][:25]}») y todo cuadra'

if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'partir'
    det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
    if modo == 'probar':
        for i in sys.argv[2:]: print(i, *revisar(det.get(int(i)) or {}))
        sys.exit()
    plan = json.load(open(P))
    if modo == 'partir':
        desde = json.load(open(DESDE)) if os.path.exists(DESDE) else {}
        seguros, dudas = [], []
        for x in plan.get('confirmar', []):
            v, m = revisar(det.get(x['id']) or {})
            print('AUTO', v, x['id'], x.get('n', ''), '·', m)
            if v == 'SEGURO': seguros.append(x); continue
            t0 = desde.setdefault(str(x['id']), time.time())
            if time.time() - t0 > ESPERA_IA: plan.setdefault('etiquetar', []).append({'id': x['id'], 'motivo': f'sin revisión de la IA en 2 h: {m}'})
            else: dudas.append(dict(x, motivo_duda=m))
        # Ronald 25-11: oficina = «dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO». Si Dropi solo dice «reclama en oficina», se pone el punto antes de confirmar.
        import subprocess; sys.path.insert(0, os.path.join(os.getcwd(), 'robot')); import oficinas as _ofi
        tels = [f"{x['id']}\t{det[x['id']]['_tel']}" for x in seguros if (det.get(x['id']) or {}).get('_tel')]
        if tels:
            open('/tmp/dropi/tel_auto.tsv', 'w').write('\n'.join(tels) + '\n')
            out = subprocess.run(['node', 'tel_lote.js', 'tel_auto.tsv'], cwd='/tmp/dropi', capture_output=True, text=True, timeout=300).stdout
            print('AUTO_TEL', out.strip().replace('\n', ' | '))
            malos = {int(t.split('\t')[0]) for t in tels if f"TEL_OK {t.split(chr(9))[0]}" not in out and f"YA {t.split(chr(9))[0]}" not in out}
            for x in [s_ for s_ in seguros if s_['id'] in malos]:
                seguros.remove(x); dudas.append(dict(x, motivo_duda='el teléfono del resumen es otro y no pude cambiarlo'))
        arreglos = []
        for x in list(seguros):
            d = det.get(x['id']) or {}; dirx = re.sub(r'\s+', ' ', d.get('dir') or '').strip(' ,')
            if not re.search(r'oficina|reclam', dirx, re.I): continue
            nueva = _ofi.dir_oficina(d.get('state'), d.get('city'), dirx)
            if not nueva:
                seguros.remove(x); dudas.append(dict(x, motivo_duda='oficina sin dirección del punto y no la encuentro')); continue
            if nueva.upper() != dirx.upper(): arreglos.append(f"{x['id']}\t{nueva}")
        if arreglos:
            open('/tmp/dropi/dir_auto.tsv', 'w').write('\n'.join(arreglos) + '\n')
            out = subprocess.run(['node', 'dir_lote.js', 'dir_auto.tsv'], cwd='/tmp/dropi', capture_output=True, text=True, timeout=300).stdout
            print('AUTO_DIR_OFICINA', out.strip().replace('\n', ' | '))
            malos = {int(l.split()[1]) for l in out.splitlines() if l.startswith(('FALLO', 'SALTO'))}
            malos |= {int(a.split('\t')[0]) for a in arreglos if f"OK {a.split(chr(9))[0]}" not in out}
            for x in [s for s in seguros if s['id'] in malos]:
                seguros.remove(x); dudas.append(dict(x, motivo_duda='no pude poner la dirección del punto de oficina'))
        json.dump(desde, open(DESDE, 'w'))
        json.dump(dudas, open(DUD, 'w'), ensure_ascii=False)
        plan['confirmar'] = seguros; json.dump(plan, open(P, 'w'), ensure_ascii=False)
        print('AUTO_SEGUROS', len(seguros), 'DUDAS_PARA_IA', len(dudas))
    elif modo == 'resto':
        dudas = json.load(open(DUD)) if os.path.exists(DUD) else []
        plan['confirmar'] = [{'id': x['id'], 'n': x.get('n', '')} for x in dudas]; plan['etiquetar'] = []
        json.dump(plan, open(P, 'w'), ensure_ascii=False)
