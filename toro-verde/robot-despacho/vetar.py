# Saca un pedido de «confirmar» y lo manda a REVISAR HUMANO con el motivo. Uso: python3 -I robot/vetar.py <id> "<motivo>"
import json, sys
P = '/tmp/dropi/plan.json'; plan = json.load(open(P)); i = int(sys.argv[1]); m = sys.argv[2]
plan['confirmar'] = [x for x in plan['confirmar'] if x['id'] != i]
plan['etiquetar'] = [x for x in plan['etiquetar'] if x['id'] != i] + [{'id': i, 'motivo': 'revisión del agente: ' + m}]
json.dump(plan, open(P, 'w'), ensure_ascii=False); open('/tmp/dropi/vetados.txt', 'a').write(f'{i}\t{m}\n')
V='/tmp/dropi/vetos.json'; v=json.load(open(V)) if __import__('os').path.exists(V) else {}; v[str(i)]=m; json.dump(v, open(V,'w'), ensure_ascii=False)  # se recuerda en las próximas vueltas
print('VETADO', i, m)
