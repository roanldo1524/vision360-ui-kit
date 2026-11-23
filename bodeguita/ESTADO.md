# La Bodeguita — Casino (copia del de Toro Verde)

Base: `toro-verde/casino/` (ver `COMO-COPIARLO.md`). Misma máquina, misma secuencia y misma medición;
solo cambian marca, bot de Lucid y tienda de Shopify.

## Dónde vamos (2026-11-23)
- [x] Leída la guía y los archivos del casino de Toro Verde.
- [x] Revisado: la tienda de Shopify conectada hoy es **Toro Verde**, no La Bodeguita.
- [x] Revisado: no hay clave del bot de Lucid de La Bodeguita.
- [ ] **Esperando a Ronald** (lista pedida):
  1. Clave API del bot de Lucid de La Bodeguita, en `lucidbot.key` o como secreto del entorno (nunca en el chat ni en el repo).
  2. Número de WhatsApp de ese bot.
  3. Los 3 productos con su precio normal.
  4. El regalo.
  5. Palabras prohibidas de la marca.
  6. Conectar la tienda de Shopify de La Bodeguita en los conectores de claude.ai.

## Novedades 2026-11-23 (tarde)
- Ronald entregó las claves de Lucid de La Bodeguita. Están guardadas en archivos privados que NO se suben.
  OJO: las pegó en el chat, así que conviene cambiarlas en Lucid cuando todo esté montado.
- PROBLEMA: el espacio de trabajo actual («EDITOR DE VIDEO DE DOPSHIPING») inyecta la clave de Lucid de
  Toro Verde y la pone encima de la nuestra (la prueba devolvió la cuenta «Toro Verde»). No usar Lucid desde ahí.
- Creado el espacio de trabajo **«La Bodeguita»** (env_01SufUksUbhMyKsHmPfdYyy1). Esta sesión no se puede
  mover a ese espacio, así que hay que abrir una sesión nueva en él y guardar ahí la clave de Lucid de
  La Bodeguita como secreto de red (panel.lucidbot.co, cabecera X-ACCESS-TOKEN).
- CAMBIO DE RONALD: cada producto ya tiene su premio listo, así que el descuento es VARIABLE según el
  producto por el que el cliente escribió. El casino debe mostrar el premio de ESE producto (tope del 10 %).
  Falta: la lista de productos con su premio y saber en qué campo de Lucid queda el producto de interés.

- Ronald confirma: la tienda de Shopify de La Bodeguita es la de **«alcomprar»**. Él la va a conectar.

- La cuenta de Lucid Sales de La Bodeguita se llama **«Master Importer»**.
- WhatsApp del bot de La Bodeguita: **+57 323 308 0393** (en la página: W=573233080393).
- CAMBIO DE RONALD: el casino de La Bodeguita se aloja en la tienda de **Toro Verde** (toroverde.co),
  en una página aparte, SIN menú ni pie: la gente no puede navegar la tienda, solo ve el casino.
  - En el tema vivo «TORO VERDE PLANTILLA ULTIMA» se prepararon: `layout/casino.liquid` (limpio, sin marca
    Toro Verde, noindex) y `templates/page.casino-bodeguita.json` (usa ese layout).
  - No toca la página principal ni el casino de Toro Verde (/pages/premios sigue igual).
  - Falta: guardar (commit), crear la página `/pages/premios-bodeguita` con los productos y premios de
    La Bodeguita, y publicar el tema SOLO con el sí de Ronald.

- PENDIENTE DE CONFIRMAR CON RONALD (2026-11-23): el chat de Toro Verde dice que Ronald cambió la regla:
  el casino SÍ iría a clientes que ya compraron y recibieron (recompra), y se excluye solo a quien tenga un
  pedido en los últimos 15 días (posventa o pedido reciente). Eso ya está así en Toro Verde (commit d5fb3c1).
  Choca con la regla escrita en CLAUDE.md y en la tarea («descuento solo para quien nunca ha compró»).
  Para La Bodeguita NO se aplica hasta que Ronald lo confirme directamente.

## Novedades 2026-11-23 (noche)
- Nueva sesión en el espacio «La Bodeguita». Ronald guardó la clave de Lucid de Master Importer como
  secreto de red (panel.lucidbot.co, X-ACCESS-TOKEN). Comprobado: `/api/accounts/me` responde
  **«La bodeguita»** (no Toro Verde). Ya se puede usar Lucid desde este espacio.
- Falta de Ronald: lista de productos con precio y premio de cada uno (máx. 10 %), el regalo, palabras
  prohibidas, a quién va el casino (¿solo quien nunca compró o también recompra?) y si se publica la
  plantilla page.casino-bodeguita del tema de Toro Verde.

