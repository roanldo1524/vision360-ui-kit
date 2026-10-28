// Jardín visual: cada 30 pétalos ganados brota o crece una flor.
import { Ciclita } from "@/components/Ciclita";
import type { CiclitaId } from "@/lib/tipos";
import estilos from "./jardin.module.css";

const ESPACIOS = [
  { x: 40, base: 150 }, { x: 278, base: 148 }, { x: 92, base: 160 }, { x: 228, base: 158 },
  { x: 140, base: 164 }, { x: 186, base: 166 }, { x: 18, base: 162 }, { x: 302, base: 164 },
  { x: 64, base: 170 }, { x: 254, base: 172 }, { x: 116, base: 176 }, { x: 206, base: 178 },
];
const COLORES = ["#f27d9a", "#b14bc4", "#f2916a", "#e01e37", "#6cbf98", "#f2b04a"];
const PETALOS_POR_ETAPA = 30;

export function Jardin({ ganados, ciclita }: { ganados: number; ciclita: CiclitaId }) {
  const etapas = Math.floor(ganados / PETALOS_POR_ETAPA);
  // cada espacio pasa por 3 etapas: brote, tallo, flor
  const plantas = ESPACIOS.map((e, i) => {
    const n = ESPACIOS.length;
    const etapa = Math.min(3, Math.floor(etapas / n) + (i < etapas % n ? 1 : 0));
    return { ...e, etapa, color: COLORES[i % COLORES.length] };
  });
  const flores = plantas.filter((p) => p.etapa === 3).length;
  const siguiente = PETALOS_POR_ETAPA - (ganados % PETALOS_POR_ETAPA);

  return (
    <div className={estilos.jardin}>
      <div className={estilos.escena}>
      <svg viewBox="0 0 320 190" role="img" aria-label={`Tu jardín tiene ${flores} flores abiertas`}>
        <defs>
          <linearGradient id="jardin-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde3e9" />
            <stop offset="1" stopColor="#fff1d6" />
          </linearGradient>
        </defs>
        <rect width="320" height="190" fill="url(#jardin-cielo)" />
        <circle cx="270" cy="40" r="20" fill="#fff6e0" />
        <path d="M0 150 q80 -34 160 -10 q80 24 160 -6 v56 h-320z" fill="#cfeedd" />
        <path d="M0 170 q90 -20 170 0 q80 18 150 -2 v22 h-320z" fill="#a9dfc5" />
        {plantas.map((p, i) =>
          p.etapa === 0 ? (
            <ellipse key={i} cx={p.x} cy={p.base} rx="5" ry="2" fill="#7a5f68" opacity=".25" />
          ) : (
            <g key={i} className={estilos.planta} style={{ animationDelay: `${i * 60}ms` }}>
              <path
                d={`M${p.x} ${p.base} q${i % 2 ? 4 : -4} ${-p.etapa * 9} 0 ${-p.etapa * 18}`}
                stroke="#5aa883"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx={p.x + 6} cy={p.base - p.etapa * 6} rx="5" ry="2.6" fill="#6cbf98" transform={`rotate(-30 ${p.x + 6} ${p.base - p.etapa * 6})`} />
              {p.etapa >= 2 && (
                <ellipse cx={p.x - 6} cy={p.base - p.etapa * 9} rx="5" ry="2.6" fill="#6cbf98" transform={`rotate(30 ${p.x - 6} ${p.base - p.etapa * 9})`} />
              )}
              {p.etapa === 3 ? (
                <g transform={`translate(${p.x} ${p.base - 56})`}>
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx="0" cy="-6" rx="4.4" ry="6.4" fill={p.color} transform={`rotate(${a})`} />
                  ))}
                  <circle r="3.6" fill="#ffd98a" />
                </g>
              ) : (
                <circle cx={p.x} cy={p.base - p.etapa * 18} r={p.etapa * 2} fill={p.color} opacity=".7" />
              )}
            </g>
          ),
        )}
      </svg>
        <div className={estilos.jardinCiclita}>
          <Ciclita id={ciclita} tamano={46} feliz />
        </div>
      </div>
      <p className={estilos.jardinPie}>
        {flores} {flores === 1 ? "flor abierta" : "flores abiertas"} · faltan {siguiente} pétalos para que crezca algo nuevo
      </p>
    </div>
  );
}
