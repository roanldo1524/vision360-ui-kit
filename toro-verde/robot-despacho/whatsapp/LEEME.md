# Agente «Mensajero del grupo» (WhatsApp)

Publica en el grupo de WhatsApp del equipo cada comprobante de anticipo (foto + cliente, celular, pedido, valor, «POR VALIDAR»).
Usa un número APARTE (nunca el de ventas), conectado como WhatsApp Web con un código QR. No es oficial de Meta: si WhatsApp bloquea ese número, no afecta las ventas.

## Encenderlo (una sola vez)
1. Celular con el número aparte y WhatsApp instalado; agrégalo al grupo del equipo.
2. En la máquina del robot: `mkdir -p /tmp/wa && cp toro-verde/robot-despacho/whatsapp/wa_grupo.js /tmp/wa/ && cd /tmp/wa && npm i @whiskeysockets/baileys@6 qrcode pino https-proxy-agent@7`
3. `cd /tmp/wa && QR_PNG=<scratchpad>/wa_qr.png setsid nohup node wa_grupo.js > wa.log 2>&1 &` → aparece la imagen del QR.
4. En el celular: WhatsApp → Dispositivos vinculados → Vincular dispositivo → escanear el QR. El log dice CONECTADO y guarda los grupos en /tmp/wa/grupos.json.
5. Escribir el nombre del grupo (o parte) en /tmp/wa/grupo.txt.

## Cómo llegan los mensajes
pedir_anticipo.py deja cada comprobante nuevo como archivo en /tmp/wa/salida/; wa_grupo.js lo envía cada 20 s y lo pasa a /tmp/wa/enviados/.
Si la máquina se reinicia, la sesión queda guardada en /tmp/wa/auth; si se borra, se vuelve a escanear el QR.

## Conectado (26-11-2026)
- Número: **310 846 7560**, vinculado con código de 8 letras (WA_NUMERO=573108467560). El QR no funcionó.
- Grupo de comprobantes: **«Comprobantes de Pago CDR»** (/tmp/wa/grupo.txt). Cada comprobante sale con la foto y menciona a Ronald (3218940042), Leidy (3234209080) y Karen (3206357423), que están en /tmp/wa/mencionar.txt.
- Si el servidor se reinicia, bucle.sh lo vuelve a encender solo, siempre que exista /tmp/wa/auth. Si WhatsApp cierra la sesión, hay que generar otro código.
- El robot no escribe en ningún otro grupo.
