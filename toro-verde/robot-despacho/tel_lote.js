// Cambia el teléfono de pedidos PENDIENTE CONFIRMACION (sin guía) y deja el número original en las notas. Uso: node tel_lote.js archivo.tsv  (id<TAB>telefono_nuevo)  TODOS=1 también cambia pedidos ya confirmados (PENDIENTE) sin guía.
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
for(const l of fs.readFileSync(process.argv[2],'utf8').split('\n').filter(Boolean)){const [id,tel]=l.split('\t');
  const o=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
  if(!(o.status==='PENDIENTE CONFIRMACION'||(process.env.TODOS&&o.status==='PENDIENTE'))||o.shipping_guide){console.log('SALTO',id,o.status);continue}
  const viejo=String(o.phone||'');if(viejo.slice(-10)===tel){console.log('YA',id);continue}
  const notas=((o.notes||'')+' | Teléfono registrado en el pedido: '+viejo).replace(/^ \| /,'');
  const r=await call('PUT','/orders/myorders/'+id,{phone:tel,notes:notas});
  const v=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
  console.log(r.s===200&&String(v.phone).slice(-10)===tel?'TEL_OK':'TEL_FALLO',id,viejo,'->',tel,r.s);await p.waitForTimeout(800)}
await b.close()})();
