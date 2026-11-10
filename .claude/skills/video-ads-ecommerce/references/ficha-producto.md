# Ficha de producto e investigación de mercado

Cada producto tiene UNA ficha que se crea la primera vez y se actualiza cada vez que se
aprende algo (un gancho que ganó, una objeción nueva, un dato confirmado). Antes de escribir
cualquier guion o editar cualquier video de un producto, **lee su ficha**. Si no existe, créala
antes de escribir (es lo que separa un anuncio genérico de uno que vende).

## Dónde se guarda
- En el computador: `<carpeta de trabajo>/Fichas/<producto>.md` (ver `~/.video-ads/config.json`). En la nube: `fichas/<tienda>/<producto>.md` del repositorio, con commit.
- Si hay Google Drive conectado: también como documento dentro de la carpeta del producto en la categoría de la tienda (ej. `Salud y belleza/Faja lipo/Ficha - Faja lipo`).
- Si el usuario no indica tienda, pregunta una vez y anótala.

## Plantilla (copiar tal cual)

```markdown
# Ficha: <Producto> — <Tienda> — <País>
Actualizada: <fecha> · Fuentes: <links/archivos usados>

## 1. Producto
- Qué es (1 frase sin adjetivos):
- Qué hace / cómo se usa (pasos):
- Mecanismo único (por qué funciona distinto):
- Especificaciones confirmadas (medidas, materiales, contenido del paquete):
- Precio, oferta vigente, envío, pago (contraentrega/online), garantía y cambios:
- Proveedor / material de video disponible y derechos de uso:

## 2. Buyer persona principal (y secundario si aplica)
- Quién es (edad, rol, ciudad/región, momento de vida):
- Punto A (situación hoy, con SUS palabras):
- Dolores (funcionales / emocionales / sociales):
- Deseos (punto B, cómo se ve y se siente):
- Creencias que lo frenan:
- Lo que ya probó y le falló:
- Objeciones en orden de frecuencia:
- Disparadores de compra (qué lo hace comprar HOY):
- Dónde está y cómo habla (palabras, modismos, tono):
- Nivel de conciencia del público frío:

## 3. Mercado y competencia
- Competidores y sus ángulos (con links de anuncios):
- Ganchos que se repiten en anuncios activos (lo que el mercado ya validó):
- Huecos: lo que nadie está diciendo:
- Precio de referencia en el mercado:

## 4. Mensajes
- Promesa principal (1 frase):
- 3 ángulos para testear (ángulo → persona → emoción):
- Frases textuales de clientes (de reseñas/comentarios/chats):
- Prueba disponible (demos, testimonios, cifras verificadas):

## 5. Reglas
- Prohibido decir (política, marca, legal):
- Obligatorio decir (avisos, modo de uso, garantía):
- Datos NO confirmados (no usar hasta confirmar):

## 6. Historial de creativos (se llena después de lanzar)
| Fecha | Video | Ángulo | Gancho | Resultado (retención 3s / CTR / CPA) | Aprendizaje |
```

## Cómo investigar (en este orden, rápido y barato)

1. **Lo que el usuario ya sabe**: pregúntale 3-5 cosas clave si no están (precio/oferta, público, país, qué lo diferencia). Pregunta corto y con opciones.
2. **Página/producto del proveedor y fotos**: especificaciones reales.
3. **Anuncios activos de la competencia** (Dropkiller `search_ads` / `semantic_search_ads` / `get_ad_transcripts` / `get_ad_hooks` si está conectado; o Biblioteca de anuncios de Meta, `ads_library_search` si hay Meta Ads): los ganchos y ángulos que llevan más tiempo activos son los validados por el mercado. Anota links.
4. **Reseñas** (Amazon, Mercado Libre, AliExpress, TikTok Shop): las de 3-4 estrellas tienen las objeciones y el lenguaje real; las de 5 estrellas, los deseos.
5. **Comentarios** en anuncios y videos de la competencia: dudas frecuentes = objeciones a contestar.
6. **Máquina Creativa** (solo marcas de Toro Verde): `instrucciones_marca`, `buscar_en_cerebro`, `ver_conocimiento`.

Gasta poco: 2-4 búsquedas bien dirigidas valen más que 20 genéricas. Cita la fuente de cada
afirmación en la ficha; lo que no esté confirmado va en "Datos NO confirmados".
