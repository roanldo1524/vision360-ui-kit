// Confirma (status PENDIENTE) y etiqueta (REVISAR HUMANO) según /tmp/dropi/plan.json. Uso: node confirmar.js [max]
const {chromium}=require('playwright');const fs=require('fs');
const MAX=parseInt(process.argv[2]||'999');const TAG=93484;
(async()=>{const plan=JSON.parse(fs.readFileSync('/tmp/dropi/plan.json'));
const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
const log=[];let errs=0,n=0;
for(const x of plan.confirmar){if(n>=MAX)break;
  const g=await call('GET','/orders/myorders/'+x.id);const st=g.j&&g.j.objects&&g.j.objects.status;
  if(st!=='PENDIENTE CONFIRMACION'){log.push(['SALTO',x.id,st]);continue}
  const r=await call('PUT','/orders/myorders/'+x.id,{status:'PENDIENTE'});
  const v=await call('GET','/orders/myorders/'+x.id);const st2=v.j&&v.j.objects&&v.j.objects.status;
  log.push([r.s===200&&r.j&&r.j.isSuccess?'OK':'FALLO',x.id,st2,r.j&&r.j.message]);n++;
  if(!(r.s===200&&r.j&&r.j.isSuccess)){if(++errs>=3){log.push(['FRENO','3 fallos seguidos']);break}}else errs=0;
  await p.waitForTimeout(1200)}
if(MAX>=999){for(const t of plan.etiquetar){const r=await call('POST','/tags/createorderstags',{order_id:t.id,tag_id:TAG});log.push(['ETIQUETA',t.id,r.s,r.j&&(r.j.isSuccess??r.j.message)]);await p.waitForTimeout(800)}}
fs.writeFileSync('/tmp/dropi/resultado.json',JSON.stringify(log));log.forEach(l=>console.log(l.join(' | ')));await b.close()})();
