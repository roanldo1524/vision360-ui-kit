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

- Ronald (2026-11-23): **los precios válidos son los del catálogo del bot** (campo 312704). No pedirlos de nuevo.
  Ojo Imán: en pedidos reales se cobró 1 und a 109.000 (13 pedidos) y 2 und a 199.000, aunque el catálogo dice
  1 und 99.000. Revisar si fue un cambio de precio.

## En curso: objeciones por producto
- Leídos 388 chats de quienes escribieron desde el 2-nov y no compraron. Resultado → `bodeguita/objeciones.md`
  (motivos por producto, frases de clientes, errores del bot, preguntas y reglas listas para pegar, ventas recuperables).
- Fallas que se repiten en casi todos los productos:
  1. El bot NO da el precio en texto cuando lo preguntan («a cómo», «cuánto vale»): Imán, Mandala, Yunabi, Afilador, Pelador.
  2. Reinicia el guion completo si el cliente manda video, enlace o vuelve a escribir.
  3. Precios que cambian según el chat (Afilador 129.000 vs 129.900; Mandala 109.000/109.900/129.900; Imán 99.000/99.900).
  4. Inventa o se contradice (Mandala: «sí/no se pegan a la pared»; «revisas antes de pagar», lo contrario de la política).
  5. Ofrece descuentos de $5.000 por su cuenta, y las reglas 24 y 96 de descuentos se contradicen.
  6. No cierra: pregunta «¿cuántas unidades?», «¿qué color?», pide datos uno por uno o datos que ya tiene.
  7. Promete «una asesora te contacta en minutos» y nadie aparece.
- ESPERANDO el sí de Ronald para pegar los arreglos en Lucid y para escribirle a las ventas recuperables.

## Casino La Bodeguita — armado (2026-11-23 noche)
- `bodeguita/casino/pagina-premios-bodeguita.html`: misma máquina de Toro Verde (foto sin marca, sonidos ya en Shopify).
  El premio sale del producto del enlace (`?p=afilador|detector|iman|pelador|ventilador|tensor|canas|mandala|brocas|bici|yunabi`),
  10 % sobre el precio del catálogo, redondeado hacia arriba para no pasar nunca del 10 %. Código BODEGUITA10. Sin regalo.
  WhatsApp 573233080393. Probado con Playwright (mandala, imán, producto desconocido → afilador): sin errores.
- Ronald pidió que la máquina se vea real como la imagen: rodillos tipo tambor con borde dorado, 7 rojos con filo
  dorado y línea verde de neón sobre la foto real de la máquina (vistas: `casino/vista-antes.png`, `casino/vista-gana.png`).
- `bodeguita/casino/casino-wa-bodeguita.jpg`: imagen de WhatsApp («Gana hasta 10 % de descuento en tu pedido»).
- `bodeguita/casino/casino_envio.py`: 6–23 h callado, nunca compró (todo 705299), 3 días sin repetir, revisa justo antes
  de enviar, comprueba que la cuenta sea La Bodeguita. Modos: contar (por defecto), `--prueba <número>`, `--enviar`.
  Conteo de prueba 23-nov: 349 para enviar (afilador 151, canas 46, pelador 41, detector 37, tensor 34, mandala 28, imán 12).
- FALTA (con el sí de Ronald): subir imagen a Shopify Archivos; crear la página /pages/premios-bodeguita con la plantilla
  page.casino-bodeguita; publicar el tema; que el bot reconozca «gané en el casino … BODEGUITA10» y aplique el 10 %;
  número de WhatsApp de Ronald para la prueba; programar 10 a. m. / 4 p. m.

## Prueba del mensaje (2026-11-23)
- Números para la prueba: Ronald 573218940042; Sandra (administra el bot) 573146851127.
- Ninguno ha escrito al bot en las últimas 24 h (Ronald hace 137 h, Sandra hace 53 días): WhatsApp no deja
  mandarles mensaje libre. Tienen que escribir «hola» al bot +57 323 308 0393 y ahí se manda la prueba.
- La prueba completa también necesita la imagen en Shopify y la página publicada (falta el sí de Ronald).

## CAMBIO DE RONALD (2026-11-23 noche): el casino NO puede mostrar nada de Toro Verde
- La prueba a Ronald (solo texto, enlace toroverde.co/pages/premios-bodeguita) lo llevó al inicio de Toro Verde
  porque la página no existía. Ronald: nada de Toro Verde, ni banner; pantalla completa; el mensaje va con foto.
