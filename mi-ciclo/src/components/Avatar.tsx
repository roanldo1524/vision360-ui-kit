"use client";
import { Plus } from "lucide-react";
import type { CiclitaId } from "@/lib/tipos";
import { useUrlMedio } from "@/lib/medios";
import { Ciclita } from "./Ciclita";
import estilos from "./Avatar.module.css";

interface Props {
  ciclita: CiclitaId;
  fotoId?: string;
  tamano?: number;
  anillo?: "nuevo" | "visto" | "ninguno";
  mas?: boolean; // "+" para subir historia
  nombre?: string;
}

/** Foto de la usuaria o su Ciclita, con anillo de historia opcional. */
export function Avatar({ ciclita, fotoId, tamano = 40, anillo = "ninguno", mas = false, nombre }: Props) {
  const url = useUrlMedio(fotoId);
  const interior = anillo === "ninguno" ? tamano : tamano - 8;
  return (
    <span
      className={`${estilos.avatar} ${anillo !== "ninguno" ? estilos[anillo] : ""}`}
      style={{ width: tamano, height: tamano }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={nombre ? `Foto de ${nombre}` : ""} width={interior} height={interior} className={estilos.foto} />
      ) : (
        <Ciclita id={ciclita} tamano={interior} titulo={nombre ? `Ciclita de ${nombre}` : undefined} />
      )}
      {mas && (
        <span className={estilos.mas} aria-hidden="true">
          <Plus size={Math.max(10, tamano / 5)} strokeWidth={3} />
        </span>
      )}
    </span>
  );
}
