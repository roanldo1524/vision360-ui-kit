// Fecha REAL en que cada paquete llegó a la oficina (primer movimiento del estado actual en la transportadora). Solo lectura.
// Lee los pedidos «RECLAME EN OFICINA» de /tmp/dropi/hoy.json; guarda caché en /tmp/dropi/oficina_desde.json = {id: "AAAA-MM-DD HH:MM"}
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const F='/tmp/dropi/oficina_desde.json';const cache=fs.existsSync(F)?JSON.parse(fs.readFileSync(F)):{};
const ids=JSON.parse(fs.readFileSync('/tmp/dropi/hoy.json')).filter(x=>x.status==='RECLAME EN OFICINA'&&!cache[x.id]).map(x=>x.id);
if(!ids.length){console.log('OFICINA_DESDE sin nuevos');return}
const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const call=u=>p.evaluate(async([u,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{headers:{'x-authorization':a,'accept':'application/json'}});return await r.json()},[u,auth]);
let n=0;for(const id of ids){try{const o=((await call('/orders/myorders/'+id))||{}).objects||{};const mv=o.servientrega_movements||[];const ult=mv[mv.length-1]||{};
 const d=(mv.filter(m=>m.nom_mov===ult.nom_mov).map(m=>m.serv_date)[0]||o.updated_at||'').replace('T',' ').slice(0,16);if(d){cache[id]=d;n++}}catch(e){}}
fs.writeFileSync(F,JSON.stringify(cache));console.log('OFICINA_DESDE',n,'de',ids.length);await b.close()})();
