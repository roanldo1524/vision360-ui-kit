# Videos 100% con IA (guion único → escenas generadas → anuncio)

Para cuando no hay material grabado, o para sacar conceptos nuevos sin grabar. El estándar:
**hiperrealista, gente del común en lugares comunes**, como si una persona normal lo hubiera
grabado con su celular. Nada de modelos perfectos, piel de plástico, estudios o look de cine:
eso se ve "IA" a kilómetros y el público colombiano lo descarta.

## Flujo
1. **Ficha y guion único** (ficha-producto.md + metodo-guion.md). Puntuado ≥16/20. Cada frase
   del guion = una escena de 2-4 s. Un concepto distinto por video (diversidad-meta.md).
2. **Biblia visual** (se repite en todas las escenas para que parezca un solo video):
   - Personaje común: edad, contextura normal, ropa de diario, peinado normal, rasgos locales. Ej.: "mujer de 34 años de Cali, contextura normal, cabello rizado recogido, camiseta del Deportivo Cali vieja". Evita "hermosa", "modelo", "perfecta".
   - Lugar común con detalle local: "cocina pequeña de conjunto en Bogotá con baldosa blanca y nevera con imanes", "sala con sofá y tapete en un barrio de Medellín", "parqueadero de un centro comercial", "baño con toalla colgada", "moto parqueada en la calle".
   - Producto: descripción exacta + **foto real** (`ref_producto`). Sin foto real la IA inventa el empaque.
   - Si el mismo personaje sale en varias escenas: una imagen de referencia del personaje (`ref_personaje`), generada una vez y reutilizada.
   - Estilo: "video vertical de celular, hiperrealista, sin texto ni logos". El script añade solo el **kit de realismo** (persona del común, piel con textura, luz natural, desorden normal, cámara en mano) y la lista de lo que se debe evitar.
3. **Storyboard** (`storyboard.json`, ver cabecera de `escenas_ia.py`): por escena `imagen` (qué se ve, una acción simple), `movimiento` (cámara y acción: "handheld", "se acerca", "gira el frasco"), `dur`, `usa` (personaje/producto). Las escenas de precio/oferta/producto solo pueden ser `"fuente": "foto"` (gratis, foto real animada).
4. **Simular primero (gratis)**: `python escenas_ia.py storyboard.json salida --simular` → muestra prompts y costo, y arma tomas de prueba para revisar ritmo con el editor. Enséñale al usuario el costo estimado y pide confirmación antes de gastar.
5. **Generar** (solo cuando el usuario lo ordene y apruebe el costo): `python escenas_ia.py storyboard.json salida --presupuesto 5`. Proveedor por defecto **kie.ai** (más barato): clave en `KIE_API_KEY` o en `~/.video-ads/credenciales.env` (`KIE_API_KEY=...`); en la nube, si la clave está guardada como secreto del entorno, corre con `KIE_API_KEY=proxy-injected` (el entorno pone la real). Antes de generar muestra el saldo y no sigue si no alcanza. fal.ai como alternativa (`--proveedor fal`, `FAL_KEY`). Primero imagen clave por escena (con las fotos reales de referencia), luego imagen→video. Todo queda en caché: repetir no vuelve a cobrar.
6. **Control de realismo** (mira `salida/imagenes/*.png` y una hoja de contactos de las tomas): manos y dedos, rostro consistente entre escenas, producto idéntico al real (etiqueta, color, forma), sin texto deformado, sin "brillo IA". Rehaz solo las malas: `--solo e02,e05`.
7. **Voz y edición**: `generar_voz.py guion.json voz/ --unir voz/voz.wav` (voz del país) → `editar_auto.py montaje --clips salida/tomas/e01.mp4 ... --en-orden --voz voz/voz.wav --subs voz/voz.json --gancho ... --cta ... --oferta ...`.
8. **Etiqueta IA**: al subir a Meta, marca el contenido como hecho con IA (personas realistas generadas); en pantalla puede ir un aviso pequeño "Imágenes generadas con IA".

## Límites que protegen la cuenta (y la ley)
- Una persona IA **puede**: usar el producto, actuar una situación (el problema, la rutina, la reacción), aparecer en un skit o en una demostración.
- Una persona IA **no puede**: presentarse como clienta real con un testimonio ("yo lo usé y bajé 2 tallas", "llevo 3 meses y…"), mostrar resultados corporales o de salud, ni parecerse a una persona famosa o real. Eso es una reseña falsa: Meta lo castiga y en Colombia puede ser publicidad engañosa (Superintendencia de Industria y Comercio).
- Testimonios: solo de clientes reales, con su permiso.
- El producto siempre fiel al real (devoluciones si no).

## Modelos y costos (aproximados, nov 2026; cambian seguido: verifica en kie.ai/pricing)
| Uso | kie.ai (`--modelo-...`) | Costo aprox. |
|---|---|---|
| Imagen clave con referencia de producto/personaje | `nano-banana` (por defecto), `seedream` | ~USD 0.02-0.03 por imagen |
| Imagen → video, mejor costo | `seedance` (por defecto, Seedance 2, 720p) | ~USD 0.057 por segundo |
| Imagen → video, más calidad de movimiento | `kling3` (Kling 3.0 omni, 720p) | ~USD 0.075 por segundo |
| Imagen → video, el más barato por clip | `hailuo` (Hailuo 02, 6 s) | ~USD 0.06-0.12 por clip |
| Máximo realismo | `veo3-fast` (Veo 3.1 rápido) | ~USD 0.25-0.30 por clip |
Un video de 25 s con 7 escenas IA de 3-4 s ≈ USD 1.5-2.5 con Seedance. `--simular` siempre da el estimado exacto antes de gastar. Las tareas que fallan no se cobran. Para bajar costos: 5-7 escenas IA + 1-3 escenas de foto real animada (gratis) + reutilizar escenas entre conceptos parecidos.
Para personas hablando a cámara en español (UGC IA): Veo 3 con diálogo, o plataformas de avatares (HeyGen, Arcads, Creatify) con clave propia; aplica las mismas reglas de arriba.
