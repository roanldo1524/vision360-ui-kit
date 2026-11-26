// Agente «Mensajero del grupo» (Ronald 26-11): el robot entra a WhatsApp con un número APARTE (no el de ventas)
// y publica en el grupo del equipo los comprobantes de anticipo (foto + datos). Conexión tipo WhatsApp Web (QR una sola vez).
// Uso:  node wa_grupo.js            → queda corriendo: conecta, guarda el QR en QR_PNG si hace falta escanear,
//                                      lista los grupos en /tmp/wa/grupos.json y envía todo lo que caiga en /tmp/wa/salida/*.json
//       Mensaje a enviar (archivo JSON en /tmp/wa/salida): {"grupo": "nombre o parte del nombre del grupo", "texto": "...", "imagen": "/ruta/foto.jpg"}
// Nunca escribe a clientes: solo al grupo configurado. Solo envía; no responde mensajes.
const fs = require('fs'), path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode'); const pino = require('pino');
const { HttpsProxyAgent } = require('https-proxy-agent');
const BASE = '/tmp/wa', SAL = path.join(BASE, 'salida'), ENV = path.join(BASE, 'enviados');
const QR_PNG = process.env.QR_PNG || path.join(BASE, 'qr.png');
for (const d of [SAL, ENV]) fs.mkdirSync(d, { recursive: true });
const log = (...a) => console.log(new Date().toISOString().slice(0, 19), ...a);
let sock = null, grupos = {};

var iniciar = async function() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(BASE, 'auth'));
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  const agent = process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : undefined;
  sock = makeWASocket({ auth: state, version, agent, fetchAgent: agent, logger: pino({ level: 'silent' }), browser: Browsers.ubuntu('Chrome'), markOnlineOnConnect: false, syncFullHistory: false, keepAliveIntervalMs: 10000, connectTimeoutMs: 60000 });
  sock.ev.on('creds.update', saveCreds);
  // Ronald 26-11: «el QR no lo coge» → vincular con CÓDIGO de 8 letras (WhatsApp → Dispositivos vinculados → Vincular con número de teléfono).
  // Uso: WA_NUMERO=57XXXXXXXXXX node wa_grupo.js → escribe el código en /tmp/wa/codigo.txt
  if (process.env.WA_NUMERO && !state.creds.registered) setTimeout(async () => { try { const code = await sock.requestPairingCode(process.env.WA_NUMERO.replace(/\D/g, '')); fs.writeFileSync(path.join(BASE, 'codigo.txt'), code); log('CODIGO', code); } catch (e) { log('CODIGO_ERROR', e.message); } }, 4000);
  sock.ev.on('connection.update', async (u) => {
    if (u.qr) { await QRCode.toFile(QR_PNG, u.qr, { width: 420, margin: 2 }); log('QR_LISTO', QR_PNG); }
    if (u.connection === 'open') {
      log('CONECTADO', sock.user && sock.user.id);
      try { grupos = await sock.groupFetchAllParticipating(); fs.writeFileSync(path.join(BASE, 'grupos.json'), JSON.stringify(Object.values(grupos).map(g => ({ id: g.id, nombre: g.subject, miembros: (g.participants || []).length })), null, 1)); log('GRUPOS', Object.keys(grupos).length); } catch (e) { log('GRUPOS_ERROR', e.message); }
      try { fs.unlinkSync(QR_PNG); } catch (e) {}
    }
    if (u.connection === 'close') {
      const code = u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.output && u.lastDisconnect.error.output.statusCode;
      if (code === DisconnectReason.loggedOut) { log('SESION_CERRADA (hay que volver a escanear el QR)'); try { fs.renameSync(path.join(BASE, 'auth'), path.join(BASE, 'auth_vieja_' + Date.now())); } catch (e) {} }
      else log('DESCONECTADO', code, '→ reconecto');
      setTimeout(iniciar, 5000);
    }
  });
}

