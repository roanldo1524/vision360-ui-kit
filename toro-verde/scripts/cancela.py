import json,sys,re
# lee el chat de Lucid (stdin) y dice si el cliente pidió cancelar después de su último mensaje de compra
d=json.load(sys.stdin).get('data','')
msgs=re.findall(r'^(Usuario|Yo) \((\d{4}-\d\d-\d\d [^)]*)\): (.*?)(?=^\w+ \(\d{4}-|\Z)',d,re.S|re.M)
user=[(t,m.strip()) for w,t,m in msgs if w=='Usuario']
pat=re.compile(r'(?<![a-záéíóúñ])(?:ya no (lo |la |los )?(quiero|necesito|me interesa|voy a)|no (lo |la )?quiero|cancel[aeé]n? (el|mi) pedido|cancelar (el|mi) pedido|anul|desist|mejor no|no (me )?(lo |la )?(env[ií]e|mande|despache)|no (lo |la )?necesito|no puedo recib|no voy a (recib|pag)|olv[ií]dalo|no estoy interesad)',re.I)
import datetime as dt
lim=(dt.datetime.utcnow()-dt.timedelta(days=3)).strftime('%Y-%m-%d')
hits=[(t,m) for t,m in user if t[:10]>=lim and pat.search(m)]
if hits: print('CANCELA', ' | '.join(f'{t}: {m[:90]}' for t,m in hits[-2:]).replace('\n',' '))
else: print('SIGUE', (user[-1][1][:80].replace('\n',' ') if user else ''))
