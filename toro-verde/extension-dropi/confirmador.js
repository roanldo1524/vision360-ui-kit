// «Confirmador Toro Verde» (Ronald 27-11: «algo brutal que se convierta como el bot que se encarga de hacer las confirmaciones… que potencie
// mucho más a Dropi en el área de pedidos y confirmación», «que lo haga por API, evite consumir tanto crédito»).
// Panel dentro de Dropi con TODOS los pedidos pendientes de confirmar, agrupados por lo que hay que hacer, con botones de un toque:
// ✅ Confirmar · 💲 Cambiar precio al del chat · 💬 Abrir chat en Lucid · 📞 WhatsApp. Usa solo la API de Dropi con la sesión de quien lo usa.
// CERO IA. Nunca cancela. Cada acción queda escrita en las notas del pedido («✋ … desde el Confirmador»).
(() => {
  const API = 'https://api.dropi.co/api';
  const tokLS = () => { try { const t = (localStorage.getItem('DROPI_token') || '').replace(/"/g, ''); return t ? 'Bearer ' + t : null; } catch (e) { return null; } };
  let auth = null, userId = null;
  // toma el token y el usuario de las propias peticiones de Dropi (no se guardan en ningún lado)
  const f0 = window.fetch;
  window.fetch = function (u, opt) {
    try { // Dropi llama fetch con un Request o con (url, opciones)
      const url = (u && u.url) || String(u);
      const hs = [opt && opt.headers, u && u.headers].filter(Boolean);
      for (const h of hs) { const a = h.get ? h.get('x-authorization') : (h['x-authorization'] || h['X-Authorization']); if (a && String(a).length > 40 && !tokLS()) auth = a; }
      const m = url.match(/user_id=(\d+)/); if (m) userId = m[1];
    } catch (e) {}
    return f0.apply(this, arguments);
  };
  const X = XMLHttpRequest.prototype, o0 = X.open, h0 = X.setRequestHeader;
  X.open = function (m, u) { try { const k = String(u).match(/user_id=(\d+)/); if (k) userId = k[1]; } catch (e) {} return o0.apply(this, arguments); };
  X.setRequestHeader = function (k, v) { if (String(k).toLowerCase() === 'x-authorization' && String(v).length > 40 && !tokLS()) auth = v; return h0.apply(this, arguments); };
  const api = async (m, u, body) => {
    auth = tokLS() || auth;
    const r = await f0(API + u, { method: m, headers: { 'x-authorization': auth, accept: 'application/json', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j };
  };
  // Configuración (Opciones de la extensión) y Lucid por el puente: la clave nunca llega a esta página
  let CFG = { lucid: false, chatUrl: '', nombre: '', tienda: '', pais: '57' };
  const esperando = {}; let nreq = 0;
  window.addEventListener('message', (e) => { const m = e.data; if (e.source !== window || !m) return;
    if (m.tv === 'cfg') { CFG = Object.assign(CFG, m.cfg); if (document.getElementById('tvc')) pintar(); }
    if (m.tv === 'res' && esperando[m.id]) { esperando[m.id](m.r); delete esperando[m.id]; } });
  const lucidApi = (ruta, metodo, cuerpo) => new Promise(res => { const id = ++nreq; esperando[id] = res; window.postMessage({ tv: 'req', id, ruta, metodo, cuerpo }, '*'); setTimeout(() => { if (esperando[id]) { delete esperando[id]; res({ ok: false, error: 'tiempo' }); } }, 20000); });
  const plata = (n) => '$' + Math.round(+n || 0).toLocaleString('es-CO');
  const parte = (t, k) => { const m = String(t || '').match(new RegExp(k + ':\\s*([^·|]+)')); return m ? m[1].trim() : ''; };
  const lucid = (tel) => { let m = CFG.chatUrl || ''; if (!m) { try { m = localStorage.getItem('tv_lucid_url') || ''; } catch (e) {} } return m ? m.replace('{tel}', (CFG.pais || '57') + tel) : ''; };
  const hora = () => new Date().toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  // ───────── Diseño Toro Verde (Ronald 27-11: «diseño único, buena experiencia de usuario») ─────────
  const css = document.createElement('style');
  css.textContent = `
  :root{--tv-osc:#141432;--tv-ver:#2b2b6b;--tv-lim:#c6f135;--tv-nar:#ff6b4a;--tv-roj:#e5484d;--tv-gri:#6b7280;--tv-fon:#f4f4f8}
  #tvc-btn{position:fixed;right:22px;bottom:96px;z-index:100000;display:flex;align-items:center;gap:10px;background:var(--tv-osc);color:#fff;border:0;border-radius:999px;padding:12px 18px 12px 14px;font:700 15px 'Segoe UI',system-ui,sans-serif;box-shadow:0 10px 30px #0e3a2066;cursor:pointer;transition:transform .15s}
  #tvc-btn:hover{transform:translateY(-2px)}#tvc-btn .ic{width:30px;height:30px;border-radius:50%;background:var(--tv-lim);color:var(--tv-osc);display:grid;place-items:center;font-size:17px}
  #tvc-btn .n{background:var(--tv-nar);border-radius:999px;padding:1px 8px;font-size:13px}
  #tvc{position:fixed;top:0;right:0;width:520px;max-width:100vw;height:100vh;z-index:100001;background:var(--tv-fon);box-shadow:-12px 0 40px #0004;display:none;flex-direction:column;font:14px/1.45 'Segoe UI',system-ui,sans-serif;color:#1f2a1f;animation:tvin .2s ease}
  @keyframes tvin{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
  #tvc .hd{background:radial-gradient(120% 140% at 0% 0%,#3b3b9a 0%,var(--tv-osc) 60%);color:#fff;padding:16px 18px 14px}
  #tvc .hd .r1{display:flex;align-items:center;gap:10px}#tvc .hd .lg{width:36px;height:36px;border-radius:10px;background:var(--tv-lim);color:var(--tv-osc);display:grid;place-items:center;font-size:20px}
  #tvc .hd b{font-size:17px;flex:1;line-height:1.1}#tvc .hd small{display:block;font-weight:400;opacity:.75;font-size:12px}
  #tvc .hd button{background:#ffffff1f;color:#fff;border:0;border-radius:9px;width:34px;height:34px;cursor:pointer;font-size:15px}#tvc .hd button:hover{background:#ffffff33}
  #tvc .kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
  #tvc .kpi div{background:#ffffff14;border-radius:12px;padding:8px 10px}#tvc .kpi span{display:block;font-size:22px;font-weight:800}#tvc .kpi em{font-style:normal;font-size:11.5px;opacity:.8}
  #tvc .tl{padding:10px 14px 6px;background:#fff;border-bottom:1px solid #e5e8e1}
  #tvc .tl input{width:100%;box-sizing:border-box;border:1px solid #d9ded4;border-radius:10px;padding:9px 12px;font:14px inherit;outline:none}#tvc .tl input:focus{border-color:var(--tv-ver)}
  #tvc .ch{display:flex;gap:6px;overflow-x:auto;padding:8px 0 4px}#tvc .ch button{white-space:nowrap;border:1px solid #d9ded4;background:#fff;border-radius:999px;padding:5px 11px;font:600 12.5px inherit;cursor:pointer;color:#344}
  #tvc .ch button.on{background:var(--tv-osc);color:#fff;border-color:var(--tv-osc)}
  #tvc .ls{overflow:auto;flex:1;padding:10px 14px 30px}
  #tvc .cd{background:#fff;border-radius:14px;margin:10px 0;box-shadow:0 1px 3px #0001,0 4px 14px #0e3a200d;border-left:5px solid var(--tv-nar);overflow:hidden;transition:opacity .3s}
  #tvc .cd.rb{border-left-color:#c8cec2}#tvc .cd.ok{opacity:.5;border-left-color:var(--tv-lim)}
  #tvc .cd .top{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 14px 4px}#tvc .cd .nm{font-weight:700;font-size:15px}#tvc .cd .id{color:var(--tv-gri);font-size:12px;font-weight:600}
  #tvc .cd .tt{font-weight:800;font-size:17px;color:var(--tv-osc)}
  #tvc .cd .mt{padding:0 14px;color:#4b5563;font-size:12.5px;display:flex;flex-wrap:wrap;gap:4px 12px}
  #tvc .cd .pr{padding:6px 14px 0;display:flex;flex-wrap:wrap;gap:6px}#tvc .cd .pr .lp{display:block;width:100%;background:#f6f8ee;color:#1f2a05;font-weight:500;font-size:13px;padding:5px 9px}#tvc .cd .pr .lp b{color:var(--tv-osc)}#tvc .cd .pr .lp em{font-style:normal;font-weight:700;color:var(--tv-ver);float:right}
  #tvc .cd .pr span{background:#f0f9d4;color:#3a4a05;border-radius:7px;padding:2px 8px;font-size:12.5px;font-weight:600}
  #tvc .cd .hs{border-radius:7px;padding:2px 8px;font-size:12px;font-weight:700}.hs.b{background:#dcfce7;color:#166534}.hs.m{background:#fef3c7;color:#92400e}.hs.x{background:#fee2e2;color:#991b1b}.hs.n{background:#eef0f3;color:#4b5563}
  #tvc .cd .dr{padding:6px 14px 0;font-size:12.5px;color:#374151}
  #tvc .cd .qh{margin:10px 14px 0;background:#fff3ef;border:1px solid #ffcfc2;border-radius:10px;padding:9px 11px}
  #tvc .cd .qh b{display:block;color:#9a3d00;font-size:13.5px}#tvc .cd .qh .qt{font-weight:800;color:#9a3d00;font-size:12px;text-transform:uppercase;letter-spacing:.3px}
  #tvc .cd .qh ol{margin:6px 0 6px 18px;padding:0;color:#5a2600;font-weight:600;font-size:13.5px}#tvc .cd .qh li{margin:3px 0}
  #tvc .cd .qh .dc{background:#fff;border:1px dashed #ffb27a;border-radius:8px;padding:7px 9px;margin:6px 0;font-size:12.5px;color:#333}#tvc .cd .qh .dc span{display:block;font-weight:700;color:var(--tv-ver);font-size:11.5px;margin-bottom:2px}
  #tvc .tvchat{padding:0 14px 6px}#tvc .tvchat .msgc{color:#6b7280;font-size:12.5px;padding:6px 0}
  #tvc .tvchat .hilo{max-height:320px;overflow:auto;background:#fafafd;border-radius:10px;padding:4px 8px;margin-top:6px}
  #tvc .tvchat .esc{display:flex;gap:6px;margin-top:6px}#tvc .tvchat textarea{flex:1;border:1px solid #d9d9e3;border-radius:9px;padding:7px 9px;font:13px inherit;resize:vertical}
  #tvc .bur{max-width:85%;margin:6px 0;padding:7px 10px;border-radius:12px;font-size:13px}#tvc .bur small{display:block;color:#6b7280;font-size:10.5px;margin-top:2px}
  #tvc .bur.cl{background:#eef0ff;border-top-left-radius:3px}#tvc .bur.yo{background:#f0f9d4;margin-left:auto;border-top-right-radius:3px}
  .tv-vc{background:#e7e7ff!important;color:#2b2b6b!important}
  .tv-ojo{background:#9ca3af!important;color:#fff!important}
  .tvi{width:16px;height:16px;vertical-align:-3px;flex:none}#tvc .lg .tvi,#tvc-btn .ic .tvi{width:20px;height:20px}#tvc .cd .qh small{color:#8a5a3a;font-size:12px}
  #tvc .cd.rb .qh{background:#f3f4f2;border-color:#e2e5df}#tvc .cd.rb .qh b{color:#4b5563}
  #tvc .cd .ac{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px 12px}
  #tvc .cd .ac button,#tvc .cd .ac a{white-space:nowrap;border:0;border-radius:9px;padding:8px 12px;font:700 12.5px inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
  .tv-ok{background:var(--tv-osc);color:var(--tv-lim)!important;flex:1;justify-content:center}.tv-ok:hover{background:#000}
  .tv-pr{background:var(--tv-nar);color:#fff!important}.tv-sec{background:#eef1ec;color:#1f2a1f!important}.tv-sec:hover{background:#e2e7de}
  #tvc .vc{text-align:center;color:var(--tv-gri);padding:40px 20px}#tvc .vc div{font-size:40px}
  #tvc-md{position:fixed;inset:0;z-index:100002;background:#0e3a2066;display:none;place-items:center;font:14px 'Segoe UI',system-ui,sans-serif}
  #tvc-md .bx{background:#fff;border-radius:16px;width:380px;max-width:92vw;padding:20px;box-shadow:0 20px 60px #0005}
  #tvc-md h3{margin:0 0 8px;color:var(--tv-osc)}#tvc-md .rs{background:var(--tv-fon);border-radius:10px;padding:10px 12px;font-size:13px;margin:8px 0 14px}
  #tvc-md .bt{display:flex;gap:8px;justify-content:flex-end}#tvc-md button{border:0;border-radius:9px;padding:9px 14px;font:700 13px inherit;cursor:pointer}
  #tvc-ts{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:100003;background:var(--tv-osc);color:#fff;padding:10px 16px;border-radius:10px;font:600 13.5px 'Segoe UI',system-ui;display:none;box-shadow:0 8px 24px #0004}`;

  const I = (d) => `<svg class="tvi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = { bolt: I('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'), ok: I('<path d="M20 6 9 17l-5-5"/>'), chat: I('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    send: I('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'), copy: I('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'),
    tag: I('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'), pin: I('<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
    truck: I('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>'), phone: I('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
    home: I('<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>'), refresh: I('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'), x: I('<path d="M18 6 6 18M6 6l12 12"/>'),
    alert: I('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'), list: I('<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>') };
  let pedidos = [], filtro = 'Para ti', busca = '', actual = '';
  const toast = (t) => { const e = document.getElementById('tvc-ts'); e.textContent = t; e.style.display = 'block'; clearTimeout(e._t); e._t = setTimeout(() => e.style.display = 'none', 2600); };
  const corto = (q) => /llam/i.test(q) ? '📞 Llamar' : /plata|pago|banco/i.test(q) ? '💰 Pago' : /precio/i.test(q) ? '💲 Precio' : /cantidad/i.test(q) ? '📦 Cantidad'
    : /direcc|oficina/i.test(q) ? '📍 Dirección' : /devolverla al bot|conversaci/i.test(q) ? '💬 Chat abierto' : /abono|devuelve/i.test(q) ? '🔁 Abono' : /Ronald/i.test(q) ? '👤 Ronald' : /robot/i.test(q) ? 'Robot revisando' : '🔎 Revisar';
  const pasos = (q) => q.split(/\s*\d\)\s+/).filter(Boolean).map(x => `<li>${x.replace(/\.$/, '')}</li>`).join('');
  function historial(o) {
    const t = +o.client_total_orders || 0, e = +o.client_total_orders_delivered || 0, d = +o.client_total_orders_returneds || 0;
    if (!(e + d)) return `<span class="hs n">Cliente nuevo</span>`;
    const p = Math.round(100 * e / (e + d)); return `<span class="hs ${p >= 70 ? 'b' : p > 50 ? 'm' : 'x'}">Recibe ${e} de ${e + d} (${p} %)</span>`;
  }
  // Universal: sirve en cualquier tienda de Dropi. Si un robot dejó nota («🤖 ROBOT · POR QUÉ · QUÉ HACER · QUIÉN · DECIR»), manda la nota;
  // si no, la extensión revisa sola los datos del pedido (historial del cliente, dirección, repetidos) y propone los pasos.
  const firma = () => `soy ${CFG.nombre || 'del equipo'}${CFG.tienda ? ' de ' + CFG.tienda : ''}`;
  function propio(o) {
    const e = +o.client_total_orders_delivered || 0, d = +o.client_total_orders_returneds || 0, n = (o.name || '').split(' ')[0];
    const pasos = [], por = []; let decir = '';
    if (d > e) { por.push(`devolvió ${d} y recibió ${e}`); pasos.push('NO confirmar todavía: pedir un abono o llamar para asegurar que lo va a recibir'); decir = `Hola ${n}, ${firma()} 🙌 Te escribimos por tu pedido. Para despacharlo te pedimos un abono; el resto lo pagas al recibir. ¿Te comparto los datos?`; }
    const dir = String(o.dir || '');
    if (!/oficina|reclama/i.test(dir) && !/\d+\s*[a-z]?\s*-\s*\d+|#\s*\d+|casa\s*\d+|mz/i.test(dir)) { por.push('la dirección no tiene número de casa'); pasos.push('Pedir la dirección completa con número de casa y un punto de referencia, y corregirla'); decir = decir || `Hola ${n}, ${firma()}. Para despachar tu pedido nos falta la dirección completa: calle, número de casa, barrio y un punto de referencia. ¿Nos la compartes?`; }
    if (+o.ordenes_repetidas > 0 || (Array.isArray(o.ordenes_repetidas) && o.ordenes_repetidas.length)) { por.push('tiene otro pedido parecido'); pasos.push('Preguntar si son dos pedidos o uno repetido'); }
    if (!pasos.length) { pasos.push('Revisar el chat del cliente: que haya aceptado producto, precio y dirección'); decir = `Hola ${n}, ${firma()}. Tu pedido ya está listo para despachar hoy. ¿Nos confirmas con un SÍ para enviarlo?`; }
    if (!/NO confirmar/.test(pasos.join())) pasos.push('Si todo queda bien, tocar Confirmar pedido');
    return { que: pasos.map((p, i) => `${i + 1}) ${p}.`).join(' '), por: por.join(', ') || 'sin revisión automática', decir };
  }
  function info(o) {
    const nota = String(o.notes || '').split(' | ').find(x => x.startsWith('🤖 ROBOT')) || '';
    if (nota) { const que = parte(nota, 'QUÉ HACER'); return { nota, que, por: parte(nota, 'POR QUÉ'), quien: parte(nota, 'QUIÉN') || 'Equipo', decir: parte(nota, 'DECIR'), tipo: corto(que), robot: true }; }
    const recien = Date.now() - new Date(o.created_at).getTime() < 40 * 60 * 1000;   // el robot pasa cada 15-30 min
    if (recien && window.__tvRobot) return { nota: '', que: 'El robot lo está revisando. Espera unos minutos.', tipo: 'Robot revisando', robot: true };
    const pr = propio(o); const e = estado[o.id]; let que = pr.que, por = pr.por, tipo = corto(pr.que);
    if (e) {
      por = `chat real: el cliente dijo ${e.ult}` + (pr.por !== 'sin revisión automática' ? `; ${pr.por}` : '');
      if (e.no) { que = '1) En el chat dijo que no o que después: llamar y preguntar si de verdad no lo quiere.'; tipo = '✋ Dijo que no'; }
      else if (e.si && !/NO confirmar/.test(pr.que)) { que = '1) El cliente ya dijo SÍ en el chat: revisa producto, precio y dirección. 2) Toca Confirmar pedido.'; tipo = '✅ Dijo que sí'; }
      else if (e.nada) { que = '1) Aún no responde al resumen: envíale el mensaje listo. 2) Cuando diga sí, toca Confirmar pedido.'; tipo = '⏳ Sin respuesta'; }
    }
    return { nota: 'propio', que, por, quien: 'Equipo', decir: pr.decir, tipo, robot: false };
  }
  async function cargarSilencio() {   // trae los pendientes sin abrir el panel (para el contador del botón y la voz)
    auth = tokLS() || auth; if (!auth || !userId) return;
    const f = (d) => d.toISOString().slice(0, 10);
    const r = await api('GET', `/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=300&start=0&textToSearch=&status=PENDIENTE%20CONFIRMACION&supplier_id=false&user_id=${userId}&from=${f(new Date(Date.now() - 10 * 864e5))}&until=${f(new Date(Date.now() + 864e5))}&filter_date_by=FECHA%20DE%20CREADO`);
    if (r.s !== 200) return; pedidos = ((r.j || {}).objects || []).filter(o => o.status === 'PENDIENTE CONFIRMACION'); pintar();
  }
  async function cargar() {
    const ls = document.querySelector('#tvc .ls');
    auth = tokLS() || auth;
    if (!auth || !userId) { ls.innerHTML = '<div class="vc"><div>🔑</div>Abre «Mis Pedidos» de Dropi una vez para tomar la sesión y toca 🔄.</div>'; return; }
    ls.innerHTML = '<div class="vc"><div>…</div>Cargando pedidos por confirmar…</div>';
    const f = (d) => d.toISOString().slice(0, 10);
    const r = await api('GET', `/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=300&start=0&textToSearch=&status=PENDIENTE%20CONFIRMACION&supplier_id=false&user_id=${userId}&from=${f(new Date(Date.now() - 10 * 864e5))}&until=${f(new Date(Date.now() + 864e5))}&filter_date_by=FECHA%20DE%20CREADO`);
    if (r.s !== 200) { ls.innerHTML = `<div class="vc"><div>⚠️</div>Dropi respondió con error (${r.s}). Toca 🔄 en un momento.</div>`; return; }
    pedidos = ((r.j || {}).objects || []).filter(o => o.status === 'PENDIENTE CONFIRMACION');
    detalles();   // Ronald 27-11: cantidad y precio a la vista, sin abrir la lupa
    actual = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    pintar();
  }
  // La lista de Dropi no trae cantidad ni precio: se pide el detalle de cada pedido (4 a la vez) y se guarda mientras el panel esté abierto
  const det = {}, tienda = {}, chats = {}, estado = {}, abiertos = new Set();
  async function detalles() {
    const faltan = pedidos.filter(o => !det[o.id]).map(o => o.id);
    for (let i = 0; i < faltan.length; i += 4) {
      await Promise.all(faltan.slice(i, i + 4).map(async (id) => {
        try { const r = await api('GET', '/orders/myorders/' + id); const o = (r.j || {}).objects; if (o) { det[id] = o.orderdetails || []; tienda[id] = String(((o.shop || {}).type || '') + ' ' + ((o.shop || {}).name || '')); } } catch (e) {}
        if (CFG.lucid) await analizar(id);
      }));
      pintar();
    }
  }
  // Ronald 27-11: «que sea real lo que analizo»: se lee el chat de Lucid y se mira qué dijo el cliente después del último resumen
  const SI = /\b(s[ií]+|ok|okey|listo|dale|de una|confirm\w*|correct[oa]|perfecto|claro|bueno|est[aá] bien|as[ií] es|h[aá]gale|env[ií]e\w*)\b/i;
  const NO = /\b(no lo quiero|ya no|cancel\w*|no gracias|despu[eé]s|m[aá]s adelante|no tengo plata)\b/i;
  function mensajes(t) { return String(t || '').split(/\n(?=(?:Yo|Usuario) \()/).filter(x => /^(Yo|Usuario) \(/.test(x)).map(x => ({ yo: x.startsWith('Yo'), h: (x.match(/\(([^)]+)\)/) || [])[1] || '', tx: x.replace(/^(Yo|Usuario) \([^)]*\):\s*/, '').trim() })); }
  async function leerChat(tel) {
    const r = await lucidApi(`/contacts/${CFG.pais || '57'}${tel}/messages?limit=30`);
    if (!r.ok) return null; chats[tel] = mensajes(typeof r.data === 'string' ? r.data : JSON.stringify(r.data || '')); return chats[tel];
  }
  async function analizar(id) {
    const o = pedidos.find(x => x.id == id); if (!o || !CFG.lucid) return;
    const tel = String(o.phone || '').slice(-10); const ms = chats[tel] || await leerChat(tel); if (!ms) return;
    let k = -1; ms.forEach((m, i) => { if (m.yo && /Resumen de tu pedido|Tu pedido ya est[aá]/i.test(m.tx)) k = i; });
    const tras = ms.slice(k + 1).filter(m => !m.yo).map(m => m.tx);
    const ult = ms.filter(m => !m.yo).slice(-1)[0];
    estado[id] = { si: tras.some(t => SI.test(t) && t.length < 120), no: tras.some(t => NO.test(t)), resumen: k >= 0, nada: k >= 0 && !tras.length, ult: ult ? `«${ult.tx.slice(0, 90)}» (${ult.h})` : 'sin mensajes del cliente' };
  }
  function productos(o) {
    const ds = det[o.id];
    if (!ds) return (o.orderdetails || []).map(d => `<span>${((d.variation || {}).attribute_values || []).map(a => a.value).join(' ') || (d.product || {}).name || 'producto'} · cargando…</span>`).join('');
    return ds.map(d => {
      const q = Math.round(+d.quantity || 1), pu = +d.price || 0;
      const pres = ((d.variation || {}).attribute_values || []).map(a => a.value).join(' ') || '';
      const nom = String((d.product || {}).name || 'Producto');
      return `<span class="lp"><b>${q} ×</b> ${nom}${pres ? ' · ' + pres : ''} <em>${plata(pu)} c/u = ${plata(pu * q)}</em></span>`;
    }).join('');
  }
  function avisar(n) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime); o.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.5);
      setTimeout(() => { const u = new SpeechSynthesisUtterance(n > 1 ? `${n} pedidos nuevos por confirmar` : 'Nuevo pedido por confirmar'); u.lang = 'es-CO'; u.rate = 1; speechSynthesis.speak(u); }, 550);
    } catch (e) {}
    toast(n > 1 ? `🔔 ${n} pedidos nuevos por confirmar` : '🔔 Nuevo pedido por confirmar');
  }
  function pintar() {
    const p = document.getElementById('tvc'); if (!p) return;
    window.__tvRobot = pedidos.some(o => String(o.notes || '').includes('🤖 ROBOT'));
    const it = pedidos.filter(o => !tienda[o.id] || /lucid/i.test(tienda[o.id])).map(o => ({ o, ...info(o) }));   // Ronald 27-11: solo pedidos que vienen de Lucid Bot
    const tuyos = it.filter(x => x.tipo !== 'Robot revisando');
    p.querySelector('.kpi').innerHTML = `<div><span>${tuyos.length}</span><em>Para resolver</em></div><div><span>${it.filter(x => /NO confirmar/.test(x.que)).length}</span><em>Esperan abono</em></div><div><span>${it.length - tuyos.length}</span><em>Robot revisando</em></div>`;
    p.querySelector('.hd small').textContent = `${it.length} pendientes de confirmar · actualizado ${actual}`;
    const n = document.querySelector('#tvc-btn .n'); if (n) n.textContent = tuyos.length;
    // Ronald 27-11: «sonido de nuevo pedido por confirmar, así como una nota de voz»
    if (window.__tvAntes !== undefined && tuyos.length > window.__tvAntes) avisar(tuyos.length - window.__tvAntes);
    window.__tvAntes = tuyos.length;
    const tipos = {}; it.forEach(x => tipos[x.tipo] = (tipos[x.tipo] || 0) + 1);
    const chips = ['Para ti', ...Object.keys(tipos).filter(t => t !== 'Robot revisando').sort((a, b) => tipos[b] - tipos[a]), ...(tipos['Robot revisando'] ? ['Robot revisando'] : []), 'Todos'];
    const cuenta = (t) => t === 'Todos' ? it.length : t === 'Para ti' ? tuyos.length : tipos[t];
    p.querySelector('.ch').innerHTML = chips.map(t => `<button data-f="${t}" class="${t === filtro ? 'on' : ''}">${t} · ${cuenta(t)}</button>`).join('');
    const q = busca.toLowerCase();
    const vis = it.filter(x => (filtro === 'Todos' || (filtro === 'Para ti' ? x.tipo !== 'Robot revisando' : x.tipo === filtro)) && (!q || `${x.o.id} ${x.o.name} ${x.o.surname} ${x.o.phone} ${x.o.city}`.toLowerCase().includes(q)))
      .sort((a, b) => a.o.id - b.o.id);
    const ls = p.querySelector('.ls');
    if (!vis.length) { ls.innerHTML = `<div class="vc"><div>${IC.ok}</div>${it.length ? (filtro === 'Para ti' ? '¡Nada pendiente para ti! El robot está con el resto.' : 'Nada con ese filtro.') : 'No hay pedidos pendientes de confirmar.'}</div>`; return; }
    const tit = (x) => String(x || '').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    ls.innerHTML = vis.map(({ o, que, por, quien, decir, tipo, robot }) => {
      const tel = String(o.phone || '').slice(-10);
      const prods = productos(o);
      const nuevo = (String(que).match(/precio en Dropi a \$([\d.]+)/) || [])[1];
      const chat = lucid(tel); const espera = tipo === 'Robot revisando'; const ojo = /NO confirmar/.test(que);
      return `<div class="cd ${espera ? 'rb' : ''}" data-id="${o.id}">
        <div class="top"><div><div class="nm">${tit(o.name)} ${tit(o.surname)}</div><div class="id">#${o.id} · ${new Date(o.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div><div class="tt">${plata(o.total_order)}</div></div>
        <div class="mt"><span>${IC.pin} ${tit(o.city)}, ${tit(o.state)}</span><span>${IC.truck} ${tit((o.distribution_company || {}).name) || '—'}</span><span>${IC.phone} ${tel}</span></div>
        <div class="pr">${prods}${historial(o)}</div>
        <div class="dr">${IC.home} ${o.dir || ''}</div>
        <div class="qh">${espera ? `<b>${que}</b>` : `<div class="qt">${IC.list} Qué hacer · ${quien}${robot ? '' : ' · revisión de la extensión'}</div><ol>${pasos(que)}</ol>${decir ? `<div class="dc"><span>${IC.chat} Mensaje listo para el cliente</span>${decir}</div>` : ''}<small>Por qué: ${por}</small>`}</div>
        <div class="ac"><button class="tv-ok ${ojo ? 'tv-ojo' : ''}" data-acc="ok">${ojo ? IC.alert + ' Confirmar igual' : IC.ok + ' Confirmar pedido'}</button>
          ${nuevo ? `<button class="tv-pr" data-acc="precio" data-v="${nuevo.replace(/\./g, '')}">${IC.tag} Precio a $${nuevo}</button>` : ''}
          ${chat ? `<a class="tv-sec" target="_blank" href="${chat}">${IC.chat} Abrir en Lucid</a>` : (CFG.lucid ? '' : `<button class="tv-sec tv-aprender">${IC.chat} Abrir en Lucid</button>`)}
          ${tel ? `<a class="tv-sec" target="_blank" href="https://wa.me/57${tel}${decir ? '?text=' + encodeURIComponent(decir) : ''}">${IC.send} ${decir ? 'Enviar mensaje' : 'WhatsApp'}</a>` : ''}
          ${CFG.lucid && tel ? `<button class="tv-sec tv-vc" data-acc="verchat" data-tel="${tel}">${IC.chat} Ver y escribir chat</button>` : ''}
          ${CFG.lucid && tel && decir ? `<button class="tv-sec" data-acc="lucid" data-tel="${tel}" data-t="${encodeURIComponent(decir)}">${IC.send} Enviar por Lucid</button>` : ''}
          ${decir ? `<button class="tv-sec" data-acc="copiar" data-t="${encodeURIComponent(decir)}">${IC.copy} Copiar</button>` : ''}</div><div class="tvchat" data-chat="${o.id}"></div></div>`;
    }).join('');
    ls.querySelectorAll('.cd').forEach(cd => { if (abiertos.has(cd.dataset.id)) { const o = pedidos.find(x => String(x.id) === cd.dataset.id); if (o) mostrarChat(cd, String(o.phone || '').slice(-10), false); } });
  }
  async function anotar(id, texto) {
    const g = await api('GET', '/orders/myorders/' + id); const o = (g.j || {}).objects || {};
    await api('PUT', '/orders/myorders/' + id, { notes: (`✋ ${texto} desde el Confirmador ${hora()} | ` + (o.notes || '')).slice(0, 1000) });
  }
  function modal(titulo, html, si) {
    const m = document.getElementById('tvc-md');
    m.innerHTML = `<div class="bx"><h3>${titulo}</h3><div class="rs">${html}</div><div class="bt"><button class="tv-sec" data-m="no">Cancelar</button><button class="tv-ok" data-m="si">${si}</button></div></div>`;
    m.style.display = 'grid';
    return new Promise(res => { m.onclick = (e) => { const b = e.target.dataset.m; if (b || e.target === m) { m.style.display = 'none'; res(b === 'si'); } }; });
  }
  async function mostrarChat(cd, tel, recargar) {
    const box = cd.querySelector('.tvchat'); if (!box) return;
    if (recargar || !chats[tel]) { box.innerHTML = '<div class="msgc">Cargando chat…</div>'; await leerChat(tel); }
    const ms = (chats[tel] || []).slice(-15);
    const txt = (m) => m.tx.replace(/\[Complex Message\] Check inbox for details\./g, '📨 (plantilla o mensaje con botones)').replace(/</g, '&lt;').replace(/\n/g, '<br>');
    const borr = (box.querySelector('textarea') || {}).value || '';
    box.innerHTML = `<div class="hilo">${ms.map(m => `<div class="bur ${m.yo ? 'yo' : 'cl'}"><div>${txt(m)}</div><small>${m.yo ? 'Tienda' : 'Cliente'} · ${m.h}</small></div>`).join('') || '<div class="msgc">Sin mensajes (o falta la clave de Lucid en Opciones).</div>'}</div>
      <div class="esc"><textarea rows="2" placeholder="Escribe al cliente…">${borr.replace(/</g, '&lt;')}</textarea><button class="tv-ok" data-acc="escribir" data-tel="${tel}">Enviar</button></div>`;
    const h = box.querySelector('.hilo'); h.scrollTop = h.scrollHeight;
  }
  async function accion(btn) {
    const cd = btn.closest('.cd'); const id = cd.dataset.id; const o = pedidos.find(x => String(x.id) === id) || {};
    if (btn.dataset.acc === 'verchat') { if (abiertos.has(id)) { abiertos.delete(id); cd.querySelector('.tvchat').innerHTML = ''; return; } abiertos.add(id); await mostrarChat(cd, btn.dataset.tel, true); return; }
    if (btn.dataset.acc === 'escribir') {
      const inp = cd.querySelector('.tvchat textarea'); const txt = (inp.value || '').trim(); if (!txt) return;
      btn.disabled = true; btn.textContent = 'Enviando…';
      const r = await lucidApi(`/contacts/${CFG.pais || '57'}${btn.dataset.tel}/send_content`, 'POST', { messages: [{ message: { text: txt } }] });
      btn.disabled = false; btn.textContent = 'Enviar';
      if (r.ok && JSON.stringify(r.data).includes('true')) { inp.value = ''; toast('Enviado por Lucid ✔'); await anotar(id, 'Mensaje enviado por Lucid'); await mostrarChat(cd, btn.dataset.tel, true); }
      else toast('Lucid no lo envió: el chat lleva más de 24 h cerrado. Usa «Enviar mensaje» por WhatsApp.');
      return;
    }
    if (btn.dataset.acc === 'lucid') {
      const txt = decodeURIComponent(btn.dataset.t);
      if (!await modal('¿Enviar este mensaje por Lucid?', txt.replace(/</g, '&lt;'), 'Sí, enviar')) return;
      const r = await lucidApi(`/contacts/${CFG.pais || '57'}${btn.dataset.tel}/send_content`, 'POST', { messages: [{ message: { text: txt } }] });
      if (r.ok && JSON.stringify(r.data).includes('true')) { await anotar(cd.dataset.id, 'Mensaje enviado por Lucid'); toast('Mensaje enviado por Lucid ✔'); btn.textContent = 'Enviado ✔'; btn.disabled = true; }
      else toast('Lucid no lo envió: el chat lleva más de 24 h cerrado. Usa «Enviar mensaje» por WhatsApp.');
      return;
    }
    if (btn.dataset.acc === 'copiar') { try { await navigator.clipboard.writeText(decodeURIComponent(btn.dataset.t)); toast('Mensaje copiado: pégalo en el chat del cliente'); } catch (e) { toast('No se pudo copiar'); } return; }
    const res = `<b>${o.name || ''} ${o.surname || ''}</b> · #${id}<br>${plata(o.total_order)} · ${(o.city || '')} · ${(o.distribution_company || {}).name || ''}<br>${o.dir || ''}`;
    if (btn.dataset.acc === 'ok') {
      if (!await modal('¿Confirmar este pedido?', res + '<br><br>Revisa producto, precio y dirección antes de confirmar.', '✅ Sí, confirmar')) return;
      btn.disabled = true; btn.textContent = 'Confirmando…';
      const r = await api('PUT', '/orders/myorders/' + id, { status: 'PENDIENTE' });
      if (r.s === 200) { await anotar(id, 'Confirmado'); cd.classList.add('ok'); btn.textContent = '✔ Confirmado'; toast(`Pedido #${id} confirmado`); pedidos = pedidos.filter(x => String(x.id) !== id); setTimeout(pintar, 1500); }
      else { btn.disabled = false; btn.textContent = '✅ Confirmar pedido'; toast(`Dropi no dejó confirmar (código ${r.s}). Hazlo desde Dropi.`); }
    }
    if (btn.dataset.acc === 'copiar') { try { await navigator.clipboard.writeText(decodeURIComponent(btn.dataset.t)); toast('Mensaje copiado: pégalo en el chat del cliente'); } catch (e) { toast('No se pudo copiar'); } return; }
    if (btn.dataset.acc === 'precio') {
      const v = +btn.dataset.v;
      if (!await modal('¿Cambiar el precio?', res + `<br><br>Nuevo total: <b>${plata(v)}</b> (lo que aceptó en el chat).`, '💲 Sí, cambiar')) return;
      btn.disabled = true; btn.textContent = 'Cambiando…';
      const r = await api('PUT', '/orders/myorders/' + id, { total_order: v });
      if (r.s === 200) { await anotar(id, `Precio cambiado a ${plata(v)}`); o.total_order = v; toast(`Precio del #${id} cambiado a ${plata(v)}`); pintar(); }
      else { btn.disabled = false; toast(`Dropi no dejó cambiar el precio (código ${r.s}). Cámbialo con «Editar».`); }
    }
  }
  function montar() {
    if (!document.body || document.getElementById('tvc-btn')) return;
    document.head.appendChild(css);
    const b = document.createElement('button'); b.id = 'tvc-btn'; b.innerHTML = `<span class="ic">${IC.bolt}</span>Confirma+ <span class="n">·</span>`; document.body.appendChild(b);
    const p = document.createElement('div'); p.id = 'tvc';
    p.innerHTML = `<div class="hd"><div class="r1"><div class="lg">${IC.bolt}</div><b>Confirma+ <span style="color:var(--tv-lim)">para Dropi</span><small>Pedidos pendientes</small></b><button data-x="r" title="Actualizar">${IC.refresh}</button><button data-x="c" title="Cerrar">${IC.x}</button></div><div class="kpi"></div></div>
      <div class="tl"><input placeholder="Buscar por nombre, teléfono, ciudad o #pedido"><div class="ch"></div></div><div class="ls"></div>`;
    document.body.appendChild(p);
    const md = document.createElement('div'); md.id = 'tvc-md'; document.body.appendChild(md);
    const ts = document.createElement('div'); ts.id = 'tvc-ts'; document.body.appendChild(ts);
    b.onclick = () => { p.style.display = 'flex'; cargar(); };
    p.querySelector('input').oninput = (e) => { busca = e.target.value; pintar(); };
    p.addEventListener('click', (ev) => {
      let t = ev.target.closest('button,a') || ev.target;
      const x = t.closest && t.closest('[data-x]'); if (x) t = x;
      if (t.dataset.x === 'c') p.style.display = 'none'; if (t.dataset.x === 'r') cargar();
      if (t.dataset.f) { filtro = t.dataset.f; pintar(); }
      if (t.dataset.acc) accion(t);
      if (t.classList && t.classList.contains('tv-aprender') && window.tvAprenderLucid) { window.tvAprenderLucid().then(ok => { if (ok) { toast('Listo: el botón ya abre el chat de cada cliente en Lucid'); pintar(); } }); }
    });
    setInterval(() => { if (p.style.display === 'flex') cargar(); }, 5 * 60 * 1000);
    // Ronald 27-11: desde el recuadro naranja de cada pedido (aunque el panel esté cerrado) se abre directo ese pedido con su chat
    window.tvAbrir = async (id) => { p.style.display = 'flex'; filtro = 'Todos'; busca = String(id); p.querySelector('input').value = busca; abiertos.add(String(id)); await cargar(); };
    document.addEventListener('click', (ev) => { const a = ev.target.closest && ev.target.closest('.tv-abrir'); if (a) { ev.preventDefault(); ev.stopPropagation(); window.tvAbrir(a.dataset.id); } }, true);   // se actualiza solo cada 5 minutos
  }
  setInterval(montar, 1500);
})();
