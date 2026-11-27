// Ronald 27-11 (tarde): «quita el mensaje que colocas en las notas de los pedidos». Borra de las NOTAS de Dropi solo la parte del robot
// («🤖 ROBOT …») y deja intactas las notas de las personas. No toca nada más del pedido. Uso: node quitar_notas_robot.js ids.json ([id,...])
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
for(const id of JSON.parse(fs.readFileSync(process.argv[2],'utf8'))){try{
  const o=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
  const n=String(o.notes||''); if(!n.includes('🤖 ROBOT')){console.log('SIN_NOTA',id);continue}
  const propias=n.split(' | ').filter(x=>x&&!x.startsWith('🤖 ROBOT')).join(' | ');
  const r=await call('PUT','/orders/myorders/'+id,{notes:propias||'-'});  // Dropi ignora la nota vacía: queda un guion
  console.log(r.s===200?'QUITADA':'ERROR',id,r.s,o.status);
}catch(e){console.log('FALLO',id,String(e.message).slice(0,60));await p.waitForTimeout(3000)}}
await b.close()})();
