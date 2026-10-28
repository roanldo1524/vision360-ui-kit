// Ciclitas: avatares sin foto. Protegen la privacidad y dan un personaje propio a la marca.
// Dibujo plano con la paleta del brandbook: un disco de color, cara mínima en tinta ciruela,
// sin brillos ni degradados. La Ciclita "con flor" lleva la flor-luna; la anónima, gafas.
import type { CiclitaId } from "@/lib/tipos";

const TINTA = "#1f0526";

export const CICLITAS: Record<CiclitaId, { nombre: string; fondo: string; cara: string; mejilla: string }> = {
  rosa: { nombre: "Rosa", fondo: "#ffdced", cara: "#ffb3cf", mejilla: "#f62c39" },
  durazno: { nombre: "Coral", fondo: "#ffe4e6", cara: "#ff8f98", mejilla: "#e3202f" },
  lila: { nombre: "Violeta serena", fondo: "#f3e2fb", cara: "#e7bef8", mejilla: "#b07ce0" },
  menta: { nombre: "Lavanda", fondo: "#ece4f8", cara: "#c4abee", mejilla: "#5b3aaa" },
  mantequilla: { nombre: "Nube", fondo: "#fff1f6", cara: "#ffd2e1", mejilla: "#f62c39" },
  flor: { nombre: "Con flor", fondo: "#ffdced", cara: "#ffb3cf", mejilla: "#f62c39" },
  anonima: { nombre: "Anónima", fondo: "#ece4f8", cara: "#c9b6ee", mejilla: "#5b3aaa" },
};

export const CICLITAS_ELEGIBLES: CiclitaId[] = ["rosa", "durazno", "lila", "menta", "mantequilla", "flor"];

interface Props {
  id: CiclitaId;
  tamano?: number;
  feliz?: boolean;
  className?: string;
  titulo?: string;
}

export function Ciclita({ id, tamano = 44, feliz = false, className, titulo }: Props) {
  const c = CICLITAS[id];
  const trazo = { stroke: TINTA, strokeWidth: 2.4, strokeLinecap: "round" as const, fill: "none" };

  const ojos =
    id === "anonima" ? (
      <g>
        <rect x="17" y="30" width="13" height="8" rx="4" fill={TINTA} />
        <rect x="34" y="30" width="13" height="8" rx="4" fill={TINTA} />
        <path d="M30 33 h4" stroke={TINTA} strokeWidth="2" />
      </g>
    ) : id === "lila" || feliz ? (
      <g {...trazo}>
        <path d={id === "lila" ? "M22 33 q3 2.6 6 0" : "M22 34 q3 -3.6 6 0"} />
        <path d={id === "lila" ? "M36 33 q3 2.6 6 0" : "M36 34 q3 -3.6 6 0"} />
      </g>
    ) : (
      <g fill={TINTA}>
        <circle cx="25" cy="33" r="2.4" />
        <circle cx="39" cy="33" r="2.4" />
      </g>
    );

  return (
    <svg
      viewBox="0 0 64 64"
      width={tamano}
      height={tamano}
      className={className}
      role="img"
      aria-label={titulo ?? `Ciclita ${c.nombre}`}
    >
      <circle cx="32" cy="32" r="32" fill={c.fondo} />
      <circle cx="32" cy="35" r="20" fill={c.cara} />
      {ojos}
      {id !== "anonima" && (
        <g fill={c.mejilla} opacity=".28">
          <circle cx="19.5" cy="40" r="3" />
          <circle cx="44.5" cy="40" r="3" />
        </g>
      )}
      <path d={feliz ? "M27.5 41 q4.5 4.4 9 0" : "M29 42 q3 2.2 6 0"} {...trazo} strokeWidth={2.2} />
      {id === "flor" && (
        <g transform="translate(44 14)">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx="0" cy="-4.6" r="3.6" fill="#f62c39" transform={`rotate(${a})`} />
          ))}
          <circle r="4.6" fill="#f62c39" />
          <path d="M1 -3 a3 3 0 1 0 2 4.6 a2.3 2.3 0 1 1 -2 -4.6z" fill="#ffdced" />
        </g>
      )}
    </svg>
  );
}
