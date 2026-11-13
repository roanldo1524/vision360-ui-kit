# Edición: ritmo, transiciones, subtítulos, color

## Índice
1. Ritmo y retención
2. Transiciones (cuáles y cuándo)
3. Subtítulos y texto en pantalla
4. Color y look
5. Recetas ffmpeg (copiar y pegar)
6. Cuándo usar Remotion u otras herramientas

---

## 1. Ritmo y retención

El enemigo es el pulgar: cada segundo sin cambio visual es una oportunidad de scroll.
- **Corte o cambio visual cada 1.5-3 s** (en el gancho, cada 0.7-1.5 s). Un "cambio" puede ser corte, zoom, texto nuevo, b-roll o cambio de ángulo.
- **Quita silencios y respiraciones** entre frases: el ritmo de anuncio es más rápido que el natural.
- **Pattern interrupts** cada 5-7 s: zoom punch, cambio de fondo, SFX, emoji/sticker, cambio de plano.
- **Gancho visual en el fotograma 0**: nada de logos, intros ni fundidos de entrada.
- **J-cut / L-cut**: el audio del siguiente plano entra antes que la imagen (o al revés); hace la edición fluida y profesional.
- **B-roll sobre la voz** cada vez que se nombra algo visible ("colágeno" → plano del polvo; "gym" → plano de sentadilla).
- **Final**: producto + oferta + CTA visibles al menos 2-3 s, sin que se corte la frase.

## 2. Transiciones

Regla: la transición debe tener una razón (energía, cambio de tema, revelar). En anuncios,
el 80% deben ser **cortes secos**; las transiciones con efecto son la sal, no el plato.

| Transición | Uso | Cómo |
|---|---|---|
| Corte seco | Por defecto | — |
| Zoom punch (zoom-in rápido 110-120% en 3-5 frames) | Énfasis en una palabra clave | `zoompan` o escalar con keyframes |
| Whip pan / barrido | Cambio de escena con energía, antes/después | Desenfoque direccional + "whoosh" |
| Match cut | Continuidad entre dos planos con forma/movimiento similar (mano que abre → producto abierto) | Planificar en la grabación |
| Jump cut | Talking head; elimina pausas | Cortes dentro del mismo plano, ligero zoom alterno (100% / 110%) para que no salte |
| Flash blanco (2-3 frames) | Revelación, antes/después | `fade` a blanco muy corto |
| Glitch / RGB split | Tecnología, gaming | Con moderación |
| Fundido (crossfade) | Founder/lujo/emocional; casi nunca en UGC | `xfade=fade` 0.2-0.4 s |
| Mano/objeto que tapa cámara | Transición "orgánica" UGC | Grabarla |

### Transiciones automáticas en `editar_auto.py` (ya probadas)
`--transiciones auto` (por defecto) mete transiciones con efecto de sonido en el corte, según el preset:

| Preset | Proporción de cortes con transición | Tipos (nunca la misma dos veces seguidas) |
|---|---|---|
| dopamina | ~55% | hlwind (barrido), zoomin, slideleft, hblur, fadewhite (flash), pixelize |
| ugc | ~25% | smoothleft, zoomin, fade (que parezca celular, no edición de TV) |
| premium | ~60% | fade, fadeblack, smoothleft, circleopen (lentas, 0.3-0.4 s) |
| cine | ~45% | fade, fadeblack (fundidos suaves, sin efectos de sonido fuertes) |

Reglas que aplica solo: transición únicamente si las dos tomas duran ≥0.9 s (en tomas cortas
se ve como error), el whoosh/hit va centrado en el corte, y los cortes secos llevan a veces un
whoosh corto. `--transiciones todas` (más energía) o `no` (solo cortes secos).
Técnica: todas las entradas se normalizan a `fps=30,settb=1/30` antes de `xfade` (si no,
ffmpeg falla con "Error reinitializing filters").

## 3. Subtítulos y texto en pantalla

El 70-85% ve sin sonido: los subtítulos no son opcionales, y son la mitad de la retención.
- **Estilo dopamina** (por defecto en `dopamina` y `ugc`): karaoke palabra por palabra
  (cada palabra se pinta amarilla FFD400 justo cuando se dice), 3 palabras por bloque,
  MAYÚSCULAS, Montserrat ExtraBold ~11% del ancho, borde negro grueso, entrada "pop".
  Las **palabras clave** (`--claves "filo,ángulo,..."`) y los números salen en verde 00E676
  y 12% más grandes. Elige 5-12 claves: beneficio, dolor, mecanismo, cifra, nombre del producto.
- **Estilo palabras**: igual pero sin karaoke (para voces muy rápidas).
- **Estilo frase**: testimonios largos o tono premium. **Estilo caja** (`--subs-caja`): fondo
  oscuro; úsalo solo para tapar texto viejo del video original, porque la caja achica la letra.
