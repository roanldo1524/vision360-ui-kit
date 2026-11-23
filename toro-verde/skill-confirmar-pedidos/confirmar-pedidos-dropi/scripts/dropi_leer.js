// Llama la API de Dropi desde la sesión abierta del navegador (solo lectura en este script).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const get=async(path)=>p.evaluate(async([u,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json'}});return {s:r.status,j:await r.json().catch(()=>null)}},[path,auth]);
const q='exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=100&start=0&textToSearch=&status=PENDIENTE%20CONFIRMACION&supplier_id=false&user_id=__DROPI_USER_ID__&from=2026-11-14&until=2026-11-22&tag_id=&warranty=false&seller=null&filter_date_by=FECHA%20DE%20CREADO&invoiced=null';
const r=await get('/orders/myorders/v2?'+q);const o=(r.j&&r.j.objects)||[];
console.log('STATUS',r.s,'PENDIENTES',o.length);
if(o[0]){const x=o[0];console.log(Object.keys(x).join(','));console.log(JSON.stringify({id:x.id,status:x.status,city:x.city,state:x.state,total:x.total_order,dc:x.distribution_company,rate:x.rate_type,created:x.created_at,shop:x.shop&&x.shop.type,notes:x.notes}).slice(0,500))}
const by={};o.forEach(x=>{const k=(x.distribution_company&&x.distribution_company.name)||'?';by[k]=(by[k]||0)+1});console.log('TRANSP',JSON.stringify(by));
const t=await get('/tags/showtag');console.log('TAGS',t.s,JSON.stringify(t.j).slice(0,500));
require('fs').writeFileSync('/tmp/dropi/pendientes.json',JSON.stringify(o));await b.close()})();
