# Traducir y adaptar por país

Traducir no es cambiar palabras: es que suene como alguien de ese país hablándole a un
vecino. Un anuncio colombiano con "vosotros" o un chileno con "parcero" pierde confianza al
instante. Pregunta (o deduce de la tienda) el país destino antes de escribir.

| País | Trato | Suena local | Evitar | Moneda / pago típico |
|---|---|---|---|---|
| **Colombia** | "tú" (jóvenes, belleza, moda) o "usted" (campo, adultos, hogar, herramientas) | "parce" (solo urbano joven), "bacano", "chévere", "qué belleza", "le cuento", "mire", "pídalo ya" | "guay", "vale" (España), "chido" (MX) | COP $89.900 · contraentrega, envío gratis, Nequi/Daviplata |
| **Chile** | "tú" con conjugación chilena ligera ("¿cachai?" solo en tono muy casual) | "bacán", "la raja", "al tiro" (=ya), "polera", "lucas" (miles) | "parce", "chévere" | CLP $19.990 · transferencia, contraentrega en algunas tiendas |
| **México** | "tú" | "padre/padrísimo", "chido" (casual), "ándale", "neta" (joven) | "chévere", "bacano", "coger" | MXN $499 · pago contra entrega, OXXO |
| **Perú** | "tú" | "chévere", "bacán", "al toque" | "parce" | PEN S/ 99.90 · contraentrega, Yape |
| **Ecuador** | "tú"/"usted" | "chévere", "bacán", "de una" | "guay" | USD $29.99 · contraentrega |
| **Argentina** | "vos" (voseo obligatorio: "probá", "tenés") | "re", "buenísimo", "dale" | "tú", "chévere" | ARS · transferencia, Mercado Pago |
| **España** | "tú" / "vosotros" | "vale", "mola", "flipar" | latinismos | EUR 29,99 € · tarjeta, Bizum |
| **EE. UU. hispano** | "tú", español neutro | neutro con palabras compartidas | regionalismos fuertes | USD |

Reglas:
- Formato de precio local (punto de miles en CO/CL: $89.900; coma decimal en ES).
- Medidas y tallas locales (tallas de faja, litros, cm).
- Fechas comerciales de ese país (ver colombia.md para Colombia; Chile: Cyber Day, Fiestas Patrias en septiembre; México: Buen Fin en noviembre, Hot Sale).
- **Voz del país**: el acento vende. Opciones:
  - Fish Audio: `generar_voz.py --buscar-voces es colombiana` (o chilena, mexicana, argentina). Escucha o pide al equipo escuchar 2-3 antes de elegir y guarda el ID en la ficha del producto/tienda.
  - XTTS: clona una muestra de 10-15 s de una voz real del país **con permiso** (por ejemplo alguien del equipo); guárdala en `voces/<pais>_<nombre>.wav` y reutilízala siempre (consistencia de marca y cero créditos).
  - ElevenLabs: voces con acento por país en su biblioteca.
- Cuando el material original tiene texto en pantalla en otro idioma: decide con el usuario si se tapa y traduce (`subtitulos.py --tapar`) o se deja.
- Revisa la transcripción del doblaje (`verificar.py --guion`) también por palabras de otro país que la IA haya colado.
