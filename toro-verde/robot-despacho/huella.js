// Consulta la huella (historial de entregas/devoluciones) de varios teléfonos. Uso: node huella.js tel1 tel2 ...
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const out={};
for(const tel of process.argv.slice(2)){
  const r=await p.evaluate(async(tel)=>{const t=(localStorage.getItem('DROPI_token')||'').replace(/"/g,'');const u='https://api-v2.dropi.co/bff/customers/fingerprint/v2?country_code=CO&user_id=1024715&phone='+tel;const x=await fetch(u,{headers:{'X-Authorization':'Bearer '+t,'X-Host':'co'}});let j=null;try{j=await x.json()}catch(e){};return {s:x.status,j}},tel);
  out[tel]=r;await p.waitForTimeout(400)}
require('fs').writeFileSync('/tmp/dropi/huellas.json',JSON.stringify(out));
for(const k in out)console.log(k,out[k].s,JSON.stringify(out[k].j).slice(0,700));await b.close()})();
