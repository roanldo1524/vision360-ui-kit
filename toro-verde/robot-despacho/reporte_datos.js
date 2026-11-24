// Datos del reporte del día (Ronald 24-11: solo 2 WhatsApp al día). Lee de Dropi los pedidos con cambios en la ventana [DESDE, HASTA]
// y cuenta en su «Historial de estados»: confirmados por el robot (usuario 1024715) y por personas, novedades solucionadas y novedades abiertas. Solo lee.
// Uso: DESDE=2026-11-24T05:00:00Z HASTA=... node reporte_datos.js → /tmp/dropi/reporte_datos.json
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});if(!auth){console.log('SESION_DROPI_CAIDA');process.exit(2)}
const call=u=>p.evaluate(async([u,a])=>{try{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,accept:'application/json'}});return await r.json()}catch(e){return null}},[u,auth]);
const D=Date.parse(process.env.DESDE),H=Date.parse(process.env.HASTA||new Date().toISOString());const ROBOT=1024715,REV=93484;
let all=[];for(let s=0;s<8000;s+=200){const q=`/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=200&start=${s}&textToSearch=&status=null&supplier_id=false&user_id=${ROBOT}&from=${new Date(Date.now()-40*864e5).toISOString().slice(0,10)}&until=${new Date(Date.now()+864e5).toISOString().slice(0,10)}&filter_date_by=FECHA%20DE%20CREADO`;const j=await call(q);const o=(j&&j.objects)||[];all=all.concat(o);if(o.length<200)break}
const pend=all.filter(o=>o.status==='PENDIENTE CONFIRMACION');const enRev=pend.filter(o=>(o.tags||[]).some(t=>(t.id||t.public_tags_id||t.key_base_data)==REV||/REVISAR HUMANO/.test(t.tag_name||t.name||'')));
const dd=n=>new Date(Date.now()-n*864e5).toISOString().slice(0,10);
let inc=[];for(let s=0;s<3000;s+=200){const j=await call(`/orders/myorders/v2?orderBy=id&orderDirection=desc&result_number=200&start=${s}&textToSearch=&status=null&supplier_id=null&user_id=null&from_date_last_incidence=${new Date(D-7*864e5).toISOString().slice(0,10)}&until_date_last_incidence=${dd(-1)}&issue_solved_by_parent_order=false`);const o=(j&&j.objects)||[];inc=inc.concat(o);if(o.length<200)break}
const abiertas=await call(`/orders/myorders/v2?orderBy=id&orderDirection=desc&result_number=500&start=0&textToSearch=&status=NOVEDAD&supplier_id=null&user_id=null&from_date_last_incidence=${dd(30)}&until_date_last_incidence=${dd(-1)}&issue_solved_by_parent_order=false`);
const vistos=new Set();const cand=[];
for(const o of all.filter(o=>o.status!=='PENDIENTE CONFIRMACION'&&Date.parse(o.created_at)>=D-5*864e5).concat(inc)){if(!vistos.has(o.id)){vistos.add(o.id);cand.push(o)}}
const r={desde:process.env.DESDE,hasta:new Date(H).toISOString(),conf_robot:0,conf_humano:0,conf_humano_por:{},nov_sol:0,nov_sol_por:{},entregados:0,devoluciones:0,pendientes:pend.length,nov_abiertas:((abiertas&&abiertas.objects)||[]).length,revisados:0,en_revision:enRev.length,sin_leer:0};
for(const x of cand){let o=null;for(let i=0;i<4&&!o;i++){const j=await call('/orders/myorders/'+x.id);o=j&&j.objects&&j.objects.id?j.objects:null;if(!o)await p.waitForTimeout(1500*(i+1))}
 if(!o){r.sin_leer++;continue}r.revisados++;
 const hi=(o.history||[]).slice().sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at));
 for(let k=0;k<hi.length;k++){const e=hi[k],t=Date.parse(e.created_at);if(!(t>=D&&t<H))continue;const quien=((e.user&&e.user.name)||'?')+' '+((e.user&&e.user.surname)||'').split(' ')[0];
  if(e.status==='PENDIENTE'&&k>0&&hi[k-1].status==='PENDIENTE CONFIRMACION'){if(e.user_id===ROBOT)r.conf_robot++;else{r.conf_humano++;r.conf_humano_por[quien.trim()]=(r.conf_humano_por[quien.trim()]||0)+1}}
  if(e.status==='NOVEDAD SOLUCIONADA'){r.nov_sol++;r.nov_sol_por[quien.trim()]=(r.nov_sol_por[quien.trim()]||0)+1}
  if(e.status==='ENTREGADO')r.entregados++;if(e.status==='DEVOLUCION')r.devoluciones++}
 await p.waitForTimeout(250)}
fs.writeFileSync('/tmp/dropi/reporte_datos.json',JSON.stringify(r));console.log('REPORTE_DATOS',JSON.stringify(r));await b.close()})();