- Nueva versión: `bodeguita/casino/web/` (index.html a pantalla completa + casino-wa.jpg liviana). Se publicará en
  Vercel como proyecto propio «casino-labodeguita» (casino-labodeguita.vercel.app), no en Shopify.
  Fotos de la máquina y sonidos siguen en cdn.shopify.com (dirección genérica, no muestra marca).
- Vercel pidió permiso para el equipo «matrix-ops»: se le pasó el enlace a Ronald. Después: publicar, cambiar
  PAGINA e IMAGEN en casino_envio.py a la dirección nueva y mandar la prueba completa a Ronald.
- Ya no hace falta publicar el tema de Toro Verde para La Bodeguita.

## PUBLICADO (2026-11-23 noche)
- Casino en **https://casino-labodeguita.vercel.app/** (Vercel, equipo matrix-ops, proyecto casino-labodeguita).
  Pantalla completa, sin nada de Toro Verde. Protección de Vercel solo en vistas previas (la principal es pública).
  Se publicó pasando el archivo directo (GitHub frenaba a Vercel). Para cambios: volver a publicar web/index.html.
- Foto del mensaje: raw.githubusercontent.com/…/88206144…/bodeguita/casino/web/casino-wa.jpg (repo público).
- casino_envio.py ya usa esas direcciones. Prueba completa (foto + texto + enlace) enviada a Ronald: OK.
- Falta: visto bueno de Ronald; que el bot de Lucid reconozca BODEGUITA10 (su sí); programar envíos (su sí).

## Casino automático por producto (2026-11-23 noche)
- Ronald: el premio va sobre el ÚLTIMO producto por el que el cliente entró o preguntó, y los productos nuevos del
  catálogo deben entrar solos. Hecho:
  - casino_envio.py lee el catálogo del bot (312704) en cada envío: producto, cantidades y precios (34 productos hoy).
    Filtra precios mal cargados (ej. imán «2 unidades 94.500») y repetidos (mandala 1 und = 3 und → 3 unidades).
  - Lucid NO actualiza el campo 116501 (se queda con el producto del primer anuncio). Por eso el script lee los
    últimos 40 mensajes del chat y toma el último producto mencionado (palabra completa; desempata productos
    parecidos como «detector» vs «detector disco»). Si no encuentra ninguno, usa el del anuncio.
    Prueba con 8 clientes que cambiaron de producto: acierta en todos (los 2 «raros» de verdad preguntaron otro al final).
  - La página recibe el producto y sus precios en el enlace (`t=` nombre, `o=` «2 unidades~219900|1 unidad~129900»).
    Republicada en Vercel (pasando el archivo directo: GitHub sigue frenando a Vercel).
- Prueba de foto con texto en un solo mensaje (pie de foto «caption») enviada a Ronald: Lucid respondió success;
  falta que Ronald confirme si se ve el texto debajo de la foto.
- HALLAZGO: el bot de posventa responde «mi función es el seguimiento de tu pedido y no gestiono ventas» cuando un
  cliente que ya compró pregunta por otro producto (ej. …9410 pidió info del detector). Venta perdida: arreglar.

## ARRANCÓ (2026-11-23 8:40 p. m. Bogotá) — Ronald: «sí, empecemos, full al casino»
- Ronald aprobó la foto con texto en un solo mensaje → casino_envio.py manda 1 mensaje (imagen con pie de foto).
- Bot: nueva regla «0 - CASINO LA BODEGUITA (BODEGUITA10)» al inicio de Reglas_adicionales2_LucidSales (bot field 456432).
  Manda sobre las reglas de descuento 14, 24, 86 y 96; 10 % solo sobre lo que trae el mensaje; nota «CASINO BODEGUITA10».
  Lectura: GET /accounts/bot_fields/456432. Escritura: POST /accounts/bot_fields/456432 con FORMULARIO (value=…);
  con JSON da 400. Respaldo: scratchpad bdg/botf/456432_antes_casino_*.json. Las otras 109 reglas quedaron iguales.
- Primer envío real 23-nov 8:40 p. m.: 445 tibios de 6–23 h, 61 ya habían comprado (fuera) → **384 enviados, 0 fallos**.
- Tarea programada «Casino La Bodeguita 10 a. m. y 4 p. m.» (trig_01G3woJafayZRfv8QHcMHaD6, 10:07 y 16:07 Bogotá):
  envía, mide con casino_medir.py, anota aquí y le reporta a Ronald.
