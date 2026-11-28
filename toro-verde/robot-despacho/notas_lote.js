// Ronald 27-11: escribe en las NOTAS de Dropi el porqué y qué hacer de cada pedido frenado (REVISAR HUMANO). Solo pedidos sin despachar (PENDIENTE CONFIRMACION, sin guía). Reemplaza la nota anterior del robot y respeta las notas de las personas. Uso: node notas_lote.js archivo.json  ([{id, nota}])
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
for(const f of JSON.parse(fs.readFileSync(process.argv[2],'utf8'))){const id=f.id;
  const o=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
  if(o.status!=='PENDIENTE CONFIRMACION'||o.shipping_guide){console.log('SALTO',id,o.status);continue}
  const propias=String(o.notes||'').split(' | ').filter(x=>x&&!x.startsWith('🤖 ROBOT'));
  const notas=[f.nota,...propias].join(' | ').slice(0,1000);
  const r=await call('PUT','/orders/myorders/'+id,{notes:notas});
  console.log(r.s===200?'NOTA_OK':'NOTA_ERROR',id,r.s);
}
await b.close()})();
