import type { CiclitaId } from "@/lib/tipos";
import { faseDelDia, FASES } from "@/lib/ciclo";
import { Ciclita } from "@/components/Ciclita";

interface Props {
  dia: number;
  total: number;
  regla: number;
  ciclita: CiclitaId;
}

/** Anillo del ciclo: segmentos por fase, avance hasta hoy y la Ciclita al centro. */
export function AnilloFase({ dia, total, regla, ciclita }: Props) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const config = { ultimoPeriodo: "", duracionCiclo: total, duracionRegla: regla };
  // tramos consecutivos de la misma fase
  const tramos: { fase: ReturnType<typeof faseDelDia>; desde: number; hasta: number }[] = [];
  for (let d = 1; d <= total; d++) {
    const f = faseDelDia(d, config);
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.fase === f) ultimo.hasta = d;
    else tramos.push({ fase: f, desde: d, hasta: d });
  }
  const angulo = ((dia - 0.5) / total) * 360 - 90;
  const rad = (angulo * Math.PI) / 180;
  const faseHoy = faseDelDia(dia, config);
  return (
    <div style={{ position: "relative", width: 132, height: 132, flex: "none" }}>
      <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#fff" strokeWidth="12" />
        {tramos.map((t) => {
          const largo = ((t.hasta - t.desde + 1) / total) * C - 2;
          const offset = -((t.desde - 1) / total) * C;
          return (
            <circle
              key={t.desde}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={FASES[t.fase].color}
              strokeOpacity={t.fase === faseHoy ? 0.95 : 0.22}
              strokeWidth="9"
              strokeDasharray={`${Math.max(1, largo)} ${C}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <circle cx={60 + R * Math.cos(rad)} cy={60 + R * Math.sin(rad)} r="7.5" fill="#fff" stroke="var(--rojo)" strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", inset: 22, display: "grid", placeItems: "center" }}>
        <Ciclita id={ciclita} tamano={84} feliz={faseHoy !== "menstrual"} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -10,
          transform: "translateX(-50%)",
          background: "var(--blanco)",
          borderRadius: 16,
          boxShadow: "var(--sombra)",
          padding: "4px 10px",
          textAlign: "center",
          lineHeight: 1.05,
        }}
      >
        <span className="mini texto-2" style={{ display: "block" }}>Día</span>
        <span className="titulo-m num" style={{ color: "var(--rojo)" }}>{dia}</span>
        <span className="mini texto-3" style={{ display: "block" }}>de {total}</span>
      </div>
    </div>
  );
}
