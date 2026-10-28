"use client";
// Modo vínculo: invitaciones, roles, privacidad y notas de 24 horas.
import { actualizar, leerEstado } from "../almacen";
import type { Ajustes, NotaPareja, RolVinculo, Vinculo } from "../tipos";
import { nuevoId } from "../utilidades";

const DIA_MS = 86_400_000;

export function crearInvitacion(): Vinculo {
  const v: Vinculo = {
    id: nuevoId("v_"),
    codigo: nuevoId().slice(0, 8),
    estado: "pendiente",
    creadoEn: Date.now(),
  };
  actualizar((e) => ({ ...e, vinculos: [v, ...e.vinculos] }));
  return v;
}

export function enlaceInvitacion(codigo: string): string {
  const origen = typeof window !== "undefined" ? window.location.origin : "https://app.miciclo.co";
  return `${origen}/vinculo/unirse/${codigo}`;
}

export function buscarPorCodigo(codigo: string): Vinculo | undefined {
  return leerEstado().vinculos.find((v) => v.codigo === codigo);
}

/** La persona invitada elige su rol y su nombre; queda esperando que ella confirme. */
export function aceptarInvitacion(codigo: string, rol: RolVinculo, nombre: string) {
  actualizar((e) => ({
    ...e,
    vinculos: e.vinculos.map((v) =>
      v.codigo === codigo && v.estado === "pendiente" ? { ...v, rol, nombre: nombre.trim(), estado: "por_confirmar" } : v,
    ),
  }));
}

export function confirmarVinculo(id: string) {
  actualizar((e) => ({
    ...e,
    vinculos: e.vinculos.map((v) => (v.id === id ? { ...v, estado: "activo" } : v)),
  }));
}

export function eliminarVinculo(id: string) {
  actualizar((e) => ({ ...e, vinculos: e.vinculos.filter((v) => v.id !== id) }));
}

export function cambiarPrivacidad(clave: keyof Ajustes["privacidadVinculo"], valor: boolean) {
  actualizar((e) => ({
    ...e,
    ajustes: { ...e.ajustes, privacidadVinculo: { ...e.ajustes.privacidadVinculo, [clave]: valor } },
  }));
}

export function notasVigentes(notas: NotaPareja[], ahora: number): NotaPareja[] {
  return notas.filter((n) => ahora - n.creadaEn < DIA_MS).sort((a, b) => a.creadaEn - b.creadaEn);
}

export function escribirNota(texto: string, de: NotaPareja["de"] = "yo") {
  const limpio = texto.trim();
  if (!limpio) return;
  actualizar((e) => ({
    ...e,
    // se limpian las notas vencidas al escribir
    notasPareja: [...notasVigentes(e.notasPareja, Date.now()), { id: nuevoId("np_"), texto: limpio, de, creadaEn: Date.now() }],
  }));
}

const RESPUESTAS = [
  "Te traje tu té favorito, está en la cocina.",
  "Hoy te toca descansar, yo me encargo de la cena.",
  "Pensando en ti. ¿Quieres que veamos una película?",
  "Eres increíble, no lo olvides.",
];

/** Demo: simula una respuesta de la persona vinculada. */
export function simularRespuesta() {
  escribirNota(RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)], "vinculo");
}

export function horasRestantes(nota: NotaPareja, ahora: number): number {
  return Math.max(0, Math.ceil((nota.creadaEn + DIA_MS - ahora) / 3_600_000));
}
