# Plantillas de WhatsApp para Meta (Lucid)

Sirven para escribirle al cliente cuando el chat ya está cerrado (más de 24 horas sin hablar).
Categoría: **Utilidad** (no Marketing: no llevan precios, promos ni descuentos). Idioma: Español (COL).

## 1. `confirmar_pedido_tv`
**Cuerpo:**
Hola {{1}}, te escribimos de Toro Verde por tu pedido de {{2}} para {{3}}, pago contra entrega. Ya está listo para salir. ¿Lo despachamos?

**Botones de respuesta rápida:**
- Sí, despáchenlo
- Quiero cambiar algo

Ejemplo para Meta: {{1}} = Gonzalo · {{2}} = 1 litro de Herbicida Toro Verde · {{3}} = Cumbitara, Nariño

## 2. `aclarar_dato_pedido_tv`
**Cuerpo:**
Hola {{1}}, te escribimos de Toro Verde por tu pedido de {{2}}. Antes de despacharlo necesitamos confirmar un dato: {{3}}. Respóndenos por aquí y lo dejamos listo.

**Botón de respuesta rápida:**
- Ya les respondo

Ejemplo para Meta: {{1}} = Walter · {{2}} = 1 litro de Herbicida Toro Verde · {{3}} = ¿lo envío a tu casa o lo reclamas en la oficina de Interrapidísimo?

## 3. `pedido_en_proceso_tv` (pedidos de Shopify sin confirmar — Ronald 26-11, versión mejorada)
**Categoría:** Utilidad · **Idioma:** Español (COL)

**Cuerpo:**
Hola {{1}} 😊 ¡Muchísimas gracias por tu compra y por confiar en Toro Verde!

Tu pedido ya está listo para salir 🚚📦
• {{2}}
• {{3}}
• Pagas al recibir

Solo falta tu confirmación para despacharlo hoy mismo. Toca *Sí, despáchenlo* y sale 🙌

Apenas tengamos el número de guía te lo compartimos para que sigas tu envío 🌱🐂

**Botones de respuesta rápida:**
- Sí, despáchenlo
- Quiero cambiar algo

Ejemplo para Meta: {{1}} = María · {{2}} = 1 litro de Herbicida Toro Verde · {{3}} = Reclamas en la oficina de Interrapidísimo de Pasto

Cuando Meta la apruebe: en Lucid crea un flujo que solo envíe esta plantilla y pásame su número; lo pongo en `FLUJO_SHOPIFY` (recordar_confirmar.py).
Mientras tanto el robot manda el mismo mensaje (con el total) cuando el chat del cliente está abierto. Si responde que sí, el robot confirma solo.

## Cómo crearlas (Ronald)
1. Lucid → Configuración → WhatsApp → Plantillas → Nueva plantilla (o en Meta Business Suite → WhatsApp Manager → Plantillas de mensajes).
2. Pega el nombre, la categoría «Utilidad», el idioma, el cuerpo, los botones y los ejemplos de arriba.
3. Enviar a revisión. Meta suele aprobar en minutos u horas.
4. Cuando estén aprobadas, avisa en el chat del robot y las conecto a las vueltas (de 5 a. m. a 8 p. m., nunca de noche).

## 4. `rastreo_pedido_tv` (rastreo humanizado: Ronald 26-11)
Categoría: **Utilidad**. Idioma: español. La usan rastreo.py y cas_auto.py cuando el chat del cliente está cerrado (más de 24 h). La mayoría de los avisos de oficina y de reparto caen aquí, y son los que evitan devoluciones.
Texto:
> Hola {{1}} 👋 Te escribe Karen de Toro Verde. Actualización de tu pedido: {{2}}. Para recibirlo ten a la mano tu cédula y el pago contra entrega de {{3}}. ¿Te podemos ayudar en algo?

Variables: {{1}} nombre · {{2}} etapa con el detalle (por ejemplo, «ya está disponible en la oficina de Interrapidísimo de Doradal, CLL 23 25 30» o «hoy sale a reparto en Tuluá») · {{3}} valor.
Botones de respuesta rápida: «Voy a reclamarlo» · «No puedo ir» · «Tengo una duda».
Cuando Meta la apruebe, crea en Lucid un flujo que solo envíe esta plantilla y pásame su número para ponerlo en `FLUJO_RASTREO`.

## Versión persuasiva final (Ronald 26-11: «deben ser persuasivos, que realmente funcionen»)
**Esta versión reemplaza los textos de arriba.** El texto exacto que se crea en Lucid está en `lucid-sales/prompt-claude-plantillas-robot.md`.
Qué la hace persuasiva sin dejar de ser de utilidad:
- **Hoy:** «listo para salir hoy» y «sale hoy mismo». La gente actúa cuando el beneficio es inmediato.
- **Un solo toque:** el botón dice exactamente lo que pasa («Sí, envíenlo hoy»), sin tener que escribir.
- **Miedo a perder:** en rastreo, «la transportadora solo lo guarda unos pocos días y, si no se recibe, lo devuelve». Es la frase que más baja las devoluciones por no reclamar.
- **Una persona, no una empresa:** «Soy Karen, de Toro Verde».
- **Sin riesgo:** «pagas cuando lo recibes».
- Sin precios de promoción, descuentos ni palabras prohibidas, para que Meta la apruebe como Utilidad.
