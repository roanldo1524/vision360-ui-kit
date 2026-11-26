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
