# Arma el plan: qué pedidos de Dropi confirmar y cuáles etiquetar «REVISAR HUMANO» (con motivo).
import json, re
o = json.load(open('/tmp/dropi/pendientes.json')); d = {f['contacto']: f for f in json.load(open('robot/decision.json'))}
conf, tag = [], []
for x in o:
    c = '57' + str(x.get('phone') or '')[-10:]; f = d.get(c)
    if not f: tag.append({'id': x['id'], 'motivo': 'teléfono de Dropi distinto al del chat: revisar'}); continue
    if f['decision'] != 'SALE': tag.append({'id': x['id'], 'motivo': '; '.join(f['motivos'])}); continue
    try: v = float(re.sub(r'[^\d.]', '', f['valor']) or 0)
    except Exception: v = 0
    if v and abs(v - float(x['total_order'])) > 1: tag.append({'id': x['id'], 'motivo': f'precio distinto: Dropi {x["total_order"]} vs chat {v:.0f}'}); continue
    conf.append({'id': x['id'], 'n': x['name']})
ya = set(json.load(open('/tmp/dropi/etiquetados.json'))) if __import__('os').path.exists('/tmp/dropi/etiquetados.json') else set()
tag_nuevos = [t for t in tag if t['id'] not in ya]
json.dump({'confirmar': conf, 'etiquetar': tag_nuevos, 'revisar_total': tag}, open('/tmp/dropi/plan.json', 'w'), ensure_ascii=False)
json.dump(sorted(ya | {t['id'] for t in tag}), open('/tmp/dropi/etiquetados.json', 'w'))
print('PLAN confirmar', len(conf), 'etiquetar_nuevos', len(tag_nuevos), 'revisar_total', len(tag))
