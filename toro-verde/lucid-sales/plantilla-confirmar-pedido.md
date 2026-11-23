# Plantilla «confirmar_pedido_robot» (para clientes que no confirmaron y llevan más de 24 h sin escribir)

**Dónde:** Lucid → Plantillas de WhatsApp → Crear (o business.facebook.com → WhatsApp Manager → Plantillas de mensajes → Crear).

- **Nombre:** `confirmar_pedido_robot`
- **Categoría:** Utilidad (es sobre un pedido que el cliente ya hizo; Meta la aprueba más rápido y es más barata que Marketing)
- **Idioma:** Español (COL) o Español

**Cuerpo (copiar tal cual):**
> Hola {{1}}, tu pedido de Toro Verde está listo para despacho: {{2}}. Pagas al recibir. ¿Lo despachamos?

**Ejemplos que pide Meta:**
- {{1}} = Breiner
- {{2}} = 2 litros por $169.000, para reclamar en la oficina de Interrapidísimo de Guamal

**Botones (respuesta rápida):**
1. `CONFIRMAR PEDIDO`
2. `CAMBIAR DATOS`

## Flujo en Lucid: «Robot - Confirmar pedido»
1. Bloque de **plantilla de WhatsApp** (logo verde) con `confirmar_pedido_robot`:
   - {{1}} = nombre del contacto (first name)
   - {{2}} = campo **Resumen_confirmacion_pedido** (el robot lo llena antes de mandarla)
2. Botón **CONFIRMAR PEDIDO** → mensaje: «🎉 ¡Gracias por confirmar tu pedido! El tiempo estimado de entrega es de 3 a 7 días hábiles…» (el mismo de siempre: el robot lo reconoce).
3. Botón **CAMBIAR DATOS** → pasar al bot (o a una persona) con: «Claro, ¿qué dato quieres cambiar: dirección, producto o teléfono?»
4. Si falla el envío, no hacer nada más.

Cuando esté aprobada, pasar el número del flujo (sale en la URL: panel.lucidbot.co/en/flow?id=**NÚMERO**) para ponerlo en `robot-despacho/recordar_confirmar.py` (FLUJO_CONFIRMAR).

El robot la manda **una sola vez por pedido**, solo a pedidos frenados porque el cliente no ha confirmado, de 8 a. m. a 8 p. m. Cuando el cliente toca «CONFIRMAR PEDIDO», la siguiente vuelta (máx. 15 min) lo confirma.
