# Prompt para Claude en línea (Claude en Chrome): crear las plantillas del robot en Lucid

Ronald (26-11): «dime qué plantillas toca hacer, para programar a Claude en línea y que lo haga él».
Copia TODO el bloque de abajo y pégaselo a Claude en Chrome, con Lucid abierto en panel.lucidbot.co (cuenta Toro Verde).

```
Eres mi asistente dentro de Lucid Bot (panel.lucidbot.co, cuenta Toro Verde). Necesito que crees 5 plantillas de WhatsApp
y un flujo para cada una. Hazlo con cuidado y sin borrar nada que ya exista. Si algo no lo puedes hacer, dime en qué paso te quedaste.

REGLAS PARA TODAS LAS PLANTILLAS
- Categoría: UTILIDAD (no marketing). Idioma: Español (COL).
- No cambies ni una palabra del texto. No agregues precios, descuentos ni promociones.
- Nunca uses las palabras «orgánico», «ecológico», «natural», «sin veneno» ni «no tóxico».

PASO 1 · CAMPOS DEL ROBOT
En Configuración → Campos personalizados, crea 3 campos de tipo texto (si ya existen, no los dupliques):
  Robot dato 1 · Robot dato 2 · Robot dato 3
Anota el número (ID) de cada campo.

PASO 2 · PLANTILLAS (Configuración → WhatsApp → Plantillas → Nueva)

1) Nombre: confirmar_pedido_tv
Cuerpo:
Hola {{1}} 👋 Soy Karen, de Toro Verde. Tu pedido de {{2}} para {{3}} ya está empacado y listo para salir hoy, pago contra entrega 🚚

Solo falta tu OK para despacharlo. ¿Lo enviamos?
Botones de respuesta rápida: «Sí, envíenlo hoy» · «Quiero cambiar algo»
Ejemplos: {{1}} Gonzalo · {{2}} 1 litro de Herbicida Toro Verde · {{3}} Cumbitara, Nariño

2) Nombre: aclarar_dato_pedido_tv
Cuerpo:
Hola {{1}} 👋 Soy Karen, de Toro Verde. Tu pedido de {{2}} ya está listo, y para que te llegue sin contratiempos necesito confirmar un dato: {{3}}

Respóndeme por aquí y sale hoy mismo 🚚
Botón de respuesta rápida: «Ya te respondo»
Ejemplos: {{1}} Walter · {{2}} 1 litro de Herbicida Toro Verde · {{3}} ¿lo envío a tu casa o lo reclamas en la oficina de Interrapidísimo?

3) Nombre: pedido_en_proceso_tv
Cuerpo:
Hola {{1}} 😊 ¡Gracias por tu compra en Toro Verde!

Tu pedido está empacado y listo para salir 🚚📦
• {{2}}
• {{3}}
• Pagas cuando lo recibes

Solo falta tu confirmación para despacharlo hoy mismo. Toca *Sí, envíenlo hoy* y queda en camino 🙌

Apenas salga te compartimos el número de guía para que lo sigas 🌱
Botones de respuesta rápida: «Sí, envíenlo hoy» · «Quiero cambiar algo»
Ejemplos: {{1}} María · {{2}} 1 litro de Herbicida Toro Verde · {{3}} Reclamas en la oficina de Interrapidísimo de Pasto

4) Nombre: rastreo_pedido_tv
Cuerpo:
Hola {{1}} 👋 Soy Karen, de Toro Verde. ¡Buenas noticias! {{2}} 📦

Ten a la mano tu cédula y {{3}} para el pago contra entrega.

⏳ La transportadora solo lo guarda unos pocos días y, si no se recibe, lo devuelve. ¿Te ayudamos a recibirlo?
Botones de respuesta rápida: «Voy hoy por él» · «No puedo ir» · «Tengo una duda»
Ejemplos: {{1}} Diego · {{2}} Tu pedido ya está en la oficina de Interrapidísimo de Doradal (CLL 23 25 30) · {{3}} $169.000

5) Nombre: entregado_toroverde
Cuerpo:
Hola {{1}}, nos confirman que ya le entregaron su pedido de Toro Verde ✅

Un favor que le sirve a usted: tómele una foto a la guía del paquete, donde se vea el número. Con eso, cualquier reclamo se resuelve en minutos.

Antes de aplicar: agite el envase y use mínimo 130 ml por bomba de 20 litros. Con menos dosis la maleza vuelve a salir.

Si algo llegó mal o le falta algo, escríbanos por aquí mismo y lo solucionamos.
Botones: respuesta rápida «Todo llegó bien» · respuesta rápida «Tengo un problema» · enlace «Cómo aplicarlo» (usa el enlace del video de aplicación que ya se manda hoy; si no lo encuentras, pregúntame)
Ejemplo: {{1}} Carlos

Envía las 5 a revisión de Meta.

PASO 3 · UN FLUJO POR PLANTILLA (Automatización → Flujos → Nuevo)
Crea 4 flujos, uno por cada plantilla 1 a 4, llamados:
  «Robot - confirmar_pedido_tv», «Robot - aclarar_dato_pedido_tv», «Robot - pedido_en_proceso_tv», «Robot - rastreo_pedido_tv».
Cada flujo tiene un solo paso: enviar su plantilla, con estas variables:
  {{1}} = nombre del contacto (first_name) · {{2}} = campo «Robot dato 2» · {{3}} = campo «Robot dato 3».
No le pongas más pasos, condiciones, etiquetas ni descuentos.
La plantilla 5 (entregado_toroverde) va en el flujo de ENTREGADO que ya existe: reemplaza los mensajes de ENTREGADO por esta sola plantilla, con {{1}} = nombre del contacto.
  - Botón «Todo llegó bien» → mensaje: «¡Qué bueno, {{nombre}}! 🌱 Para que le rinda y funcione: 1. Agite el envase antes de medir. 2. Mínimo 130 ml por bomba de 20 litros. 3. Aplique directo a la maleza, con el día seco. ¿Para qué cultivo lo va a usar?» + etiqueta entregado_ok.
  - Botón «Tengo un problema» → mensaje: «Lo sentimos, {{nombre}}. Cuéntenos qué pasó y, si puede, mándenos la foto de la guía y del producto. Una persona del equipo le responde ya mismo.» + etiqueta reclamo_entrega + pasar a humano.

PASO 4 · REPORTE
Al terminar, dame esta lista para pegársela al robot:
  campo Robot dato 1 = <ID> · Robot dato 2 = <ID> · Robot dato 3 = <ID>
  flujo confirmar_pedido_tv = <número> · flujo aclarar_dato_pedido_tv = <número>
  flujo pedido_en_proceso_tv = <número> · flujo rastreo_pedido_tv = <número>
  estado en Meta de cada plantilla (en revisión / aprobada / rechazada y por qué)
```

Cuando tengas esa lista, pégala en el chat del robot y la conecto: FLUJO_CONFIRMAR, FLUJO_SHOPIFY, FLUJO_RASTREO y el de aclarar.
