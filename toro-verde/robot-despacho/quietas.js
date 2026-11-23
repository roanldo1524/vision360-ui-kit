// Ronald 23-11: horas en el MISMO estado según el «Historial de estados» de cada pedido (campo history; lo mismo que muestra la lupa).
// Solo cuentan los estados en que la TRANSPORTADORA ya tiene el paquete (no oficina/novedad, que dependen del cliente).
// Si no logra leer el pedido, NO lo cuenta. Solo lee. Uso: node quietas.js → /tmp/dropi/quietas.json
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
if(!auth){console.log('SESION_DROPI_CAIDA');process.exit(2)}
const call=u=>p.evaluate(async([u,a])=>{try{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'}});return await r.json()}catch(e){return null}},[u,auth]);
const h=JSON.parse(fs.readFileSync('/tmp/dropi/hoy.json'));
const FIN=/ENTREGADO|DEVOLU|DEVUELTO|CANCELADO|RECHAZ|INDEMNIZ|ANULAD/;
const TRANSPORTADORA=/EN BODEGA ORIGEN|DESPACHADA|EN ESPERA DE RUTA|EN TRANSPORTE|TRANSITO|EN BODEGA TRANSPORTADORA|EN BODEGA DESTINO|EN REPARTO|EN REEXPEDICION|SIN MOVIMIENTOS|REENVIO|INTENTO DE ENTREGA/;
const out=[];let fallos=0;
for(const x of h.filter(x=>!FIN.test(x.status)&&x.status!=='PENDIENTE CONFIRMACION'&&x.status!=='PENDIENTE')){
 let o=null;for(let i=0;i<2&&!o;i++){const j=await call('/orders/myorders/'+x.id);o=j&&j.objects&&j.objects.id?j.objects:null;if(!o)await p.waitForTimeout(800)}
 if(!o){fallos++;continue}
 if(FIN.test(o.status||''))continue;
 const hi=(o.history||[]).map(e=>({t:Date.parse(e.created_at),st:e.status})).filter(e=>!isNaN(e.t)).sort((a,b)=>a.t-b.t);
 if(!o.shipping_guide||!hi.length)continue;
 const ult=hi[hi.length-1];if(ult.st!==o.status)continue;
 if(!TRANSPORTADORA.test(o.status||''))continue;
 const mv=o.servientrega_movements||[];const um=mv[mv.length-1]||{};
 out.push({id:o.id,status:o.status,name:((o.name||'')+' '+(o.surname||'')).trim(),phone:String(o.phone||'').slice(-10),city:o.city,dc:(o.distribution_company||{}).name||x.dc,guia:o.shipping_guide,horas:Math.floor((Date.now()-ult.t)/36e5),dias:Math.floor((Date.now()-ult.t)/864e5),desde:new Date(ult.t-5*36e5).toISOString().slice(0,16).replace('T',' '),ult_mov:(um.nom_mov||'')+(um.des_mov&&um.des_mov!==um.nom_mov?' / '+um.des_mov:'')});
 await p.waitForTimeout(150)}
fs.writeFileSync('/tmp/dropi/quietas.json',JSON.stringify(out));console.log('QUIETAS leidas',out.length,'sin poder leer',fallos);await b.close()})();