function buscaGrupo(q) {
  if (/@(g\.us|s\.whatsapp\.net|lid)$/.test(q)) return q;
  const n = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const m = Object.values(grupos).filter(g => n(g.subject).includes(n(q)));
  return m.length === 1 ? m[0].id : null;
}

async function despachar() {
  if (!sock || !sock.user) return;
  for (const f of fs.readdirSync(SAL).filter(x => x.endsWith('.json')).sort()) {
    const p = path.join(SAL, f); let j;
    try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { continue; }
    const conf = (() => { try { return fs.readFileSync(path.join(BASE, 'grupo.txt'), 'utf8').trim(); } catch (e) { return ''; } })();
    const jid = buscaGrupo(j.grupo || conf || process.env.WA_GRUPO || '');
    if (!jid) { log('SIN_GRUPO', f, j.grupo); continue; }
    try {
      // Ronald 26-11: «mencionar a Ronaldo, a Karen y a Leidy» → @ en el texto + mentions (números en /tmp/wa/mencionar.txt o en j.mencionar)
      const men = (j.mencionar || (() => { try { return fs.readFileSync(path.join(BASE, 'mencionar.txt'), 'utf8').split(/\s+/).filter(Boolean); } catch (e) { return []; } })()).map(n => n.replace(/\D/g, '')).filter(Boolean);
      const mentions = men.map(n => n + '@s.whatsapp.net');
      const txt = (j.texto || '') + (men.length ? '\n\n' + men.map(n => '@' + n).join(' ') : '');
      const enviado = (j.imagen && fs.existsSync(j.imagen)) ? await sock.sendMessage(jid, { image: fs.readFileSync(j.imagen), caption: txt, mentions })
                                                            : await sock.sendMessage(jid, { text: txt, mentions });
      try { const ids = leerIds(); ids[enviado.key.id] = { ...j, archivo: f, jid, cuando: Date.now() }; fs.writeFileSync(IDS, JSON.stringify(ids)); } catch (e) {}
      fs.renameSync(p, path.join(ENV, f)); log('ENVIADO', f);
      await new Promise(r => setTimeout(r, 2500));  // despacio, como una persona
    } catch (e) { log('ENVIO_ERROR', f, e.message); }
  }
}
process.on('unhandledRejection', e => log('ERROR', e && e.message)); process.on('uncaughtException', e => log('ERROR', e && e.message));
// Ronald 26-11: «si yo respondo por WhatsApp confirmado, o que sí está el dinero, o aprobado, tú puedes despacharlo y registrarlo».
// Escucha SOLO el grupo configurado; guarda cada respuesta que CITA un comprobante enviado por el robot en /tmp/wa/respuestas/*.json.
// abonos.py decide (solo vale si responde Ronald) y hace el trabajo en Dropi. Este programa no decide nada.
const IDS = path.join(BASE, 'ids.json'), RESP = path.join(BASE, 'respuestas'); fs.mkdirSync(RESP, { recursive: true });
function leerIds(){ try { return JSON.parse(fs.readFileSync(IDS, 'utf8')); } catch (e) { return {}; } }
function escuchar(){ if (!sock) return; sock.ev.on('messages.upsert', ({ messages }) => { for (const m of messages || []) { try {
  if (m.key.remoteJid && m.key.remoteJid.endsWith('@g.us') && !m.key.fromMe) log('MSG_GRUPO', (grupos[m.key.remoteJid] || {}).subject || m.key.remoteJid, m.pushName || '', m.message ? Object.keys(m.message).join(',') : 'SIN_CONTENIDO(no descifrado)');
  if (!m.message || m.key.fromMe) continue;
  // Ronald 26-11: si mencionan al agente en cualquier grupo, responde (responder.py)
  try { const mm = m.message, ci = (mm.extendedTextMessage || mm.imageMessage || {}).contextInfo || {}, men = ci.mentionedJid || [];
    const yo = [(sock.user.id || '').split(':')[0].split('@')[0], (sock.user.lid || '').split(':')[0].split('@')[0]].filter(Boolean);
    const tx = mm.conversation || (mm.extendedTextMessage || {}).text || (mm.imageMessage || {}).caption || '';
    // Ronald 26-11: también por chat PRIVADO a este número (solo Ronald)
    const privado = !m.key.remoteJid.endsWith('@g.us') && (m.key.remoteJid.startsWith('573218940042') || m.key.remoteJid.startsWith('94502349988013') || (m.key.remoteJidAlt || '').startsWith('573218940042') || /ronald/i.test(m.pushName || ''));
    if (privado && tx) { const datos = JSON.stringify({ pregunta: tx, quien: m.pushName || 'Ronald', quien_num: '', grupo: m.key.remoteJid, grupo_nombre: 'chat privado' });
      const ch = require('child_process').spawn('python3', ['-I', path.join(BASE, 'responder.py')], { cwd: BASE }); ch.stdin.end(datos);
      ch.stdout.on('data', d => log('RESPONDER', String(d).trim().slice(0, 120))); log('PRIVADO', m.pushName || '', tx.slice(0, 60)); continue; }
    if (m.key.remoteJid.endsWith('@g.us') && (men.some(j => yo.includes(j.split('@')[0].split(':')[0])) || yo.some(n => tx.includes('@' + n)))) {
      const quien_num = (m.key.participantPn || m.key.participantAlt || m.key.participant || '').split('@')[0].split(':')[0];
      // Ronald 26-11: «solo si lo pregunta Ronaldo; a nadie más le puedes responder tú como bot cosas del sistema»
      if (!(['573218940042', '94502349988013'].includes(quien_num) || /ronald/i.test(m.pushName || ''))) { log('MENCION_IGNORADA', m.pushName || '', quien_num); continue; }
      const datos = JSON.stringify({ pregunta: tx.replace(/@\d+/g, '').trim(), quien: m.pushName || '', quien_num: /^57\d{10}$/.test(quien_num) ? quien_num : '', grupo: m.key.remoteJid, grupo_nombre: (grupos[m.key.remoteJid] || {}).subject || '' });
      const ch = require('child_process').spawn('python3', ['-I', path.join(BASE, 'responder.py')], { cwd: BASE }); ch.stdin.end(datos);
      ch.stdout.on('data', d => log('RESPONDER', String(d).trim().slice(0, 120))); log('MENCION', m.pushName || '', tx.slice(0, 60));
    } } catch (e) { log('MENCION_ERROR', e.message); }
  const msg = m.message, ctx = (msg.extendedTextMessage || msg.imageMessage || msg.videoMessage || {}).contextInfo || {};
  let ref = ctx.stanzaId && leerIds()[ctx.stanzaId];
  if (!ref && ctx.quotedMessage){ const q = ctx.quotedMessage, qt = q.conversation || (q.extendedTextMessage || {}).text || (q.imageMessage || {}).caption || '';
    if (/Comprobante de anticipo/i.test(qt) && /Pedido Dropi:\s*\d+/.test(qt)) ref = { texto: qt }; }
  if (!ref) continue;
  const texto = msg.conversation || (msg.extendedTextMessage || {}).text || (msg.imageMessage || {}).caption || '';
  const r = { texto, quien: m.key.participant || '', quien_pn: m.key.participantPn || m.key.participantAlt || '', nombre: m.pushName || '', fecha: Date.now(), ref };
  fs.writeFileSync(path.join(RESP, Date.now() + '_' + (m.key.id || '') + '.json'), JSON.stringify(r)); log('RESPUESTA', r.nombre, texto.slice(0, 60));
  try { require('child_process').execFile('python3', ['-I', path.join(BASE, 'abonos.py'), '--enviar'], { cwd: BASE, timeout: 300000 }, (e, so) => log('ABONOS', (so || '').trim().slice(-160))); } catch (e) {}
} catch (e) { log('RESPUESTA_ERROR', e.message); } } }); }
const _iniciar = iniciar; iniciar = async function(){ await _iniciar(); escuchar(); };
iniciar(); setInterval(despachar, 20000);
