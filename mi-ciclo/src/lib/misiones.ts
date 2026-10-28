"use client";
// Misiones diarias y pétalos. Cada misión se puede completar una vez por día.
import { actualizar, leerEstado } from "./almacen";
import { hoyColombia, rachaSobre } from "./ciclo";
import { nuevoId } from "./utilidades";
import { avisar } from "@/components/Avisos";

export type ClaveMision =
  | "abrir_app"
  | "registrar_animo"
  | "tomar_sobre"
  | "escribir_diario"
  | "publicar"
  | "comentar"
  | "dar_flor";

export const MISIONES: Record<ClaveMision, { titulo: string; petalos: number; enlace: string }> = {
  abrir_app: { titulo: "Abrir Mi Ciclo", petalos: 5, enlace: "/" },
  tomar_sobre: { titulo: "Tomar tu sobre de Mi Ciclo", petalos: 15, enlace: "/#ritual" },
  registrar_animo: { titulo: "Contar cómo te sientes", petalos: 10, enlace: "/#animo" },
  escribir_diario: { titulo: "Escribir en tu diario", petalos: 10, enlace: "/diario" },
  publicar: { titulo: "Compartir algo en la comunidad", petalos: 10, enlace: "/publicar" },
  comentar: { titulo: "Responder a otra chica", petalos: 5, enlace: "/comunidad/preguntas" },
  dar_flor: { titulo: "Regalar una flor", petalos: 2, enlace: "/comunidad" },
};

export const BONO_RACHA = { dias: 7, petalos: 50 };

export function sumarPetalos(cantidad: number, motivo: string) {
  actualizar((e) => ({
    ...e,
    petalos: e.petalos + cantidad,
    movimientos: [{ id: nuevoId("mv_"), fecha: Date.now(), cantidad, motivo }, ...e.movimientos].slice(0, 200),
  }));
}

/** Completa una misión del día. Devuelve los pétalos ganados (0 si ya estaba hecha). */
export function completarMisionPorClave(clave: ClaveMision, silencioso = false): number {
  const hoy = hoyColombia();
  const hechas = leerEstado().misiones[hoy] ?? [];
  if (hechas.includes(clave)) return 0;
  const m = MISIONES[clave];
  actualizar((e) => ({ ...e, misiones: { ...e.misiones, [hoy]: [...(e.misiones[hoy] ?? []), clave] } }));
  sumarPetalos(m.petalos, m.titulo);
  if (!silencioso) avisar(`+${m.petalos} pétalos · ${m.titulo}`, "exito");

  if (clave === "tomar_sobre") {
    const racha = rachaSobre(hoy, leerEstado().registros);
    if (racha > 0 && racha % BONO_RACHA.dias === 0) {
      sumarPetalos(BONO_RACHA.petalos, `Racha de ${racha} días`);
      avisar(`¡${racha} días seguidos! +${BONO_RACHA.petalos} pétalos`, "exito");
    }
  }
  return m.petalos;
}

export function misionesDeHoy(): ClaveMision[] {
  return (leerEstado().misiones[hoyColombia()] ?? []) as ClaveMision[];
}
