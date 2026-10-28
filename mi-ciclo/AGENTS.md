# Mi Ciclo · guía para quien construye

App PWA de Mi Ciclo (EA Business Group SAS). Especificación: *Documento maestro de desarrollo v1* (27-oct-2026).

## Stack
- Next.js 16 (App Router) + TypeScript estricto. Iconos `lucide-react` (trazo, nunca emojis).
- Datos: almacén local en el navegador (`src/lib/almacen.ts`) con la misma forma que el modelo de Supabase de la sección 06.
  Cada acción vive en `src/lib/**/acciones*.ts` y se podrá reemplazar por una acción del servidor sin tocar las pantallas.
- Fotos y videos: IndexedDB (`src/lib/medios.ts`). En producción: Supabase Storage con URLs firmadas.

## Reglas
1. Todo en español: interfaz, código y comentarios.
2. Solo tokens y tipografías del sistema v2 (`src/app/globals.css`): Lora 500 títulos, DM Sans interfaz, Caveat solo dentro de imágenes, wordmark en Chonburi.
3. El rojo `--rojo` solo en la acción principal de cada pantalla.
4. Ciclitas en lugar de fotos de personas. Nada de fotos generadas con IA.
5. Nunca mostrar la fase ni datos del ciclo en la comunidad. El anonimato se aplica en la capa de consultas (`src/lib/comunidad/consultas.ts`): la vista pública nunca devuelve `autoraId` de lo anónimo.
6. Zonas táctiles de 44 px mínimo. Se ve bien de 360 a 430 px.
7. Cada entrega pasa `npx tsc --noEmit`, `npm run lint` y `npm run build`.

## Mapa
| Ruta | Pantalla |
| --- | --- |
| `/bienvenida` | Registro (18+), Ciclita, configuración del ciclo |
| `/` | Inicio (Hoy) |
| `/ciclo` | Calendario, predicciones, "mi regla llegó hoy", días íntimos |
| `/consejos`, `/diario`, `/notificaciones` | Consejos por fase, diario cifrado (AES-GCM con PIN), avisos |
| `/comunidad/**`, `/publicar`, `/admin` | Comunidad, publicar, panel de moderación |
| `/jardin` | Pétalos, misiones, jardín y canje de bonos con UTM |
| `/vinculo/**` | Modo vínculo |
| `/ajustes/**`, `/legal/**` | Configuraciones y páginas legales |
