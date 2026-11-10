# Sistema de 30+ videos al día con pocos créditos

## Dónde se gastan los créditos (y cómo no gastarlos)
| Gasto | Cómo evitarlo |
|---|---|
| Subir videos por Google Drive al chat | **Subir los videos directo al chat** (llegan como archivo). El conector de Drive convierte el video a texto: carísimo o imposible con videos pesados. Drive solo para entregar/archivar. |
| Que Claude "mire" videos | Hojas de contacto (1 imagen con muchos fotogramas) en vez de muchas imágenes sueltas; `inventario_tomas.py` una vez por tanda |
| Leer todas las guías | SKILL.md tiene el mapa: leer solo la guía de la tarea |
| Investigación | 2-4 búsquedas dirigidas por producto, una sola vez; queda en la ficha y se reutiliza |
| Voces de pago | Caché por frase (no se paga dos veces la misma frase), CTA/oferta reutilizados, XTTS local gratis para pruebas y Fish/ElevenLabs solo para la versión final si hace falta |
| Música y SFX | Biblioteca indexada + `generar_musica.py` + `generar_sfx.py`: cero créditos |
| Repetir trabajo por errores | Plan/guion aprobado antes de renderizar; `verificar.py` antes de entregar |
| Textos largos en el chat | Resúmenes cortos al usuario; los detalles quedan en archivos (plan.json, resumen.csv) |

## Flujo de una tanda (ejemplo: 3 productos × 10 variantes)
1. **El usuario sube** los videos/fotos de los productos al chat y dice tienda, país y oferta.
2. **Por producto** (una vez): ficha (crear o leer) → inventario de tomas → 3 ángulos → 10 ganchos (puntuados).
3. **Un pedido.json por producto** (ver `lote.py`): ganchos, cuerpo, CTA, oferta, plan, música (mood/temporada), voz, formatos.
4. **Muestra primero**: corre `lote.py --solo 0` y enséñale ese video al usuario (o una hoja de fotogramas). Ajusta estilo una vez.
5. **Lote completo**: `lote.py pedido.json --paralelo 2 --rapido` → 10 videos + resumen.csv.
6. **Control**: `verificar.py` en 2-3 al azar + mirar fotogramas del gancho y del CTA de todos (hoja de contactos).
7. **Entrega**: zip por producto con nombres de la convención + resumen.

Tiempos de referencia (servidor sin tarjeta gráfica, 4 núcleos): montaje de 15 s ≈ 15-20 s;
UGC de 40 s ≈ 45-60 s; voces XTTS ≈ 1-2x su duración (solo frases nuevas); inventario de 4
videos ≈ 50 s. Un lote de 10 variantes de 15-20 s ≈ 5-8 min con voces en caché.

## Lo que hace que 30 videos/día no sean 30 videos genéricos
- Cada producto tiene ficha y ángulos propios; cada variante cambia gancho (voz + texto + toma inicial), orden de tomas y semilla de edición.
- El plan creativo (`--plan`) pone textos y efectos en las palabras que importan de ESE producto.
- Estilo por tienda: colores de gancho/CTA/resaltado y fuente de la marca (guárdalos en la ficha).
- Se aprende de los resultados: anota en la ficha qué ganchos ganaron y produce más de eso.
