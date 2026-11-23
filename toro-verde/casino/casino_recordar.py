# Último empujón: a quien recibió el casino hoy y no ha comprado: «tu premio vence a medianoche».
import json,os,time,urllib.request,datetime,re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
K=open('lucidbot.key').read().strip()
def get(p): return json.loads(urllib.request.urlopen(urllib.request.Request('https://panel.lucidbot.co/api'+p,headers={'X-ACCESS-TOKEN':K}),timeout=40).read())
reg=json.load(open('casino/enviados.json'))
hoy=datetime.datetime.now(datetime.timezone.utc)-datetime.timedelta(hours=10)
lista=[c for c,f in reg.items() if f>=hoy.isoformat()]
comp=set();o=0
while o<20000:
  d=get(f'/pipelines/705299/opportunities?limit=100&offset={o}');d=d.get('data',d)
  comp|={str(r['contact_id']) for r in d}
  if len(d)<100:break
  o+=100
hechos=set(open('casino/recordados.txt').read().split()) if os.path.exists('casino/recordados.txt') else set()
lista=[c for c in lista if c not in comp and c not in hechos]
txt="⏰ ¡Últimas horas! Tu premio del casino Toro Verde vence hoy a la medianoche.\n\nSi ya jugaste, solo responde *QUIERO MI PREMIO* y te tomo el pedido ya mismo 🚚 (pagas al recibir).\n\nSi no has jugado, aún tienes 3 tiros gratis para ganar hasta $26.900 de descuento 🎰👇\nhttps://toroverde.co/pages/premios"
ok=0
for c in lista:
  # Si escribió en las últimas 3 h está hablando con el bot (comprando): no se le interrumpe.
  try:
    info=get(f'/contacts/{c}');info=info.get('data',info)
    li=float(info.get('last_interaction') or 0)/1000  # milisegundos, no fecha ISO
    if time.time()-li<3*3600: continue
  except Exception: continue
  try:
    r=urllib.request.urlopen(urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/{c}/send_content',data=json.dumps({'messages':[{'message':{'text':txt}}]}).encode(),headers={'X-ACCESS-TOKEN':K,'Content-Type':'application/json'},method='POST'),timeout=40).read().decode()
    if 'true' in r: ok+=1; open('casino/recordados.txt','a').write(c+'\n')
  except Exception: pass
  time.sleep(0.5)
print('RECORDADOS',ok,'DE',len(lista))
