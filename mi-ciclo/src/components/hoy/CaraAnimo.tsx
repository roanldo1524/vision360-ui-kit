import type { Animo } from "@/lib/tipos";

const COLORES: Record<Animo, { fondo: string; cara: string }> = {
  // Solo tonos del brandbook: Rosa, Violeta y matices del Rojo Coral y el Violeta oscuro
  feliz: { fondo: "#ffdced", cara: "#ffb3cf" },
  tranquila: { fondo: "#f3e2fb", cara: "#e7bef8" },
  normal: { fondo: "#fff0f6", cara: "#ffd0e2" },
  sensible: { fondo: "#efe6fb", cara: "#cdb6f0" },
  irritable: { fondo: "#ffe1e3", cara: "#ff9ea6" },
  cansada: { fondo: "#ebe5f6", cara: "#b9a8e3" },
};

/** Caras de ánimo del check-in diario. */
export function CaraAnimo({ animo, tamano = 52 }: { animo: Animo; tamano?: number }) {
  const c = COLORES[animo];
  const trazo = { stroke: "#1f0526", strokeWidth: 2.2, strokeLinecap: "round" as const, fill: "none" };
  const ojos = {
    feliz: (
      <>
        <path d="M22 30 q3 -4 6 0" {...trazo} />
        <path d="M36 30 q3 -4 6 0" {...trazo} />
      </>
    ),
    tranquila: (
      <>
        <path d="M22 30 q3 3 6 0" {...trazo} />
        <path d="M36 30 q3 3 6 0" {...trazo} />
      </>
    ),
    normal: (
      <>
        <circle cx="25" cy="30" r="2.4" fill="#1f0526" />
        <circle cx="39" cy="30" r="2.4" fill="#1f0526" />
      </>
    ),
    sensible: (
      <>
        <circle cx="25" cy="31" r="2.4" fill="#1f0526" />
        <circle cx="39" cy="31" r="2.4" fill="#1f0526" />
        <path d="M21 25 l6 2 M43 25 l-6 2" {...trazo} />
      </>
    ),
    irritable: (
      <>
        <path d="M21 27 l7 3 M43 27 l-7 3" {...trazo} />
        <circle cx="25" cy="32" r="2" fill="#1f0526" />
        <circle cx="39" cy="32" r="2" fill="#1f0526" />
      </>
    ),
    cansada: (
      <>
        <path d="M21 31 h7 M36 31 h7" {...trazo} />
      </>
    ),
  }[animo];
  const boca = {
    feliz: <path d="M26 39 q6 6 12 0" {...trazo} />,
    tranquila: <path d="M27 40 q5 3 10 0" {...trazo} />,
    normal: <path d="M27 41 h10" {...trazo} />,
    sensible: <path d="M27 42 q5 -3 10 0" {...trazo} />,
    irritable: <path d="M26 43 q6 -5 12 0" {...trazo} />,
    cansada: <ellipse cx="32" cy="41" rx="3" ry="2.4" fill="#1f0526" />,
  }[animo];
  return (
    <svg viewBox="0 0 64 64" width={tamano} height={tamano} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={c.fondo} />
      <circle cx="32" cy="34" r="21" fill={c.cara} />
      {ojos}
      {boca}
      <ellipse cx="19" cy="37" rx="3" ry="2" fill="#f62c39" opacity=".22" />
      <ellipse cx="45" cy="37" rx="3" ry="2" fill="#f62c39" opacity=".22" />
    </svg>
  );
}
