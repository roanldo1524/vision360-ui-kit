// Lee (solo mirar) los mensajes del chat de soporte de Dropi (Intercom → pestaña Mensajes) para seguir los tickets «Dev_injustificadas».
// Uso: node leer_tickets.js → imprime la lista de conversaciones y el texto de la primera que diga Dev_injustificadas; deja captura en /tmp/dropi/tickets.png
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1500,height:1000},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
try{await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(4000);
const lz=p.locator('.intercom-lightweight-app-launcher-icon, .intercom-launcher, [aria-label*="Intercom" i], iframe[name*="intercom-launcher"]').first();if(await lz.count())await lz.click({timeout:20000});else await p.mouse.click(1455,955);await p.waitForTimeout(5000);
const f=p.frameLocator('iframe[name="intercom-messenger-frame"]');
await f.getByText(/Mensajes|Messages/).first().click({timeout:15000});await p.waitForTimeout(5000);
const lista=await f.locator('body').innerText();console.log('LISTA\n'+lista.slice(0,2500));
const t=f.getByText(/Dev_injustificadas|injustificad/i).first();if(await t.count()){await t.click();await p.waitForTimeout(6000);console.log('HILO\n'+(await f.locator('body').innerText()).slice(-4000))}
await p.screenshot({path:'/tmp/dropi/tickets.png'});}catch(e){console.log('ERROR',String(e).slice(0,200));await p.screenshot({path:'/tmp/dropi/tickets.png'})}finally{await b.close()}})();
