import type { ReactNode } from "react";
import type { CiclitaId } from "@/lib/tipos";
import { Ciclita } from "./Ciclita";

interface Props {
  titulo: string;
  texto: string;
  ciclita?: CiclitaId;
  accion?: ReactNode;
}

/** Estado vacío o de error con una Ciclita. */
export function EstadoVacio({ titulo, texto, ciclita = "lila", accion }: Props) {
  return (
    <div className="tarjeta" style={{ display: "grid", justifyItems: "center", textAlign: "center", gap: 10, padding: "28px 22px" }}>
      <Ciclita id={ciclita} tamano={72} />
      <h3 className="titulo-s">{titulo}</h3>
      <p className="texto-2 pequeno" style={{ maxWidth: 280 }}>{texto}</p>
      {accion}
    </div>
  );
}
