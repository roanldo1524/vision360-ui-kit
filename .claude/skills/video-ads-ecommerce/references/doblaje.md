# Traducir y doblar un video (flujo probado)

Caso real del que sale este flujo: 5 anuncios en inglés de una creatina para mujeres,
doblados al español conservando la imagen, la música y la voz de cada creadora.

## Decidir primero qué pide el usuario
- **Solo subtítulos traducidos** (audio original): pasos 1, 2, 3, 6 con `subtitulos.py`.
- **Doblaje** (voz en español, imagen original intacta, incluso con su texto en inglés): pasos 1-2, 4-6. Este fue el pedido final del caso real: "deja los subtítulos originales, solo cambia el audio".
- **Ambos** (doblaje + texto en pantalla traducido): todo.
Si no está claro, pregunta: rehacer un doblaje cuesta más que una pregunta.

## Paso 1. Revisar el material
```bash
python3 scripts/transcribir.py video.mp4 orig.json        # idioma + texto con tiempos
bash scripts/hoja_contactos.sh video.mp4 hoja.png 0.5 13   # ver textos quemados y cortes
```
- Si la transcripción tiene 1-2 segmentos o confianza baja, probablemente es **solo una canción**: no se dobla (en el caso real el video 4 era una canción con letra; quedó con su audio).
- Anota qué textos quemados hay, dónde (píxeles) y entre qué segundos aparecen.

## Paso 2. Escribir el guion traducido (`guion.json`)
Mismo formato que la transcripción: `[{"start":0.0,"end":3.1,"text":"..."}]`.
- **Adapta, no traduzcas palabra por palabra**: tono local, tuteo, expresiones del mercado ("2x1" en vez de "BOGO").
- Agrupa fragmentos de una misma oración en un solo segmento (la voz IA entona mejor oraciones completas).
- **El español es ~20-30% más largo que el inglés**: recorta desde el principio. Regla: palabras del segmento ≤ (duración en s × 2.6). En el caso real los videos cortos salieron al 1.6x de velocidad hasta que se acortaron las frases; después quedaron en 1.0-1.24x.
- Números en letras para la voz.

## Paso 3. Subtítulos / texto en pantalla traducido (si se pidió)
```bash
python3 scripts/subtitulos.py video.mp4 guion.json salida.mp4 --estilo palabras --resaltado FFD400 \
  --tapar zonas.json   # opcional: cubre textos en inglés y pone la traducción en su lugar
```

## Paso 4. Separar voz y fondo, generar voces
```bash
bash scripts/separar_voz.sh video.mp4 sep/            # sep/voz.wav y sep/fondo.wav
python3 scripts/generar_voz.py guion.json voces/ --motor auto --idioma es \
   --referencia sep/voz.wav --fonetica "Clean Nutra=Clin Nutra"
```
- `--motor auto` usa Fish si hay saldo de API; si no, XTTS local que **clona la voz de la creadora original** (queda más natural que una voz genérica).
- Fish: los créditos gratis de la web NO sirven para la API (error 402 "Insufficient API credit"). Opciones: recargar saldo de API, usar XTTS, o que el equipo genere los audios en la web y los guarde como `voces/seg_000.wav`, `seg_001.wav`...
- La clave de una API se guarda como secreto del entorno (Fish: header `Authorization: Bearer`), nunca pegada en el chat; si alguien la pega, recomiéndale rotarla.

## Paso 5. Mezclar
```bash
python3 scripts/mezclar_doblaje.py video.mp4 guion.json voces/ sep/fondo.wav doblado.mp4
```
Lee la salida: si la velocidad pasa de 1.25x, acorta esas frases y regenera solo esas
(`generar_voz.py ... --rehacer 0,3`). La imagen no se recodifica (queda idéntica).

## Paso 6. Verificar antes de entregar
```bash
python3 scripts/verificar.py doblado.mp4 --guion guion.json --idioma es
```
- Coincidencia voz/guion ≥ 85-90%. Errores típicos de la IA: marcas ("Lin Nutra"), siglas ("BCAA"), palabras parecidas ("creativa"), frases inventadas en textos muy cortos. Regenera esas frases (cada intento sale distinto) o cambia la escritura fonética.
- Volumen ~ -14 LUFS, metadatos limpios, se reproduce completo.

## Entrega
- Nombres claros: `video1_shelf_builder_ES.mp4` o la convención de guiones.md.
- Entrega un .zip si son varios y, si hay Drive conectado, crea la carpeta del producto dentro de la categoría correcta de la tienda (ej. `Salud y belleza/Creatina para mujeres Clean Nutra`) con un documento de guiones (original + traducción con tiempos).
- La conexión de Drive por MCP sube documentos, pero no videos pesados; los videos se suben arrastrándolos desde el .zip, a menos que el entorno tenga acceso de escritura a Drive configurado.
- Explica qué no se pudo hacer y por qué (ej. sin saldo de API, sin acceso a la carpeta local del usuario).
