# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

PWA instalable, empaquetada con Capacitor para Google Play. El envoltorio nativo no cambia el lenguaje de diseño: sigue siendo web móvil. iOS (App Store) queda para más adelante.

## Users

Mujeres mayores de 18 años en Colombia, urbanas, que quieren entender su cuerpo sin medicalizarlo. La app está abierta a cualquier mujer de 18 años o más, sea o no clienta. Quienes compran el suplemento Mi Ciclo la usan además para su ritual diario y para los bonos de recompra.

La usan a diario desde el celular: abren la app, ven en qué fase están, registran cómo se sienten, marcan si tomaron su sobre y pasan por la comunidad.

Audiencia secundaria: las personas que una usuaria invita en el modo vínculo (pareja, mamá, papá o amiga). Reciben un consejo diario según la fase de ella y ven solo lo que ella decide compartir.

Audiencia interna: el equipo de moderación de Mi Ciclo, que revisa la cola de contenido de la comunidad.

## Product Purpose

Acompañar las cuatro fases del ciclo hormonal (menstrual, folicular, ovulación, lútea) y convertir el ritual del producto en parte del día. La app tiene tres objetivos con el mismo peso:

1. **Hábito diario:** abrir la app, registrar ánimo y síntomas, tomar el sobre y sostener la racha.
2. **Comunidad propia:** una red social interna de mujeres, más cálida que un grupo de WhatsApp, con posts, preguntas anónimas, reels, historias y perfiles.
3. **Recompra:** pétalos que se canjean por bonos de descuento con código único y enlace a la tienda con UTM para medir cada venta.

El éxito se mide en los tres a la vez: uso diario, participación en la comunidad y ventas atribuidas a la app.

## Positioning

Es la única app que une suplemento, seguimiento de las cuatro fases y comunidad, en español y pensada para la mujer latina. La acompañan dos mecanismos propios: el modo vínculo, en el que ella controla qué se comparte, y un sistema de recompensas propio (pétalos, misiones, jardín y flores en lugar de corazones).

## Operating Context

- El producto físico es un suplemento efervescente diario sabor manzana, 30 sobres por caja, de EA Business Group SAS. La tienda es miciclo.co (Shopify).
- Esta versión de la app **reemplaza** a la anterior (app.miciclo.co). Es la nueva base y se le conectará Supabase (autenticación, base de datos con RLS, almacenamiento y URLs firmadas). Hoy los datos viven en el navegador con la misma forma del modelo de Supabase.
- Las fechas del ciclo se calculan en hora de Colombia.
- Moderación híbrida: publicación inmediata con filtro de palabras; con 2 reportes el contenido se oculta; los primeros 3 posts de cada usuaria nueva y las preguntas anónimas pasan por aprobación previa; los temas de riesgo (autolesión, embarazo, medicamentos) siempre pasan por revisión humana; un panel admin con una sola cola.

## Capabilities and Constraints

- Solo para mayores de 18 años. Lanzamiento solo en Colombia.
- Todo en español: interfaz, código y comentarios.
- En la comunidad nunca se muestra la fase ni los datos del ciclo de ninguna usuaria.
- El anonimato se aplica en el servidor: la vista pública nunca devuelve la autora de lo anónimo. Una publicación anónima nunca enlaza a un perfil.
- El diario se cifra y nunca se comparte, ni con el vínculo ni con la comunidad.
- Los datos de salud no salen a píxeles de publicidad ni a SDKs externos (Ley 1581 de 2012).
- Eliminar la cuenta borra todo de verdad.
- Las predicciones son estimaciones y no un método anticonceptivo.
- Más adelante (no ahora): planes en pareja por ciudad, widgets nativos, match de amigas, pauta segmentada, feed curado por la marca, cashback, nutrición por fase, asistente de IA (Mía), App Store y expansión a LATAM.
- **Decisión abierta:** el documento maestro dejaba agua, objetivo y productos recomendados para una fase posterior. Ya están construidos (agua y objetivo en Mi ciclo, productos en Jardín) a pedido de la marca; falta confirmar si salen en el lanzamiento.

## Brand Commitments

- Nombre: Mi Ciclo. Promesa: "Tu cuerpo no falla. Se expresa."
- Voz cercana, serena y sin juicio. Trata de "tú". No busca corregir a la mujer: la acompaña. "Bajar el ritmo también es avanzar."
- Fuente de verdad visual vinculante, definida por la marca: **colores del Brandbook y Manual de Identidad Mi Ciclo 2026** y **tipografías del sitio miciclo.co**. Ver `DESIGN.md` cuando exista.
- Ciclitas (avatares sin foto) en lugar de fotos de usuarias. La flor-luna como reacción en lugar del corazón.
- Nunca fotos de personas generadas con IA.

## Evidence on Hand

- Fotos y piezas reales de la marca tomadas de miciclo.co, en `public/marca/`: caja, sobre, manzanas, ingredientes (amalaki, melena de león, maca, remolacha), flor-luna, logo en blanco y rojo, y fotos de campaña.
- Reseñas reales en miciclo.co (calificación 4,8 con más de 100 reseñas). No se citan en la app sin confirmar el permiso.
- La comunidad trae contenido de ejemplo con perfiles ficticios. No se presentan como usuarias reales ni como testimonios.
- No hay métricas, cifras clínicas ni testimonios propios de la app. No se inventan.

## Product Principles

1. **Acompañar, no corregir.** Cada pantalla valida cómo se siente ella; nunca diagnostica ni presiona.
2. **Ella controla su información.** La privacidad (anonimato, diario cifrado, qué ve el vínculo) se decide por defecto a su favor.
3. **El día cabe en un minuto.** Lo esencial de hoy (fase, sobre, ánimo) se resuelve rápido; lo demás espera un nivel más abajo.
4. **La recompensa se siente propia.** Pétalos, flores y jardín en lugar de mecánicas genéricas de likes.
5. **Comunidad cálida y segura.** La moderación protege antes de que algo dañe.

## Accessibility & Inclusion

- Zonas táctiles de 44 px como mínimo. Debe verse bien de 360 a 430 px de ancho.
- Respetar la opción de reducir animaciones del sistema.
- Contraste de texto legible sobre los colores de marca.
