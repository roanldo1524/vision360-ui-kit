# Mi Ciclo

App de bienestar femenino de Mi Ciclo (EA Business Group SAS), construida a partir del
*Documento maestro de desarrollo v1* (27 de octubre de 2026) y el sistema visual v2.

## Cómo correrla

```bash
cd mi-ciclo
npm install
npm run dev        # http://localhost:3000
```

Verificación antes de cada entrega:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

## Qué incluye

| Módulo | Estado | Ruta |
| --- | --- | --- |
| Bienvenida (solo 18+, Ciclita, configuración del ciclo) | Funcional | `/bienvenida` |
| Inicio (Hoy): semana, fase con anillo, ritual y racha, ánimo y síntomas, Para ti, En pareja, avance de la comunidad | Funcional | `/` |
| Calendario: fases, predicciones, "mi regla llegó hoy", días íntimos, notas, historial | Funcional | `/ciclo` |
| Consejos por fase | Funcional | `/consejos` |
| Diario cifrado (AES-GCM 256 con PIN, nunca se comparte) | Funcional | `/diario` |
| Comunidad: posts, preguntas, reels, historias 24 h, comentarios en hilo, flores, guardar, seguir, perfiles, búsqueda | Funcional | `/comunidad/**`, `/publicar` |
| Moderación híbrida y panel admin (una sola cola) | Funcional | `/admin` |
| Jardín: pétalos, misiones, racha, canje de bonos con código y UTM | Funcional | `/jardin` |
| Modo vínculo: invitación, roles, confirmación, privacidad, consejo diario, notas de 24 h | Funcional | `/vinculo/**` |
| Configuraciones, cerrar sesión y eliminar cuenta con borrado real | Funcional | `/ajustes` |
| Política de privacidad y Términos (borradores para el abogado) | Borrador | `/legal/**` |
| PWA (manifest, íconos, service worker, notificaciones del sistema) | Funcional | `public/` |
| Empaquetado Google Play con Capacitor | Preparado | `capacitor.config.json`, `docs/PUBLICAR_GOOGLE_PLAY.md` |

## Datos

Esta versión guarda todo en el navegador de cada usuaria (localStorage + IndexedDB para fotos y
videos), con la misma forma del modelo de Supabase propuesto en la sección 06 del documento.
La comunidad trae contenido de ejemplo (perfiles ficticios con Ciclitas e ilustraciones).

Para pasar a producción con Supabase:

1. Crear las tablas de la sección 06 con RLS (`perfiles_comunidad`, `publicaciones`,
   `publicacion_medios`, `comentarios`, `flores`, `guardados`, `seguimientos`, `bloqueos`,
   `reportes`, vista `cola_moderacion`).
2. Reemplazar cada función de `src/lib/**/acciones*.ts` por su acción del servidor. Las pantallas
   no cambian: leen con `useEstado` y escriben con esas acciones.
3. Mover `src/lib/comunidad/consultas.ts` a una vista del servidor que nunca devuelva `autora_id`
   de lo anónimo.
4. Medios a Supabase Storage con URLs firmadas; notificaciones push con Web Push o FCM.

## Decisiones aplicadas (sección 08, opción A)

Rojo `#E01E37`, títulos en Lora 500, colores de fase de DISENO.md
(Folicular `#F773A1`, Ovulación `#B14BC4`, Lútea `#5B3AAA`), última pestaña: Comunidad.