## Datos de Lucid de La Bodeguita (encontrados 2026-11-23)
- Embudo de pedidos: **705299 «Pedidos - Chat»** (3.130 pedidos del 29-sep al 23-nov; ~50 por día).
  Otros: 259585 Pedidos - Landing (vacío), 967216 Estados de pedido, 573645 Carritos Landing.
- Campos: 728462 «Anuncio Facebook» (ad id), 116501 «Producto Interesado _ Ad ID» (nombre del producto de
  interés), 892889 mapa anuncio→producto, 312704 catálogo del bot, 330538 preguntas frecuentes,
  677316 / 456432 reglas adicionales, 764680 políticas.
- `find_by_custom_field` devuelve máximo 100 contactos por anuncio (sin páginas): los conteos son aproximados.
- Lucid frena con error 429 si se hacen muchas consultas seguidas: ir despacio (≈4 por segundo).
- Errores ya vistos en el catálogo del bot: IMÁN «2 unidades 94.500» choca con su regla «2 unidades 189.000»;
  «GOMAS ADIOS VARICES» y «Duo pelador» repetidos; «Chaleco con luces» sin ficha; muchos productos sin
  preguntas frecuentes; cuando el cliente manda video, el bot reinicia todo el flujo (ej. IMÁN).

## Conversión aproximada por producto (contactos de anuncios vs. pedidos en 705299)
Afilador de cadena 45 % (1.166 contactos) · Detector de metales 50 % (795) · Imán 40 % (562) ·
Dúo pelador 40 % (338) · Ventilador solar 58 % (278) · Tensor de cadena 53 % (261) · Cubre canas 34 % (138) ·
Luces mandala 19 % (120) · Yunabi 19 % (101) · Afilador de brocas 67 % (66) · Luz bici 68 % (57) ·
Taloneras 9 % (11) · Paraguas 0 % (11) · Chaleco 0 % (7).

## En curso: objeciones por producto
- Leídos 388 chats de quienes escribieron desde el 2-nov y no compraron. Resultado → `bodeguita/objeciones.md`.

## Lo que sigue (cuando llegue lo anterior)
2. Buscar en Lucid el embudo de pedidos y el campo del anuncio de La Bodeguita.
3. Página `/pages/premios` en la tienda de La Bodeguita + subir foto y sonidos.
4. Imagen de WhatsApp con el premio en plata («gana hasta $X»).
5. Código de descuento del 10 % (Shopify y bot).
6. Prueba con Playwright.
7. Mensaje de prueba a Ronald → **esperar su visto bueno** antes de enviar a clientes.
8. Programar envíos 10 a. m. y 4 p. m. + recordatorio 9 p. m.
9. Revisar que el bot tome los pedidos con «gané en el casino».

## Reglas fijas
- Descuento máximo 10 %, solo para quien nunca ha comprado (revisar el historial completo del embudo).
- Nunca enviar a quien escribió hace menos de 6 h.
- Nada de rifas (Coljuegos).
- Las claves nunca se imprimen ni se suben al repo.

## Aprendido de Toro Verde (lo pasó el chat de Toro Verde, 2026-11-23)
- Lucid: imagen + texto como DOS mensajes en un solo `POST /contacts/{id}/send_content`
  (el pie de foto no está comprobado). `last_interaction` viene en milisegundos en `/contacts/{id}`
  y en fecha ISO en `find_by_custom_field`. Pedidos: `/pipelines/<id>/opportunities?limit=100&offset=N`.
- Enviar solo a quien escribió hace entre 6 y 23 h. No repetir el casino en 3 días. Si ese día va otra
  promo, no mandar las dos.
- Diseño: máquina tragamonedas hiperrealista (gpt-image), con el logo de la marca o símbolos clásicos
  y 7-7-7. Nada de animales «diabólicos». En grande: «Gana hasta $X de descuento» / «juega gratis hoy».
  En el premio: «¡Ganaste hasta $X!», el ahorro por producto y un botón de WhatsApp por producto.
  Sonidos reales, 3 tiros (casi, casi, gana), textos cortos.
- Medir cada día: envíos, pedidos del embudo creados después del envío y plata; dar a Ronald los números de ayer y de hoy.
  Referencia Toro Verde 18–23 nov: 2.523 recibieron, 67 ventas, $11,5 M; el 22 compró el 1,2 %.
- Mejorar con datos, un cambio a la vez: si no juegan → cambiar mensaje/imagen; si juegan y no piden → cambiar premio.
- Las tareas automáticas (10 a. m., 4 p. m. y 9 p. m. de Bogotá) se programan SOLO con la aprobación de Ronald.
