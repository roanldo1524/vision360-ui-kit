# Skill «Video Ads Ecommerce» — instalar y usar en tu computador

Esta skill convierte a **Claude Code** en el editor y estratega de anuncios de video del
equipo, para todos los productos de las tiendas: investiga el producto, escribe guiones que
venden, traduce y dobla, edita en automático (cortes al ritmo, subtítulos, efectos, música,
voz), saca muchas variantes al día, quita marcas de agua y limpia metadatos.

> **Lo más fácil:** instala Claude Code, copia la carpeta de la skill (paso 2), abre Claude
> Code y escribe **«configura la skill de video»**. Claude revisa tu computador, te dice qué
> falta y te guía. Lo de abajo es lo mismo, por escrito.

---

## 1. Lo que necesita el computador

| | Mínimo | Recomendado |
|---|---|---|
| Sistema | Windows 10/11 o macOS 12+ | — |
| Memoria | 8 GB | 16 GB |
| Disco libre | 15 GB | 30 GB |
| Tarjeta gráfica | **No hace falta** | NVIDIA (va ~2 veces más rápido); los Mac con chip M también aceleran |
| Internet | Para instalar y la primera vez (descarga ~3 GB de modelos) | — |

Programas (una sola vez):
1. **Claude Code** — https://claude.com/claude-code (cuenta de Claude Pro o superior), o la app de escritorio de Claude.
2. **Python 3.12**
3. **ffmpeg** versión completa

### Windows
Abre **PowerShell** y escribe una línea a la vez:
```
winget install Python.Python.3.12
winget install Gyan.FFmpeg
```
Cierra PowerShell, ábrelo de nuevo y escribe:
```
python -m pip install -r "$HOME\.claude\skills\video-ads-ecommerce\requirements.txt"
```

