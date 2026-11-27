// Ronald 27-11: «deseo alguna anotación en un color con textos, dentro del mismo Dropi: lo que se debe hacer exactamente sin tener que pensar».
// Lee las notas que el robot deja en cada pedido («🤖 ROBOT · POR QUÉ · QUÉ HACER · QUIÉN») y pinta un recuadro naranja debajo de la fila,
// más un panel arriba a la derecha agrupado por lo que hay que hacer. No cambia nada en Dropi: solo muestra.
(() => {
  // Enlace al chat del cliente en Lucid. {tel} = 57 + celular. FALTA CONFIRMAR el formato exacto con Ronald (copia de la barra de direcciones al abrir un chat).
  // El enlace del chat de Lucid se aprende UNA vez: la primera vez que tocan «Abrir chat», se pega la dirección de cualquier chat abierto en Lucid
  // y se guarda en este computador (el número 57… de esa dirección se reemplaza por el de cada cliente).
  const lucidUrl = (tel) => { let m = ''; try { m = localStorage.getItem('tv_lucid_url') || ''; } catch (e) {}
    return m ? m.replace('{tel}', tel) : ''; };
  // Ronald 27-11: «más tamaño, que sea claro»: ventana propia y grande en vez del aviso gris del navegador
  window.tvAprenderLucid = () => new Promise((fin) => {
    let v = document.getElementById('tv-guia'); if (v) v.remove();
    v = document.createElement('div'); v.id = 'tv-guia';
    v.innerHTML = `<style>#tv-guia{position:fixed;inset:0;z-index:100005;background:#141432aa;display:grid;place-items:center;font:16px/1.5 'Segoe UI',system-ui,sans-serif}
      #tv-guia .bx{background:#fff;border-radius:18px;width:560px;max-width:94vw;padding:26px 28px;box-shadow:0 24px 70px #0006;color:#141432}
      #tv-guia h2{margin:0 0 6px;font-size:22px}#tv-guia ol{margin:10px 0 14px 22px;padding:0;font-size:16px}#tv-guia li{margin:6px 0}
      #tv-guia input{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px;border:2px solid #2b2b6b;border-radius:12px}
      #tv-guia .er{color:#b91c1c;font-weight:600;min-height:22px;margin-top:6px}#tv-guia .bt{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
      #tv-guia button{border:0;border-radius:12px;padding:12px 18px;font:700 16px inherit;cursor:pointer}#tv-guia .si{background:#141432;color:#c6f135}#tv-guia .no{background:#eef0f3;color:#141432}</style>
      <div class="bx"><h2>💬 Conectar el botón «Chat» con Lucid</h2><div>Esto se hace <b>una sola vez</b>:</div>
      <ol><li>Abre <b>Lucid</b> en otra pestaña.</li><li>Entra al chat de <b>cualquier cliente</b>.</li><li>Copia la <b>dirección de arriba</b> del navegador (la que empieza por https://).</li><li>Pégala aquí abajo y toca <b>Guardar</b>.</li></ol>
      <input placeholder="https://panel.lucidbot.co/…"><div class="er"></div>
      <div class="bt"><button class="no">Cancelar</button><button class="si">Guardar</button></div>
      <div style="margin-top:10px;font-size:13.5px;color:#6b7280">Consejo: si pones la clave de Lucid en la configuración de la extensión (ícono arriba en Chrome), el chat se ve aquí mismo dentro de Dropi.</div></div>`;
    document.body.appendChild(v); const inp = v.querySelector('input'); inp.focus();
    v.querySelector('.no').onclick = () => { v.remove(); fin(false); };
    v.querySelector('.si').onclick = () => {
      const u = inp.value.trim(); const m = u.match(/57\d{10}/);
      if (!m) { v.querySelector('.er').textContent = 'Esa dirección no trae el número del cliente (57…). Abre un chat de cliente y copia otra vez.'; return; }
      try { localStorage.setItem('tv_lucid_url', u.replace(m[0], '{tel}')); } catch (e) {} v.remove(); fin(true);
    };
  });
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
  css.textContent = `.tv-caja{text-align:left!important;margin:0 0 12px;padding:12px 16px;border-left:8px solid #ff6a00;background:#fff4e6;border-radius:0 0 10px 10px;font:15px/1.45 system-ui,sans-serif;color:#3b2200;box-shadow:0 4px 14px #ff6a0026}.tv-in{position:sticky;left:12px;max-width:min(1100px,calc(100vw - 340px))}.tv-tit{font-weight:800;font-size:15px;color:#c2410c;text-transform:none;margin-bottom:4px}.tv-fila,.tv-fila>td{background:#fff4e6!important}.tv-fila>td:first-child{box-shadow:inset 8px 0 0 #ff6a00}.tv-marca{display:inline-block;margin-top:4px;background:#ff6a00;color:#fff;font:800 11px system-ui;padding:2px 8px;border-radius:999px;letter-spacing:.3px}
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
      // Ronald 27-11: «que resalte bien el pedido que tiene la novedad y cuál es»: la fila del pedido se pinta y lleva una etiqueta junto al número
      fila.classList.add('tv-fila'); if (!c.querySelector('.tv-marca')) { const mk = document.createElement('div'); mk.className = 'tv-marca'; mk.textContent = '⚠ POR RESOLVER'; c.appendChild(mk); }
      const caja = document.createElement(fila.tagName === 'TR' ? 'tr' : 'div');
      const nombre = (fila.innerText.split('\n').map(x => x.trim()).find(x => /^[A-ZÁÉÍÓÚÑa-záéíóúñ][a-záéíóúñA-ZÁÉÍÓÚÑ.]+( [A-Za-zÁÉÍÓÚÑáéíóúñ.]+){1,4}$/.test(x) && !/herbicida|lote|tiene nota|reclama|oficina|pendiente|interrap|envia|coordinadora|bodega|recaudo/i.test(x)) || '');
      const html = `<div class="tv-tit">⚠ Pedido #${id}${nombre ? ' · ' + nombre : ''} — necesita una persona</div><div class="tv-q">👉 ${parte(t, 'QUÉ HACER') || 'Revisar el pedido'}</div><div class="tv-p"><b>Por qué:</b> ${parte(t, 'POR QUÉ')} · <b>Quién:</b> ${parte(t, 'QUIÉN') || 'Karen'}</div>` + `<a class="tv-chat tv-abrir" href="#" data-id="${id}">⚡ Abrir chat y acciones</a> ` + (tels[id] ? (lucidUrl('57' + tels[id]) ? `<a class="tv-chat" target="_blank" href="${lucidUrl('57' + tels[id])}">💬 Abrir chat en Lucid</a>` : `<a class="tv-chat tv-aprender" href="#">💬 Abrir chat en Lucid</a>`) + ` <a class="tv-chat" href="https://wa.me/57${tels[id]}" target="_blank">📞 WhatsApp ${tels[id]}</a>` : '');
      if (caja.tagName === 'TR') { const td = document.createElement('td'); td.colSpan = 30; td.innerHTML = `<div class="tv-caja"><div class="tv-in">${html}</div></div>`; caja.appendChild(td); }
      else { caja.className = 'tv-caja'; caja.innerHTML = html; }
      caja.id = 'tv-' + id; fila.after(caja);
    }
    // el panel negro viejo «Qué hacer hoy» ya no se muestra: lo reemplaza Confirma+
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
