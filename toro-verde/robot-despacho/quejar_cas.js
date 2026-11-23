// Pone UNA queja «Ordenes sin movimiento» por el CAS (audífonos) de un pedido. Evidencia: pantallazo real del Historial de estados (lupa), se borra al terminar.
// Solo deja pasar: entrar al CAS, leer chats, subir la foto y crear la queja. Todo lo demás que no sea leer se bloquea.
// Uso: node quejar_cas.js <id_pedido> "<texto máx 200>"   → imprime QUEJA_OK <id> | QUEJA_YA_ABIERTA | QUEJA_ERROR <motivo>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const id=process.argv[2];const texto=(process.argv[3]||'').slice(0,200);const png=`/tmp/dropi/ev_${id}_${Date.now()}.png`;
const b=await chromium.launch();let fin='QUEJA_ERROR sin terminar';
try{const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let abiertos=null,creada=null;
p.on('response',async r=>{const u=r.url();try{if(/caschat\/all/.test(u)){abiertos=JSON.parse(await r.text()).data||[];console.error('CHATS',JSON.stringify(abiertos).slice(0,600))}if(/enterprise-request\/create/.test(u))creada={st:r.status(),t:(await r.text()).slice(0,400)}}catch(e){}});
await p.route(/./,r=>{const q=r.request();if(/myorders\/v2\?/.test(q.url())&&/textToSearch=\d/.test(q.url())){const d=new Date(Date.now()-90*864e5).toISOString().slice(0,10);return r.continue({url:q.url().replace(/from=[0-9-]+/,'from='+d)})}if(q.method()!=='GET'&&!/white-label|get-data-user|api\/cas\/auth|caschat\/all|file-manager\/upload\/image|enterprise-request\/create/.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2000);
if(/login/.test(p.url())){fin='QUEJA_ERROR sesion';throw 0}
await p.fill('input[placeholder*="uscar"]',id);await p.keyboard.press('Enter');await p.waitForTimeout(5000);
const fila=p.locator('tbody tr',{hasText:id}).first();if(!await fila.count()){fin='QUEJA_ERROR no_encontrado';throw 0}
// evidencia
await fila.locator('i.fa-search').click();await p.waitForTimeout(5000);
const caja=()=>p.evaluate(()=>{const t=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div')].find(e=>/^\s*Historial de estados/.test(e.innerText||'')&&e.children.length<3);if(!t)return null;t.scrollIntoView();let tb=t.nextElementSibling;while(tb&&!tb.querySelector('table')&&tb.tagName!=='TABLE')tb=tb.nextElementSibling;const r1=t.getBoundingClientRect(),r2=(tb||t).getBoundingClientRect();return {x:Math.max(0,Math.min(r1.x,r2.x)-8),y:Math.max(0,r1.y-8),width:Math.max(r1.width,r2.width)+16,height:Math.min(1080,r2.bottom-r1.y+16)}});
if(!await caja()){fin='QUEJA_ERROR sin_historial';throw 0}await p.waitForTimeout(500);await p.screenshot({path:png,clip:await caja()});
await p.keyboard.press('Escape');await p.waitForTimeout(1500);const x=p.locator('button.btn-close:visible, .close:visible, [aria-label=Close]:visible').first();if(await x.count())await x.click().catch(()=>{});await p.waitForTimeout(1500);
// CAS
await fila.locator('i.fa-headset').click();await p.waitForTimeout(6000);
if(abiertos&&abiertos.length){fin='QUEJA_YA_ABIERTA '+id;throw 0}
await p.getByText('Transportadora',{exact:true}).last().click();await p.waitForTimeout(800);
await p.getByRole('button',{name:'Siguiente'}).last().click();await p.waitForTimeout(4000);
await p.getByText('Ordenes sin movimiento',{exact:true}).last().click();await p.waitForTimeout(800);
await p.getByRole('button',{name:'Siguiente'}).last().click();await p.waitForTimeout(4000);
const ta=p.locator('textarea:visible').last();if(!await ta.count()){fin='QUEJA_ERROR sin_formulario (¿muy pronto o estado no permitido?)';throw 0}
await ta.fill(texto);await p.locator('input[type=file]').last().setInputFiles(png);await p.waitForTimeout(4000);
const btn=p.getByRole('button',{name:'Iniciar conversación'}).last();if(!await btn.isEnabled()){fin='QUEJA_ERROR boton_inactivo';throw 0}
await btn.click();for(let i=0;i<20&&!creada;i++)await p.waitForTimeout(500);
fin=creada&&creada.st<300?'QUEJA_OK '+id+' '+creada.t.replace(/\s+/g,' ').slice(0,200):'QUEJA_ERROR crear '+JSON.stringify(creada);
}catch(e){if(e!==0)fin='QUEJA_ERROR '+String(e).slice(0,150)}
finally{if(fs.existsSync(png))fs.unlinkSync(png);await b.close();console.log(fin)}})();
