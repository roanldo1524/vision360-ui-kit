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
- 19 oct: se quitó del catálogo el consejo de "2 limones por bomba" (los dos productos); esa respuesta ahora dice "Agite el envase antes de medir" y la dosis mínima de 130 ml.
- Pendiente: el catálogo del bot (campo Catalogo_productos_LucidSales) todavía dice "ecológico", "natural", "no deja residuos tóxicos" y el nombre "Herbicidas Orgánico Regenerativo"; no dice "agite el envase"; y el precio de 20 L no cuadra ($995.000 en el paquete, $980.000 en preguntas frecuentes). Antes de cambiar el nombre, confirmar si está conectado con Dropi.