### Mac
1. Instala Homebrew (https://brew.sh) si no lo tienes.
2. En **Terminal**:
```
brew install python@3.12 ffmpeg
python3 -m pip install -r ~/.claude/skills/video-ads-ecommerce/requirements.txt
```

## 2. Copiar la skill
1. Descomprime el archivo de la skill (`video-ads-ecommerce.skill` es un .zip; si hace falta, cámbiale la extensión a .zip).
2. Deja la carpeta `video-ads-ecommerce` aquí:
   - **Windows:** `C:\Users\<tu usuario>\.claude\skills\video-ads-ecommerce`
   - **Mac:** `/Users/<tu usuario>/.claude/skills/video-ads-ecommerce`
3. ¿No ves la carpeta `.claude`? Está oculta: en Windows, Explorador › Vista › Mostrar › Elementos ocultos; en Mac, `Cmd + Shift + .`

(Si usas Claude en la web con skills de organización, también puedes instalarla con el botón «Save skill» del archivo `.skill`.)

## 3. Revisar el computador
```
python  "%USERPROFILE%\.claude\skills\video-ads-ecommerce\scripts\verificar_equipo.py"      (Windows)
python3 ~/.claude/skills/video-ads-ecommerce/scripts/verificar_equipo.py                    (Mac)
```
Cada línea sale con ✔ o ✘. Si algo falta, el informe dice el comando exacto. Cuando diga
**LISTO: el equipo puede editar**, ya se puede usar.

Voz IA gratis en tu computador (opcional, ~3 GB):
```
python scripts/setup_xtts.py            (agrega --cuda si tienes NVIDIA)
```

## 4. Tu carpeta de trabajo
Pídele a Claude «configura la skill» o corre:
```
python scripts/configurar.py "D:\Editor IA" --tienda "Mi tienda" --pais CO
```
Quedan estas carpetas:
| Carpeta | Para qué |
|---|---|
| `1 Material crudo/<producto>/` | lo que grabaron o mandó el proveedor (videos y fotos). No se toca |
| `2 Referentes/` | videos cuyo estilo de edición quieres copiar |
| `3 Resultados/<producto>/<fecha>/` | los videos terminados |
| `Fichas/` | una ficha por producto: la memoria de lo que se sabe y lo que funcionó |
| `Estilos/` | estilos de edición aprendidos de referentes |
| `Musica/` | música **con licencia** por estilo/temporada (ya trae música base hecha con código) |
| `Voces/` | muestras de voz para clonar (solo con permiso de la persona) |
| `Pedidos/` | pedidos de lote (muchas variantes de un producto) |

## 5. Cómo se usa (lo que le escribes a Claude)

**La receta más simple:** pon el material en `1 Material crudo/<producto>/` (o súbelo al chat) y escribe
**«Necesito 10 videos de <producto>»**. Claude lee o crea la ficha del producto, te muestra opciones para
elegir y reparte los 10 en conceptos distintos (formato, ángulo, voz, música y look diferentes) para que
Meta no los trate como el mismo anuncio.

Qué conviene darle (mientras más, mejor resultado):
- 3 a 6 videos del producto (en uso, resultado, unboxing, una persona hablando) y 2-3 fotos;
- nombre, precio y oferta real, a quién se le vende, link del producto;
- opcional: un video de referencia del estilo que te gusta y los colores de la tienda.

No tienes que saber editar ni escribir instrucciones largas: **Claude te muestra opciones y tú
eliges** (qué quieres hacer, país, cuántas versiones, tipo de edición, ángulo de venta, voz,
música, oferta). Ejemplos para empezar:
- «Hazme videos de la faja que está en `1 Material crudo/faja lipo`»
- «Traduce al español colombiano los videos de `1 Material crudo/creatina`»
- «Hazme 10 variantes del producto X para testear en Meta»
- «Solo necesito guiones para el producto Y»
- «Quítale la marca de agua a estos videos» (solo material propio o con permiso)
- «Quiero editar como este video: `2 Referentes/video.mp4`»

Lo que hace Claude, en orden: lee (o crea) la **ficha del producto** → te pregunta con opciones →
escribe el guion y lo puntúa → arma los videos → los revisa (volumen, textos, metadatos) → los
deja en `3 Resultados` y actualiza la ficha.

**Lo que SIEMPRE revisa una persona antes de pautar** (Claude no oye):
- que la música y la voz suenen bien y vayan con el ánimo del video;
- que los subtítulos digan lo correcto;
- precios, fechas y ofertas: solo las confirmadas.

## 6. Reglas del equipo
- Música: solo con licencia comercial o la generada por la skill. Nunca canciones famosas (aunque se les quite la voz): Meta silencia o bloquea el anuncio.
- Material de otras marcas: solo como referencia o con permiso del proveedor.
- Claves de APIs: en el computador, en el archivo `~/.video-ads/credenciales.env` (una por línea: `KIE_API_KEY=...`, `FISH_API_KEY=...`, `ELEVENLABS_API_KEY=...`) o como variables de entorno; nunca pegadas en el chat. kie.ai es el proveedor de videos con IA (Kling, Seedance, Veo): Claude siempre muestra el costo antes de generar y solo genera si tú lo ordenas. Fish necesita **saldo de API** (los créditos gratis de la web no sirven para la API).

## 7. Si algo falla
| Lo que pasa | Qué hacer |
|---|---|
| `python` no se reconoce | Cierra y abre PowerShell. En Mac usa `python3` |
| «ffmpeg no está» o «faltan filtros» | Reinstala ffmpeg completo (paso 1) y vuelve a revisar el equipo |
| Va muy lento | Normal sin tarjeta gráfica en videos largos; en lotes usa la opción rápida (Claude la usa sola) |
| Los subtítulos tienen palabras mal oídas | Díselo a Claude; para que oiga mejor (más lento): variable `VIDEO_ADS_WHISPER=medium` |
| La voz IA dijo una palabra mal | Díselo a Claude: regenera solo esa frase |
| La voz de Fish da error 402 | Falta saldo de API en fish.audio/app/developers; usa la voz gratis mientras tanto |
