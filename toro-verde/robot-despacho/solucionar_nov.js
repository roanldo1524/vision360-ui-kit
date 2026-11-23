// Soluciona UNA novedad en Dropi volviendo a ofrecer el pedido (nunca devolución). Uso: node solucionar_nov.js <order_id> '<json {"solucion","nombre","direccion","celular"}>'
// Verifica después que Dropi la marque como solucionada.
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();let auth=null;p.on('request',r=>{const h=r.headers();if(!auth&&h['x-authorization'])auth=h['x-authorization']});
await p.goto('https://app.dropi.co/dashboard/novelties',{waitUntil:'networkidle',timeout:60000});
const call=(m,u,body)=>p.evaluate(async([m,u,body,a])=>{const r=await fetch('https://api.dropi.co/api'+u,{method:m,headers:{'x-authorization':a,'accept':'application/json','content-type':'application/json'},body:body?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){};return {s:r.status,j}},[m,u,body,auth]);
const id=+process.argv[2];const d=JSON.parse(process.argv[3]);
if(!d.solucion||!d.direccion||!d.celular||!/^3\d{9}$/.test(String(d.celular))){console.log('NOV_DATOS_INCOMPLETOS',id);process.exit(3)}
const o=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
if(o.status!=='NOVEDAD'||o.issue_solved_by_operator){console.log('NOV_SALTO',id,o.status,'resuelta:',o.issue_solved_by_operator);process.exit(0)}
await call('POST','/orders/clickbtnsolve',{shipping_guide:o.shipping_guide});
const body={data:[{order_id:id,direccionConfirma:d.direccion,nombreConfirma:d.nombre||((o.name||'')+' '+(o.surname||'')).trim(),datosAdicionalDir:d.adicional||'',telefonoBaseConfirma:String(d.celular),fechaConfirma:'',solution:d.solucion,essolucion:1,tipocategoria:0,selectValueConfirma:'1',timeStart:'',timeEnd:'',location_url:null}]};
const r=await call('POST','/orders/saveincidencesolution',body);
const v=((await call('GET','/orders/myorders/'+id)).j||{}).objects||{};
console.log(r.s===200&&v.issue_solved_by_operator?'NOV_SOLUCIONADA':'NOV_FALLO',id,r.s,JSON.stringify(r.j).slice(0,200),'resuelta:',v.issue_solved_by_operator);await b.close()})();
