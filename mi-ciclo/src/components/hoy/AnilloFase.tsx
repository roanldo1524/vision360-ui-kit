import type { CiclitaId } from "@/lib/tipos";
import { faseDelDia } from "@/lib/ciclo";
import { Ciclita } from "@/components/Ciclita";

interface Props {
  dia: number;
  total: number;
  regla: number;
  ciclita: CiclitaId;
  tamano?: number;
}

// Colores de los tramos como en la referencia: rosa para la regla, lavandas para el resto
const COLOR = {
  menstrual: "#ff8fb4", // Rosa del período (referencia)
  folicular: "#f1dafb", // Violeta claro
  ovulacion: "#e7bef8", // Violeta
  lutea: "#d9b6f3",
} as const;

/** Anillo grande del ciclo con la Ciclita al centro y la burbuja "Día X de N". */
export function AnilloFase({ dia, total, regla, ciclita, tamano = 174 }: Props) {
  const k = tamano / 174;
  const C0 = 110; // centro
  const R = 92; // radio del trazo
  const ANCHO = 24;
  const config = { ultimoPeriodo: "", duracionCiclo: total, duracionRegla: regla };

  const tramos: { fase: ReturnType<typeof faseDelDia>; desde: number; hasta: number }[] = [];
  for (let d = 1; d <= total; d++) {
    const f = faseDelDia(d, config);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.fase === f) ultimo.hasta = d;
    else tramos.push({ fase: f, desde: d, hasta: d });
  }

  const punto = (n: number, r = R) => {
    const a = ((n / total) * 360 - 90) * (Math.PI / 180);
    return { x: C0 + r * Math.cos(a), y: C0 + r * Math.sin(a) };
  };
  const arco = (desde: number, hasta: number) => {
    const hueco = 0.35; // separación blanca entre tramos (en días)
    const a = punto(desde - 1 + hueco);
    const b = punto(hasta - hueco);
    const grande = hasta - desde + 1 > total / 2 ? 1 : 0;
    return `M ${a.x} ${a.y} A ${R} ${R} 0 ${grande} 1 ${b.x} ${b.y}`;
  };

  const regla0 = tramos[0];
  // la gota va en el extremo del tramo de la regla más lejano al marcador del día
  const gota = punto(dia <= (regla0.desde + regla0.hasta) / 2 ? regla0.hasta - 0.9 : regla0.desde - 0.1);
  const marca = punto(dia - 0.5);

  return (
    <div style={{ position: "relative", width: tamano, height: tamano + 10 * k, flex: "none" }}>
      <svg viewBox="0 0 220 220" width={tamano} height={tamano} aria-hidden="true">
        <defs>
          <radialGradient id="anillo-centro" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#fff6f8" />
            <stop offset="1" stopColor="#ffdced" />
          </radialGradient>
        </defs>
        <circle cx={C0} cy={C0} r={R + ANCHO / 2 + 4} fill="#fff" />
        {tramos.map((t) => (
          <path
            key={t.desde}
            d={arco(t.desde, t.hasta)}
            fill="none"
            stroke={COLOR[t.fase]}
            strokeWidth={ANCHO}
            strokeLinecap="butt"
          />
        ))}
        <circle cx={C0} cy={C0} r={R - ANCHO / 2 - 5} fill="url(#anillo-centro)" />
        {/* gota en el tramo de la regla */}
        <path
          transform={`translate(${gota.x - 7} ${gota.y - 9})`}
          d="M7 0 C7 0 0 8 0 12 a7 7 0 0 0 14 0 C14 8 7 0 7 0z"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        {/* marcador del día */}
        <circle cx={marca.x} cy={marca.y} r="9" fill="#fff" stroke="#f62c39" strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 34 * k, display: "grid", placeItems: "center" }}>
        <Ciclita id={ciclita} tamano={Math.round(92 * k)} feliz />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          background: "#fff",
          borderRadius: "50% 50% 46% 46%",
          boxShadow: "0 8px 20px rgba(220, 60, 100, 0.18)",
          width: Math.round(66 * k),
          padding: "8px 0 6px",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--vino)" }}>Día</span>
        <span className="num" style={{ fontFamily: "var(--f-titulo)", fontWeight: 500, fontSize: Math.round(28 * k), color: "var(--rojo-texto)" }}>
          {dia}
        </span>
        <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--vino)" }}>de {total}</span>
      </div>
    </div>
  );
}
