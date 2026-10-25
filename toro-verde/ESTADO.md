# Estado del proyecto Toro Verde

Última actualización: 11 de octubre de 2026.

## Dónde está cada cosa
- Plan de la Máquina Creativa: `docs/maquina-creativa-ugc.md` (original en https://claude.ai/artifact/FyyrfnVF3S2K4Lzov4g2cX).
- Plan de recompra en Lucid Bot: `docs/recompra-lucid-bot.md` (original en https://claude.ai/artifact/4Qu5RYU6hEe26RRBdJvZ7R).
- Código hecho antes en el computador (no está en este repositorio todavía):
  - Carpeta `TORO VERDE-MARKETING/lucidbot-recompra/`: 11 plantillas desde el día 3, la máquina de estados y el brief para Lucid Bot, además de `imagenes_plantillas.json`, `guia_visual_recompra.md` y `segmentos_recompra_toroverde.csv`.
  - CREATIVE OS: app desplegada antes con Claude Code.
  - Para traerlos aquí: subir esas carpetas a este repositorio en GitHub (botón "Add file → Upload files").

## PRIORIDAD: recuperar el código de la plataforma
- La plataforma está publicada en https://maquina-creativa.vercel.app/crm (Vercel, equipo "Mi ciclo", plan Hobby) y usa Supabase.
- El proyecto de Vercel NO tiene repositorio de Git conectado: se publicó desde una carpeta con la CLI de Vercel. El código fuente está guardado en el último deployment.
- Plan de recuperación:
  1. Con la variable `VERCEL_TOKEN` y la red abierta a `api.vercel.com`, listar los deployments del proyecto `maquina-creativa` y descargar todos los archivos fuente del último (API `GET /v6/deployments/{id}/files` y `GET /v7/deployments/{id}/files/{fileId}`).
  2. Guardar el código en un repositorio de GitHub propio (por ejemplo `roanldo1524/maquina-creativa`).
  3. Conectar ese repositorio al proyecto de Vercel (Settings → Git) para que cada cambio quede guardado y se publique solo.
  4. Las variables de Supabase se copian desde Vercel (Settings → Environment Variables), nunca se suben al repositorio.
- No construir una plataforma nueva: se sigue editando la que ya existe.

## Máquina Creativa: qué sigue
Fase 1, el cerebro: análisis de los 95 videos, ADN de marca, guionista con 3 críticos y la tanda en PDF.
Falta para arrancar:
- [ ] Reconectar Meta Ads y Notion en los conectores de Claude.
- [ ] Carpeta de Drive con los 95 videos, nombrados igual que en Meta (o el export de Meta).
- [ ] API key de Lucid Bot y el endpoint para disparar un flujo o una plantilla.
- [ ] Decidir quién despliega la app y quién aprueba las tandas cuando el dueño no está.

## Recompra Lucid Bot: plan por semanas
- Semana 1 (7–13 oct): validar margen del galón a $249.900, cotizar el medidor de 130 ml, subir plantillas a Meta, importar segmentos, reactivar el segmento 2.
- Semana 2 (14–20 oct): ajustar ENTREGADO, activar días 3 y 7, audios de Jaime, reactivar segmentos 3 y 4.
- Semana 3 (21–27 oct): activar días 14, 21, 28 y 35.
- Semana 4 (28 oct – 3 nov): activar días 50, 65 y 90, referidos y primer corte de métricas.
- Pregunta abierta: ¿Lucid Bot crea el pedido en Dropi directo desde el botón "Sí, mándemelo"?

## Recompra: lo que ya está montado en Lucid Bot (captura del 11 oct)
Carpeta Flujos / Recompra, 20 flujos, todos con Estado y Bandeja de Entrada encendidos:
- Secuencia: RC S1 Día 3 dosis · RC d3 Ya aplicó (dosis) · RC S2 Día 10 cómo le quedó · RC S3 Día 25 referidos · RC S4 Día 30 otro lote · RC S5 Día 55 mantenimiento · RC S6 Día 70 precio guardado · RC S7 Día 90 cómo le fue.
- Ramas: Diagnóstico (RESCATE) · Evento adverso (EVENTO_ADVERSO) · Pedir foto (SATISFECHO).
- Respuestas: Duda (humano) · No recibir mensajes (OPT_OUT) · Oferta precio cliente · Referidos mensaje · Consejos lluvias · Rinde y precio por bomba · Gracias por ahora no.
- Campañas: Finca Toro Verde (2da entrega) · Campaña Lluvias.
- Ojo: el calendario montado (3, 10, 25, 30, 55, 70, 90) no es el del documento (3, 7, 14, 21, 28, 31, 35, 50, 65, 90). Hay dos flujos de día 3 (S1 y d3).

## Conexión con la API de Lucid Bot (11 oct)
- La API funciona (cuenta Toro Verde, 27.492 contactos). La clave NO se guarda en el repositorio.
- Lo que la API deja hacer: listar flujos, etiquetas y campos; leer y editar un contacto (etiquetas y campos); enviarle un flujo, texto o archivo a un contacto.
- Lo que la API NO deja: leer el contenido de un flujo, ver los pasos de una secuencia, ver plantillas de Meta ni contar contactos por etiqueta. Eso se revisa con capturas del panel.
- Secuencia que maneja los días: "RC Recompra Toro Verde" (id 306056).
- Hay un flujo viejo "Flujo de recompra" (id 1771620943449): confirmar que esté apagado para que no choque con los RC.
- Hay tres etiquetas de entrega: "Entregado", "Pedido Entregado" y "Entrega realizada". Confirmar cuál pone Dropi y cuál mete al cliente a la secuencia.
- Campos de recompra que ya existen: fecha_entregado, ciclo_recompra, paso_recompra, segmento_recompra, es_recompra, escalon_oferta, dias_desde_ultima, compras_entregadas, ultimo_producto, ultimo_ticket, cultivo, maleza, referidor.
- Etiquetas de recompra: SEG_1_RECIENTE, SEG_2_VENTANA, SEG_3_VENCIDO, SEG_4_DORMIDO, SATISFECHO, RESCATE, SUBDOSIS, EVENTO_ADVERSO, OPT_OUT, RECOMPRA, RECOMPRA_LISTA, VIP_RECOMPRA, CLIENTE_TORO, REFERIDO_AFILIADO.

## Editor de videos (reels de creadoras)
- Se trabajó en un chat de claude.ai (no en Claude Code). Resultado guardado en la página "Reels Toro Verde": https://claude.ai/artifact/Ee9PwhBAQeCaZewXA9mVML (videos 1 a 9 con sus versiones viral, PRO e imperial, actualizada el 3 oct).
- El código del editor (los scripts que cortaban, subtitulaban y mezclaban) no quedó en ningún repositorio; vivía dentro de ese chat.
- Reglas de edición que usaba: Fugaz One + Verde Vital (#C8F520) y Verde Roble (#043434); subtítulos palabra por palabra en zona segura de Meta, palabra clave en verde; cortes en cada pausa, nada quieto más de 2–4 s; voz de la creadora al frente y música libre (Pixabay) que baja cuando habla; efectos de sonido en los cortes, no encima de la voz; textos que nunca tapan la cara; cierre con envío gratis, pago contra entrega, toroverde.co y el mantra "Controle con fuerza. Proteja su tierra."

## Lucid Sales: oficina principal de Interrapidísimo (aplicado el 19 oct)
- Guardado en el campo `Reglas_adicionales2_LucidSales` (ahora 77 reglas): nueva regla 77 y ajustes a 12, 21, 56, 72 y 73 (punto 5). Textos en `lucid-sales/PEGAR-en-lucid-sales.md`.
- Hay copia de las 76 reglas anteriores (fuera del repositorio) por si hay que devolverlo.
- 19 oct: reglas 36, 37 y 38 corregidas (ahora "Herbicida Toro Verde") y nueva regla 78 de palabras prohibidas y dosis (78 reglas en total).
- 19 oct: el "2 limones por bomba" fijo se cambió por la regla 79: ml exactos de limón según el municipio (misma tabla de la página de pH del agua). La respuesta "¿Cómo se debe aplicar?" del catálogo apunta a esa regla y dice "agite el envase" y mínimo 130 ml. Ahora son 79 reglas. Si la página de pH cambia sus datos, hay que volver a cargar la tabla.
- Pendiente: el catálogo del bot (campo Catalogo_productos_LucidSales) todavía dice "ecológico", "natural", "no deja residuos tóxicos" y el nombre "Herbicidas Orgánico Regenerativo"; no dice "agite el envase"; y el precio de 20 L no cuadra ($995.000 en el paquete, $980.000 en preguntas frecuentes). Antes de cambiar el nombre, confirmar si está conectado con Dropi.
- 19 oct: postventa (campo Preguntas_frecuentes_posventa_LucidSales): "¿Cómo se aplica?" decía 100 ml en malezas blandas y "2 limones"; ahora dice mínimo 130 ml, agite el envase y limón según el municipio (regla 79).
- 19 oct: unificado venta y postventa con la ficha del producto de la Máquina Creativa: es de CONTACTO (seca lo verde que moja, no viaja a la raíz); sembrar a los 3 días. El modo de uso del catálogo (los dos productos), la dosificación y el "¿cómo se aplica?" de postventa llevan ahora el limón por municipio (regla 79), "agite el envase" y mínimo 130 ml.
- Pendiente catálogo de ventas: la descripción todavía dice "viaja hasta la raíz", "evitando el rebrote", "nutre y regenera el suelo", "fijadores de nitrógeno y fósforo", "ecológico", "natural" y "no deja residuos tóxicos": la ficha de la marca prohíbe todo eso. El campo "Preguntas frecuentes postventa" (id 215771) es una plantilla de otra tienda (Ciudad de México).
- 19 oct: la dirección por defecto para oficina y zona rural es "RECLAMO EN OFICINA INTERRAPIDÍSIMO" (municipio y departamento en sus campos). Reglas 12 y 77 actualizadas.
- 20 oct: menos chats pasados a humano. Nueva regla 80 (el bot resuelve primero; lista cerrada de casos que sí van a asesor) y cambios en 50 (cantidades distintas las arma el bot), 59 (antes de garantía pregunta dosis, agitado, limón, lluvia y días; la maleza que vuelve tras semanas es recompra), 60 punto 2 (seguimiento lo responde el bot con los datos del pedido), 73 y 77 (dirección dudosa → RECLAMO EN OFICINA INTERRAPIDÍSIMO). Son 80 reglas. Hay copia de las 79 anteriores.
- Pendiente: el flujo de recompra "RC R - Duda (humano)" manda a humano al tocar el botón de duda; revisarlo en el panel (la API no deja editar flujos).
- 20 oct: garantías: el bot hace las preguntas (ml, agitó, limón, lluvia, días, foto), explica, y SIEMPRE pasa a asesora con etiqueta GARANTIA y un resumen de las respuestas. Si llegó dañado, pasa de una vez. Reglas 59 y 80 actualizadas.
- 20 oct: OJO: el catálogo (Catalogo_productos_LucidSales) y las preguntas de postventa por producto (Preguntas_Postventa_Productos_LucidSales) se vuelven a escribir solos desde la pantalla Productos de Lucid Sales: los cambios por API se pierden. Lo que sí se queda: las reglas (Reglas_adicionales2_LucidSales) y Preguntas_frecuentes_posventa_LucidSales. Por eso las respuestas oficiales viven en la regla 81, que manda sobre el catálogo.
- 20 oct: regla 81 (pasos de venta, recomendación de presentación por tamaño de finca, pruebas permitidas, respuestas a estafa, precio, original, agrícola, suelo, cultivo, duración, lluvia, pago, entrega, registro, contacto, siembra, y qué hacer si el cliente se queda callado). Reglas 19 y 65 ahora piden trato de usted (antes decían "como novio o novia"); regla 39 ya no dice "enviamos a partir del viernes 8 de mayo". Son 81 reglas.
- Pedidos Dropi 18–19 oct (muestra de 100): ~52% de 1 litro, ~25% de 2 litros, ~17% de 4 litros; 9 cancelados (9%). Subir la venta de 4 litros sube ticket y recompra.
- No se pueden leer los chats por API (Lucid Bot no los entrega y la documentación de Lucid Sales pide sesión). Para medir la conversión se necesita la pantalla de métricas de Lucid Sales o una exportación de chats.
- 20 oct: el bot se sentía acosador: esperaba solo 6 s antes de responder (Tiempo_recepcion_mensajes_LucidSales). Subido a 20 s para juntar los mensajes seguidos. Nueva regla 82: pedir datos una sola vez y todos juntos, sin pedir teléfono (usa el WhatsApp) ni cédula, un solo resumen y solo completo, no insistir. Regla 77 punto 5: la dirección del resumen queda limpia ("RECLAMO EN OFICINA INTERRAPIDÍSIMO") y la frase de la cédula va en línea aparte. Son 82 reglas. Ojo: si el tiempo de espera vuelve a 6, es que la pantalla de configuración de Lucid Sales lo sobrescribe y hay que cambiarlo ahí.
- 20 oct: regla 75: después del resumen, "gracias", "muchas gracias", "Dios le pague", "está bien", emojis, etc. cuentan como confirmación; prohibido volver a preguntar "¿te dejo el pedido así?".
- 20 oct: precios oficiales en la regla 81 (mandan sobre el catálogo): 1 L $99.000 · 2 L $169.000 · 4 L (galón) $269.000 · 20 L (poma) $995.000; el $980.000 del catálogo está mal.
- Leer los mensajes: la API de Lucid Bot no entrega chats. La Máquina Creativa ya tiene la entrada /api/lucidbot/mensajes?k=CLAVE (la dirección completa sale en la plataforma, sección ADN / voz del cliente). Falta poner en Lucid Bot un paso "Petición externa" que mande cada mensaje del cliente ({{last_input}} y el id del contacto). La plataforma solo guarda los mensajes del cliente (no las respuestas del bot) y los resume en "voz del cliente"; Claude los lee con ver_conocimiento.
- 20 oct (10:52): el bot seguía pidiendo "Nombre / Barrio / Dirección exacta / Teléfono" (plantilla interna de Lucid Sales, no está en ningún campo) y pedía calle cuando el cliente daba "barrio Centro". Se agregó la regla 0 al PRINCIPIO de la lista (prioridad máxima: mensaje único para pedir nombre y dirección, sin teléfono ni cédula, ofreciendo la oficina) y se cambiaron 58, 73 y 77: dirección sin calle o carrera con número = RECLAMO EN OFICINA INTERRAPIDÍSIMO sin volver a preguntar. Son 83 reglas. Si la plantilla sigue saliendo, hay que buscar en la configuración de Lucid Sales dónde se definen los "datos para la orden".
- 20 oct: el "mensaje inicial" del producto (😱 Espera..., beneficios, imágenes, audio, video; campo mensajes_iniciales_lucidsales, se edita en Productos de Lucid Sales) se reenviaba a clientes que volvían días después. Nueva regla "00" al principio: se envía una sola vez por cliente; si ya lo recibió, el bot responde directo. Son 84 reglas.
- Pendiente: ese mensaje inicial dice "elimina de raíz", "fértil", "corrige pH", "aporta fijadores de nitrógeno y fósforo", tutea y promete "60 días de garantía": va contra la ficha de la marca. Corregirlo en Lucid Sales → Productos → Mensaje inicial.
- 20 oct: regla 00 ajustada: mensaje inicial completo una sola vez; si lo recibió hace menos de 10 días y no compró, flujo corto (1 imagen de testimonio de las botellas + 1 texto que responde); 10 días o más: solo responder; si compró o está dando datos: responder directo.
- 20 oct: voz humana. Se quitaron 21 reglas que confundían o sonaban a robot (1, 6, 7, 8, 10, 17, 25, 27, 32, 34, 35, 40, 42, 43, 53, 54, 55, 61, 62, 67, 68: límites de palabras contradictorios, "cerebro reptiliano", "PNLA", "piensa cada letra", nombre en cada mensaje, frases sueltas). Regla 16 simplificada (audio corto + precio escrito). Nueva regla "000" al principio: cómo escribir como persona (corto, una pregunta, de usted, pocos emojis, sin repetir, honesto si preguntan si es robot) y cómo vender sin presionar (validar, una prueba real, quitar riesgo, preguntas fáciles, dos opciones, valor antes del precio, cierre suave). Quedan 64 reglas. Copia de las 84 anteriores en el scratchpad de la sesión.
- 20 oct: encargo enviado al chat "Máquina Creativa — plataforma" (session_01SLeeQKvsqHbVmFkYZ3oxoX): estructura E6 "Nosotros vs. la alternativa", gancho "romper el patrón" y botón "Escribir 3 variaciones" en Qué grabar de la Cabina. Lo construye ese chat (main publica a producción).
- 21 oct: hoja de ventas de WhatsApp. Ayer 54 pedidos en Dropi (ventas no frenadas). 12 no estaban en la hoja: 3 de Shopify (bien), 9 de WhatsApp. Se volvió a correr el flujo "Subir pedido Google Sheet – LucidSales" (id 1755835693544): subieron Rubelio, Lizeth y Aceneth (los que tenían la etiqueta "Pedido subido LucidSales"). No suben Jorge (3186060850), Wilmar (3128849796), Milciades (3118814401), José Ramiro (3137509650), Miguel (3155042745), Sandra (3112202501) y Gilberto (3118063663): tienen pedido en Dropi pero Lucid Sales no lo registró (sin "Pedido subido"); probablemente los cerró una asesora a mano. Fechas vacías en la hoja: los campos de fecha del pedido están vacíos; arreglo en el flujo (falta captura).
- 21 oct: regla 78: al hablar "Herbicida Toro Verde", pero en resumen y JSON del pedido el nombre exacto del catálogo "HERBICIDA EL TORO".
- 21 oct 11:30: el embudo "Pedidos - WhatsApp" (pipeline 705299 en Lucid Bot; etapas Pendiente por confirmar / Error al subir / Corregido - Por subir / Pedidos subidos) es la mejor fuente para ver pedidos del chat. Hoy hasta las 11:30: 24 subidos por el bot (19 y 20 oct a la misma hora: 31 y 32), 7 de Shopify (#6364–#6370, en "Corregido - Por subir"), 4 pendientes por confirmar. Hoja: 22 de WhatsApp en la hoja (2 subidos a mano con el flujo); 2 pedidos de Facebook/Instagram (Norman Riascos, Mercedes Vásquez) no están en la hoja.
- 23 oct: el bot dejaba gente en visto y bajaron los pedidos del chat (22 oct: 47 frente a ~75; sin confirmar subiendo de 0 a 9). Las reglas habían crecido de 18.800 a 50.000 caracteres. Se aligeraron a 25.000 con las mismas reglas (000, 00, 77, 79, 80, 81, 82 reescritas cortas; la tabla de limón de 1.122 municipios se cambió por el enlace a la página de pH), se agregó "responda siempre cada mensaje" y se quitaron "nunca envíes dos mensajes/preguntas seguidas". Espera antes de responder: 10 s. Copia de la versión anterior en el scratchpad (respaldo_antes_aligerar.json).
- 23 oct 11:15: revisión de 17 clientes sin confirmar (21–23 oct): ninguno con el bot pausado; en 14 el cliente dejó de responder después del resumen. Regla 82 cambiada: ya no dice "no le insista"; ahora hace un recordatorio amable una vez cuando le toca hacer seguimiento. El mensaje inicial completo (😱 Espera...) se reenvía a clientes que vuelven: lo dispara Lucid Sales, no las reglas; se arregla en Productos → Mensaje inicial.
- 23 oct 4 p. m.: después del arreglo (11 a. m.–4 p. m.) entraron 17 pedidos por el chat (22 oct: 13; 19–20 oct: 19; 21 oct: 27) y 3 quedaron sin confirmar (22 oct: 2). Mejora frente a ayer, todavía sin llegar al mejor día. Reglas 64 (25.334 caracteres) y espera 10 s confirmadas.
- 25 oct: confirmado que TODOS los pedidos de Shopify suben a la hoja de WhatsApp: al entrar un pedido web, Lucid pone "Shopify" → "Pedido subido LucidSales" → "Subido a Google Sheet" en 1 minuto (105 pedidos web del #6355 al #6459 desde el 20 oct). La etiqueta "Shopify" no sirve para filtrar (queda para siempre en clientes que compraron antes por la web, ej. Pedro Mesa). El dato que sí distingue: el campo json_lucid_sales trae "source": "shopify" (web) o "source": "WhatsApp". Arreglo: en el flujo "Subir pedido Google Sheet – LucidSales", condición al inicio: si json_lucid_sales contiene "source": "shopify" → terminar. La API no deja editar flujos: lo hace Ronald en el editor.

### 25 oct, 7:45 a. m. — Revisión del filtro de Shopify en la hoja
- El pedido web #6460 (Juan Luis Martínez, 7:20 a. m.) también se subió a la hoja (`Subido a Google Sheet`), así que la condición del flujo «Subir pedido Google Sheet - LucidSales» todavía no funciona. Su `json_lucid_sales` sí dice `"source": "shopify"`.
- Pedidos de WhatsApp en el embudo 705299: 44 (19 oct), 55 (20), 74 (21), 47 (22), 50 (23), 54 (24). Por confirmar: 2 a 4 por día.
