# Plantillas del casino para Meta (WhatsApp) — para crear en Lucid

Ronald 23-11: «crea las plantillas, haz las acciones necesarias para que consigas las metas»
(meta: $100 millones al mes solo con el casino).

Por qué hacen falta: sin plantilla solo se le puede escribir a quien habló en las últimas 23 h
(~300 personas al día). La cuenta de Lucid tiene ~48.000 contactos. Una plantilla aprobada deja
escribirle a los interesados de los últimos 30 días y a clientes antiguos.

Cómo crearlas (lo hace una persona en Lucid; la API no deja crear plantillas):
Lucid → Plantillas de WhatsApp → Nueva → categoría **Marketing**, idioma **Español (COL)**.
Luego crear en Lucid un flujo que envíe la plantilla y pasarme el **número del flujo**
(como el «Mensaje administrador», flujo 1753286864407). Yo envío con `/contacts/{id}/send/{flujo}`.

## 1) `casino_toro_verde` — interesados que no compraron (últimos 30 días)
- Encabezado: IMAGEN (casino-wa-777.jpg: máquina 7-7-7 «JUEGA GRATIS HOY · GANA HASTA $26.900»)
- Cuerpo:
  > ¡Hola {{1}}! 🎰 Te ganaste *3 tiros gratis* en el Casino Toro Verde.
  >
  > Con el 7-7-7 te llevas *hasta $26.900 de descuento* + semilla de maíz criollo de regalo 🌽
  >
  > Pagas al recibir en tu casa o en la oficina de Interrapidísimo. Tus tiros vencen hoy a la medianoche ⏰
- Pie: «Responde NO si no quieres recibir premios»
- Botón URL: «🎰 Jugar ahora» → `https://toroverde.co/pages/premios?utm_source=whatsapp&utm_campaign=casino_plantilla`
- Botón respuesta rápida: «No me interesa»
- Variable {{1}}: nombre del contacto (si no hay, «amigo»).

## 2) `casino_recompra` — clientes con pedido entregado hace 30 días o más
- Encabezado: IMAGEN (la misma)
- Cuerpo:
  > ¡Hola {{1}}! 🌱 Gracias por confiar en Toro Verde. Por ser cliente tienes *3 tiros gratis* en nuestro casino.
  >
  > Puedes ganar *hasta $26.900 de descuento* en tu próximo pedido + semilla de maíz criollo de regalo 🌽
  >
  > Recuerda: mínimo 130 ml por bomba de 20 litros y agite el envase. Tus tiros vencen hoy a la medianoche ⏰
- Pie: «Responde NO si no quieres recibir premios»
- Botón URL: «🎰 Jugar ahora» → `https://toroverde.co/pages/premios?utm_source=whatsapp&utm_campaign=casino_recompra`
- Botón respuesta rápida: «No me interesa»

Reglas al usarlas (las hago cumplir yo en el envío):
- Nunca a quien tiene pedido en los últimos 15 días (en camino / posventa / cancelaría por el descuento).
- Nunca a quien dijo NO (casino/negados.json) ni a garantías.
- Máximo 1 plantilla por persona cada 14 días. Lotes de 500 por día al empezar y se sube según
  la calidad del número en Meta (si baja a amarilla, se frena).
- Costo aproximado: una plantilla de marketing en Colombia vale unos $50–60 pesos por mensaje
  (lo cobra Meta). 1.000 mensajes ≈ $55.000; con 1,2 % de compra ≈ 12 ventas ≈ $2 millones.
