const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13']});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()=='error')errs.push(m.text())});
await p.goto((process.argv[2]||'file://'+__dirname+'/local2.html')+'?n=Ronald',{waitUntil:'load',timeout:60000});await p.waitForTimeout(2500);
await p.screenshot({path:__dirname+'/k0.png',fullPage:true});
for(let t=0;t<3;t++){await p.click('#tirar',{force:true});if(t==2){await p.waitForTimeout(1200);await p.screenshot({path:__dirname+'/k_spin.png'});}await p.waitForTimeout(t==2?3500:3200);console.log(t,await p.textContent('#msg'));if(t==2){await p.waitForTimeout(1500);await p.screenshot({path:__dirname+'/k_win.png'});}}
await p.waitForTimeout(3000);console.log('premio',await p.evaluate(()=>getComputedStyle(document.getElementById('premio')).display),await p.textContent('#premioLed'));
await p.screenshot({path:__dirname+'/k2.png',fullPage:true});console.log('ERR',errs);await b.close()})();
