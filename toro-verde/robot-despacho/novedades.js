// Lista las novedades sin solucionar de Dropi (página Novedades) con su detalle y aclaración de la transportadora → /tmp/dropi/novedades.json
// Solo lee. Uso: node novedades.js
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',viewport:{width:1600,height:1100},userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/novelties',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(4000);
if(!auth){console.log('SESION_DROPI_CAIDA');process.exit(2)}
const call=u=>p.evaluate(async([u,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'}});return await r.json()},[u,auth]);
const filas=await p.evaluate(()=>[...document.querySelectorAll('table tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>td.innerText.trim())).filter(r=>r.length>=3&&/^\d+$/.test(r[0])));
const out=[];
for(const f of filas){const id=+f[0];const datos=f[2]||'';const o=((await call('/orders/myorders/'+id))||{}).objects||{};
  const mv=o.servientrega_movements||[];
  out.push({id,fecha:f[1],novedad:(datos.match(/Novedad:\s*([^\n]+)/)||[])[1]||'',transportadora:(datos.match(/Transportadora:\s*([^\n]+)/)||[])[1]||((o.distribution_company||{}).name||''),
    guia:o.shipping_guide||'',status:o.status,name:((o.name||'')+' '+(o.surname||'')).trim(),phone:String(o.phone||'').slice(-10),dir:o.dir,city:o.city,state:o.state,total:+o.total_order,
    shop_order_id:o.shop_order_id,notes:o.notes||'',movs:mv.slice(-6).map(m=>m.serv_date+' '+m.nom_mov+(m.des_mov?' / '+m.des_mov:''))})}
// Aclaración de la transportadora (sale en el detalle de «Solucionar»): se lee abriendo el botón; clickbtnsolve solo registra el clic.
const bts=await p.$$('text=Solucionar');
for(let i=0;i<bts.length&&i<out.length;i++){try{await bts[i].click();await p.waitForTimeout(2500);
  const t=await p.evaluate(()=>{const ms=[...document.querySelectorAll('ngb-modal-window, .modal.show, [role=dialog]')];return (ms[ms.length-1]||document.body).innerText});
  const id=+((t.match(/Orden #(\d+)/)||[])[1]||0);const x=out.find(o=>o.id===id);
  if(x){x.aclaracion=((t.split('verificar los datos de entrega')[1]||'').split('Si ya validó')[0]||'').replace(/\s+/g,' ').trim()}
  await p.locator('button:has-text("Cerrar")').last().click().catch(()=>{});await p.waitForTimeout(800)}catch(e){}}
fs.writeFileSync('/tmp/dropi/novedades.json',JSON.stringify(out,null,1));console.log('NOVEDADES',out.length);await b.close()})();
