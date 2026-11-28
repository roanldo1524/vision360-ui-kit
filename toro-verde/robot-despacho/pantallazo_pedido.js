// Ronald 25-11: pantallazo del pedido en Dropi (estado, guía, transportadora) para adjuntarlo como evidencia en el CAS.
// Uso: node pantallazo_pedido.js <id_pedido> → /tmp/dropi/evidencias/pedido_<id>.png (solo mira, no cambia nada)
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const id=process.argv[2];const b=await chromium.launch();
const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1600,height:1000},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
await p.route(/./,r=>r.request().method()==='GET'?r.continue():r.abort());
await p.route(/myorders\/v2\?/,r=>{const u=r.request().url();const d=new Date(Date.now()-90*864e5).toISOString().slice(0,10);return r.continue({url:u.replace(/from=[0-9-]+/,'from='+d)})});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.fill('input[placeholder*="uscar"]',id);await p.keyboard.press('Enter');await p.waitForTimeout(6000);
fs.mkdirSync('/tmp/dropi/evidencias',{recursive:true});const f='/tmp/dropi/evidencias/pedido_'+id+'.png';await p.screenshot({path:f});console.log('PANTALLAZO',f);await b.close()})();
