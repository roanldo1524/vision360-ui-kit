// Ronald 27-11: «deseo alguna anotación en un color con textos, dentro del mismo Dropi: lo que se debe hacer exactamente sin tener que pensar».
// Lee las notas que el robot deja en cada pedido («🤖 ROBOT · POR QUÉ · QUÉ HACER · QUIÉN») y pinta un recuadro naranja debajo de la fila,
// más un panel arriba a la derecha agrupado por lo que hay que hacer. No cambia nada en Dropi: solo muestra.
(() => {
  // Enlace al chat del cliente en Lucid. {tel} = 57 + celular. FALTA CONFIRMAR el formato exacto con Ronald (copia de la barra de direcciones al abrir un chat).
  // El enlace del chat de Lucid se aprende UNA vez: la primera vez que tocan «Abrir chat», se pega la dirección de cualquier chat abierto en Lucid
  // y se guarda en este computador (el número 57… de esa dirección se reemplaza por el de cada cliente).
  const lucidUrl = (tel) => { let m = ''; try { m = localStorage.getItem('tv_lucid_url') || ''; } catch (e) {}
    return m ? m.replace('{tel}', tel) : ''; };
  window.tvAprenderLucid = () => { const u = prompt('Abre en Lucid el chat de cualquier cliente, copia la dirección de arriba del navegador y pégala aquí:');
    if (!u) return; const m = u.match(/57\d{10}/); if (!m) { alert('Esa dirección no trae el número del cliente (57…). Prueba con otra.'); return; }
    try { localStorage.setItem('tv_lucid_url', u.replace(m[0], '{tel}')); } catch (e) {} alert('Listo, ya quedó. Toca otra vez «Abrir chat».'); };
  const notas = {};            // id → texto de la nota del robot
  const tels = {};             // id → celular del pedido
  const tokLS = () => { try { const t = (localStorage.getItem('DROPI_token') || '').replace(/"/g, ''); return t ? 'Bearer ' + t : null; } catch (e) { return null; } };
  let auth = null;             // token que la misma página de Dropi usa (no se guarda en ningún lado)
  const pedidos = new Set();   // ids vistos en la lista
  const guardar = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(guardar);
    if (o.id && o.phone) tels[o.id] = String(o.phone).slice(-10);
    if (o.id && typeof o.notes === 'string' && o.status) { pedidos.add(String(o.id));
      // solo pedidos SIN confirmar (Ronald 27-11: no mostrar los ya confirmados)
      notas[o.id] = (o.notes.includes('🤖 ROBOT') && o.status === 'PENDIENTE CONFIRMACION') ? o.notes : ''; }
    for (const k of ['objects', 'data', 'orders', 'rows']) if (o[k]) guardar(o[k]);
  };
  // 1) Escucha las respuestas de la API de Dropi que la página ya pide
  const f0 = window.fetch;
  window.fetch = async function (u, opt) {
    try { // Dropi llama fetch con un Request o con (url, opciones)
      const url = (u && u.url) || String(u);
      const hs = [opt && opt.headers, u && u.headers].filter(Boolean);
      for (const h of hs) { const a = h.get ? h.get('x-authorization') : (h['x-authorization'] || h['X-Authorization']); if (a && String(a).length > 40 && !tokLS()) auth = a; }
    } catch (e) {}
    const r = await f0.apply(this, arguments);
    try { if ((((u && u.url) || String(u)) + '').includes('api.dropi.co') && (((u && u.url) || String(u)) + '').includes('order')) r.clone().json().then(guardar).catch(() => {}); } catch (e) {}
    return r;
  };
  const X = XMLHttpRequest.prototype, open0 = X.open, send0 = X.send, set0 = X.setRequestHeader;
  X.open = function (m, u) { this._u = u; return open0.apply(this, arguments); };
  X.setRequestHeader = function (k, v) { if (String(k).toLowerCase() === 'x-authorization' && String(v).length > 40 && !tokLS()) auth = v; return set0.apply(this, arguments); };
  X.send = function () {
    this.addEventListener('load', () => { try { if (String(this._u).includes('order')) guardar(JSON.parse(this.responseText)); } catch (e) {} });
    return send0.apply(this, arguments);
  };
  // 2) Si la lista no trae las notas, se piden pedido por pedido (solo los que se ven en pantalla)
  const pedidas = new Set();
  async function pedirNota(id) {
    auth = tokLS() || auth;
    if (!auth || pedidas.has(id)) return; pedidas.add(id);
    try {
      const r = await f0('https://api.dropi.co/api/orders/myorders/' + id, { headers: { 'x-authorization': auth, accept: 'application/json' } });
      const o = ((await r.json()) || {}).objects || {};
      if (o.phone) tels[id] = String(o.phone).slice(-10);
      if (String(o.notes || '').includes('🤖 ROBOT') && o.status === 'PENDIENTE CONFIRMACION') notas[id] = o.notes; else notas[id] = notas[id] || '';
    } catch (e) {}
  }
  const parte = (t, k) => { const m = t.match(new RegExp(k + ':\\s*([^·|]+)')); return m ? m[1].trim() : ''; };
  const css = document.createElement('style');
  css.textContent = `.tv-caja{margin:6px 0 10px;padding:10px 14px;border-left:6px solid #ff6a00;background:#fff4e6;border-radius:8px;font:14px/1.4 system-ui,sans-serif;color:#3b2200}
  .tv-caja b{color:#c44d00}.tv-caja .tv-q{font-size:15px;font-weight:700;color:#7a2e00;margin-bottom:2px}.tv-caja .tv-chat{display:inline-block;margin:6px 8px 0 0;padding:4px 10px;background:#ff6a00;color:#fff!important;border-radius:6px;text-decoration:none;font-weight:600}.tv-caja .tv-p{font-size:12.5px;color:#7a5a3a}
  #tv-panel{position:fixed;top:70px;right:14px;z-index:99999;width:330px;max-height:70vh;overflow:auto;background:#1b1b1b;color:#fff;border-radius:12px;box-shadow:0 8px 28px #0006;font:13px/1.4 system-ui,sans-serif}
  #tv-panel h3{margin:0;padding:10px 14px;background:#ff6a00;border-radius:12px 12px 0 0;font-size:14px;cursor:pointer}
  #tv-panel .g{padding:8px 14px;border-bottom:1px solid #333}#tv-panel .g b{color:#ffb070}#tv-panel a{color:#9fd;cursor:pointer;margin-right:8px}`;
  function pintar() {
    if (!document.body) return;
    if (!css.isConnected) document.head.appendChild(css);
    // ids que se ven en la pantalla (celdas con solo un número de pedido)
    const celdas = [...document.querySelectorAll('td, a, span, div')].filter(e => e.children.length === 0 && /^\d{8,9}$/.test(e.textContent.trim()));
    for (const c of celdas) {
      const id = c.textContent.trim();
      if (!(id in notas)) { pedirNota(id); continue; }
      const t = notas[id]; if (!t) continue;
      const fila = c.closest('tr') || c.closest('[role=row]') || c.parentElement;
      if (!fila || fila.dataset.tvId === id) continue;
      fila.dataset.tvId = id;
      const caja = document.createElement(fila.tagName === 'TR' ? 'tr' : 'div');
      const html = `<div class="tv-q">👉 ${parte(t, 'QUÉ HACER') || 'Revisar el pedido'}</div><div class="tv-p"><b>Por qué:</b> ${parte(t, 'POR QUÉ')} · <b>Quién:</b> ${parte(t, 'QUIÉN') || 'Karen'}</div>` + (tels[id] ? (lucidUrl('57' + tels[id]) ? `<a class="tv-chat" target="_blank" href="${lucidUrl('57' + tels[id])}">💬 Abrir chat en Lucid</a>` : `<a class="tv-chat tv-aprender" href="#">💬 Abrir chat en Lucid</a>`) + ` <a class="tv-chat" href="https://wa.me/57${tels[id]}" target="_blank">📞 WhatsApp ${tels[id]}</a>` : '');
      if (caja.tagName === 'TR') { const td = document.createElement('td'); td.colSpan = 30; td.innerHTML = `<div class="tv-caja">${html}</div>`; caja.appendChild(td); }
      else { caja.className = 'tv-caja'; caja.innerHTML = html; }
      caja.id = 'tv-' + id; fila.after(caja);
    }
    panel();
  }
  function panel() {
    const grupos = {};
    for (const [id, t] of Object.entries(notas)) if (t) { const q = parte(t, 'QUÉ HACER') || 'Revisar'; (grupos[q] = grupos[q] || []).push(id); }
    let p = document.getElementById('tv-panel');
    const n = Object.values(grupos).reduce((a, b) => a + b.length, 0);
    if (!n) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement('div'); p.id = 'tv-panel'; document.body.appendChild(p); }
    const abierto = p.dataset.cerrado !== '1';
    p.innerHTML = `<h3>🤖 Qué hacer hoy · ${n} pedido(s) ${abierto ? '▲' : '▼'}</h3>` + (abierto ? Object.entries(grupos).map(([q, ids]) =>
      `<div class="g"><b>${q}</b> · ${ids.length}<br>${ids.map(i => `<a data-id="${i}">#${i}</a>`).join('')}</div>`).join('') : '');
    p.querySelector('h3').onclick = () => { p.dataset.cerrado = abierto ? '1' : '0'; panel(); };
    p.querySelectorAll('a').forEach(a => a.onclick = () => { const e = document.getElementById('tv-' + a.dataset.id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  }
  // sin onclick en línea (Dropi puede bloquearlo): un solo escuchador para el botón de aprender el enlace
  document.addEventListener('click', (ev) => { const a = ev.target.closest && ev.target.closest('.tv-aprender'); if (a) { ev.preventDefault(); window.tvAprenderLucid(); document.querySelectorAll('[data-tv-id]').forEach(f => delete f.dataset.tvId); document.querySelectorAll('[id^=tv-]').forEach(e => e.id !== 'tv-panel' && e.remove()); } }, true);
  setInterval(pintar, 1500);
})();
