const C = ['lucid_token', 'chat_url', 'nombre', 'tienda', 'pais'];
chrome.storage.local.get(C, (v) => C.forEach(k => { document.getElementById(k).value = v[k] || ''; }));
const est = (t, ok) => { const e = document.getElementById('est'); e.textContent = t; e.style.color = ok ? '#15803d' : '#b91c1c'; };
document.getElementById('g').onclick = () => {
  const v = {}; C.forEach(k => v[k] = document.getElementById(k).value.trim());
  const m = v.chat_url.match(/\d{12}/); if (v.chat_url && m) v.chat_url = v.chat_url.replace(m[0], '{tel}');
  chrome.storage.local.set(v, () => est('Guardado ✔ Recarga Dropi (F5).', true));
};
document.getElementById('p').onclick = () => chrome.runtime.sendMessage({ tipo: 'lucid', ruta: '/accounts/custom_fields' }, (r) =>
  est(r && r.ok ? 'Conexión con Lucid OK ✔' : 'No conecta con Lucid: ' + ((r && (r.error || r.status)) || 'revisa la clave'), r && r.ok));