- Tamaño: el texto dopamina ocupa casi todo el ancho de la toma; nunca menos de 6% del ancho.
- Posición: 62-70% de la altura (`--pos-subs 0.66`), fuera de la cara y de la zona de botones de la app.
- Sincronización: cada palabra aparece cuando se dice (palabras con tiempo de faster-whisper).
- **Texto de gancho** arriba (15-25% de la altura) en los primeros 3 s: la pregunta o promesa.
- Emojis: libass no pinta emojis en color; si son importantes, ponlos como imagen PNG (overlay) o quítalos.

Script: `scripts/subtitulos.py` (cuatro estilos, dopamina por defecto, resaltado, y modo `--tapar` para cubrir texto
quemado del original con desenfoque y poner el texto traducido en la misma posición).
Para ubicar textos quemados: `scripts/hoja_contactos.py` (fotogramas con tiempo) y luego
un fotograma a tamaño real para medir la zona en píxeles.

Lección aprendida: el desenfoque en rectángulo se nota; combínalo con el estilo caja
(caja semitransparente encima) para que parezca diseño intencional.

## 4. Color y look

- Corrige primero (exposición, balance de blancos), después estiliza.
- Look ecommerce: colores limpios, blancos neutros, piel natural; un toque de contraste y saturación (+5-10%).
- Ajuste rápido con ffmpeg: `eq=contrast=1.06:saturation=1.1:brightness=0.02`, nitidez suave `unsharp=5:5:0.6`.
- Mantén el color del producto fiel (devoluciones si el color real es otro).
- Videos de baja resolución (360p de bibliotecas de anuncios): súbelos a 1080 con `scale=1080:-2:flags=lanczos` + `unsharp` antes de añadir texto, para que el texto quede nítido.

## 5. Recetas ffmpeg

```bash
# Unir clips (mismos códec/tamaño/fps)
printf "file '%s'\n" clip1.mp4 clip2.mp4 > lista.txt && ffmpeg -f concat -safe 0 -i lista.txt -c copy unido.mp4

# Recortar sin recodificar (rápido; corta en keyframes)
ffmpeg -ss 2.5 -to 14 -i in.mp4 -c copy corte.mp4

# Zoom punch de 0.2 s en el segundo 3 (video de entrada 1080x1920)
ffmpeg -i in.mp4 -vf "scale=w='iw*if(between(t,3,3.2),1.15,1)':h=-2:eval=frame,crop=1080:1920" -c:a copy out.mp4

# Ken Burns (zoom lento) para fotos de producto, 4 s
ffmpeg -loop 1 -i foto.jpg -vf "scale=2160:-2,zoompan=z='min(zoom+0.0012,1.15)':d=120:s=1080x1920:fps=30" -t 4 -pix_fmt yuv420p kb.mp4

# Acelerar un tramo (video y audio) 1.25x
ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=PTS/1.25[v];[0:a]atempo=1.25[a]" -map "[v]" -map "[a]" out.mp4

# Logo/sticker PNG encima entre 2 y 5 s
ffmpeg -i in.mp4 -i logo.png -filter_complex "[1:v]scale=200:-1[l];[0:v][l]overlay=W-w-40:120:enable='between(t,2,5)'" -c:a copy out.mp4

# Pantalla dividida antes/después (vertical, uno arriba otro abajo)
ffmpeg -i antes.mp4 -i despues.mp4 -filter_complex "[0:v]scale=1080:960,setsar=1[a];[1:v]scale=1080:960,setsar=1[b];[a][b]vstack[v]" -map "[v]" -map 1:a? out.mp4

# Barra de progreso arriba (aumenta retención)
ffmpeg -i in.mp4 -vf "drawbox=x=0:y=0:w=iw*t/$(ffprobe -v error -show_entries format=duration -of csv=p=0 in.mp4):h=8:color=yellow@0.9:t=fill" -c:a copy out.mp4
```

## 6. Remotion y otras herramientas

- **ffmpeg + scripts** (esta skill): traducir, doblar, subtitular, reformatear, limpiar, cortes, overlays. Rápido y sin tarjeta gráfica.
- **Remotion** (React → video): plantillas animadas reutilizables (listicles, ofertas, textos cinéticos, precios, contadores), muchas variantes desde datos. Requiere Node y Chromium (Playwright ya lo trae en estos entornos); vale la pena cuando el equipo va a sacar decenas de variantes con el mismo diseño.
- **CapCut / Premiere / DaVinci**: edición fina manual por el equipo. Al exportar desde ellos, pasa siempre `limpiar_metadatos.py` (dejan su nombre en el archivo).
- Sin tarjeta gráfica (servidores en la nube): todo funciona en CPU; la voz IA local (XTTS) tarda 1-2x el tiempo real.
