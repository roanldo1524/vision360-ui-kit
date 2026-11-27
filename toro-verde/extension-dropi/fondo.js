// Fondo: habla con la API de Lucid usando la clave que se guardó en Opciones. Solo permite leer el chat de un contacto y mandarle un texto.
chrome.runtime.onMessage.addListener((m, _s, responder) => {
  if (!m || m.tipo !== 'lucid') return;
  const ok = /^\/contacts\/\d{10,15}(\/messages\?limit=\d+|\/send_content)?$|^\/accounts\/custom_fields$/.test(m.ruta || '');
  if (!ok) { responder({ ok: false, error: 'ruta no permitida' }); return; }
  chrome.storage.local.get(['lucid_token'], async ({ lucid_token }) => {
    if (!lucid_token) { responder({ ok: false, error: 'Falta la clave de Lucid en Opciones' }); return; }
    try {
      const r = await fetch('https://panel.lucidbot.co/api' + m.ruta, { method: m.metodo || 'GET', headers: { 'X-ACCESS-TOKEN': lucid_token, 'Content-Type': 'application/json' }, body: m.cuerpo ? JSON.stringify(m.cuerpo) : undefined });
      const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { j = t; }
      responder({ ok: r.ok, status: r.status, data: (j && j.data !== undefined) ? j.data : j });
    } catch (e) { responder({ ok: false, error: String(e) }); }
  });
  return true;
});
