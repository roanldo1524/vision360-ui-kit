// Ciclitas: avatares sin foto. Protegen la privacidad y dan un personaje propio a la marca.
import type { CiclitaId } from "@/lib/tipos";

export const CICLITAS: Record<CiclitaId, { nombre: string; fondo: string; cara: string; mejilla: string }> = {
  rosa: { nombre: "Rosa", fondo: "#fde3e9", cara: "#f9b8c8", mejilla: "#f27d9a" },
  durazno: { nombre: "Durazno", fondo: "#ffebdd", cara: "#ffc79f", mejilla: "#f2916a" },
  lila: { nombre: "Lila serena", fondo: "#efeaff", cara: "#cdbcf7", mejilla: "#a98ee8" },
  menta: { nombre: "Menta", fondo: "#e1f5ec", cara: "#a9dfc5", mejilla: "#6cbf98" },
  mantequilla: { nombre: "Mantequilla", fondo: "#fff1d6", cara: "#ffd98a", mejilla: "#f2b04a" },
  flor: { nombre: "Con flor", fondo: "#fde3e9", cara: "#f9b8c8", mejilla: "#f27d9a" },
  anonima: { nombre: "Anónima", fondo: "#efeaff", cara: "#d9cdf5", mejilla: "#b9a6ea" },
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
  const ojos =
    id === "lila" ? (
      // ojos cerrados, serena
      <g stroke="#3a1220" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M22 33 q3 3 6 0" />
        <path d="M36 33 q3 3 6 0" />
      </g>
    ) : id === "anonima" ? (
      // gafas oscuras
      <g>
        <path d="M17 29 h12 a2 2 0 0 1 2 2 v1 a6 6 0 0 1 -6 6 h-2 a6 6 0 0 1 -6 -6 v-1 a2 2 0 0 1 0 -2z" fill="#3a1220" />
        <path d="M33 29 h12 a2 2 0 0 1 2 2 v1 a6 6 0 0 1 -6 6 h-2 a6 6 0 0 1 -6 -6 v-1 a2 2 0 0 1 0 -2z" fill="#3a1220" />
        <path d="M31 31 h2" stroke="#3a1220" strokeWidth="2" />
        <path d="M20 31.5 l3 -1.5" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M36 31.5 l3 -1.5" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ) : feliz ? (
      <g stroke="#3a1220" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M22 34 q3 -4 6 0" />
        <path d="M36 34 q3 -4 6 0" />
      </g>
    ) : (
      <g fill="#3a1220">
        <ellipse cx="25" cy="32.5" rx="2.3" ry="2.8" />
        <ellipse cx="39" cy="32.5" rx="2.3" ry="2.8" />
        <circle cx="25.8" cy="31.6" r=".8" fill="#fff" />
        <circle cx="39.8" cy="31.6" r=".8" fill="#fff" />
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
      <ellipse cx="32" cy="36" rx="20" ry="18.5" fill={c.cara} />
      <ellipse cx="27" cy="25" rx="7" ry="3.5" fill="#fff" opacity=".35" />
      {ojos}
      {id !== "anonima" && (
        <>
          <ellipse cx="19.5" cy="39" rx="3.4" ry="2.2" fill={c.mejilla} opacity=".55" />
          <ellipse cx="44.5" cy="39" rx="3.4" ry="2.2" fill={c.mejilla} opacity=".55" />
        </>
      )}
      <path
        d={feliz ? "M27 41 q5 6 10 0" : "M28.5 41.5 q3.5 3 7 0"}
        stroke="#3a1220"
        strokeWidth="2"
        strokeLinecap="round"
        fill={feliz ? "#e0577a" : "none"}
      />
      {id === "flor" && (
        <g transform="translate(43 13)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5" fill="#e01e37" transform={`rotate(${a})`} />
          ))}
          <circle r="2.6" fill="#ffd98a" />
        </g>
      )}
    </svg>
  );
}
