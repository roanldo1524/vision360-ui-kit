// Confirma (status PENDIENTE) y etiqueta (REVISAR HUMANO) según /tmp/dropi/plan.json. Uso: node confirmar.js [max]
const {chromium}=require('playwright');const fs=require('fs');
const MAX=parseInt(process.argv[2]||'999');const TAG=93484;
(async()=>{const plan=JSON.parse(fs.readFileSync('/tmp/dropi/plan.json'));
const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
const log=[];let errs=0,n=0;
const huella=(tel)=>p.evaluate(async(tel)=>{const t=(localStorage.getItem('DROPI_token')||'').replace(/"/g,'');const x=await fetch('https://api-v2.dropi.co/bff/customers/fingerprint/v2?country_code=CO&user_id=1024715&phone='+tel,{headers:{'X-Authorization':'Bearer '+t,'X-Host':'co'}});try{return (await x.json()).data}catch(e){return null}},tel);
const hoy=new Date(),hace=new Date(Date.now()-30*864e5),f=d=>d.toISOString().slice(0,10);
const FINAL=/CANCELADO|ENTREGADO|DEVOLUCION|DEVUELTO|ANULAD|RECHAZ|INDEMNIZ/i;
for(const x of plan.confirmar){if(n>=MAX)break;
  const g=await call('GET','/orders/myorders/'+x.id);const o=g.j&&g.j.objects||{};const st=o.status;
  if(st!=='PENDIENTE CONFIRMACION'){log.push(['SALTO',x.id,st]);continue}
  const tel=String(o.phone||'').slice(-10),dir=(o.dir||'').toLowerCase(),dc=((o.distribution_company||{}).name||'').toUpperCase();
  const motivos=[];
  // 1) Oficina = siempre Interrapidísimo
  if(/oficina|reclama|interrap/.test(dir)&&dc!=='INTERRAPIDISIMO')motivos.push('es para oficina y la transportadora no es Interrapidísimo');
  // 2) Historial del cliente (cuida la efectividad)
  const h=await huella(tel);const gp=(h&&h.global_profile)||{};const lt=gp.lifetime_totals||{};const dev=lt.returned||0,ent=lt.delivered||0;
  if(/riesgosa|cr[ií]tica/i.test(gp.risk_label||'')||(dev>=2&&dev>=ent))motivos.push(`cliente devuelve (${ent} entregados, ${dev} devueltos): pedir abono o llamar`);
  // 2b) Transportadora con la que el cliente SÍ recibe (historial por transportadora, todas las tiendas)
  const TR=JSON.parse(fs.readFileSync('/tmp/dropi/transportadoras.json'));const ca=(h&&h.context_analysis)||{};const hc={};
  for(const sec of [ca.my_shop||{},ca.other_shops||{}])for(const k of (sec.by_courier||[])){const z=hc[k.courier_id]||(hc[k.courier_id]={d:0,r:0});z.d+=k.delivered||0;z.r+=k.returned||0}
  const cur=(o.distribution_company||{}).id;const act=hc[cur]||{d:0,r:0};
  let mejor=null;for(const id in hc){const z=hc[id];if(+id===cur)continue;if(z.d>0&&z.r===0&&(!mejor||z.d>hc[mejor].d))mejor=id}
  const oficina=/oficina|reclama|interrap/.test(dir);
  if(act.r>0&&act.r>=act.d){ if(mejor&&!oficina)motivos.push(`con ${TR[cur]||cur} devuelve (${act.d} entregas, ${act.r} devoluciones) pero con ${TR[mejor]} recibe (${hc[mejor].d} entregas): cambiar a ${TR[mejor]}`); else motivos.push(`con ${TR[cur]||cur} devuelve (${act.d} entregas, ${act.r} devoluciones)`)}
  else if(!oficina&&mejor&&act.d===0&&hc[mejor].d>=3)log.push(['SUGERENCIA',x.id,`nunca ha recibido con ${TR[cur]||cur}; con ${TR[mejor]} recibe siempre (${hc[mejor].d} entregas)`]);
  // 3) Otro pedido abierto del mismo teléfono en Dropi
  const q=`/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=20&start=0&textToSearch=${tel}&status=null&supplier_id=false&user_id=1024715&from=${f(hace)}&until=${f(hoy)}&filter_date_by=FECHA%20DE%20CREADO`;
  const otros=((await call('GET',q)).j||{}).objects||[];
  const abiertos=otros.filter(y=>y.id!==x.id&&!FINAL.test(y.status||''));
  if(abiertos.length)motivos.push('ya tiene otro pedido abierto en Dropi: '+abiertos.map(y=>y.id+' ('+y.status+')').join(', '));
  if(motivos.length){const r=await call('POST','/tags/createorderstags',{order_id:x.id,tag_id:TAG});log.push(['REVISAR',x.id,motivos.join('; '),r.s]);plan.etiquetar_extra=(plan.etiquetar_extra||[]).concat([{id:x.id,motivo:motivos.join('; ')}]);continue}
  const r=await call('PUT','/orders/myorders/'+x.id,{status:'PENDIENTE'});
  const v=await call('GET','/orders/myorders/'+x.id);const st2=v.j&&v.j.objects&&v.j.objects.status;
  log.push([r.s===200&&r.j&&r.j.isSuccess?'OK':'FALLO',x.id,st2,r.j&&r.j.message]);n++;
  if(!(r.s===200&&r.j&&r.j.isSuccess)){if(++errs>=3){log.push(['FRENO','3 fallos seguidos']);break}}else errs=0;
  await p.waitForTimeout(1200)}
if(MAX>=999){for(const t of plan.etiquetar){const r=await call('POST','/tags/createorderstags',{order_id:t.id,tag_id:TAG});log.push(['ETIQUETA',t.id,r.s,r.j&&(r.j.isSuccess??r.j.message)]);await p.waitForTimeout(800)}}
fs.writeFileSync('/tmp/dropi/resultado.json',JSON.stringify(log));fs.writeFileSync('/tmp/dropi/plan.json',JSON.stringify(plan));log.forEach(l=>console.log(l.join(' | ')));await b.close()})();
