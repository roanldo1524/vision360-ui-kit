// Fondo: habla con la API de Lucid usando la clave que se guardó en Opciones. Solo permite leer el chat de un contacto y mandarle un texto.
chrome.runtime.onMessage.addListener((m, _s, responder) => {
  if (!m || m.tipo !== 'lucid') return;
  const ok = /^\/contacts\/\d{10,15}(\/messages\?limit=\d+|\/send_content)?$|^\/accounts\/custom_fields$|^\/buscar_pedido\?sid=\d+$/.test(m.ruta || '');
  if (!ok) { responder({ ok: false, error: 'ruta no permitida' }); return; }
  chrome.storage.local.get(['lucid_token'], async ({ lucid_token }) => {
    if (!lucid_token) { responder({ ok: false, error: 'Falta la clave de Lucid en Opciones' }); return; }
    try {
      // Chat EXACTO del pedido: se busca el contacto por el número de pedido de Lucid Sales (campo «Id_lucidsales»), no por el teléfono
      if (m.ruta.startsWith('/buscar_pedido')) {
        const H = { 'X-ACCESS-TOKEN': lucid_token };
        let fid = (await chrome.storage.local.get(['campo_sid'])).campo_sid;
        if (!fid) { const cf = await (await fetch('https://panel.lucidbot.co/api/accounts/custom_fields', { headers: H })).json();
          const x = (cf.data || cf || []).find(c => /id_?lucid_?sales/i.test(String(c.name).replace(/\s/g, ''))); fid = x && x.id; if (fid) chrome.storage.local.set({ campo_sid: fid }); }
        if (!fid) { responder({ ok: false, error: 'no encuentro el campo Id_lucidsales' }); return; }
        const r = await (await fetch(`https://panel.lucidbot.co/api/contacts/find_by_custom_field?field_id=${fid}&value=${m.ruta.split('=')[1]}`, { headers: H })).json();
        const l = Array.isArray(r) ? r : (r.data || []); responder({ ok: true, data: [...new Set(l.map(c => String(c.id)))] }); return;
      }
      const r = await fetch('https://panel.lucidbot.co/api' + m.ruta, { method: m.metodo || 'GET', headers: { 'X-ACCESS-TOKEN': lucid_token, 'Content-Type': 'application/json' }, body: m.cuerpo ? JSON.stringify(m.cuerpo) : undefined });
      const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { j = t; }
      responder({ ok: r.ok, status: r.status, data: (j && j.data !== undefined) ? j.data : j });
    } catch (e) { responder({ ok: false, error: String(e) }); }
  });
  return true;
});
