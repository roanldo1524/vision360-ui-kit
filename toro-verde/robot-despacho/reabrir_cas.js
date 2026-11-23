// Si el agente de IA de Dropi cerró la queja sin gestión real, la reabre y pide un asesor humano. Una sola vez por queja.
// Modo 'ia' (por defecto): solo si la IA la cerró y aún no se escaló. Modo 'seguir': seguimiento a las 48 h (reabre si hace falta y escribe).
// Uso: node reabrir_cas.js <id_pedido> "<mensaje>" [ia|seguir]  → REABIERTA_OK | NO_HACE_FALTA <motivo> | REABRIR_ERROR <motivo>
const {chromium}=require('playwright');
(async()=>{const id=process.argv[2],msg=process.argv[3],modo=process.argv[4]||'ia';const b=await chromium.launch();let fin='REABRIR_ERROR sin terminar';
try{const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let enviado=null;p.on('response',async r=>{if(/caschat\/interaction\/create/.test(r.url()))enviado=r.status()});
const OK=/chats\/search|chats\/counts|caschat\/all|filterinteraction|markAsSeenChats|getInfoOrderForCasByOrderId|api\/cas\/auth|white-label|get-data-user|caschat\/status\/create|caschat\/interaction\/create/;
await p.route(/./,r=>{const q=r.request();if(/myorders\/v2\?/.test(q.url())&&/textToSearch=\d/.test(q.url())){const d=new Date(Date.now()-90*864e5).toISOString().slice(0,10);return r.continue({url:q.url().replace(/from=[0-9-]+/,'from='+d)})}if(q.method()!=='GET'&&!OK.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2000);
await p.fill('input[placeholder*="uscar"]',id);await p.keyboard.press('Enter');await p.waitForTimeout(5000);
const fila=p.locator('tbody tr',{hasText:id}).first();if(!await fila.count()){fin='REABRIR_ERROR no_encontrado';throw 0}
await fila.locator('i.fa-headset').click();await p.waitForTimeout(6000);
const ir=p.getByRole('button',{name:'Si, ir'});if(!await ir.count()){fin='NO_HACE_FALTA sin_caso';throw 0}
await ir.click();await p.waitForTimeout(7000);
const abrirItem=async()=>{const it=p.locator('text=ID ORDEN '+id).first();if(await it.count()){await it.click();await p.waitForTimeout(5000);return true}return false};
let ta=p.locator('textarea[placeholder="Ingresar Mensaje"]:visible');
if(!await ta.count()){await p.getByText('Resueltas').first().click();await p.waitForTimeout(5000);await abrirItem()}
const conv=await p.evaluate(()=>document.body.innerText);
if(modo==='ia'&&/ASESOR HUMANO|Solicitamos por favor su intervención/.test(conv)){fin='NO_HACE_FALTA ya_escalada';throw 0}
if(modo==='ia'&&!/agente de IA de Dropi/.test(conv)||modo==='ia'&&!/finalizada|SOLUCIONADA/i.test(conv)){fin='NO_HACE_FALTA no_cerrada_por_IA';throw 0}
const re=p.getByRole('button',{name:'Reabrir chat'});if(await re.count()){await re.first().click();await p.waitForTimeout(5000)}
ta=p.locator('textarea[placeholder="Ingresar Mensaje"]:visible');if(!await ta.count()){fin='REABRIR_ERROR sin_caja';throw 0}
await ta.fill(msg);await p.getByRole('button',{name:'Enviar'}).last().click();for(let i=0;i<20&&enviado===null;i++)await p.waitForTimeout(500);
fin=enviado&&enviado<300?'REABIERTA_OK '+id:'REABRIR_ERROR envio '+enviado;
}catch(e){if(e!==0)fin='REABRIR_ERROR '+String(e).slice(0,150)}finally{await b.close();console.log(fin)}})();
