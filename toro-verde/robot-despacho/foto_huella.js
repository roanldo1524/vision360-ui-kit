// Captura la pantalla REAL «Historial del comprador» de Dropi por teléfono (botón flotante de huella). Solo lee. Uso: node foto_huella.js <telefono10> <salida.png>
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',viewport:{width:1400,height:1000},deviceScaleFactor:2,userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
await p.route(/api(-v2)?\.dropi\.co/,(route)=>{const r=route.request();if(r.method()!=='GET'&&!/fingerprint|white-label/.test(r.url()))return route.abort();return route.continue()});
const [tel,out]=process.argv.slice(2);
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2500);
// botón flotante con la huella (abajo a la derecha)
const flot=await p.evaluateHandle(()=>{const els=[...document.querySelectorAll('button,a,div,span')].filter(e=>{const r=e.getBoundingClientRect();return r.width>30&&r.width<90&&r.height>30&&r.height<90&&r.right>window.innerWidth-120&&r.bottom>window.innerHeight-400&&/finger|huella|fingerprint/i.test(e.outerHTML)});return els[0]||null});
if(!(await flot.evaluate(e=>!!e))){console.log('SIN_BOTON');await b.close();process.exit(3)}
await flot.asElement().click();await p.waitForTimeout(2500);
const inp=p.locator('input[type=tel], input[placeholder*="elular"], input[placeholder*="eléfono"], input[placeholder*="umero"], input[placeholder*="úmero"]').last();
await inp.fill(tel);await p.keyboard.press('Enter');await p.waitForTimeout(1500);
const bt=p.locator('button:has-text("Consultar"), button:has-text("Buscar"), button:has-text("Verificar")').last();if(await bt.count())await bt.click();
await p.waitForTimeout(5000);
const card=p.locator('text=Probabilidad de entrega').first().locator('xpath=ancestor::div[.//*[contains(normalize-space(.),"Comprador")]][1]');
let box=(await card.count())?await card.boundingBox():null;
if(!box){console.log('SIN_TARJETA');await b.close();process.exit(4)}
await p.screenshot({path:out,clip:{x:box.x-8,y:box.y-8,width:box.width+16,height:box.height+16}});console.log('FOTO_OK',out);await b.close()})();
