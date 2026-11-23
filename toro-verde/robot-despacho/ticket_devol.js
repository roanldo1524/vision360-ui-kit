// Crea en el chat de soporte de Dropi (Intercom) el ticket «Dev_injustificadas» con el Excel de guías.
// Ruta: Envíanos un mensaje → Problemas con mis envíos → Reportar devoluciones injustificadas → Crear Ticket → Dev_injustificadas.
// Correo de avisos: el del usuario del robot (variable DU). Uso: node ticket_devol.js /tmp/dropi/dev_injustificadas.xlsx → TICKET_OK | TICKET_ERROR <motivo>
const {chromium}=require('playwright');
(async()=>{const xls=process.argv[2];const b=await chromium.launch();let fin='TICKET_ERROR sin terminar';
try{const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let creado=null;p.on('response',async r=>{const u=r.url();if(/intercom/.test(u)&&/tickets/.test(u)&&!/ticket_form/.test(u)&&r.request().method()==='POST'){creado={st:r.status(),t:(await r.text().catch(()=>'')).slice(0,300)}}});
await p.route(/./,r=>{const q=r.request();if(q.method()!=='GET'&&!/white-label|get-data-user|intercom/.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(3000);
await p.locator('.intercom-lightweight-app-launcher-icon, .intercom-launcher').first().click();await p.waitForTimeout(7000);
const f=p.frameLocator('iframe[name="intercom-messenger-frame"]');
await f.getByText('Envíanos un mensaje').first().click();await p.waitForTimeout(5000);
for(const op of ['Problemas con mis envíos','Reportar devoluciones injustificadas','Crear Ticket']){await f.getByRole('button',{name:op}).first().click();await p.waitForTimeout(9000)}
await f.getByText('Dev_injustificadas').last().click();await p.waitForTimeout(6000);
const mail=f.locator('input[type=email]');if(await mail.count()&&!(await mail.inputValue()))await mail.fill(process.env.DU||'');
await f.locator('input[type=file]').first().setInputFiles(xls);await p.waitForTimeout(6000);
await f.getByRole('button',{name:'Crear ticket'}).last().click();for(let i=0;i<30&&!creado;i++)await p.waitForTimeout(500);await p.waitForTimeout(4000);
const t=await p.frames().find(x=>x.name()==='intercom-messenger-frame').evaluate(()=>document.body.innerText).catch(()=>'');
fin=creado&&creado.st<300?'TICKET_OK '+t.replace(/\n+/g,' | ').slice(-400):'TICKET_ERROR '+JSON.stringify(creado)+' '+t.replace(/\n+/g,' | ').slice(-300);
await p.screenshot({path:'/tmp/dropi/ticket_final.png'});
}catch(e){fin='TICKET_ERROR '+String(e).slice(0,200)}finally{await b.close();console.log(fin)}})();
