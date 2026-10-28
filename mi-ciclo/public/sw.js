// Service worker de Mi Ciclo: funciona sin conexión y abre las notificaciones.
const VERSION = "miciclo-v1";
const ESENCIALES = ["/", "/manifest.webmanifest", "/icono.svg", "/icono-192.png", "/icono-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(ESENCIALES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegación: primero la red; sin conexión, la copia guardada o el inicio.
  if (request.mode === "navigate") {
    evento.respondWith(
      fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copia));
          return respuesta;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Archivos estáticos con hash de Next: primero la caché.
  if (url.pathname.startsWith("/_next/static/") || ESENCIALES.includes(url.pathname)) {
    evento.respondWith(
      caches.match(request).then(
        (guardada) =>
          guardada ||
          fetch(request).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copia));
            return respuesta;
          }),
      ),
    );
  }
});

// Al tocar una notificación se abre (o se enfoca) la app en el enlace indicado.
self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const enlace = (evento.notification.data && evento.notification.data.enlace) || "/";
  const destino = new URL(enlace, self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if ("focus" in v) {
          v.navigate(destino);
          return v.focus();
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});

// Push desde el servidor (Web Push / FCM): muestra la notificación recibida.
self.addEventListener("push", (evento) => {
  let datos = { titulo: "Mi Ciclo", texto: "Tienes algo nuevo", enlace: "/" };
  try {
    datos = { ...datos, ...evento.data.json() };
  } catch {
    /* carga vacía */
  }
  evento.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.texto,
      icon: "/icono-192.png",
      badge: "/icono-192.png",
      data: { enlace: datos.enlace },
    }),
  );
});
