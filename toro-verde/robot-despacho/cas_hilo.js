// Lee las conversaciones completas del CAS (solo lectura). Uso: node cas_hilo.js <casChatId> [...] → imprime cada mensaje con quién lo escribió
const {chromium}=require('playwright');
(async()=>{const ids=process.argv.slice(2);const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let hdr=null;p.on('request',r=>{if(/api-v2\.dropi\.co\/cas/.test(r.url())&&r.headers()['authorization']&&!hdr)hdr=r.headers()});
const OK=/chats\/search|chats\/counts|caschat\/all|api\/cas\/auth|white-label|get-data-user|filterinteraction/;
await p.route(/./,r=>{const q=r.request();if(q.method()!=='GET'&&!OK.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/cas/tray',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(5000);
for(const id of ids){const j=await p.evaluate(async([h,id])=>{const r=await fetch('https://api-v2.dropi.co/cas/api/v1/caschat/filterinteraction',{method:'POST',headers:{'content-type':'application/json','authorization':h.authorization},body:JSON.stringify({casChat:id})});return await r.json()},[hdr,id]);
 console.log('===== CASO',id);for(const x of (j.data||[])){const u=x.user||{};const m=(x.objectIntegrationType&&(x.objectIntegrationType.message||(x.objectIntegrationType.formData&&x.objectIntegrationType.formData.description)))||'';console.log(' ',(x.createdAt||'').slice(5,16),'|',x.interactionType,'|',((u.name||'')+' '+(u.surname||'')).trim().slice(0,25),'|',String(m).replace(/\s+/g,' ').slice(0,400))}}
await b.close()})();
