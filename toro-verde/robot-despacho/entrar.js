// Vuelve a iniciar la sesión del robot en Dropi con las variables del entorno DU (correo) y DP (clave) y la guarda en estado.json.
const {chromium}=require('playwright');(async()=>{
if(!process.env.DU||!process.env.DP){console.log('SIN_CREDENCIALES');process.exit(3)}
const b=await chromium.launch();const c=await b.newContext({locale:'es-CO',userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'});const p=await c.newPage();
await p.goto('https://app.dropi.co/auth/login',{waitUntil:'networkidle',timeout:60000});
await p.fill('input[type=email], input[name=email], input[formcontrolname=email]',process.env.DU);await p.fill('input[type=password]',process.env.DP);
await p.keyboard.press('Enter');await p.waitForTimeout(10000);
const ok=await p.evaluate(()=>!!localStorage.getItem('DROPI_token'));
if(ok){await c.storageState({path:'/tmp/dropi/estado.json'});console.log('SESION_OK')}else console.log('LOGIN_FALLO');
await b.close()})();
