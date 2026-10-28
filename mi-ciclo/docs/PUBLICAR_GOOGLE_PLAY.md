# Publicar Mi Ciclo en Google Play

La app es una PWA de Next.js. Para Google Play se empaqueta con **Capacitor**, que abre la app de producción (`https://app.miciclo.co`) dentro de una app Android nativa. La configuración ya está en `capacitor.config.json` (appId `co.miciclo.app`).

> Las acciones del servidor de Next necesitan servidor, por eso Capacitor carga la URL de producción en lugar de un export estático. `webDir: "out"` queda como respaldo para una pantalla sin conexión.

## 1. Requisitos
- Android Studio (SDK 35 o superior) y JDK 21.
- Cuenta de desarrollador de Google Play a nombre de EA Business Group SAS.
- Dominio `app.miciclo.co` desplegado en Vercel con HTTPS.

## 2. Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/android @capacitor/push-notifications @capacitor/splash-screen
npm install -D @capacitor/cli
mkdir -p out && cp public/icono-512.png out/   # carpeta mínima para webDir
npx cap add android
npx cap sync android
```

## 3. Íconos y pantalla de inicio
- Íconos fuente: `public/icono.svg` y `public/icono-maskable-512.png` (regenerar con `node scripts/generar-iconos.mjs`).
- En Android Studio: *Image Asset* → ícono adaptativo con fondo `#E01E37` y la flor-luna blanca.
- Splash: fondo crema `#FBF7F4` con el wordmark.

## 4. Notificaciones push reales
1. Crear el proyecto en Firebase, descargar `google-services.json` a `android/app/`.
2. Registrar el token con `@capacitor/push-notifications` y guardarlo en Supabase (tabla `dispositivos`).
3. Enviar desde el servidor (Supabase Edge Function con cron) los tres tipos: consejo diario, racha y cambio de fase. Respetar las preferencias de `ajustes.notificaciones`.
4. En web, el `public/sw.js` ya escucha el evento `push` (Web Push con VAPID).

## 5. Firmar y generar el paquete
```bash
cd android
./gradlew bundleRelease
```
- Crear la llave de subida (`keytool -genkey -v -keystore miciclo-upload.jks -alias miciclo -keyalg RSA -keysize 2048 -validity 10000`) y guardarla fuera del repositorio.
- Activar *Play App Signing*.
- Configurar Digital Asset Links (`/.well-known/assetlinks.json` en `app.miciclo.co`) si se usa TWA en lugar de Capacitor.

## 6. Ficha de Play Console
- **Categoría:** Salud y bienestar. **Público objetivo:** mayores de 18 años (no incluir grupos de menores).
- **Seguridad de los datos:** declarar datos de salud (ciclo, síntomas, ánimo), fotos y videos, nombre de usuario. Datos cifrados en tránsito. La usuaria puede pedir su eliminación (desde la app). No se comparten con terceros para publicidad.
- **Política de privacidad:** `https://app.miciclo.co/legal/privacidad` (versión aprobada por el abogado).
- **Contenido generado por usuarias:** declarar moderación (filtro, reportes, revisión humana) y botón de reportar y bloquear.
- **Clasificación de contenido:** completar el cuestionario IARC.
- **Eliminación de cuenta:** URL pública con instrucciones (requisito de Google). Puede ser una sección de `/legal/privacidad`.

## 7. Lanzamiento
1. Prueba interna → prueba cerrada (al menos 12 testers durante 14 días si la cuenta es personal nueva) → producción.
2. País: solo Colombia.
3. Revisar en celular pequeño (360 px) y grande (430 px) antes de cada envío.
