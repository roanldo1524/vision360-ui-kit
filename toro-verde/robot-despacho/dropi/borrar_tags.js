const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let t=await r.text();return {s:r.status,t:t.slice(0,160)}},[m,u,body,auth]);
const l=JSON.parse((await call('GET','/tags/showtag')).t.length>150?'{}':'{}');
const all=await p.evaluate(async a=>{const r=await fetch('https://api.dropi.co/api/tags/showtag',{headers:{'x-authorization':a}});return (await r.json()).objects||[]},auth);
const H=all.filter(t=>/^HACER:/i.test(t.tag_name));console.log('HACER',H.map(t=>t.id+' '+t.tag_name).join(' / '));
for(const t of H){const r=await call('DELETE','/tags/deletetag',{id:t.id});console.log('BORRADA',t.id,t.tag_name,r.s,r.t.slice(0,60))}
await b.close()})();
