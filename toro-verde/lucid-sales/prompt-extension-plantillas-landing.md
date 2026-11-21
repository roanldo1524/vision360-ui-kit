# Instrucciones para la extensión de Claude en Chrome (Lucid Bot)

Pegar completo en el panel de Claude (ícono ✳) con panel.lucidbot.co abierto.

---

Estoy en Lucid Bot de Toro Verde. Desde hoy a las 10 a. m. los pedidos de la página (Shopify) no reciben el mensaje de confirmación: el flujo «Plantilla CON RECAUDO 1 Landing - LucidSales» (Flujos → Lucid Sales (V3 Pro) → Plantillas de WhatsApp → Venta por landing) cae en «Fallo». Ese flujo tiene un punto amarillo y se modificó hoy al reinstalar la plantilla de Lucid. Necesito que lo arregles y que dejemos plantillas más cortas. Reglas: háblale al cliente de «usted», textos cortos, nunca uses «orgánico», «natural», «ecológico», «sin veneno» ni «no tóxico». No borres ningún flujo. Muéstrame cada cambio y espera mi «sí» antes de guardar, publicar o enviar algo a Meta.

## PARTE 1 — Arreglo inmediato (que vuelva a salir hoy)
1. Abre «Plantilla CON RECAUDO 1 Landing - LucidSales». Toca el bloque «Confirmación CON RECAUDO».
2. Dime qué plantilla de WhatsApp tiene seleccionada (debe ser «confirmacion_landing», español) y qué dato tiene cada variable {{1}} a {{6}}.
3. Abre «Plantilla CON RECAUDO 2 Landing - LucidSales» (no tiene punto amarillo) y mira cómo están asignadas allá las variables. Copia esa misma asignación en el flujo 1. Si no hay referencia, usa: {{1}} primer nombre del contacto · {{2}} nombre del asesor · {{3}} Toro Verde · {{4}} campo Producto_Ordenados · {{5}} campo Total a pagar · {{6}} campo Direccion_1.
4. No toques las conexiones: «CONFIRMAR PEDIDO» va a «Enviar flujo CL - LucidSales», «MODIFICAR DATOS» va a «Enviar flujo MPL - LucidSales» y «Fallo» va a la espera de 2 minutos y luego a la etiqueta de fallo.
5. Con mi «sí»: guarda y toca «Publicar». Confirma que el punto amarillo desapareció.
6. Revisa «Plantilla SIN RECAUDO Landing» y «Plantilla CARRITO 1 Landing»: que su plantilla exista y todas sus variables tengan dato. Si algo está vacío, avísame.

## PARTE 2 — Plantillas nuevas más cortas (Plantillas de WhatsApp → Crear)
Crea estas tres. Ejemplos para Meta: nombre «Carlos», producto «1 x Herbicida Toro Verde 1 litro», total «$99.000», dirección «Calle 5 # 3-20, Centro, Pitalito».

**A) confirmar_pedido_tv** · Utilidad · Español
- Encabezado (texto): Confirme su pedido
- Cuerpo:
  Hola {{1}} 👋, recibimos su pedido de Toro Verde:
  📦 {{2}}
  💵 Total: {{3}} · lo paga al recibir, envío gratis
  📍 {{4}}
  ¿Lo confirmamos para despacharlo?
- Botones de respuesta rápida: CONFIRMAR PEDIDO · MODIFICAR DATOS

**B) pedido_pagado_tv** · Utilidad · Español
- Encabezado (texto): Su pedido está listo
- Cuerpo:
  Hola {{1}} 👋, recibimos su pedido pagado de Toro Verde:
  📦 {{2}}
  📍 {{3}}
  ¿Confirmamos la dirección para despacharlo?
- Botones: CONFIRMAR PEDIDO · MODIFICAR DATOS

**C) carrito_tv** · Marketing · Español
- Cuerpo:
  Hola {{1}}, su pedido de Toro Verde quedó sin terminar. ¿Le ayudamos a completarlo? Lo paga al recibir y el envío es gratis 🚚
- Botones: TERMINAR PEDIDO · TENGO UNA DUDA

Envíalas a aprobación con mi «sí».

## PARTE 3 — Enlazarlas (solo cuando Meta las apruebe)
1. Duplica cada flujo antes de cambiarlo (copia de respaldo).
2. «Plantilla CON RECAUDO 1 Landing»: en el bloque de WhatsApp cambia la plantilla por «confirmar_pedido_tv». Variables: {{1}} primer nombre · {{2}} Producto_Ordenados · {{3}} Total a pagar · {{4}} Direccion_1 + Ciudad. Conecta «CONFIRMAR PEDIDO» y «MODIFICAR DATOS» exactamente a los mismos bloques de antes. Deja «Fallo» igual.
3. «Plantilla SIN RECAUDO Landing»: plantilla «pedido_pagado_tv», mismas conexiones de botones que tenía.
4. «Plantilla CARRITO 1 Landing»: plantilla «carrito_tv»; «TERMINAR PEDIDO» va a donde iba el botón de completar compra y «TENGO UNA DUDA» al bot de ventas (o a donde iba el otro botón).
5. Con mi «sí», publica cada uno y confirma que no quedan puntos amarillos.
