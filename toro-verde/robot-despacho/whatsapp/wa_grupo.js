// Agente «Mensajero del grupo» (Ronald 26-11): el robot entra a WhatsApp con un número APARTE (no el de ventas)
// y publica en el grupo del equipo los comprobantes de anticipo (foto + datos). Conexión tipo WhatsApp Web (QR una sola vez).
// Uso:  node wa_grupo.js            → queda corriendo: conecta, guarda el QR en QR_PNG si hace falta escanear,
//                                      lista los grupos en /tmp/wa/grupos.json y envía todo lo que caiga en /tmp/wa/salida/*.json
//       Mensaje a enviar (archivo JSON en /tmp/wa/salida): {"grupo": "nombre o parte del nombre del grupo", "texto": "...", "imagen": "/ruta/foto.jpg"}
// Nunca escribe a clientes: solo al grupo configurado. Solo envía; no responde mensajes.
const fs = require('fs'), path = require('path');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode'); const pino = require('pino');
const { HttpsProxyAgent } = require('https-proxy-agent');
const BASE = '/tmp/wa', SAL = path.join(BASE, 'salida'), ENV = path.join(BASE, 'enviados');
const QR_PNG = process.env.QR_PNG || path.join(BASE, 'qr.png');
for (const d of [SAL, ENV]) fs.mkdirSync(d, { recursive: true });
const log = (...a) => console.log(new Date().toISOString().slice(0, 19), ...a);
let sock = null, grupos = {};

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(BASE, 'auth'));
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }));
  const agent = process.env.HTTPS_PROXY ? new HttpsProxyAgent(process.env.HTTPS_PROXY) : undefined;
  sock = makeWASocket({ auth: state, version, agent, fetchAgent: agent, logger: pino({ level: 'silent' }), browser: ['Toro Verde Robot', 'Chrome', '1.0'], markOnlineOnConnect: false, syncFullHistory: false });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if (u.qr) { await QRCode.toFile(QR_PNG, u.qr, { width: 420, margin: 2 }); log('QR_LISTO', QR_PNG); }
    if (u.connection === 'open') {
      log('CONECTADO', sock.user && sock.user.id);
      try { grupos = await sock.groupFetchAllParticipating(); fs.writeFileSync(path.join(BASE, 'grupos.json'), JSON.stringify(Object.values(grupos).map(g => ({ id: g.id, nombre: g.subject, miembros: (g.participants || []).length })), null, 1)); log('GRUPOS', Object.keys(grupos).length); } catch (e) { log('GRUPOS_ERROR', e.message); }
      try { fs.unlinkSync(QR_PNG); } catch (e) {}
    }
    if (u.connection === 'close') {
      const code = u.lastDisconnect && u.lastDisconnect.error && u.lastDisconnect.error.output && u.lastDisconnect.error.output.statusCode;
      if (code === DisconnectReason.loggedOut) { log('SESION_CERRADA (hay que volver a escanear el QR)'); fs.rmSync(path.join(BASE, 'auth'), { recursive: true, force: true }); }
      else log('DESCONECTADO', code, '→ reconecto');
      setTimeout(iniciar, 5000);
    }
  });
}

function buscaGrupo(q) {
  if (/@g\.us$/.test(q)) return q;
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
      if (j.imagen && fs.existsSync(j.imagen)) await sock.sendMessage(jid, { image: fs.readFileSync(j.imagen), caption: j.texto || '' });
      else await sock.sendMessage(jid, { text: j.texto || '' });
      fs.renameSync(p, path.join(ENV, f)); log('ENVIADO', f);
      await new Promise(r => setTimeout(r, 2500));  // despacio, como una persona
    } catch (e) { log('ENVIO_ERROR', f, e.message); }
  }
}
iniciar(); setInterval(despachar, 20000);
