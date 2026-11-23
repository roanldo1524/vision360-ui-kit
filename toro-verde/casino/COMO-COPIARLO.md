# Casino: cómo copiarlo a otra marca (otro bot de Lucid + otra tienda Shopify)

Funciona igual en Toro Verde desde el 2026-11-18. Para otra marca se cambian solo los datos de la marca.

## Qué hace
1. `casino_envio.py` (10 a. m. y 4 p. m. de Bogotá): toma los contactos que llegaron por anuncios
   (campo personalizado del anuncio en Lucid), que escribieron hace entre 6 y 23 h, que NUNCA compraron
   (no tienen pedido en el embudo de pedidos de Lucid) y que no recibieron el casino en 3 días.
   Les manda por Lucid (`/contacts/{id}/send_content`) la imagen + un texto con su enlace
   `https://<tienda>/pages/premios?n=<Nombre>&utm_source=whatsapp&utm_campaign=casino`.
   Guarda a quién se mandó en `casino/enviados.json`.
2. `casino_recordar.py` (9 p. m.): último aviso «vence a medianoche» a quien lo recibió hoy y no compró.
3. `pagina-premios.html`: el cuerpo de la página de Shopify (handle `premios`). Máquina tragamonedas
   con foto real de fondo, sonidos, 3 tiros (gana en el tercero, 7-7-7), premio en plata, botones por
   producto que abren WhatsApp del bot con el mensaje listo y el código. Mide cada paso en Microsoft
   Clarity (`casino_abre`, `casino_tiro_1..3`, `casino_jackpot`, `casino_premio_visto`,
   `casino_reclama_<producto>`, `casino_sin_sonido`).
4. El bot de Lucid debe reconocer el texto «gané en el casino» y tomar el pedido con el descuento.
5. Conteo de ventas: pedidos del embudo creados después del envío a cada contacto.

## Qué cambiar para la otra marca
- `lucidbot.key` de ESA marca (archivo local, nunca en el repo ni en el chat).
- Id del embudo de pedidos (Toro Verde: 705299) y del campo del anuncio (Toro Verde: 728462).
- Dominio de la tienda, número de WhatsApp del bot (`W=` en la página), nombre de la marca en textos.
- Los 3 productos con precio normal y precio con 10 %, el regalo y el código de descuento
  (crearlo en Shopify y en el bot).
- Imagen de WhatsApp: regenerarla con el nombre y el premio de la marca (`wa3.html` + `shot2.js`).
- Subir a Shopify (Contenido → Archivos) la foto de la máquina (`maquina.jpg`) y los 4 mp3, y cambiar
  las direcciones en la página.
- Clarity: confirmar que la tienda tiene Clarity instalado (app «Microsoft Clarity»).
- Palabras prohibidas propias de la marca.

## Reglas que no cambian
- Descuento máximo 10 % y SOLO para quien nunca ha comprado (sacar a todo el que tenga pedido en el
  historial completo del embudo). A clientes que ya compraron, precio normal.
- Nunca mandar a quien escribió hace menos de 6 h (está comprando con el bot).
- Rifas o sorteos de premios necesitan permiso de Coljuegos: no se hacen.
- Probar con Playwright (`prueba2.js`) antes de publicar y mandarle primero el mensaje de prueba al dueño.
