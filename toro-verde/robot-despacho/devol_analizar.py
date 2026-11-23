# Ronald 23-11: «montar también devoluciones injustificadas, analizarlas y que se nos exonere el costo del envío».
# Analiza como Karen cada DEVOLUCIÓN (devol.json de devol_detalle.js + chats de devol_chats.py) y solo marca las que tienen PRUEBA clara
# de falla de la transportadora (criterio estricto: no se reclama lo dudoso):
#  A) la devolvieron sin ningún intento de entrega, novedad, reparto ni aviso de oficina;
#  B) la novedad quedó SOLUCIONADA y la devolvieron sin un nuevo intento;
#  C) el cliente escribió entre el despacho y la devolución que no le llegó / nadie vino / no lo llamaron / fue a reclamar y no estaba,
#     y nunca dijo que no lo quería. No cuenta si habla de otra dirección/lugar, ni si estaba para reclamar en oficina (salvo «fui a reclamar»).
# Reglas de Dropi (chat de soporte → «Reportar devoluciones injustificadas»): causal 1 = no atendieron la solución de la novedad;
# causal 2 = nunca hubo novedad y la devolvieron; desde el 2º intento de ofrecimiento NO es injustificada;
# plazo: 30 días después de la devolución (Interrapidísimo: 7 días). La transportadora responde en 15-30 días hábiles.
# Uso: python3 -I robot/devol_analizar.py → /tmp/dropi/devol_reclamos.json
import json, re, os, datetime
REG = '/tmp/dropi/devol_reg.json'; reg = json.load(open(REG)) if os.path.exists(REG) else {}
d = json.load(open('/tmp/dropi/devol.json')); ch = json.load(open('/tmp/dropi/devol_chats.json')) if os.path.exists('/tmp/dropi/devol_chats.json') else {}
FUERTE = re.compile(r'nunca (lleg|vin|me llam)|no (me )?(ha|han) llegado|no lleg[oó]|nadie (vino|lleg|me llam)|no me llamaron|no vinieron|no han venido|estuve esperando|lo estoy esperando|sigo esperando|fui a (reclamar|buscar)|no ha llegado nada|c[aá]maras', re.I)
EN_DC = re.compile(r'EN BODEGA|DESPACHADA|EN PROCESAMIENTO|EN REPARTO|TRANSITO|ADMITIDA|ENTREGADO A TRANSPORTADORA|EN ESPERA DE RUTA|EN REEXPEDICION')
def t(s):
    try: return datetime.datetime.fromisoformat(s.replace('Z', '+00:00')).timestamp()
    except Exception: return None
def tchat(l):
    m = re.match(r'Usuario \((\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{2})(am|pm)\)', l)
    if not m: return None
    y, mo, da, h, mi, ap = m.groups(); h = int(h) % 12 + (12 if ap == 'pm' else 0)
    return datetime.datetime(int(y), int(mo), int(da), h, int(mi), tzinfo=datetime.timezone(datetime.timedelta(hours=-5))).timestamp()
out = []
for x in d:
    if str(x['id']) in reg: continue
    hs = [(t(h[0]), h[1]) for h in x['history']]
    i = next((k for k, (_, s) in enumerate(hs) if 'DEVOLU' in s), None)
    if i is None: continue
    antes = [s for _, s in hs[:i]]; t_dev = hs[i][0]
    t_desp = next((tt for tt, s in hs if EN_DC.search(s)), None)
    motivo = None
    intentos = sum(1 for s in antes if s in ('INTENTO DE ENTREGA', 'NOVEDAD'))
    if intentos >= 2 and 'NOVEDAD SOLUCIONADA' not in antes: continue   # desde el 2º intento no aplica
    plazo = 7 if 'INTER' in (x['dc'] or '').upper() else 30
    if t_dev and (datetime.datetime.now().timestamp() - t_dev) > plazo * 86400: continue   # fuera de plazo
    if not any(s in ('INTENTO DE ENTREGA', 'EN REPARTO', 'RECLAME EN OFICINA', 'TELEMERCADEO') or 'NOVEDAD' in s for s in antes):
        motivo = 'La devolvieron sin ningún intento de entrega ni novedad reportada'
    elif 'NOVEDAD SOLUCIONADA' in antes:
        j = max(k for k, s in enumerate(antes) if s == 'NOVEDAD SOLUCIONADA')
        if not any(s in ('INTENTO DE ENTREGA', 'EN REPARTO') or s == 'NOVEDAD' for s in antes[j + 1:]):
            motivo = 'La novedad fue solucionada y la devolvieron sin un nuevo intento de entrega'
    c = ch.get(str(x['id'])) or {}
    if not motivo and not c.get('no_quiere'):
        dudosa = re.compile(r'direcci[oó]n|lugar|otra parte|oficina', re.I)
        en_oficina = 'RECLAME EN OFICINA' in antes
        prueba = [l for l in c.get('culpa_dc', []) if FUERTE.search(l) and not dudosa.search(l) and (not en_oficina or re.search(r'fui a (reclamar|buscar)', l, re.I)) and t_desp and t_dev and (tchat(l) or 0) >= t_desp - 3600 and (tchat(l) or 9e12) <= t_dev + 2 * 86400]
        if prueba: motivo = 'El cliente reportó que el pedido no le llegó: «' + re.sub(r'^Usuario \([^)]*\):\s*', '', prueba[-1])[:110].strip() + '»'
    if not motivo: continue
    if c.get('no_quiere') and motivo.startswith('El cliente'): continue
    out.append({'id': x['id'], 'plazo_dias': plazo, 'intentos': intentos, 'guia': x['guia'], 'dc': x['dc'], 'ciudad': x['city'], 'flete': x.get('flete'), 'total': x['total'], 'motivo': motivo,
                'devuelta': datetime.datetime.fromtimestamp(t_dev, datetime.timezone(datetime.timedelta(hours=-5))).strftime('%d/%m/%Y') if t_dev else ''})
json.dump(out, open('/tmp/dropi/devol_reclamos.json', 'w'), ensure_ascii=False, indent=1)
print('DEVOL_INJUSTIFICADAS', len(out))
for r in out: print(' ·', r['id'], r['dc'], r['ciudad'], r['devuelta'], '|', r['motivo'][:130])