- casino_medir.py: pedidos de 705299 creados después del envío (hasta 3 días). created_at de Lucid viene en UTC.
- RIESGO: enviados.json (a quién y cuándo se mandó) vive solo en el contenedor y NO se sube (tiene teléfonos y el
  repo es público). Si el contenedor se borra se pierde el «no repetir en 3 días» y la medición. Pendiente: guardarlo
  en Lucid (etiqueta o campo por contacto).
- Pendiente: aviso de las 9 p. m. («vence a medianoche») para La Bodeguita; arreglar la posventa que dice «no gestiono ventas».

## Resultados del casino
- 24-nov 10:09 a. m. — Envío del 23-nov (8:48 p. m., 384): 377 no respondieron, 6 respondieron (2 «¿cómo se juega?»,
  1 «¿qué es eso?», 1 «hasta el 5 no me pagan», 1 pidió info, 1 automático). 0 escribieron «gané». 1 pedido después
  (1 afilador, sin código: no se sabe si vino del casino). El mensaje del casino sale en Lucid como «[Complex Message]».
- Cambio 1 (24-nov 10:15): mensaje v2 que explica en una línea y da 2 caminos: jugar en el enlace o responder
  «QUIERO MI PREMIO». Bot (regla 0, campo 456432) reconoce «QUIERO MI PREMIO» / «cómo se juega» y da el 10 % del último
  producto con el precio. Respaldo: bdg/botf/456432_antes_quieropremio_*.json.
- Envío 24-nov 10:15 a. m. (mensaje v2): 482 tibios, 93 ya compraron, 146 ya lo recibieron en 3 días → 243 para enviar,
  **242 enviados, 0 fallos** (1 escribió en las últimas 6 h y se saltó).
- 24-nov 11:00: 626 recibieron (384 + 242); 1 pedido posible (afilador, sin código). De los 242 de hoy, 1 respondió
  «¿cómo hago para jugar?» y el bot le explicó el USO del afilador: el bot NO puede leer el texto debajo de la foto
  (para él es solo una imagen). Arreglo: regla 0 ahora reconoce «jugar / casino / ruleta / tiros / premio / el 10%»
  y sabe que una imagen enviada + esas palabras = casino. Respaldo bdg/botf/456432_antes_jugar_*.json.
- 24-nov 11:05: con el sí de Ronald se le mandó a …4009 el premio directo (afilador $116.100 en vez de $129.000). Revisado antes: no tiene pedidos.
- Ronald (24-nov): en los pedidos del casino el valor debe quedar CON el descuento (para que la asesora lo vea y a Dropi
  suba ese valor). Regla 0, punto 5: precio, subtotal y «Total pedido» siempre con el 10 % descontado + nota
  «CASINO BODEGUITA10 – precio con 10%: $X (normal $Y)». Respaldo bdg/botf/456432_antes_preciodropi_*.json.
  Falta comprobarlo con el primer pedido real del casino. Para que yo suba o confirme en Dropi hace falta acceso a la
  cuenta de Dropi de La Bodeguita (aún no lo hay).
- 24-nov 4:07 p. m.: 332 tibios, 55 ya compraron → **95 enviados, 0 fallos**. Total casino: 721 recibieron.
  Ventas después del casino: 2 pedidos a precio normal (afilador $129.000 y cubre canas $69.900 = $198.900), 0 con el
  código. Respuestas: casi ninguna (7 de 626). casino_medir.py marca $0 porque esos pedidos no traen «Total» en el título.
  Propuesta a Ronald: cambio 2 = premio directo sin juego («hoy en $X en vez de $Y, responde SÍ»).
- 25-nov 10:33 a. m.: 466 tibios, 77 ya compraron → **378 enviados, 0 fallos**. Total casino: 1.099 recibieron.
  Pedidos después del casino: 4 (afilador $129.000, cubre canas $69.900, imán y mandalas el 24-nov ~6:40 p. m.,
  títulos sin total), NINGUNO usó el premio. Ronald aún no responde a la propuesta del premio directo sin juego.
- Ronald (24-nov): en este chat SOLO datos de La Bodeguita; no compararla ni mencionar Toro Verde.
- Pendiente técnico: la foto de la máquina y los sonidos del casino todavía se cargan desde el almacenamiento de
  Shopify de otra tienda (no se ve marca). Pasarlos a un alojamiento propio de La Bodeguita.

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
