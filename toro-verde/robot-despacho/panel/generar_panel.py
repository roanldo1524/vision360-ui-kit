# Genera el panel del robot desde /tmp/dropi/hoy.json. Uso: python3 -I generar.py salida.html
import json,sys,html,os,datetime
h=json.load(open('/tmp/dropi/hoy.json'))
mot={}
try:
  p=json.load(open('/tmp/dropi/plan.json')); mot={x['id']:x['motivo'] for x in p['revisar_total']+p.get('etiquetar',[])}
except Exception: pass
if os.path.exists('/tmp/dropi/motivos.json'): mot.update({int(k):v for k,v in json.load(open('/tmp/dropi/motivos.json')).items()})
if os.path.exists('/tmp/dropi/vetos.json'): mot.update({int(k):'revisión del agente: '+v for k,v in json.load(open('/tmp/dropi/vetos.json')).items()})
tag=lambda x,n: any(t.get('tag_name')==n for t in x['tags'])
ca=[x for x in h if tag(x,'CONFIRMADO AGENTE') and x['status']=='PENDIENTE']
rh=[x for x in h if tag(x,'REVISAR HUMANO') and x['status']=='PENDIENTE CONFIRMACION']
sin=[x for x in h if x['status']=='PENDIENTE CONFIRMACION' and not x['tags']]
e=html.escape
def tel(t): return f"<button class='cp' type='button' data-t='{t}' aria-label='Copiar celular'>{t[:3]} {t[3:6]} {t[6:]}</button>" if len(t)==10 else e(t)
def money(v): return '$'+f"{v:,.0f}".replace(',','.')
MES=['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
def fecha(c):
  try:
    d=datetime.datetime.fromisoformat(str(c)[:19]); hh=d.strftime('%I:%M').lstrip('0'); return f"{d.day} {MES[d.month]}<span class='sub'>{hh} {'a. m.' if d.hour<12 else 'p. m.'}</span>"
  except Exception: return ''
# Ronald 25-11: «que al entrar a Dropi ya sepa qué hacer con cada uno, ni siquiera pensar». Receta concreta según el motivo.
RECETAS=[
 (r'revisi[oó]n del agente', None),
 (r'm[aá]s de 4|por encima de 4 L', 'Más de 4 litros solo si recibe 70 % o más. Si no cumple, ofrécele hasta 4 litros (un galón) y corrige el pedido; nunca lo canceles.'),
 (r'sin revisi[oó]n de la IA', 'Lee el chat: si aceptó el último resumen y ciudad, dirección y valor cuadran con Dropi, confirma.'),
 (r'pago anticipado', 'Mira en Bancolombia que llegó la plata con el nombre del cliente. Si llegó, confirma; si no, escríbele.'),
 (r'flete', 'Cotiza Envía e Interrapidísimo en Dropi. Si ninguna queda bajo el tope (1 L 25 mil, 2 L 29 mil, galón 35 mil), llama y ofrécele reclamar en oficina.'),
 (r'recibe solo|Riesgosa|cr[ií]tica', 'Devuelve mucho: si devuelve más del 50 %, pídele anticipo por WhatsApp; si no, llámalo y confirma solo si se compromete a recibir.'),
 (r'no veo la confirmaci|no ha tocado|pedido viejo|confirmaci[oó]n de hoy', 'Escríbele o llámalo: «¿confirmamos tu pedido hoy?». Si dice sí, confirma.'),
 (r'producto distinto|precio distinto', 'Corrige en Dropi producto, cantidad y valor tal cual el último resumen que aceptó en el chat.'),
 (r'habla de reclamarlo|casa/oficina|oficina y', 'Pregúntale si es a domicilio o a oficina. Si es oficina: «dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO».'),
 (r'sin n[uú]mero|incompleta|direcci[oó]n rara', 'Pídele dirección con número de puerta y barrio, o que lo reclame en la oficina de Interrapidísimo. Corrige en Dropi y confirma.'),
 (r'repetido|otro pedido abierto', 'Tiene dos pedidos: deja solo el que aceptó de último en el chat.'),
 (r'nombre raro', 'Mira el nombre en el chat y corrígelo en Dropi.'),
 (r'transportadora|ENVIA|SERVIENTREGA', 'Revisa con qué transportadora recibe mejor y edítala en Dropi; si pidió una que no usamos, ofrécele Interrapidísimo.'),
 (r'CARRITORECUPERADO|ya le puso etiquetas', 'Carrito recuperado por el equipo: lee el chat y confirma si ya aceptó.'),
 (r'modo humano', 'Alguien del equipo atiende este chat: termina la conversación y confirma.'),
 (r'descuento', 'Ya nos compró: precio normal, sin descuento. Corrige el valor y avísale.'),
]
import re as _re
def receta(why):
  out=[]
  for pat,txt in RECETAS:
    if _re.search(pat,why or '',_re.I):
      if txt is None: return 'Haz lo que dice la nota del agente.'
      if txt not in out: out.append(txt)
  return ' '.join(out[:2]) or 'Lee el chat y decide; si aceptó y todo cuadra, confirma.'
def fila(x,d):
  why=mot.get(x['id'],'') if d=='stop' else ''
  pill={'stop':"<span class='pill stop'>Revisar humano</span>",'ok':"<span class='pill ok'>Confirmado</span>",'warn':"<span class='pill warn'>Próxima vuelta</span>"}[d]
  w=(f"<span class='why'>{e(why[:220])}</span><span class='why' style='color:var(--ok,#1e9e3a);font-weight:600'>Qué hacer: {e(receta(why))}</span>" if d=='stop' else f"<span class='why'>{e(why[:220])}</span>") if why else ("<span class='why'>Motivo en la etiqueta de Dropi y en el chat</span>" if d=='stop' else '')
  return f"<tr data-d='{d}'><td class='num'>{fecha(x.get('created'))}</td><td class='num'>{x['id']}</td><td>{e(x['name'].title())}</td><td>{tel(x['phone'])}</td><td>{e((x['city'] or '').title())}<span class='sub'>{e((x['state'] or '').title())}</span></td><td class='num'>{money(x['total'])}</td><td class='num'>{money(x['flete'])}<span class='sub'>{e((x['dc'] or '').title())}</span></td><td>{pill}{w}</td></tr>"
rows=''.join(fila(x,'stop') for x in sorted(rh,key=lambda x:-x['id']))+''.join(fila(x,'ok') for x in sorted(ca,key=lambda x:-x['id']))+''.join(fila(x,'warn') for x in sorted(sin,key=lambda x:-x['id']))
valor=sum(x['total'] for x in ca)
ahora=(datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)-datetime.timedelta(hours=5))
hora=ahora.strftime('%d nov, %I:%M %p').lstrip('0').replace('AM','a. m.').replace('PM','p. m.')
css=open('/tmp/dropi/css.txt').read()
page=f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Robot de despacho</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>{css}</style></head><body><div class="wrap">
<header><span class="estado"><i></i>Actualizado {hora}</span>
<h1 style="margin-top:12px">Robot de despacho · Toro Verde</h1>
<p class="lead">Primero, los pedidos que necesitan a una persona, con el motivo. Luego, los que el robot ya confirmó y esperan guía. El robot nunca cancela.</p></header>
<section aria-label="Resultado"><h2>En este momento</h2><div class="cifras">
<div class="cifra stop"><div class="v">{len(rh)}</div><div class="l">Esperan a una persona («REVISAR HUMANO»)</div></div>
<div class="cifra ok"><div class="v">{len(ca)}</div><div class="l">Confirmados esperando guía</div></div>
<div class="cifra"><div class="v">{money(valor)}</div><div class="l">Valor de los confirmados</div></div>
<div class="cifra warn"><div class="v">{len(sin)}</div><div class="l">Nuevos, se revisan en la próxima vuelta</div></div>
</div></section>
<section aria-label="Pedidos"><h2>Pedido por pedido</h2>
<div class="filtros" role="group" aria-label="Filtrar">
<button aria-pressed="true" data-f="stop">Necesitan persona ({len(rh)})</button>
<button aria-pressed="false" data-f="ok">Confirmados ({len(ca)})</button>
<button aria-pressed="false" data-f="warn">Nuevos ({len(sin)})</button>
<button aria-pressed="false" data-f="todos">Todos ({len(rh)+len(ca)+len(sin)})</button></div>
<div class="tabla"><table><thead><tr><th>Fecha</th><th>Pedido Dropi</th><th>Cliente</th><th>Celular</th><th>Ciudad</th><th>Valor</th><th>Envío</th><th>Estado</th></tr></thead><tbody>{rows}</tbody></table></div>
<p class="nota">Toca el celular para copiarlo y búscalo en Lucid. «Confirmados» = etiqueta CONFIRMADO AGENTE y todavía sin guía.</p></section>
<section aria-label="Reglas"><h2>Reglas antes de confirmar</h2><div class="reglas">
<div class="regla"><strong>Recibe más del 50 %</strong><p>Historial del cliente en Dropi, todas las tiendas.</p></div>
<div class="regla"><strong>Dijo que sí en el chat</strong><p>Botón «CONFIRMAR PEDIDO» o «sí» después del resumen. Sin Addi, cuotas ni anticipos sin validar.</p></div>
<div class="regla"><strong>Tope de envío</strong><p>1 litro $25.000 · 2 litros $29.000 · galón $35.000 · lo demás $30.000.</p></div>
<div class="regla"><strong>Producto, precio y dirección del chat</strong><p>Si Dropi tiene otro precio o transportadora, lo corrige. Oficina = Interrapidísimo.</p></div>
<div class="regla"><strong>Nunca cancela</strong><p>Lo dudoso queda con «REVISAR HUMANO». Lo confirmado lleva «CONFIRMADO AGENTE».</p></div>
</div></section></div>
<script>
const bs=[...document.querySelectorAll('.filtros button')],trs=[...document.querySelectorAll('tbody tr')];
const ver=f=>trs.forEach(t=>t.hidden=!(f==='todos'||t.dataset.d===f));
bs.forEach(b=>b.addEventListener('click',()=>{{bs.forEach(x=>x.setAttribute('aria-pressed',x===b));ver(b.dataset.f)}}));ver('stop');
document.querySelectorAll('.cp').forEach(b=>b.addEventListener('click',()=>{{const t=b.dataset.t,o=b.textContent;try{{navigator.clipboard.writeText(t).then(()=>{{b.classList.add('ok');b.textContent='Copiado';setTimeout(()=>{{b.classList.remove('ok');b.textContent=o}},1200)}})}}catch(e){{}}}}));
</script></body></html>"""
open(sys.argv[1],'w').write(page);print('PANEL',len(rh),len(ca),len(sin),hora)
