# Plantilla "Cazatesoros": página de ventas del imán de pesca

Esta carpeta guarda la página de ventas del imán de pesca **tal como quedó en vivo** el 27 de octubre de 2026, tema **"v12 LISTA PARA PUBLICAR - ruleta"** de alcomprar.shop.

Sirve para volver a crear **la misma estructura** con otro producto. Para eso, en un chat de Claude escribe:

> Usa la plantilla **Cazatesoros** que está en `kits/iman-de-pesca` del repositorio `vision360-ui-kit` para crear la página de ventas de [producto / link].

En diseño web esto se llama **plantilla de página de ventas**, o *landing page template*: la estructura y el diseño se quedan, y se cambian el producto, las fotos, los textos y los precios.

---

## Estructura de la página (de arriba a abajo)

| # | Sección | Para qué sirve |
|---|---|---|
| 0 | **Barra Black Friday fija** con contador real (hasta el 30/11) y "Gratis con tu pedido: Cuerda 10 m · Guía digital" | Urgencia y regalos siempre a la vista |
| 1 | **Título + precio** ("Imán de Pesca 140 kg", -27% Black Friday) | Qué es y cuánto vale, de una |
| 2 | **Galería** de fotos y video con flechas y miniaturas (la foto siguiente se asoma) | Ver el producto como en una tienda de marca |
| 3 | **Tu pedido incluye**: imán, cuerda 10 m (GRATIS), guía digital (GRATIS) | Valor percibido |
| 4 | **Intro**: "Una búsqueda de tesoros en cada salida" + chips (monedas, llaves, cajas fuertes…) | Vender la emoción, no el objeto |
| 5 | **Prueba**: "Probado en máquina hidráulica", sello 140 KG + "Truco de cazador" | Confianza sin crear objeciones |
| 6 | **Ofertas** 1, 2 y 3 unidades (×1 ×2 ×3, ahorro en verde, "Más popular", "Mejor precio") + bloque **"2 REGALOS GRATIS"** + "Antes de pedir, confirma 3 cosas" | La compra, con protección contra devoluciones |
| 7 | **Reseñas reales** (metaobjeto "Reseña de cliente"; se oculta si no hay) | Prueba social honesta |
| 8 | **Míralo en acción**: carrusel de videos con sonido | Demostración |
| 9 | **¿Qué ganas?**: tarjetas de beneficios deslizables | Beneficios |
| 10 | **¿Lo levanta o no?**: calculadora interactiva (hasta 140 kg) | Interacción |
| 11 | **Del pedido al primer tesoro**: línea de tiempo | Quitar miedo al contra entrega |
| 12 | **Cómo se usa**: pasos | Facilidad |
| 13 | **Más hallazgos, menos plata**: comparativo de marca | Valor contra la competencia |
| 14 | **Preguntas frecuentes** | Resolver objeciones (puerta, niños, envío…) |
| 15 | **Cierre al atardecer**: "Tu próximo sábado, en el río" + botón | Último empujón |
| — | **Botón de compra fijo** abajo | Comprar desde cualquier parte |

### Piezas que se activan solas
- **Ruleta de descuento**
  - **Cuándo se abre:**
    - a los 8 segundos si la persona ya bajó un poco;
    - a los 6 segundos de ver las ofertas;
    - de inmediato si intenta irse (sube rápido o vuelve de otra pestaña).
  - **Primer giro:** frena despacio sobre $10.000, se queda temblando y cae en "¡Casi!". La letra pequeña dice que es de práctica.
  - **Segundo giro:** $5.000 al 70% y $10.000 al 30%, con códigos GIRA5 y GIRA10 en Shopify → Descuentos.
  - **Al ganar:** el descuento se aplica solo en EasySell.
  - **Extras:** sonido, confeti y vibración.
- **Descuento fijo:** si gana y cierra el formulario sin pedir, aparece "🎁 ¡No pierdas tus $X! · Pedir", que brilla y se sacude.
- **Giro pendiente:** si cierra la ruleta sin girar, queda la burbuja "🎁 Tienes 1 giro gratis".
- **Formulario EasySell con la marca:** encabezado azul marino y dorado, los 2 regalos y el aviso de pago contra entrega. Está en `ct-easysell.liquid` y en el CSS de la sección.
- **Medición en el píxel de Meta:** RuletaVista, RuletaGiro, RuletaPremio, RuletaPedido, DescuentoRecordado, DescuentoChipClic y RuletaPendienteClic.

### Marca y diseño
- **Colores:** azul marino `#0A2233`, dorado `#F6B826`, rojo `#C8432B`, verde `#1d6b40`, crema.
- **Letras:** **Fugaz One** para títulos y **Barlow** / **Barlow Condensed** para el texto.
- **Sello:** "a" dorada en círculo azul, "alcomprar · Tienda oficial".
- **Hecha para celular.** Movimientos cortos y suaves, en la línea de diseño de Emil Kowalski.

---

## Archivos

```
kits/iman-de-pesca/
├── README.md                     ← esta guía
├── CONOCIMIENTO.md               ← todo lo que se decidió y aprendió (precios, reglas, datos de Clarity)
├── shopify/
│   ├── sections/
│   │   ├── iman-pesca-landing.liquid   ← la página completa (diseño, textos, ruleta)
│   │   └── ct-easysell.liquid          ← conecta los botones con EasySell y arregla el carrusel
│   └── templates/
│       └── product.iman-de-pesca.json  ← plantilla del producto que une las dos secciones
└── recursos/                     ← fotos, videos y la guía PDF (copias de Shopify → Archivos)
```

Las fotos se llaman desde Shopify → Contenido → Archivos con el prefijo `ct-`, por ejemplo `{{ 'ct-1-principal.jpg' | file_url }}`. Si se usa en otra tienda, primero hay que subir los archivos de `recursos/` con esos mismos nombres.

## Cómo instalarla en Shopify (lo hace Claude)
1. Duplicar el tema en vivo. Shopify no deja editar el tema en vivo por la API.
2. Subir los dos `.liquid` a `sections/` y el `.json` a `templates/` de la copia.
3. Asignarle al producto la plantilla (`templateSuffix`) y la app EasySell.
4. Probarla en la vista previa, renombrar la copia a "LISTA PARA PUBLICAR", y que el dueño le dé **Publicar**.

## Para usarla con otro producto, cambiar
- Textos, título, precio y chips de la sección, y las preguntas frecuentes.
- Las fotos `ct-*.jpg` y los videos.
- Las ofertas (`data-qty` y `data-price`) para que coincidan con EasySell.
- Los regalos.
- Los códigos de la ruleta, que hay que crear en Shopify → Descuentos.
- En el editor del tema: WhatsApp y "Fin de la oferta Black Friday".
