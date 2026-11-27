# Prompt para Claude en Chrome · plantilla y flujo de RASTREO (27-11)

Ronald (27-11): «pásame el flujo para la plantilla, para que la extensión de Claude cree el mejor mensaje de rastreo».
Abre Lucid en panel.lucidbot.co (cuenta Toro Verde), abre Claude en Chrome, adjúntale la imagen img/rastreo-oficina.jpg y pégale TODO el bloque de abajo.
Cuando termine, pásale al robot (este chat) los 3 números del PASO 4.

```
Eres mi asistente dentro de Lucid Bot (panel.lucidbot.co, cuenta Toro Verde). Vas a crear UNA plantilla de WhatsApp
y UN flujo para insistirle al cliente cuyo paquete está esperando en la oficina de la transportadora y no ha ido a
reclamarlo. No borres ni cambies nada que ya exista. Si algo no lo puedes hacer, dime en qué paso te quedaste.

REGLAS
- Categoría: UTILIDAD (no marketing). Idioma: Español (COL).
- Copia el texto EXACTO, sin cambiar palabras. No agregues precios fijos, descuentos ni promociones.
- Nunca uses «orgánico», «ecológico», «natural», «sin veneno» ni «no tóxico».

PASO 1 · CAMPOS (Configuración → Campos personalizados)
Crea 2 campos de tipo texto, si no existen ya (no los dupliques): «Robot dato 2» y «Robot dato 3». Anota el ID de cada uno.

PASO 2 · PLANTILLA (Configuración → WhatsApp → Plantillas → Nueva)
Nombre: rastreo_pedido_tv
Encabezado: IMAGEN. Sube la imagen «rastreo-oficina.jpg» que te adjunto (es fija, la misma para todos los clientes).
Cuerpo:
Hola {{1}} 👋 Soy Karen, de Toro Verde. {{2}} 📦 y te está esperando.

Para recibirlo solo necesitas tu cédula y {{3}} para el pago contra entrega.

⏳ La transportadora lo guarda pocos días y, si nadie lo reclama, lo devuelve. Si no puedes ir, lo puede recoger un familiar con una autorización firmada y copia de tu cédula.

¿Cuándo pasas por él?
Botones de respuesta rápida: «Voy hoy» · «Voy mañana» · «No puedo ir»
Ejemplos de las variables:
  {{1}} Diego
  {{2}} Tu pedido ya está en la oficina de Interrapidísimo de Doradal (CLL 23 25 30)
  {{3}} $169.000
Envíala a revisión de Meta.

PASO 3 · FLUJO (Automatización → Flujos → Nuevo)
Nombre: «Robot - rastreo_pedido_tv»
Paso 1: enviar la plantilla rastreo_pedido_tv con estas variables:
  {{1}} = nombre del contacto (first_name) · {{2}} = campo «Robot dato 2» · {{3}} = campo «Robot dato 3».
Respuestas a los botones:
  - «Voy hoy» → mensaje: «¡Perfecto, {{nombre}}! 🙌 Recuerda llevar tu cédula original. Cuando lo tengas en tus manos, agita bien el envase y usa mínimo 130 ml por bomba de 20 litros. Cualquier cosa, me escribes por aquí.» + etiqueta rastreo_va_hoy.
  - «Voy mañana» → mensaje: «Listo, {{nombre}}, te espera hasta mañana 📦 Lleva tu cédula original. Si se te complica, avísame y buscamos cómo ayudarte.» + etiqueta rastreo_va_manana.
  - «No puedo ir» → mensaje: «Tranquilo, {{nombre}}, lo solucionamos. Cuéntame qué se te complica: ¿puede ir alguien de tu familia con una autorización y copia de tu cédula? Una persona del equipo te ayuda ya mismo.» + etiqueta rastreo_no_puede + pasar a humano.
No le pongas descuentos ni más condiciones.

PASO 4 · REPORTE
Al terminar, dame esta lista exacta:
  campo Robot dato 2 = <ID> · campo Robot dato 3 = <ID> · flujo Robot - rastreo_pedido_tv = <número>
y dime si Meta ya aprobó la plantilla o quedó en revisión.
```
