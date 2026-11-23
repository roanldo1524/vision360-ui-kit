const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',viewport:{width:1800,height:1100},locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
let est=null;p.on('response',async r=>{if(/caschat\/all/.test(r.url())){try{est=(JSON.parse(await r.text()).data||[]).map(x=>x.status).join(',')}catch(e){}}});
const OK=/chats\/search|chats\/counts|caschat\/all|filterinteraction|getInfoOrderForCasByOrderId|api\/cas\/auth|white-label|get-data-user/;
await p.route(/./,r=>{const q=r.request();if(q.method()!=='GET'&&!OK.test(q.url()))return r.abort();return r.continue()});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});await p.waitForTimeout(2000);
await p.fill('input[placeholder*="uscar"]',process.argv[2]);await p.keyboard.press('Enter');await p.waitForTimeout(5000);
await p.locator('tbody tr',{hasText:process.argv[2]}).first().locator('i.fa-headset').click();await p.waitForTimeout(6000);
await p.getByRole('button',{name:'Si, ir'}).click();await p.waitForTimeout(7000);
let t=await p.evaluate(()=>document.body.innerText);if(!/Ingresar Mensaje|ASESOR/.test(t)){await p.getByText('Resueltas').first().click();await p.waitForTimeout(4000);await p.locator('text=ID ORDEN '+process.argv[2]).first().click().catch(()=>{});await p.waitForTimeout(5000);t=await p.evaluate(()=>document.body.innerText)}
console.log('ESTADO',est);const k=t.indexOf('ASESOR HUMANO');console.log(t.slice(Math.max(0,k-100),k+1200).replace(/\n+/g,' | '));await b.close()})();
