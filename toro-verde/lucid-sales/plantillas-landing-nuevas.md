# Plantillas de WhatsApp para pedidos de la página (crear de nuevo)

**Dónde:** Lucid → Plantillas de WhatsApp → Crear (o business.facebook.com → WhatsApp Manager → Plantillas de mensajes → Crear).

**Clave para que se enlacen solas:** use **el mismo nombre** y **la misma cantidad de variables** que ya usa cada flujo. Así el flujo las encuentra sin cambiar nada más.
Si Meta dice que el nombre ya existe o fue borrado hace poco (Meta no deja reusar un nombre borrado por 30 días), agregue `_v2` al final (ej. `confirmacion_landing_v2`) y luego elíjala en el bloque del flujo.

**Ejemplos que pide Meta para las variables** (iguales en todas):
{{1}} Carlos · {{2}} Laura · {{3}} Toro Verde · {{4}} 1 x Herbicida Toro Verde 1 litro · {{5}} $99.000 · {{6}} Calle 5 # 3-20, Centro, Pitalito

**Orden:** primero la 1 (es la que confirma casi todos los pedidos), luego la 4, luego las demás.

---

## 1. `confirmacion_landing` — Utilidad — Español
Flujo: Plantilla CON RECAUDO 1 Landing
- **Encabezado (texto):** Confirme su pedido
- **Cuerpo:**
```
Hola {{1}} 👋 Soy {{2}} de {{3}}. Recibimos su pedido:
📦 {{4}}
💵 Total: {{5}} (paga al recibir, envío gratis)
📍 {{6}}
¿Lo confirmamos para despacharlo?
```
- **Pie:** Seleccione una opción
- **Botones (respuesta rápida):** CONFIRMAR PEDIDO · MODIFICAR DATOS

## 2. `confirmacion_landing_2` — Utilidad — Español
Flujo: Plantilla CON RECAUDO 2 Landing
- **Encabezado:** Su pedido está pendiente
- **Cuerpo:**
```
Hola {{1}} 👋 Soy {{2}} de {{3}}. Su pedido sigue sin confirmar:
📦 {{4}}
💵 Total: {{5}}
📍 {{6}}
¿Lo confirmamos para despacharlo?
```
- **Pie:** Seleccione una opción
- **Botones:** CONFIRMAR PEDIDO · MODIFICAR DATOS

## 3. `confirmacion_landing_3` — Utilidad — Español
Flujo: Plantilla CON RECAUDO 3 Landing
- **Encabezado:** Último aviso de su pedido
- **Cuerpo:**
```
Hola {{1}}, soy {{2}} de {{3}}. Sin su confirmación no podemos despachar:
📦 {{4}}
💵 Total: {{5}}
📍 {{6}}
Toque una opción para continuar 👇
```
- **Pie:** Su confirmación es necesaria
- **Botones:** CONFIRMAR PEDIDO · MODIFICAR DATOS

## 4. `confirmacion_sin_recaudo_landing` — Utilidad — Español
Flujo: Plantilla SIN RECAUDO Landing (pedidos ya pagados)
- **Encabezado:** Su compra está en proceso
- **Cuerpo:**
```
Hola {{1}} 👋 Soy {{2}} de {{3}}. Recibimos su pedido pagado:
📦 {{4}}
🚚 Envío gratis. Le avisamos cuando salga.
```
- **Pie:** Gracias por su confianza
- Sin botones.
- **Ojo:** en este flujo el bloque tiene un ícono de hexágono en vez del logo de WhatsApp. Bórrelo y ponga un bloque de **plantilla de WhatsApp** (el del logo verde) con esta plantilla, como en los otros flujos. Conecte «Fallo» igual que en CON RECAUDO 1.

## 5. `carrito_correccion` — Marketing — Español
Flujo: Plantilla CARRITO 1 Landing
- **Encabezado:** Su pedido lo espera
- **Cuerpo:**
```
Hola {{1}} 👋 Soy {{2}} de {{3}}. Su pedido quedó sin terminar:
📦 {{4}}
Envío gratis y paga al recibir. ¿Lo completamos?
```
- **Pie:** Responda este mensaje y le ayudamos

## 6. `carrito_landing_2` — Marketing — Español
Flujo: Plantilla CARRITO 2 Landing
- **Encabezado:** ¿Le ayudamos a terminar?
- **Cuerpo:**
```
Hola {{1}}, soy {{2}} de {{3}}. Su pedido sigue guardado:
📦 {{4}}
🚚 Envío gratis y paga al recibir.
```
- **Pie:** Responda este mensaje y lo dejamos listo

## 7. `carrito_landing_3` — Marketing — Español
Flujo: Plantilla CARRITO 3 Landing
- **Encabezado:** Último recordatorio
- **Cuerpo:**
```
Hola {{1}}, soy {{2}} de {{3}}. Su pedido todavía está guardado:
📦 {{4}}
Responda este mensaje y lo dejamos listo 🙌
```
- **Pie:** Envío gratis · paga al recibir

---

## Cuando Meta las apruebe (en cada flujo)
1. Haga clic en el bloque de WhatsApp y confirme que tiene elegida la plantilla con ese nombre (si usó `_v2`, elíjala ahí).
2. Revise las casillas: {{1}} primer nombre · {{2}} nombre del asesor · {{3}} Toro Verde · {{4}} Producto_Ordenados · {{5}} Total a pagar · {{6}} Direccion_1.
3. Toque **Publicar** y confirme que no quede punto amarillo.
4. En CON RECAUDO 3: «Fallo» (no «Entregado») debe ir a «Espere 2 minutos».
