// Baja todas las oficinas de Interrapidísimo (portal de cobertura) a /tmp/dropi/oficinas_inter.json. Uso: node oficinas_inter.js
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const p=await b.newPage();
const U='https://www3.interrapidisimo.com/portalconsulta/Vista/Cobertura/CoberturaNacional.aspx?AspxAutoDetectCookieSupport=1';
await p.goto(U,{waitUntil:'networkidle',timeout:60000});
const deps=(await p.evaluate(()=>[...document.querySelectorAll('#cboDepartamento_cboDepartamento_OptionList li')].map(l=>l.innerText.trim()))).filter(d=>/\\COL$/.test(d));
async function pick(base,f){const items=await p.$$(`#${base}_OptionList li`);for(const it of items){const t=(await it.innerText()).trim();if(f(t)){await p.click(`#${base}_Button`);await p.waitForTimeout(300);await it.click();return t}}return null}
const out=[];
for(const d of deps){try{
  await p.goto(U,{waitUntil:'networkidle',timeout:60000});
  await pick('cboDepartamento_cboDepartamento',t=>t===d);await p.waitForLoadState('networkidle');await p.waitForTimeout(2000);
  await pick('cboCiudad_cboCiudad',t=>/TODAS LAS CIUDADES/.test(t));await p.waitForTimeout(1200);
  await p.click('#btnConsultar');await p.waitForLoadState('networkidle');await p.waitForTimeout(2500);
  let pag=1,n=0;const vistos=new Set();
  while(true){
    const rows=await p.evaluate(()=>[...document.querySelectorAll('table tr')].map(r=>[...r.querySelectorAll('td')].map(c=>c.innerText.trim())).filter(r=>r.length>=3&&r.length<=5));
    for(const r of rows){if(r[0]==='Departamento'||!r[2]||/^\d+$/.test(r[0]))continue;const k=r.join('|');if(vistos.has(k))continue;vistos.add(k);out.push({dep:r[0],ciudad:r[1],dir:r[2],tel:r[3]||''});n++}
    pag++;const links=await p.$$('table a');let sig=null,mas=null;
    for(const a of links){const t=(await a.innerText()).trim();if(t===String(pag))sig=a;if(t==='...')mas=a}
    if(!sig&&mas&&pag%10===1){const ls=await p.$$('table a');for(const a of ls){if((await a.innerText()).trim()==='...')mas=a}sig=mas}
    if(!sig)break;await sig.click();await p.waitForLoadState('networkidle');await p.waitForTimeout(1500);if(pag>200)break}
  console.log(d,n,'pags',pag-1);
}catch(e){console.log('ERR',d,String(e).slice(0,80))}}
fs.writeFileSync('/tmp/dropi/oficinas_inter.json',JSON.stringify(out));console.log('TOTAL',out.length);await b.close()})();
