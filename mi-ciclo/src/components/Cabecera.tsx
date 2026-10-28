"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  titulo: ReactNode;
  derecha?: ReactNode;
  volverA?: string;
}

/** Cabecera de pantallas secundarias: volver · título · acción. */
export function Cabecera({ titulo, derecha, volverA }: Props) {
  const router = useRouter();
  return (
    <header className="cabecera">
      <button
        className="boton-icono"
        aria-label="Volver"
        onClick={() => (volverA ? router.push(volverA) : window.history.length > 1 ? router.back() : router.push("/"))}
      >
        <ChevronLeft size={24} />
      </button>
      <div className="cabecera-titulo">{titulo}</div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>{derecha}</div>
    </header>
  );
}
