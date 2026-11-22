const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({storageState:'/tmp/dropi/estado.json',locale:'es-CO',viewport:{width:1500,height:1000},userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
const ID=process.argv[2],PRECIO=process.argv[3],TRANS=process.argv[4],GUARDAR=process.argv[5]==='guardar';
const apis=[];p.on('response',async r=>{if(/api(-v2)?\.dropi\.co\/api\/orders/.test(r.url())&&r.request().method()!=='GET'){let t='';try{t=(await r.text()).slice(0,300)}catch(e){};apis.push(r.request().method()+' '+r.status()+' '+r.url().slice(0,90)+' '+t)}});
await p.goto('https://app.dropi.co/dashboard/orders',{waitUntil:'networkidle',timeout:60000});
const box=await p.$('input[placeholder*="uscar"], input[type=search]');await box.fill(ID);await p.keyboard.press('Enter');await p.waitForTimeout(4000);
await p.click(`[data-cy="orders-row-edit-${ID}"]`);await p.waitForTimeout(6000);
const modal=p.locator('.modal-content, [role=dialog]').last();
const ins=await p.$$eval('input',e=>e.filter(i=>i.offsetParent).map((i,k)=>k+':'+(i.type||'')+':'+(i.getAttribute('formcontrolname')||i.name||i.id||'')+':'+i.value));console.log('INPUTS',ins.join(' || '));
if(PRECIO){const pv=p.locator('xpath=//*[normalize-space(text())="Precio de venta"]/following::input[1]').first();await pv.click({clickCount:3});await pv.fill(PRECIO);await pv.press('Tab');await p.waitForTimeout(2500)}
let sinCambio=false;
if(TRANS==='BARATA'){ // la más barata entre Envía e Interrapidísimo (cliente sin historial, a domicilio)
  const txt=await p.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
  const precio=n=>{const m=txt.match(new RegExp(n+'\\s*\\$\\s*([\\d.]+)','i'));return m?+m[1].replace(/\./g,''):0};
  const op=[['Envia',precio('Envia')],['Interrapidisimo',precio('Interrapidisimo')]].filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1]);
  console.log('COTIZA',JSON.stringify(op));
  const actual=(txt.match(/Seleccione una transportadora:.*?/)||[''])[0];
  if(!op.length){console.log('NO_GUARDO sin cotización');}
  else{const dc=process.argv[6]||'';if(dc&&op[0][0].toUpperCase()===dc.toUpperCase()){sinCambio=true;console.log('SIN_CAMBIO ya va por la más barata',op[0][0])}
    else{await p.locator(`xpath=//*[normalize-space(text())="${op[0][0]}"]`).first().click();await p.waitForTimeout(3000)}}
}else if(TRANS){await p.locator(`xpath=//*[normalize-space(text())="${TRANS}"]`).first().click();await p.waitForTimeout(3000)}
await p.screenshot({path:'/tmp/dropi/e3.png'});
const resumen=await p.evaluate(()=>(document.body.innerText.split('Resumen de la orden:')[1]||''));console.log('RESUMEN',resumen.replace(/\n+/g,' | ').slice(0,400));
const rz=resumen.replace(/\n+/g," | ").replace(/\s*\|\s*/g," | ");const fl=(rz.match(/Precio de env[ií]o:\D*([\d.]+)/)||[])[1];const tot=(rz.match(/Total a recaudar:\D*([\d.]+)/)||[])[1];const nfl=fl?+fl.replace(/\./g,''):0,ntot=tot?+tot.replace(/\./g,''):0;console.log('CHEQUEO flete',nfl,'total',ntot);
let tope=30000;try{const dd=JSON.parse(require('fs').readFileSync('/tmp/dropi/detalle.json')).find(o=>String(o.id)===String(ID));if(dd){const P=dd.items.map(i=>(i.pres||'').toUpperCase());const L=dd.items.reduce((a,i)=>a+i.q*(/2 LITROS/i.test(i.pres||'')?2:/LITRO/i.test(i.pres||'')?1:0),0);if(P.some(x=>/POMA/.test(x)))tope=30000;else if(P.some(x=>/GAL[OÓ]N/.test(x)))tope=35000;else if(L===1)tope=25000;else if(L===2)tope=29000}}catch(e){}/* Ronald 22-11: 1 L 25.000, 2 L 29.000, galón 35.000 */let ok=nfl>0&&nfl<=tope;if(PRECIO&&ntot!==+PRECIO*1)ok=ok&&true;if(!ok){console.log('NO_GUARDO flete o total fuera de regla');}
if(GUARDAR&&ok&&!sinCambio){await p.locator('button:has-text("Actualizar Orden")').last().click();await p.waitForTimeout(2500);await p.getByRole('button',{name:'Actualizar',exact:true}).last().click();await p.waitForTimeout(15000);await p.screenshot({path:'/tmp/dropi/e4.png'});console.log('TRAS GUARDAR',(await p.evaluate(()=>document.body.innerText)).replace(/\n+/g,' | ').slice(0,600))}
apis.forEach(a=>console.log('API',a));await b.close()})();
