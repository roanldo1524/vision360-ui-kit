"use client";
// Configuraciones: notificaciones, moderación y cierre o borrado de la cuenta.
import { actualizar, reiniciar } from "../almacen";
import { borrarMedios } from "../medios";
import type { Ajustes } from "../tipos";

export function cambiarNotificacion(tipo: keyof Ajustes["notificaciones"], valor: boolean) {
  actualizar((e) => ({
    ...e,
    ajustes: { ...e.ajustes, notificaciones: { ...e.ajustes.notificaciones, [tipo]: valor } },
  }));
}

export function cambiarHoraRecordatorio(hora: string) {
  if (!/^\d{2}:\d{2}$/.test(hora)) return;
  actualizar((e) => ({ ...e, ajustes: { ...e.ajustes, recordatorioHora: hora } }));
}

export function cambiarModoModeradora(valor: boolean) {
  actualizar((e) => ({ ...e, moderadora: valor }));
}

/** Borra las claves locales de Mi Ciclo (estado, preferencias, borradores). */
function borrarClavesLocales() {
  for (const almacen of [localStorage, sessionStorage]) {
    try {
      const claves: string[] = [];
      for (let i = 0; i < almacen.length; i++) {
        const k = almacen.key(i);
        if (k?.startsWith("miciclo:")) claves.push(k);
      }
      claves.forEach((k) => almacen.removeItem(k));
    } catch {
      /* almacenamiento bloqueado */
    }
  }
}

/** Cierra la sesión en este dispositivo. */
export function cerrarSesion() {
  borrarClavesLocales();
  reiniciar();
}

/** Eliminación real: datos, preferencias, fotos y videos. */
export async function eliminarCuenta() {
  await borrarMedios();
  borrarClavesLocales();
  try {
    const cachés = await caches.keys();
    await Promise.all(cachés.filter((c) => c.startsWith("miciclo")).map((c) => caches.delete(c)));
  } catch {
    /* sin caché */
  }
  reiniciar();
}
