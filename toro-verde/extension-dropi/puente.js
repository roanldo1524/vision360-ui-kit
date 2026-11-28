// Puente entre la página de Dropi y el fondo de la extensión. La clave de Lucid NUNCA pasa a la página: solo vive en el fondo.
(() => {
  const enviarCfg = () => chrome.storage.local.get(['lucid_token', 'chat_url', 'nombre', 'tienda', 'pais'], (c) => {
    window.postMessage({ tv: 'cfg', cfg: { lucid: !!c.lucid_token, chatUrl: c.chat_url || '', nombre: c.nombre || '', tienda: c.tienda || '', pais: c.pais || '57' } }, '*');
  });
  enviarCfg(); setTimeout(enviarCfg, 2000); chrome.storage.onChanged.addListener(enviarCfg);
  window.addEventListener('message', (e) => {
    const m = e.data; if (e.source !== window || !m || m.tv !== 'req') return;
    chrome.runtime.sendMessage({ tipo: 'lucid', metodo: m.metodo, ruta: m.ruta, cuerpo: m.cuerpo }, (r) => window.postMessage({ tv: 'res', id: m.id, r: r || { ok: false, error: 'sin respuesta' } }, '*'));
  });
})();
