# Videos "Frankenstein" y tomas de apoyo con IA

## Videos Frankenstein (varios videos → un anuncio nuevo y único)

El usuario sube varios videos (del proveedor, propios, de UGC, versiones viejas) y quiere
un anuncio nuevo con guion propio. El valor no está en pegar clips: está en el **guion nuevo**
que da sentido a las tomas.

1. **Inventario** (1 comando):
   `python3 scripts/inventario_tomas.py trabajo/inv video1.mp4 video2.mp4 ...`
   Abre `hoja_tomas.png` (miniaturas numeradas) y lee `inventario.json` (qué se dice en cada toma).
2. **Ficha del producto** (references/ficha-producto.md): si no existe, créala. El guion sale de ahí, no de los videos.
3. **Guion nuevo** con references/metodo-guion.md (y puntúalo ≥16/20). Escríbelo como tabla: frase de voz → toma(s) que la ilustran (por número) → texto en pantalla → efecto.
   - Primero la toma más fuerte visualmente (resultado, demo, movimiento) para el gancho.
   - Cada frase con su toma correspondiente ("se seca en 4 días" → toma del resultado).
   - Si falta una toma para una frase clave: anímala con código (`animar_producto.py`), genérala con IA (abajo) o reescribe la frase.
   - Las tomas con texto quemado en otro idioma o marcas de agua: `quitar_marca.py` / `subtitulos.py --tapar`, o descártalas.
4. **Voz**: `generar_voz.py guion.json voz/ --unir voz/voz.wav` (voz del país, ver paises.md).
5. **Armar en orden**:
   `python3 scripts/editar_auto.py montaje --clips trabajo/inv/tomas/t004.mp4 trabajo/inv/tomas/t011.mp4 ... --en-orden --voz voz/voz.wav --subs voz/voz.json --gancho "..." --cta "..." --oferta "..." --plan plan.json -o final.mp4`
   El editor reparte las tomas al ritmo de la música; si una frase necesita una toma exacta en un segundo exacto, ajusta el orden o usa el plan.
6. **Variantes**: el mismo inventario sirve para 5-10 anuncios distintos (otros ganchos, otros órdenes) con `lote.py` (`"clips"` = lista de tomas elegidas).

Derechos: un Frankenstein hecho con videos de otra marca sigue siendo material ajeno (ver
cumplimiento.md). Lo seguro: material del proveedor con permiso, propio, o recreado.

## Tomas de apoyo generadas con IA (escenas cortas)

Para cubrir lo que no se grabó: el producto en un contexto (baño, cocina, gym, carro), una
escena de dolor (persona frustrada), un detalle (textura), una animación del mecanismo.

**Primero lo gratis**: `animar_producto.py` (producto animado con fondo de marca), fotos con
zoom (Ken Burns en `editar_auto.py`), b-roll de bancos libres (Pexels, Pixabay) si el equipo lo baja.

**Con IA** (pago por segundo; usar solo para tomas que de verdad mueven la venta). Para generarlas usa `scripts/escenas_ia.py` (ver videos-ia.md: kit de realismo, simulación gratis y costo antes de gastar):
| Herramienta | Bueno para | Nota |
|---|---|---|
| Google Veo 3 | escenas realistas con personas y sonido | caro, muy bueno |
| Kling 2.x | movimiento de producto, imagen→video | buena relación costo/calidad |
| Runway Gen-4 | consistencia de personaje/estilo con referencias | |
| Hailuo / MiniMax, Seedance, LTX | clips rápidos y baratos | vía fal.ai con una sola clave |
| Higgsfield | movimientos de cámara "virales" | |

Cómo mantener coherencia (que no parezcan clips de otro video):
- **Imagen → video, no texto → video**: parte de una foto real del producto o de un fotograma del propio video (misma luz, mismo producto). El producto inventado por la IA casi nunca es fiel al real.
- **Prompt fijo de estilo** que se repite en todas las tomas del video: `vertical 9:16, luz natural de ventana, cocina colombiana moderna, cámara de celular en mano, colores cálidos, sin texto, sin logos`.
- Una acción simple por toma, 3-5 s, cámara lenta o estable ("slow push-in", "handheld").
- Misma persona: usa la misma imagen de referencia de personaje en todas las tomas.
- Pide 2 variantes por toma y elige; descarta manos o etiquetas deformes.
- Marca las tomas IA como contenido IA si muestran personas realistas (cumplimiento.md).

Plantilla de prompt:
```
[Sujeto + acción simple], [lugar con detalle local], [momento del día/luz], cámara [movimiento],
estilo video de celular realista, vertical 9:16, sin texto en pantalla, 4 segundos.
Referencia: [foto del producto / fotograma].
```

Ahorro: genera a 720p (el editor escala a 1080), 4-5 s, y solo las 1-3 tomas que faltan; todo lo demás sale del material existente o del código.
