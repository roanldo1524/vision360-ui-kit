// Igual que cas_hilo.js pero para MUCHOS casos y en JSON (lo usa cas_auto.py, sin IA). Solo lectura.
// Uso: node cas_hilos.js <casChat> [...]  → /tmp/dropi/cas_hilos.json = {casChat: [{f, tipo, quien, msg}]}
const {chromium}=require('playwright');
(async()=>{const ids=process.argv.slice(2);const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let hdr=null;p.on('request',r=>{if(/api-v2\.dropi\.co\/cas/.test(r.url())&&r.headers()['authorization']&&!hdr)hdr=r.headers()});
const OK=/chats\/search|chats\/counts|caschat\/all|api\/cas\/auth|white-label|get-data-user|filterinteraction/;
await p.route(/./,r=>{const q=r.request();if(q.method()!=='GET'&&!OK.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/cas/tray',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(5000);
const out={};
for(const id of ids){try{const j=await p.evaluate(async([h,id])=>{const r=await fetch('https://api-v2.dropi.co/cas/api/v1/caschat/filterinteraction',{method:'POST',headers:{'content-type':'application/json','authorization':h.authorization},body:JSON.stringify({casChat:id})});return await r.json()},[hdr,id]);
 out[id]=(j.data||[]).map(x=>{const u=x.user||{};const m=(x.objectIntegrationType&&(x.objectIntegrationType.message||(x.objectIntegrationType.formData&&x.objectIntegrationType.formData.description)))||'';return {f:(x.createdAt||'').slice(0,16),tipo:x.interactionType,quien:((u.name||'')+' '+(u.surname||'')).trim(),msg:String(m).replace(/\s+/g,' ').slice(0,1200)}});}catch(e){out[id]={error:String(e).slice(0,80)}}
 await p.waitForTimeout(200)}
require('fs').writeFileSync('/tmp/dropi/cas_hilos.json',JSON.stringify(out));console.log('HILOS',Object.keys(out).length);await b.close()})();
