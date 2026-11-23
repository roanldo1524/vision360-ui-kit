// Paso 1: lee cada pedido pendiente de confirmar con su detalle y la huella (historial) del cliente.
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(u)=>p.evaluate(async([u,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a}});try{return await r.json()}catch(e){return null}},[u,auth]);
const huella=(tel)=>p.evaluate(async(tel)=>{const t=(localStorage.getItem('DROPI_token')||'').replace(/"/g,'');const x=await fetch('https://api-v2.dropi.co/bff/customers/fingerprint/v2?country_code=CO&user_id=__DROPI_USER_ID__&phone='+tel,{headers:{'X-Authorization':'Bearer '+t,'X-Host':'co'}});try{return (await x.json()).data}catch(e){return null}},tel);
const f=d=>d.toISOString().slice(0,10);
const lista=await call(`/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=300&start=0&textToSearch=&status=PENDIENTE%20CONFIRMACION&supplier_id=false&user_id=__DROPI_USER_ID__&from=${f(new Date(Date.now()-10*864e5))}&until=${f(new Date())}&filter_date_by=FECHA%20DE%20CREADO`);
if(!lista||!lista.isSuccess){console.log('SESION_DROPI_CAIDA');process.exit(2)}
const out=[];
for(const x of lista.objects||[]){const d=(await call('/orders/myorders/'+x.id))||{};const o=d.objects||x;const tel=String(o.phone||'').slice(-10);
  const h=await huella(tel);
  const otros=((await call(`/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=20&start=0&textToSearch=${tel}&status=null&supplier_id=false&user_id=__DROPI_USER_ID__&from=${f(new Date(Date.now()-30*864e5))}&until=${f(new Date())}&filter_date_by=FECHA%20DE%20CREADO`))||{}).objects||[];
  out.push({id:o.id,shop_order_id:o.shop_order_id,status:o.status,phone:tel,name:o.name,surname:o.surname,dir:o.dir,city:o.city,state:o.state,total:+o.total_order,flete:+(o.shipping_amount||0),dc:(o.distribution_company||{}).id,rate:o.rate_type,tags:(o.tags||[]).map(t=>t.tag_name||t.name),
    items:(o.orderdetails||[]).map(d=>({q:+d.quantity,pres:(((d.variation||{}).attribute_values||[])[0]||{}).value||'',precio:+d.price})),
    huella:h,otros:otros.filter(y=>y.id!==o.id).map(y=>({id:y.id,status:y.status,total:y.total_order,created:y.created_at}))});
  await p.waitForTimeout(250)}
fs.writeFileSync('/tmp/dropi/detalle.json',JSON.stringify(out));console.log('DETALLE',out.length);await b.close()})();
