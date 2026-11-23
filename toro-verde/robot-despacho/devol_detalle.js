// Lee historial de estados, movimientos y novedades de cada DEVOLUCION (45 días) para analizar si fue culpa de la transportadora. Solo lee.
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});if(!auth){console.log('SESION_DROPI_CAIDA');process.exit(2)}
const call=u=>p.evaluate(async([u,a])=>{try{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'}});return await r.json()}catch(e){return null}},[u,auth]);
const h=JSON.parse(fs.readFileSync(process.env.ENTRADA||'/tmp/dropi/hoy45.json')).filter(x=>/DEVOLU|DEVUELT/.test(x.status||''));
const out=[];let f=0;
for(const x of h){let o=null;for(let i=0;i<2&&!o;i++){const j=await call('/orders/myorders/'+x.id);o=j&&j.objects&&j.objects.id?j.objects:null;if(!o)await p.waitForTimeout(800)}
 if(!o){f++;continue}
 out.push({id:o.id,status:o.status,name:((o.name||'')+' '+(o.surname||'')).trim(),phone:String(o.phone||'').slice(-10),city:o.city,state:(o.department||o.state||''),dir:o.dir,notes:o.notes,total:o.total_order,flete:o.shipping_amount||x.flete,dc:(o.distribution_company||{}).name||x.dc,guia:o.shipping_guide,shop_order_id:o.shop_order_id,created:o.created_at,
  history:(o.history||[]).map(e=>[e.created_at,e.status,(e.comment||'').slice(0,120)]),
  mov:(o.servientrega_movements||[]).map(m=>[m.fec_mov||m.created_at||'',m.nom_mov||'',m.des_mov&&m.des_mov!==m.nom_mov?m.des_mov:'']),
  nov:o.novedad_servientrega||null,managed:o.managed_devolution_app,solved_op:o.issue_solved_by_operator,keys:out.length?undefined:Object.keys(o)});
 await p.waitForTimeout(120)}
fs.writeFileSync('/tmp/dropi/devol.json',JSON.stringify(out));console.log('DEVOL leidas',out.length,'sin leer',f);await b.close()})();
