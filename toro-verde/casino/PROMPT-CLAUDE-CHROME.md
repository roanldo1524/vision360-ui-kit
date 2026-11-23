Estás en el panel de Lucid Bot (panel.lucidbot.co) de Toro Verde, con la sesión ya abierta. Tu tarea: crear 2 plantillas de WhatsApp y 2 flujos que las envíen, y guardar los flujos dentro de la carpeta «Mejoras». No borres ni cambies nada que ya exista. Si algo no está claro o una pantalla no coincide, detente y pregunta.

PARTE 1 — PLANTILLAS (WhatsApp → Plantillas → Crear plantilla)

Plantilla 1
- Nombre: casino_toro_verde
- Categoría: Marketing
- Idioma: Español (COL) (si no existe, Español)
- Encabezado: Imagen. Descarga esta imagen y súbela: https://cdn.shopify.com/s/files/1/0687/6096/1211/files/casino-wa-777.jpg?v=1795398353
- Cuerpo (copiar exacto):
¡Hola {{1}}! 🎰 Te ganaste *3 tiros gratis* en el Casino Toro Verde.

Con el 7-7-7 te llevas *hasta $26.900 de descuento* + semilla de maíz criollo de regalo 🌽

Pagas al recibir en tu casa o en la oficina de Interrapidísimo. Tus tiros vencen hoy a la medianoche ⏰
- Ejemplo de la variable {{1}}: Juan
- Pie de página: Responde NO si no quieres recibir premios
- Botón 1, tipo «Ir al sitio web»: texto «🎰 Jugar ahora», URL https://toroverde.co/pages/premios?utm_source=whatsapp&utm_campaign=casino_plantilla
- Botón 2, tipo «Respuesta rápida»: No me interesa
- Enviar a revisión de Meta.

Plantilla 2
- Nombre: casino_recompra
- Categoría: Marketing
- Idioma: el mismo de la plantilla 1
- Encabezado: la misma imagen
- Cuerpo (copiar exacto):
¡Hola {{1}}! 🌱 Gracias por confiar en Toro Verde. Por ser cliente tienes *3 tiros gratis* en nuestro casino.

Puedes ganar *hasta $26.900 de descuento* en tu próximo pedido + semilla de maíz criollo de regalo 🌽

Recuerda: mínimo 130 ml por bomba de 20 litros y agite el envase. Tus tiros vencen hoy a la medianoche ⏰
- Ejemplo de la variable {{1}}: María
- Pie de página: Responde NO si no quieres recibir premios
- Botón 1, tipo «Ir al sitio web»: texto «🎰 Jugar ahora», URL https://toroverde.co/pages/premios?utm_source=whatsapp&utm_campaign=casino_recompra
- Botón 2, tipo «Respuesta rápida»: No me interesa
- Enviar a revisión de Meta.

PARTE 2 — FLUJOS (Flujos → carpeta «Mejoras» → Nuevo flujo). Si la carpeta «Mejoras» no existe, créala.

Flujo 1: «Casino plantilla»
1. Paso «Enviar plantilla de WhatsApp» con la plantilla casino_toro_verde. En la variable {{1}} pon el campo «Nombre» del contacto (first name); si el flujo permite valor por defecto, «amigo».
2. Si la persona toca el botón «No me interesa»: enviar el texto «Listo, no te enviaremos más premios 🙏» y agregar la etiqueta «NO CASINO» (créala si no existe).
3. Guardar y publicar el flujo.

Flujo 2: «Casino recompra»
- Igual que el Flujo 1, pero con la plantilla casino_recompra.

PARTE 3 — LO QUE ME DEVUELVES
- Estado de cada plantilla (en revisión, aprobada o rechazada; si fue rechazada, el motivo exacto).
- El NÚMERO de cada flujo: es el número que aparece en la dirección (URL) del navegador cuando el flujo está abierto. Ejemplo: en …/flows/1753286864407 el número es 1753286864407.
No envíes ninguna plantilla a contactos: solo créalas. Los envíos los hace otro sistema.
