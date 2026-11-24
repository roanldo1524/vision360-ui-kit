// Lee la bandeja del CAS (solo lectura): todos los casos con su último mensaje. Uso: node cas_bandeja.js → /tmp/dropi/cas_bandeja.json
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let hdr=null;p.on('request',r=>{if(/api-v2\.dropi\.co\/cas/.test(r.url())&&r.headers()['authorization']&&!hdr)hdr=r.headers()});
const OK=/chats\/search|chats\/counts|caschat\/all|api\/cas\/auth|white-label|get-data-user/;
await p.route(/./,r=>{const q=r.request();if(q.method()!=='GET'&&!OK.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/cas/tray',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(5000);
if(!hdr){console.log('SIN_TOKEN_CAS');await b.close();return}
const out=[];
for(const st of ['queues','active','postponed','close']){for(let off=0;off<400;off+=50){
 const j=await p.evaluate(async([h,st,off])=>{const r=await fetch('https://api-v2.dropi.co/cas/api/v1/chats/search',{method:'POST',headers:{'content-type':'application/json','authorization':h.authorization},body:JSON.stringify({page_size:50,offset:off,orderDirection:'desc',version:'2.0.4',status_chat:st,search_term:'',filterByCategoryUser:[],filterByCommercialId:[],filterByCommunities:[],filterByWhiteBrandId:[],enterprise:[]})});return await r.json()},[hdr,st,off]);
 const d=(j&&j.data)||[];for(const x of d)out.push({estado:st,chat:x.casChat&&x.casChat._id,pedido:x.referenceObject&&x.referenceObject.id,guia:x.referenceObject&&x.referenceObject.data&&x.referenceObject.data.shipping_guide,dc:x.enterprise&&x.enterprise.name,motivo:x.casTicketType&&x.casTicketType.name,creado:x.createdAt,ult:(x.lastMessage&&x.lastMessage.objectIntegrationType&&x.lastMessage.objectIntegrationType.message||'').slice(0,300),ult_fecha:x.lastMessage&&x.lastMessage.createdAt,ult_user:x.lastMessage&&x.lastMessage.user,asesor:x.asesor&&((x.asesor.name||'')+' '+(x.asesor.surname||'')).trim(),noleidos:x.unreadCountCliente});
 if(d.length<50)break}}
fs.writeFileSync('/tmp/dropi/cas_bandeja.json',JSON.stringify(out));console.log('CASOS',out.length);await b.close()})();
