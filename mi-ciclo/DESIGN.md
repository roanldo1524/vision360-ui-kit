# Mi Ciclo · sistema de diseño

Fuente de verdad visual de la app. Inicio (`src/components/hoy/`) es la pantalla de referencia: toda pantalla nueva o rediseñada se mide contra ella. Reglas de producto en `PRODUCT.md`.

## Sensación

Calma, cuidado, deseo. Un lugar al que ella quiere volver: blanco y luminoso, con un único golpe de Rojo Coral por pantalla y las formas propias de la marca. Nada genérico, nada que parezca plantilla o hecho con IA.

## Color (solo brandbook 2026)

| Token | Valor | Uso |
| --- | --- | --- |
| `--rojo` | `#F62C39` Rojo Coral | Campos de marca (portadas), logo, flor-luna, anillos, puntos del ciclo. **No** para texto pequeño. |
| `--rojo-accion` | `#E3202F` | Fondo del único botón principal de cada pantalla (texto blanco, 4,6:1). |
| `--rojo-texto` | `#C8102E` | Texto rojo pequeño (enlaces, estados), 5,9:1 sobre blanco. |
| `--rosa` | `#FFDCED` Rosa | Superficies cálidas, cifras sobre rojo, mosaicos de icono. |
| `--violeta` | `#E7BEF8` Violeta | Superficies de calma (anónimo, consejos, vínculo). |
| `--violeta-oscuro` | `#5B3AAA` | Acento secundario, fase lútea, formas sobre violeta. |
| `--vino` | `#1F0526` | Texto (tinta ciruela de la web). |
| `--texto-2` / `--texto-3` | `#6E5470` / `#7A667C` | Texto secundario (AA sobre blanco). |
| `--crema` / `--blanco` | `#FFFFFF` | Fondo de la app y de las tarjetas. |
| `--rosa-claro`, `--lila` | `#FFF1F6`, `#F6E6FD` | Rellenos suaves de estados y filas. |

Prohibido: verdes menta, durazno, amarillo, degradados de fondo decorativos, azul (salvo el agua, que es semántico).

## Tipografía (solo miciclo.co)

- **Glodok Display** (`--f-display`): solo marca. El logo y una cifra protagonista por pantalla como máximo (ej. el día del ciclo en la portada). Nunca en párrafos ni títulos de sección.
- **Fraunces** (`--f-titulo`): títulos. Peso 400–500, con **una palabra en itálica 500** como acento (`Hola, <em>Rosaura</em>`, `Fase <em>menstrual</em>`, `Para ti <em>hoy</em>`). Nunca 800/900.
- **Lora itálica** (`--f-acento`): frases de acompañamiento (consejo del día, citas).
- **Manrope** (`--f-ui`): todo lo demás. 400 cuerpo, 600–700 énfasis, 800 solo en botones.
- Escala: 12 · 13 · 14 · 15 · 17 · 21 · 26 · 32 (+ cifra Glodok 112). **Mínimo 12 px.** Sin etiquetas en mayúsculas espaciadas (eyebrows): el contexto va en frase normal.

## Recursos gráficos (brandbook)

`src/components/FormasMarca.tsx`: `Luna`, `Circulo`, `Estrella` (4 pétalos), `FlorLuna`, `FlorOndulada`. Formas planas, un solo color, sin brillos.

- **Portada de marca**: campo `--rojo` a sangre con esquinas inferiores de 32 px, una flor-luna gigante recortada (`#FF5A66` sobre rojo) y texto blanco. Una por pantalla principal como máximo.
- **Piezas** (`Ilustracion.tsx`): campo de color plano + forma oficial grande recortada + frase opcional en Fraunces itálica. Reemplazan cualquier dibujo.
- **Glifos**: forma de marca dentro de un círculo de color suave (ánimos, filas de lista, estados vacíos).
- **Fotos reales** de `public/marca/` (producto, sobre, ingredientes, campaña). Nunca fotos de personas generadas con IA.
- **Ciclitas**: avatares de la comunidad; planas, sin brillo.

## Componentes y medidas (rejilla de 8 px)

- Margen lateral 18 px. Separación entre bloques 20 px; dentro de tarjeta 16 px.
- **Tarjeta**: fondo blanco, radio 28 px (24 en tarjetas pequeñas), borde 1 px `#F3E6EC` (`--sombra`), sin sombras difusas.
- **Lista serena**: tarjeta con filas de 76 px (miniatura 60 px radio 18, título Fraunces 17, subtítulo Manrope 14, chevron `--texto-3`), separadores de 1 px.
- **Botón principal**: píldora `--rojo-accion`, 50 px de alto, Manrope 800 15 px. **Uno por pantalla.**
- **Botón secundario**: píldora blanca con borde fino; sobre rojo, píldora blanca con texto `--vino`.
- **Chips / filtros**: píldoras `--rosa-claro` o blancas con borde; seleccionado `--rojo-accion` con texto blanco.
- **Zonas táctiles**: 44 × 44 px mínimo.
- **Barra inferior**: blanca, etiquetas 12 px `--texto-2`, activo `--rojo-texto` con píldora `--rosa`, "+" circular `--rojo-accion`.

## Movimiento

`--ease-out` fuerte, 160–320 ms. `scale(0.97)` al tocar. Entrada escalonada de bloques. Nada desde `scale(0)`. Rotación lenta (90 s) solo en la flor-luna gigante. Respetar `prefers-reduced-motion`.

## Voz

Tú, cercana, serena, sin juicio. Frases cortas. "Hoy empieza tu racha", no "0 días seguidos". Estados vacíos que invitan, nunca regañan.
