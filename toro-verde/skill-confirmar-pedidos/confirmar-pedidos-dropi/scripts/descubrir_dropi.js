// Muestra el número de usuario de Dropi y las etiquetas que existen (para llenar config.json). Uso: node descubrir_dropi.js
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
let uid=null;try{uid=JSON.parse(Buffer.from(auth.split(' ').pop().split('.')[1],'base64').toString()).sub}catch(e){}
console.log('DROPI_USER_ID',uid);
const l=await p.evaluate(async a=>{const r=await fetch('https://api.dropi.co/api/tags/showtag',{headers:{'x-authorization':a}});return r.json()},auth);
(l.objects||[]).forEach(t=>console.log('ETIQUETA',t.id,t.tag_name));await b.close()})();
