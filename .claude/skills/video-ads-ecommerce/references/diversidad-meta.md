# Diversidad creativa para Meta (Andromeda): que ningún video se parezca a otro

Meta cambió la forma de elegir qué anuncio mostrar (sistema de recuperación "Andromeda").
En la práctica:
- Meta agrupa los anuncios que se ven y suenan parecidos y los trata casi como **un solo
  creativo**. Diez videos con el mismo material y solo otro gancho compiten entre sí y le dan
  pocas "oportunidades" distintas al algoritmo.
- Gana el que entrega **conceptos realmente distintos**: cada uno le habla a otro tipo de
  persona, con otro formato y otra sensación. Así Meta encuentra más públicos distintos y los
  resultados se sostienen más tiempo (menos fatiga).
- La segmentación fina pierde peso: **el creativo es la segmentación**. Un concepto para
  mamás, otro para chicas del gym y otro para regalo encuentran cada uno su público.

## Qué cuenta como "concepto distinto" (cambia al menos 3 de estas 6 cosas)
| Eje | Opciones |
|---|---|
| 1. Ángulo / persona | dolor distinto, deseo distinto, otra persona (mamá, joven, hombre que regala, profesional) |
| 2. Formato | UGC testimonio, demo, explicador con mecanismo, listicle "3 razones", comparativa nosotros vs ellos, unboxing/ASMR, skit con humor, respuesta a comentario, solo texto + música, founder, slideshow de fotos |
| 3. Primeros 3 segundos | otra toma inicial, otro tipo de gancho (pregunta, dato, resultado, negación, historia) |
| 4. Persona en pantalla / voz | otra creadora, otra voz (hombre/mujer, edad, acento), sin voz |
| 5. Sonido | otro género musical, otro ritmo, ASMR sin música |
| 6. Look | otro preset (dopamina, UGC, premium), otros colores y fuente de textos, otro formato de pantalla |

Cambiar solo el gancho de texto, el orden de las mismas tomas o el color del CTA **no** es un
concepto nuevo: es una variante. Las variantes sirven para afinar un concepto que ya ganó.

## Cómo repartir una tanda (ejemplo: 10 videos de un producto)
- 4-5 **conceptos** distintos (formato + ángulo + inicio + sonido distintos).
- 2 variantes de gancho por concepto.
- 2 formatos de pantalla (9:16 y 4:5) cuando se va a pautar en feed.
Con `lote.py` se escribe en el pedido una lista `"conceptos"` (cada uno con su `angulo`,
`modo`, `preset`, `clips`/`crudos`, `inicio` (toma del gancho), `musica`, `voz`, `colores`, `fuente`, `ganchos`, `cuerpo`).
Elige a propósito la toma `inicio` de cada concepto (la más fuerte para ese ángulo) y no repitas la misma en dos conceptos.

## Revisión anti-parecidos (antes de entregar la tanda)
Haz una hoja con el primer segundo de cada video (`hoja_contactos.py` de cada uno, o el
primer fotograma de todos juntos). Si dos se ven iguales en el primer segundo o usan la misma
música y la misma voz, cambia uno. Entrega la tabla:
| Video | Concepto | Ángulo/persona | Formato | Inicio (0-3 s) | Voz | Música | Look |

## Cuando el material es poco (pocos videos del producto)
- Varía con lo que es gratis: formato (UGC vs. solo texto vs. explicador con fotos animadas),
  voz (varias voces IA), música (biblioteca/generada), look (presets, colores, fuentes) y el
  primer plano (toma distinta, `animar_producto.py`, foto con zoom).
- Recorta tomas de distintos momentos y reencuadra (primer plano vs. plano abierto).
- Pide al usuario 2-3 tomas nuevas concretas (ver grabacion.md) o genera 1-2 con IA (frankenstein.md).
