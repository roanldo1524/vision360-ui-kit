// Lista etiquetas o crea una. Uso: node tags.js listar | node tags.js crear "NOMBRE" "#color"
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});return r.json()},[m,u,body,auth]);
const [acc,nombre,color]=process.argv.slice(2);
if(acc==='crear'){const r=await call('POST','/tags/addtag',{tag_name:nombre,color:color||'#2a9d8f'});console.log('CREAR',JSON.stringify(r).slice(0,300))}
const l=await call('GET','/tags/showtag');(l.objects||[]).forEach(t=>console.log('TAG',t.id,t.tag_name,t.color));await b.close()})();
