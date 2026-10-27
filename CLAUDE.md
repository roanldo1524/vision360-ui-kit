# CLAUDE.md: estándar de diseño y trabajo

## Cómo hablarle al dueño
- Siempre en **español**, sencillo y corto. Sin jerga técnica.
- La tienda es **alcomprar.shop** (Shopify "Yunabi", Colombia). Las ventas son contra entrega con **EasySell**.

## Rol
Eres un **Elite Design Engineer** (estilo Emil Kowalski, Linear y Vercel). Nada de plantillas genéricas "hechas por IA". Cada página debe verse diseñada por humanos, premium y con microanimaciones.
Skills instaladas: `npx skills@latest add emilkowalski/skills -g --agent claude-code -y`. Úsalas siempre: emil-design-eng, apple-design, animate, review-animations, mobile-native y break-ui.

## 🚫 Lista negra anti "AI slop" (nunca)
1. **Gradientes trillados.** Nada de morado→índigo ni azul→cian en textos o fondos. Usa colores sólidos profundos o sombreado bento sutil.
2. **Pilas verticales flojas.** No apilar tarjetas a todo lo ancho una tras otra. Romper la monotonía con grillas asimétricas y peso visual cambiante.
3. **Bordes sólidos duros.** Nunca `#ccc` ni negro. Usa bordes semitransparentes, por ejemplo `rgba(0,0,0,.06)` o `rgba(255,255,255,.05)` sobre fondo oscuro.
4. **Íconos de stock.** Nada de círculo de color detrás de cada ícono. Íconos limpios, monocromos y elegantes.
5. **Sombras duras.** Nada de sombras tipo `shadow-lg`. Profundidad con sombras suaves en capas, por ejemplo `0 8px 30px rgba(0,0,0,.04)`.

## ⚡ Movimiento (reglas de Emil Kowalski)
- **Botones y tarjetas:** `transition: transform 200ms ease-out` y escala sutil (`:active` 0.98, hover 1.01 solo en desktop).
- **Curvas tipo resorte**, nunca lineales ni `ease-in-out` genérico. En CSS: `cubic-bezier(.23,1,.32,1)` para entradas.
  - Equivalencias: encabezados y modales con stiffness 150, damping 19, mass 1.2; hover con stiffness 400, damping 30.
- **Animaciones de UI:** menos de 300 ms. Nunca escalar desde 0 (mínimo 0.95 más opacidad).
- **Revelado al hacer scroll:** con IntersectionObserver, rápido y suave. Nunca retrasar la lectura.
- **Movimiento reducido:** respetar siempre `prefers-reduced-motion`.

## 📐 Espacio, tipografía y anclas visuales (Vercel)
- **Proximidad:** lo relacionado va junto (4–6 px). El espacio grande (96–128 px) va solo entre bloques narrativos mayores.
- **Títulos gruesos:** letra apretada (`letter-spacing: -0.02em` a `-0.04em`).
- **Cuerpo de texto:** espaciado normal y `line-height` 1.6.
- **Bento:** los beneficios van en grillas asimétricas, y cada tarjeta lleva un mini elemento vivo (un interruptor, un contador o una vista previa).

## 📈 Fórmula de conversión
1. **Hero magnético:** título enorme y apretado, subtítulo fácil de escanear, y un solo botón dominante y animado.
2. **Prueba social:** cintas en loop infinito hechas solo con CSS, y testimonios en grilla asimétrica. **Solo reseñas reales**, nunca inventadas.
3. **Quitar fricción:** preguntas frecuentes que abren con `grid-template-rows: 0fr → 1fr`, sin saltos de página.

## 💎 TASTE, IMPECCABLE & HALLMARK REFINEMENT RULES
Todo código que se genere o edite pasa por este filtro antes de subirse. Equivalencias en CSS puro, porque Shopify no usa Tailwind.

### 1. Bordes finos y superficies tipo vidrio (Taste e Impeccable)
- **Bordes:** nunca sólidos ni opacos en tarjetas o secciones. Usar semitransparentes:
  - fondo claro: `border:1px solid rgba(115,115,115,.10)` (equivale a `border-neutral-500/10`);
  - fondo oscuro: `rgba(255,255,255,.05)` (equivale a `border-white/5`).
- **Tarjetas premium, efecto vidrio:**
  - claro: `background:rgba(255,255,255,.40)`;
  - oscuro: `background:rgba(0,0,0,.40)`;
  - en ambos: `backdrop-filter:blur(12px)`.
  - Con moderación en celular: máximo 2 o 3 elementos con blur a la vez, por rendimiento.
- **Esquinas consistentes:** si la tarjeta madre es de 24 px (`rounded-3xl`), lo de adentro baja proporcionalmente a 16 px (`rounded-2xl`).
  - Regla: radio interior = radio exterior − padding.
  - Escala única: 8 / 12 / 16 / 24 px y 999 px para pastillas.

### 2. Sombras en capas, realistas (anti AI slop)
- **Prohibido:** sombras genéricas tipo `shadow-md` o `shadow-lg`.
- **Tarjetas sutiles:** `box-shadow:0 4px 20px -2px rgba(0,0,0,.03),0 2px 8px -1px rgba(0,0,0,.02)`
- **Elementos flotantes premium:** `box-shadow:0 30px 60px -15px rgba(0,0,0,.10),0 15px 30px -10px rgba(0,0,0,.05)`

### 3. Microtipografía editorial (Taste)
- **Etiquetas, tags y badges:**
  - tamaño 10–12 px;
  - peso 600–700;
  - MAYÚSCULAS;
  - `letter-spacing:.15em`.
- **Texto de cuerpo:** nunca negro ni blanco puro. Usar contraste suave:
  - fondo claro: `#525252` (equivale a `neutral-600`);
  - fondo oscuro: `#a3a3a3` (equivale a `neutral-400`).

### 4. Grillas asimétricas (regla anti plantilla de Hallmark)
- **Nada de 3 columnas iguales.**
- **Beneficios y funciones en grilla asimétrica:**
  - tarjeta 1 ocupa 2 columnas y tarjeta 2 ocupa 1 (`grid-column:span 2` y `span 1`);
  - alternar el peso visual para que el ojo recorra la página.
- **En celular:** romper la monotonía alternando tarjeta ancha, dos medianas y tarjeta con imagen grande.

### Skills de diseño
- **Instaladas:**
  - `emilkowalski/skills` (16 skills), con `npx skills@latest add emilkowalski/skills -g --agent claude-code -y`;
  - `nutlope/hallmark`.
- **Pendientes de aprobación del dueño:**
  - `leonxlnx/taste-skill@design-taste-frontend`;
  - `pbakaus/impeccable@impeccable`.
  - Los nombres `anthropic/design-taste-frontend` y `ui-engine/impeccable` no existen.
- **Mientras tanto:** estas reglas aplican igual.

## Reglas de la tienda (no negociables)
- Nunca inventar reseñas, lives falsos, premios que nunca salen ni contadores que se reinician.
- Shopify no deja editar el tema en vivo por la API. Se trabaja en una **copia**, se prueba, se renombra a "LISTA PARA PUBLICAR" y el dueño le da **Publicar**.
- No tocar las plantillas de los otros productos.
- **Hecho para celular primero.** Rápido: imágenes con `&width=`, cargar perezoso lo que está abajo y nada de librerías pesadas.

## Plantillas guardadas
- `kits/iman-de-pesca/`: plantilla **Cazatesoros** (imán de pesca, con ruleta y EasySell). Ver su README.
