// Corrige direcciones (solo pedidos sin guía: PENDIENTE o PENDIENTE CONFIRMACION). Uso: node dir_lote.js archivo.tsv
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n').filter(Boolean)){const [id,dir]=l.split('\t');
  const g=await call('GET','/orders/myorders/'+id);const o=(g.j&&g.j.objects)||{};
  if(!['PENDIENTE','PENDIENTE CONFIRMACION'].includes(o.status)||o.shipping_guide){console.log('SALTO',id,o.status,o.shipping_guide||'');continue}
  const r=await call('PUT','/orders/myorders/'+id,{dir});const v=await call('GET','/orders/myorders/'+id);console.log(r.j&&r.j.isSuccess?'OK':'FALLO',id,'→',v.j.objects.dir);await p.waitForTimeout(400)}
await b.close()})();
