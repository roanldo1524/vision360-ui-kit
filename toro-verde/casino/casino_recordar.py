# Empujón de las 8 p. m. (Ronald 23-11: «metele urgencia a las 8 de la noche si se les envió el casino y no han comprado»).
# A quien recibió el casino HOY y no ha hecho pedido después de recibirlo. Imagen + texto con su nombre y su enlace.
import json,os,time,urllib.request,urllib.parse,datetime,re,random,sys
PRUEBA='--prueba' in sys.argv  # no envía nada: solo muestra a cuántos y un ejemplo
os.chdir(os.path.dirname(os.path.abspath(__file__)))
K=open('lucidbot.key').read().strip()
API='https://panel.lucidbot.co/api'
def get(p): return json.loads(urllib.request.urlopen(urllib.request.Request(API+p,headers={'X-ACCESS-TOKEN':K}),timeout=40).read())
def post(p,b): return urllib.request.urlopen(urllib.request.Request(API+p,data=json.dumps(b).encode(),headers={'X-ACCESS-TOKEN':K,'Content-Type':'application/json'},method='POST'),timeout=40).read().decode()
reg=json.load(open('casino/enviados.json'))
bog=datetime.timezone(datetime.timedelta(hours=-5))
ahora=datetime.datetime.now(bog)
medianoche=ahora.replace(hour=0,minute=0,second=0,microsecond=0).astimezone(datetime.timezone.utc).isoformat()
lista=[c for c,f in reg.items() if f>=medianoche]
# Pedidos hechos DESPUÉS de recibir el casino: ese ya compró, no se le escribe.
ped={}
o=0
while o<20000:
  d=get(f'/pipelines/705299/opportunities?limit=100&offset={o}');d=d.get('data',d)
  for r in d:
    c=str(r['contact_id']);f=r.get('created_at') or ''
    if f>ped.get(c,''): ped[c]=f
  if len(d)<100:break
  o+=100
hechos=set(open('casino/recordados.txt').read().split()) if os.path.exists('casino/recordados.txt') else set()
negados=set(json.load(open('casino/negados.json'))) if os.path.exists('casino/negados.json') else set()
lista=[c for c in lista if ped.get(c,'')[:19]<=reg[c][:19] and c not in hechos and c not in negados]
horas=max(1,24-ahora.hour)
IMAGEN='https://cdn.shopify.com/s/files/1/0687/6096/1211/files/casino-wa-777.jpg?v=1795398353'
MSJ=[
"🚨 {n}, *tu premio se pierde a la medianoche*\n\nTe quedan *{h} horas* para reclamar *hasta $26.900 de descuento* + semilla de maíz criollo de regalo 🌽\n\nYa ganaste. Solo responde *GANÉ EN EL CASINO* y te dejo el pedido listo ahora mismo 🚚 Pagas al recibir.\n\n¿No has jugado? Tus 3 tiros siguen ahí 👇\n{u}\n\n_Si no quieres recibir premios, responde NO_",
"⏰ {n}, *últimas {h} horas* de tu premio del Casino Toro Verde\n\nA la medianoche se borra tu descuento de *hasta $26.900* y la semilla de regalo 🌽\n\nResponde *GANÉ EN EL CASINO* y te tomo el pedido ya, pagas cuando te llegue 📦\n\nO juega tus 3 tiros aquí 👇\n{u}\n\n_Si no quieres recibir premios, responde NO_",
]
ok=0;env=0
for c in lista:
  try:
    info=get(f'/contacts/{c}');info=info.get('data',info)
    li=float(info.get('last_interaction') or 0)/1000  # milisegundos
    if time.time()-li<3*3600: continue  # está hablando con el bot: no se interrumpe
    if time.time()-li>23*3600: continue  # ventana de WhatsApp cerrada
    nom=re.sub(r'[^A-Za-zÁÉÍÓÚáéíóúÑñ ]','',info.get('first_name') or '').strip().split(' ')[0].capitalize()
  except Exception: continue
  u='https://toroverde.co/pages/premios?n='+urllib.parse.quote(nom)+'&utm_source=whatsapp&utm_campaign=casino_8pm'
  t=random.choice(MSJ).format(n=nom or '¡Hola!',h=horas,u=u)
  if not nom: t=t.replace('¡Hola!, ','').replace('¡Hola!','')
  env+=1
  if PRUEBA:
    if env==1: print('EJEMPLO:\n'+t)
    continue
  try:
    r=post(f'/contacts/{c}/send_content',{'messages':[{'message':{'attachment':{'type':'image','payload':{'url':IMAGEN}}}},{'message':{'text':t}}]})
    if 'true' in r: ok+=1; open('casino/recordados.txt','a').write(c+'\n')
  except Exception: pass
  time.sleep(0.5)
print('RECORDADOS',ok,'DE',env,'CANDIDATOS',len(lista))
