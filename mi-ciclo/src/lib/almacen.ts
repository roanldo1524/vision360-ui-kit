"use client";
// Almacén local de la app. Guarda todo en el navegador (localStorage) y expone
// una API pequeña: useEstado(selector) para leer y actualizar(fn) para escribir.
// Cuando exista el backend, cada acción se reemplaza por su acción del servidor.
import { useSyncExternalStore } from "react";
import type { Estado } from "./tipos";
import { comunidadInicial, renovarHistoriasSemilla } from "./semilla";

const CLAVE = "miciclo:estado:v1";
export const VERSION = 1;

export function estadoInicial(): Estado {
  return {
    version: VERSION,
    perfil: null,
    ciclo: null,
    periodos: [],
    registros: {},
    petalos: 0,
    movimientos: [],
    misiones: {},
    canjes: [],
    notificaciones: [],
    ajustes: {
      notificaciones: { consejo: true, racha: true, fase: true, comunidad: true },
      privacidadVinculo: { fase: true, animo: true, sintomas: false, regla: true },
      recordatorioHora: "08:00",
    },
    vinculos: [],
    notasPareja: [],
    diario: { entradas: [] },
    comunidad: comunidadInicial(),
    moderadora: false,
    agua: {},
    metaAgua: 2000,
    objetivo: "periodo",
    embarazo: false,
  };
}

let estado: Estado | null = null;
const oyentes = new Set<() => void>();

function cargar(): Estado {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (crudo) {
      const leido = JSON.parse(crudo) as Estado;
      if (leido.version === VERSION) {
        const e = { ...estadoInicial(), ...leido };
        return { ...e, comunidad: renovarHistoriasSemilla(e.comunidad) };
      }
    }
  } catch {
    // almacenamiento bloqueado o dañado: se empieza de cero
  }
  return estadoInicial();
}

function guardar(e: Estado) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    // sin espacio o bloqueado: la sesión sigue funcionando en memoria
  }
}

export function leerEstado(): Estado {
  if (estado === null) estado = typeof window === "undefined" ? estadoInicial() : cargar();
  return estado;
}

/** Aplica un cambio inmutable al estado y lo persiste. */
export function actualizar(fn: (e: Estado) => Estado): void {
  estado = fn(leerEstado());
  guardar(estado);
  oyentes.forEach((o) => o());
}

/** Borra todo (cerrar sesión / eliminar cuenta). */
export function reiniciar(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    /* nada que borrar */
  }
  estado = estadoInicial();
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  const alCambiarOtraPestana = (ev: StorageEvent) => {
    if (ev.key === CLAVE) {
      estado = cargar();
      o();
    }
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(o);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

const servidor = estadoInicial();

/** Lee una parte del estado. El selector debe devolver valores estables (no objetos nuevos). */
export function useEstado<T>(selector: (e: Estado) => T): T {
  return useSyncExternalStore(
    suscribir,
    () => selector(leerEstado()),
    () => selector(servidor),
  );
}

/** true solo en el cliente, después de hidratar. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
