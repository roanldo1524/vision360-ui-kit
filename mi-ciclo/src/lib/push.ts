"use client";
// Notificaciones del sistema (las del celular). Usan el service worker de la PWA.
// Para push desde el servidor hará falta Web Push (VAPID) o FCM con Capacitor.

export function permisoNotificaciones(): NotificationPermission | "no-soportado" {
  if (typeof window === "undefined" || !("Notification" in window)) return "no-soportado";
  return Notification.permission;
}

export async function pedirPermisoNotificaciones(): Promise<NotificationPermission | "no-soportado"> {
  if (!("Notification" in window)) return "no-soportado";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function notificarSistema(titulo: string, texto: string, enlace?: string) {
  if (permisoNotificaciones() !== "granted") return;
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    const opciones: NotificationOptions = {
      body: texto,
      icon: "/icono-192.png",
      badge: "/icono-192.png",
      data: { enlace: enlace ?? "/" },
    };
    if (registro) await registro.showNotification(titulo, opciones);
    else new Notification(titulo, opciones);
  } catch {
    /* el navegador no permitió mostrarla */
  }
}
