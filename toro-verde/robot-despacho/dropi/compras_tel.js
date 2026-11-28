// Ronald 26-11: antes de atender una garantía se COMPRUEBA en Dropi que la persona sí nos compró (pedido ENTREGADO).
// Busca todos los pedidos de cada celular en el último año (todas las tiendas de la cuenta). Uso: node compras_tel.js tel1 tel2 ...
// Escribe /tmp/dropi/compras_tel.json = {tel: [{id,status,total,producto,fecha,nombre}]}
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=(u)=>p.evaluate(async([u,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json'}});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[u,auth]);
const f=x=>x.toISOString().slice(0,10),out={};
for(const tel of process.argv.slice(2)){
  let objs=[],err=null;
  for(let k=0;k<5;k++){ // Dropi deja máximo 90 días por búsqueda → 5 tramos de 89 días (~15 meses)
    const hasta=new Date(Date.now()-k*89*864e5),desde=new Date(Date.now()-(k+1)*89*864e5);
    const q=`/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=50&start=0&textToSearch=${tel}&status=null&supplier_id=false&user_id=1024715&from=${f(desde)}&until=${f(hasta)}&filter_date_by=FECHA%20DE%20CREADO`;
    const r=await call(q); if(r.s!==200){err=r.s;break} objs=objs.concat(r.j.objects||[]); await p.waitForTimeout(250)}
  if(err){out[tel]={error:err};console.log('ERROR',tel,err);continue}
  const vistos=new Set();
  out[tel]=objs.filter(o=>!vistos.has(o.id)&&vistos.add(o.id)&&String(o.phone||'').replace(/\D/g,'').slice(-10)===tel.slice(-10)).map(o=>({id:o.id,status:o.status,total:o.total_order,fecha:(o.created_at||'').slice(0,10),nombre:((o.name||'')+' '+(o.surname||'')).trim(),producto:((o.orderdetails||[]).map(d=>((d.product||{}).name||'')+(d.quantity?' x'+d.quantity:'')).join(' + ')).slice(0,90)}));
  console.log('COMPRAS',tel,JSON.stringify(out[tel]).slice(0,400));await p.waitForTimeout(300)}
require('fs').writeFileSync('/tmp/dropi/compras_tel.json',JSON.stringify(out));await b.close()})();
