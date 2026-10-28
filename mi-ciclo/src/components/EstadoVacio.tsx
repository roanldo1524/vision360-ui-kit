import type { ReactNode } from "react";
import type { CiclitaId } from "@/lib/tipos";
import { FlorLuna } from "./FormasMarca";

interface Props {
  titulo: string;
  texto: string;
  /** Se conserva por compatibilidad; el estado vacío usa la flor-luna de la marca. */
  ciclita?: CiclitaId;
  accion?: ReactNode;
}

/** Estado vacío o de error: la flor-luna en un círculo suave, un título y una invitación. */
export function EstadoVacio({ titulo, texto, accion }: Props) {
  return (
    <div
      className="tarjeta"
      style={{ display: "grid", justifyItems: "center", textAlign: "center", gap: 12, padding: "32px 24px", borderRadius: 28 }}
    >
      <span
        aria-hidden="true"
        style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--rosa-claro)", display: "grid", placeItems: "center" }}
      >
        <FlorLuna color="var(--rojo)" fondo="var(--rosa-claro)" tamano={40} />
      </span>
      <h3 style={{ fontFamily: "var(--f-titulo)", fontWeight: 500, fontSize: 19, lineHeight: 1.2, color: "var(--vino)" }}>{titulo}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--texto-2)", maxWidth: 280 }}>{texto}</p>
      {accion}
    </div>
  );
}
