# Formatos de video para anuncios

## Medidas por plataforma (exporta siempre en la máxima calidad del formato)

| Uso | Relación | Resolución | Duración recomendada |
|---|---|---|---|
| Reels, TikTok, Stories, Shorts | 9:16 | 1080x1920 | 15-45 s (gancho en 0-3 s) |
| Feed de Facebook/Instagram | 4:5 | 1080x1350 | 15-30 s |
| Feed cuadrado / marketplace | 1:1 | 1080x1080 | 10-20 s |
| YouTube / web / landing | 16:9 | 1920x1080 | 30-90 s |

Exportación estándar: H.264, 30 fps (o los del original), CRF 18-20 o 8-12 Mbps,
audio AAC 48 kHz 192 kbps, volumen -14 LUFS, `+faststart`.

**Zonas seguras 9:16** (ahí los botones de la app tapan el video): deja libre el 12-14%
superior y el 20-25% inferior, y unos 120 px a la derecha (íconos de like/compartir).
Textos clave y subtítulos entre el 15% y el 75% de la altura. El script `subtitulos.py`
usa por defecto alturas dentro de esta zona.

Un mismo video 9:16 se adapta a 4:5, 1:1 y 16:9 con `scripts/reformatear.sh` (rellena con
fondo desenfocado). Si se graba pensando en varios formatos, deja el producto en el centro.

## Catálogo de formatos creativos

| Formato | Cuándo usarlo | Claves de edición |
|---|---|---|
| **UGC testimonio** | Casi todo; el que más convierte en frío | Cámara frontal de celular, luz de ventana, cortes cada 2-3 s, subtítulos palabra a palabra |
| **UGC "amiga que recomienda" (GRWM, rutina)** | Belleza, salud, moda | Se usa el producto dentro de una rutina real |
| **Demo de producto** | Gadgets, hogar, herramientas, autos | Problema visible → solución en cámara; primeros planos, sonido real |
| **Antes / después** | Limpieza, autos, hogar, herramientas | Pantalla dividida o corte con "whoosh". En salud/belleza/peso: revisar cumplimiento.md |
| **Unboxing / ASMR** | Tecnología, belleza premium, regalos | Sin música o música muy baja; sonidos reales amplificados |
| **Listicle "3 razones"** | Productos con varios beneficios | Número grande en pantalla por razón; ritmo creciente |
| **Nosotros vs ellos / comparativa** | Hay una solución vieja conocida | Pantalla dividida, ✓/✗, colores rojo/verde |
| **Problema-solución con humor (skit)** | Productos cotidianos, virales | Dos planos/personajes, actuación exagerada, remate |
| **Explicador animado / IA 3D** | Salud, suplementos, mecanismos invisibles | Visualiza el "por qué funciona"; aviso de contenido IA |
| **Faceless / b-roll + voz en off** | Cuando no hay creadora | Clips de producto + stock, voz IA, subtítulos fuertes |
| **Slideshow / carrusel animado** | Catálogos, ofertas, varios productos | Fotos con zoom suave (Ken Burns), música con ritmo marcado |
| **Green screen (sobre una web/reseña/comentario)** | Responder objeciones o comentarios | La persona frente a una captura de reseña o comentario |
| **Respuesta a comentario** | Objeciones frecuentes | Burbuja del comentario arriba + respuesta en video |
| **Entrevista callejera / "pregunta rápida"** | Tráfico frío, curiosidad | Micrófono en mano, reacciones reales |
| **Founder / historia de marca** | Confianza, retargeting | Plano medio, luz cuidada, más pausado |

## Duración vs objetivo
- Prospección fría: 15-30 s con el beneficio claro antes del segundo 5.
- Productos que necesitan explicación (salud, mecanismo): 45-90 s funcionan si el ritmo no baja; el video 5 de Clean Nutra (85 s) es ejemplo.
- Retargeting: 6-15 s, oferta directa.

## Variantes mínimas por producto nuevo (para testear en Meta/TikTok)
3 ángulos × 3 ganchos × 2 formatos = 18 anuncios. Mismo cuerpo, cambia el gancho
(primeros 3 s) y el texto en pantalla: es la forma más barata de producir volumen.
