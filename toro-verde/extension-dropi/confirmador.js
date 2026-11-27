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
  const plata = (n) => '$' + Math.round(+n || 0).toLocaleString('es-CO');
  const parte = (t, k) => { const m = String(t || '').match(new RegExp(k + ':\\s*([^·|]+)')); return m ? m[1].trim() : ''; };
  const lucid = (tel) => { let m = ''; try { m = localStorage.getItem('tv_lucid_url') || ''; } catch (e) {} return m ? m.replace('{tel}', '57' + tel) : ''; };
  const hora = () => new Date().toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

  // ───────── Diseño Toro Verde (Ronald 27-11: «diseño único, buena experiencia de usuario») ─────────
  const css = document.createElement('style');
  css.textContent = `
  :root{--tv-osc:#0e3a20;--tv-ver:#16592f;--tv-lim:#9ccc24;--tv-nar:#ff7a1a;--tv-roj:#e5484d;--tv-gri:#6b7280;--tv-fon:#f3f5f0}
  #tvc-btn{position:fixed;right:22px;bottom:96px;z-index:100000;display:flex;align-items:center;gap:10px;background:var(--tv-osc);color:#fff;border:0;border-radius:999px;padding:12px 18px 12px 14px;font:700 15px 'Segoe UI',system-ui,sans-serif;box-shadow:0 10px 30px #0e3a2066;cursor:pointer;transition:transform .15s}
  #tvc-btn:hover{transform:translateY(-2px)}#tvc-btn .ic{width:30px;height:30px;border-radius:50%;background:var(--tv-lim);display:grid;place-items:center;font-size:17px}
  #tvc-btn .n{background:var(--tv-nar);border-radius:999px;padding:1px 8px;font-size:13px}
  #tvc{position:fixed;top:0;right:0;width:520px;max-width:100vw;height:100vh;z-index:100001;background:var(--tv-fon);box-shadow:-12px 0 40px #0004;display:none;flex-direction:column;font:14px/1.45 'Segoe UI',system-ui,sans-serif;color:#1f2a1f;animation:tvin .2s ease}
  @keyframes tvin{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
  #tvc .hd{background:linear-gradient(135deg,var(--tv-osc),var(--tv-ver));color:#fff;padding:16px 18px 14px}
  #tvc .hd .r1{display:flex;align-items:center;gap:10px}#tvc .hd .lg{width:36px;height:36px;border-radius:10px;background:var(--tv-lim);display:grid;place-items:center;font-size:20px}
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
  #tvc .cd .pr{padding:6px 14px 0;display:flex;flex-wrap:wrap;gap:6px}#tvc .cd .pr span{background:#eef6dd;color:#2e4a10;border-radius:7px;padding:2px 8px;font-size:12.5px;font-weight:600}
  #tvc .cd .hs{border-radius:7px;padding:2px 8px;font-size:12px;font-weight:700}.hs.b{background:#dcfce7;color:#166534}.hs.m{background:#fef3c7;color:#92400e}.hs.x{background:#fee2e2;color:#991b1b}.hs.n{background:#eef0f3;color:#4b5563}
  #tvc .cd .dr{padding:6px 14px 0;font-size:12.5px;color:#374151}
  #tvc .cd .qh{margin:10px 14px 0;background:#fff4ea;border:1px solid #ffd7b8;border-radius:10px;padding:9px 11px}
  #tvc .cd .qh b{display:block;color:#9a3d00;font-size:13.5px}#tvc .cd .qh .qt{font-weight:800;color:#9a3d00;font-size:12px;text-transform:uppercase;letter-spacing:.3px}
  #tvc .cd .qh ol{margin:6px 0 6px 18px;padding:0;color:#5a2600;font-weight:600;font-size:13.5px}#tvc .cd .qh li{margin:3px 0}
  #tvc .cd .qh .dc{background:#fff;border:1px dashed #ffb27a;border-radius:8px;padding:7px 9px;margin:6px 0;font-size:12.5px;color:#333}#tvc .cd .qh .dc span{display:block;font-weight:700;color:var(--tv-ver);font-size:11.5px;margin-bottom:2px}
  .tv-ojo{background:#9ca3af!important}#tvc .cd .qh small{color:#8a5a3a;font-size:12px}
  #tvc .cd.rb .qh{background:#f3f4f2;border-color:#e2e5df}#tvc .cd.rb .qh b{color:#4b5563}
  #tvc .cd .ac{display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px 12px}
  #tvc .cd .ac button,#tvc .cd .ac a{border:0;border-radius:9px;padding:8px 12px;font:700 12.5px inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
  .tv-ok{background:var(--tv-ver);color:#fff!important;flex:1;justify-content:center}.tv-ok:hover{background:var(--tv-osc)}
  .tv-pr{background:var(--tv-nar);color:#fff!important}.tv-sec{background:#eef1ec;color:#1f2a1f!important}.tv-sec:hover{background:#e2e7de}
  #tvc .vc{text-align:center;color:var(--tv-gri);padding:40px 20px}#tvc .vc div{font-size:40px}
  #tvc-md{position:fixed;inset:0;z-index:100002;background:#0e3a2066;display:none;place-items:center;font:14px 'Segoe UI',system-ui,sans-serif}
  #tvc-md .bx{background:#fff;border-radius:16px;width:380px;max-width:92vw;padding:20px;box-shadow:0 20px 60px #0005}
  #tvc-md h3{margin:0 0 8px;color:var(--tv-osc)}#tvc-md .rs{background:var(--tv-fon);border-radius:10px;padding:10px 12px;font-size:13px;margin:8px 0 14px}
  #tvc-md .bt{display:flex;gap:8px;justify-content:flex-end}#tvc-md button{border:0;border-radius:9px;padding:9px 14px;font:700 13px inherit;cursor:pointer}
  #tvc-ts{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:100003;background:var(--tv-osc);color:#fff;padding:10px 16px;border-radius:10px;font:600 13.5px 'Segoe UI',system-ui;display:none;box-shadow:0 8px 24px #0004}`;

  let pedidos = [], filtro = 'Todos', busca = '', actual = '';
  const toast = (t) => { const e = document.getElementById('tvc-ts'); e.textContent = t; e.style.display = 'block'; clearTimeout(e._t); e._t = setTimeout(() => e.style.display = 'none', 2600); };
  const corto = (q) => /llam/i.test(q) ? '📞 Llamar' : /plata|pago|banco/i.test(q) ? '💰 Pago' : /precio/i.test(q) ? '💲 Precio' : /cantidad/i.test(q) ? '📦 Cantidad'
    : /direcc|oficina/i.test(q) ? '📍 Dirección' : /devolverla al bot|conversaci/i.test(q) ? '💬 Chat abierto' : /abono|devuelve/i.test(q) ? '🔁 Abono' : /Ronald/i.test(q) ? '👤 Ronald' : /robot/i.test(q) ? '🤖 Robot revisando' : '🔎 Revisar';
  const pasos = (q) => q.split(/\s*\d\)\s+/).filter(Boolean).map(x => `<li>${x.replace(/\.$/, '')}</li>`).join('');
  function historial(o) {
    const t = +o.client_total_orders || 0, e = +o.client_total_orders_delivered || 0, d = +o.client_total_orders_returneds || 0;
    if (!(e + d)) return `<span class="hs n">Cliente nuevo</span>`;
    const p = Math.round(100 * e / (e + d)); return `<span class="hs ${p >= 70 ? 'b' : p > 50 ? 'm' : 'x'}">Recibe ${e} de ${e + d} (${p} %)</span>`;
  }
  function info(o) {
    const nota = String(o.notes || '').split(' | ').find(x => x.startsWith('🤖 ROBOT')) || '';
    const que = nota ? parte(nota, 'QUÉ HACER') : 'El robot lo está revisando en este momento. Espera la próxima vuelta o confírmalo tú si ya revisaste el chat.';
    return { nota, que, tipo: nota ? corto(que) : '🤖 Robot revisando' };
  }
  async function cargar() {
    const ls = document.querySelector('#tvc .ls');
    auth = tokLS() || auth;
    if (!auth || !userId) { ls.innerHTML = '<div class="vc"><div>🔑</div>Abre «Mis Pedidos» de Dropi una vez para tomar la sesión y toca 🔄.</div>'; return; }
    ls.innerHTML = '<div class="vc"><div>⏳</div>Cargando pedidos por confirmar…</div>';
    const f = (d) => d.toISOString().slice(0, 10);
    const r = await api('GET', `/orders/myorders/v2?exportAs=orderByRow&orderBy=id&orderDirection=desc&result_number=300&start=0&textToSearch=&status=PENDIENTE%20CONFIRMACION&supplier_id=false&user_id=${userId}&from=${f(new Date(Date.now() - 10 * 864e5))}&until=${f(new Date(Date.now() + 864e5))}&filter_date_by=FECHA%20DE%20CREADO`);
    if (r.s !== 200) { ls.innerHTML = `<div class="vc"><div>⚠️</div>Dropi respondió con error (${r.s}). Toca 🔄 en un momento.</div>`; return; }
    pedidos = ((r.j || {}).objects || []).filter(o => o.status === 'PENDIENTE CONFIRMACION');
    actual = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    pintar();
  }
  function pintar() {
    const p = document.getElementById('tvc'); if (!p) return;
    const it = pedidos.map(o => ({ o, ...info(o) }));
    const conAcc = it.filter(x => x.nota).length;
    p.querySelector('.kpi').innerHTML = `<div><span>${it.length}</span><em>Por confirmar</em></div><div><span>${conAcc}</span><em>Necesitan acción</em></div><div><span>${it.length - conAcc}</span><em>Robot revisando</em></div>`;
    p.querySelector('.hd small').textContent = `Pedidos pendientes · actualizado ${actual}`;
    const n = document.querySelector('#tvc-btn .n'); if (n) n.textContent = it.length;
    const tipos = {}; it.forEach(x => tipos[x.tipo] = (tipos[x.tipo] || 0) + 1);
    p.querySelector('.ch').innerHTML = ['Todos', ...Object.keys(tipos).sort((a, b) => tipos[b] - tipos[a])].map(t => `<button data-f="${t}" class="${t === filtro ? 'on' : ''}">${t}${t === 'Todos' ? ` · ${it.length}` : ` · ${tipos[t]}`}</button>`).join('');
    const q = busca.toLowerCase();
    const vis = it.filter(x => (filtro === 'Todos' || x.tipo === filtro) && (!q || `${x.o.id} ${x.o.name} ${x.o.surname} ${x.o.phone} ${x.o.city}`.toLowerCase().includes(q)))
      .sort((a, b) => (!!b.nota - !!a.nota) || (a.o.id - b.o.id));
    const ls = p.querySelector('.ls');
    if (!vis.length) { ls.innerHTML = `<div class="vc"><div>🎉</div>${it.length ? 'Nada con ese filtro.' : 'No hay pedidos pendientes de confirmar.'}</div>`; return; }
    ls.innerHTML = vis.map(({ o, nota, que, tipo }) => {
      const tel = String(o.phone || '').slice(-10);
      const prods = (o.orderdetails || []).map(d => `<span>${Math.round(+d.quantity || 1)} × ${((d.variation || {}).attribute_values || []).map(a => a.value).join(' ') || (d.product || {}).name || 'producto'}</span>`).join('');
      const nuevo = (que.match(/precio en Dropi a \$([\d.]+)/) || [])[1];
      const chat = lucid(tel); const decir = parte(nota, 'DECIR');
      return `<div class="cd ${nota ? '' : 'rb'}" data-id="${o.id}">
        <div class="top"><div><div class="nm">${(o.name || '') + ' ' + (o.surname || '')}</div><div class="id">#${o.id} · ${new Date(o.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div><div class="tt">${plata(o.total_order)}</div></div>
        <div class="mt"><span>📍 ${(o.city || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}, ${(o.state || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</span><span>🚚 ${(o.distribution_company || {}).name || '—'}</span><span>☎ ${tel}</span></div>
        <div class="pr">${prods}${historial(o)}</div>
        <div class="dr">🏠 ${o.dir || ''}</div>
        <div class="qh">${nota ? `<div class="qt">👉 Qué hacer · ${parte(nota, 'QUIÉN') || 'Karen'}</div><ol>${pasos(que)}</ol>${decir ? `<div class="dc"><span>💬 Mensaje listo para el cliente</span>${decir}</div>` : ''}<small>Por qué lo frenó el robot: ${parte(nota, 'POR QUÉ')}</small>` : `<b>${que}</b>`}</div>
        <div class="ac"><button class="tv-ok ${/NO confirmar/.test(que) ? 'tv-ojo' : ''}" data-acc="ok">${/NO confirmar/.test(que) ? '⚠️ Confirmar igual' : '✅ Confirmar pedido'}</button>
          ${nuevo ? `<button class="tv-pr" data-acc="precio" data-v="${nuevo.replace(/\./g, '')}">💲 Precio a $${nuevo}</button>` : ''}
          ${chat ? `<a class="tv-sec" target="_blank" href="${chat}">💬 Chat Lucid</a>` : `<button class="tv-sec tv-aprender">💬 Chat Lucid</button>`}
          ${tel ? `<a class="tv-sec" target="_blank" href="https://wa.me/57${tel}${decir ? '?text=' + encodeURIComponent(decir) : ''}">📱 ${decir ? 'Enviar mensaje' : 'WhatsApp'}</a>` : ''}
          ${decir ? `<button class="tv-sec" data-acc="copiar" data-t="${encodeURIComponent(decir)}">📋 Copiar mensaje</button>` : ''}</div></div>`;
    }).join('');
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
  async function accion(btn) {
    const cd = btn.closest('.cd'); const id = cd.dataset.id; const o = pedidos.find(x => String(x.id) === id) || {};
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
    const b = document.createElement('button'); b.id = 'tvc-btn'; b.innerHTML = '<span class="ic">🐂</span>Confirmador <span class="n">·</span>'; document.body.appendChild(b);
    const p = document.createElement('div'); p.id = 'tvc';
    p.innerHTML = `<div class="hd"><div class="r1"><div class="lg">🐂</div><b>Confirmador Toro Verde<small>Pedidos pendientes</small></b><button data-x="r" title="Actualizar">🔄</button><button data-x="c" title="Cerrar">✕</button></div><div class="kpi"></div></div>
      <div class="tl"><input placeholder="Buscar por nombre, teléfono, ciudad o #pedido"><div class="ch"></div></div><div class="ls"></div>`;
    document.body.appendChild(p);
    const md = document.createElement('div'); md.id = 'tvc-md'; document.body.appendChild(md);
    const ts = document.createElement('div'); ts.id = 'tvc-ts'; document.body.appendChild(ts);
    b.onclick = () => { p.style.display = 'flex'; cargar(); };
    p.querySelector('input').oninput = (e) => { busca = e.target.value; pintar(); };
    p.addEventListener('click', (ev) => {
      const t = ev.target.closest('button,a') || ev.target;
      if (t.dataset.x === 'c') p.style.display = 'none'; if (t.dataset.x === 'r') cargar();
      if (t.dataset.f) { filtro = t.dataset.f; pintar(); }
      if (t.dataset.acc) accion(t);
      if (t.classList && t.classList.contains('tv-aprender') && window.tvAprenderLucid) { window.tvAprenderLucid(); pintar(); }
    });
    setInterval(() => { if (p.style.display === 'flex') cargar(); }, 5 * 60 * 1000);   // se actualiza solo cada 5 minutos
  }
  setInterval(montar, 1500);
})();
