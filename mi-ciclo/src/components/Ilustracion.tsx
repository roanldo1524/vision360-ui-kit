// Ilustraciones de bienestar para el contenido de ejemplo (sin personas ni IA).
// Cada escena llena su caja (preserveAspectRatio slice).
import type { CSSProperties } from "react";

export const ILUSTRACIONES = ["cuaderno", "taza", "bolsa", "infusion", "antifaz", "velas", "atardecer", "manta"] as const;
export type IlustracionId = (typeof ILUSTRACIONES)[number];

interface Props {
  id: string;
  texto?: string;
  className?: string;
  style?: CSSProperties;
}

function Tejido({ color, opacidad = 0.18 }: { color: string; opacidad?: number }) {
  // trenzas de tejido de punto
  const filas = [];
  for (let y = -10; y < 210; y += 16) {
    for (let x = -10; x < 210; x += 14) {
      filas.push(<path key={`${x}-${y}`} d={`M${x} ${y} q7 9 0 16 M${x + 7} ${y} q-7 9 0 16`} />);
    }
  }
  return (
    <g stroke={color} strokeOpacity={opacidad} strokeWidth="3" fill="none" strokeLinecap="round">
      {filas}
    </g>
  );
}

export function Ilustracion({ id, texto, className, style }: Props) {
  const comun = {
    viewBox: "0 0 200 200",
    preserveAspectRatio: "xMidYMid slice",
    className,
    style: { width: "100%", height: "100%", ...style },
    role: "img" as const,
  };

  switch (id) {
    case "cuaderno":
      return (
        <svg {...comun} aria-label={texto ?? "Cuaderno con frase escrita a mano"}>
          <rect width="200" height="200" fill="#f6c3cf" />
          <Tejido color="#c96a85" />
          <g transform="rotate(-6 100 100)">
            <rect x="34" y="18" width="136" height="172" rx="8" fill="#fde3e9" />
            <rect x="34" y="18" width="136" height="172" rx="8" fill="none" stroke="#efb3c2" strokeWidth="2" />
            {Array.from({ length: 11 }).map((_, i) => (
              <g key={i}>
                <circle cx="34" cy={30 + i * 15} r="4" fill="#f6c3cf" />
                <path d={`M28 ${30 + i * 15} a6 6 0 0 1 12 0`} stroke="#b9a2a8" strokeWidth="2" fill="none" />
              </g>
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1="50" x2="160" y1={48 + i * 16} y2={48 + i * 16} stroke="#f2c6d1" strokeWidth="1" />
            ))}
            <foreignObject x="50" y="32" width="114" height="140">
              <div
                style={{
                  fontFamily: "var(--f-mano)",
                  color: "#8f2a4a",
                  fontSize: 21,
                  lineHeight: "16px",
                  paddingTop: 10,
                  overflowWrap: "anywhere",
                }}
              >
                {texto ?? "Pequeñas rutinas, grandes cambios."}
              </div>
            </foreignObject>
            <path d="M138 168 c-4 -6 -12 -2 -8 4 l8 8 l8 -8 c4 -6 -4 -10 -8 -4z" fill="none" stroke="#d1607e" strokeWidth="2" />
          </g>
        </svg>
      );
    case "taza":
      return (
        <svg {...comun} aria-label={texto ?? "Taza de té con corazones"}>
          <rect width="200" height="200" fill="#f4b9c6" />
          <Tejido color="#b8536f" opacidad={0.2} />
          <ellipse cx="100" cy="166" rx="70" ry="16" fill="#e999ab" />
          <g>
            <path d="M52 78 h88 v54 a40 40 0 0 1 -40 40 h-8 a40 40 0 0 1 -40 -40z" fill="#fff8f6" />
            <path d="M140 92 h8 a18 18 0 0 1 0 36 h-12" fill="none" stroke="#fff8f6" strokeWidth="9" />
            <ellipse cx="96" cy="78" rx="44" ry="10" fill="#c98a5e" />
            <ellipse cx="96" cy="78" rx="44" ry="10" fill="none" stroke="#fff8f6" strokeWidth="3" />
            {[
              [70, 104], [100, 118], [124, 100], [80, 140], [114, 146],
            ].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} c-3 -4 -9 -1 -6 3 l6 6 l6 -6 c3 -4 -3 -7 -6 -3z`} fill="#ef7d98" />
            ))}
          </g>
          <g stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M84 60 q-8 -12 0 -22 q8 -10 0 -22" />
            <path d="M104 62 q-8 -12 0 -22 q8 -10 0 -22" />
          </g>
          {texto && <TextoMano texto={texto} />}
        </svg>
      );
    case "bolsa":
      return (
        <svg {...comun} aria-label="Bolsa de agua caliente">
          <rect width="200" height="200" fill="#f7c7d1" />
          <Tejido color="#c8607c" opacidad={0.16} />
          <rect x="82" y="16" width="36" height="26" rx="6" fill="#e66e8b" />
          <path d="M60 46 h80 a26 26 0 0 1 26 26 v84 a30 30 0 0 1 -30 30 h-72 a30 30 0 0 1 -30 -30 v-84 a26 26 0 0 1 26 -26z" fill="#f08aa2" />
          <path d="M60 46 h80 a26 26 0 0 1 26 26 v84 a30 30 0 0 1 -30 30 h-72 a30 30 0 0 1 -30 -30 v-84 a26 26 0 0 1 26 -26z" fill="none" stroke="#e66e8b" strokeWidth="4" />
          <g stroke="#e66e8b" strokeWidth="2" opacity=".6">
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={i} x1="44" x2="156" y1={70 + i * 16} y2={70 + i * 16} />
            ))}
          </g>
          <path d="M100 136 c-10 -14 -30 -6 -22 8 l22 20 l22 -20 c8 -14 -12 -22 -22 -8z" fill="#ffd1dc" />
        </svg>
      );
    case "infusion":
      return (
        <svg {...comun} aria-label={texto ?? "Infusión de manzanilla"}>
          <defs>
            <linearGradient id="inf-fondo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6dcc4" />
              <stop offset="1" stopColor="#e8b48f" />
            </linearGradient>
            <linearGradient id="inf-te" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2b35c" />
              <stop offset="1" stopColor="#c7792e" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#inf-fondo)" />
          {[[24, 30], [170, 42], [40, 168], [160, 160], [186, 110], [12, 100]].map(([x, y], i) => (
            <Margarita key={i} x={x} y={y} r={9} />
          ))}
          <path d="M48 70 h104 l-8 92 a14 14 0 0 1 -14 12 h-60 a14 14 0 0 1 -14 -12z" fill="#fff" opacity=".35" />
          <path d="M53 92 h94 l-6 68 a12 12 0 0 1 -12 10 h-58 a12 12 0 0 1 -12 -10z" fill="url(#inf-te)" />
          <ellipse cx="100" cy="92" rx="47" ry="7" fill="#f6c77a" />
          <Margarita x={82} y={92} r={8} />
          <Margarita x={114} y={90} r={7} />
          <Margarita x={98} y={96} r={6} />
          <path d="M48 70 h104" stroke="#fff" strokeOpacity=".8" strokeWidth="3" />
          {texto && <TextoMano texto={texto} />}
        </svg>
      );
    case "antifaz":
      return (
        <svg {...comun} aria-label="Antifaz para dormir">
          <rect width="200" height="200" fill="#f9d0d9" />
          <Tejido color="#c5647f" opacidad={0.14} />
          <path d="M20 96 q0 -36 40 -36 q30 0 40 14 q10 -14 40 -14 q40 0 40 36 q0 34 -40 34 q-26 0 -40 -16 q-14 16 -40 16 q-40 0 -40 -34z" fill="#f4a6b8" />
          <g stroke="#5b2236" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M42 100 q18 14 36 0" />
            <path d="M122 100 q18 14 36 0" />
            {[46, 54, 62, 70].map((x) => (
              <line key={`a${x}`} x1={x} y1={106 + (x === 46 || x === 70 ? -2 : 2)} x2={x - 2} y2={114} />
            ))}
            {[126, 134, 142, 150].map((x) => (
              <line key={`b${x}`} x1={x} y1={106 + (x === 126 || x === 150 ? -2 : 2)} x2={x + 2} y2={114} />
            ))}
          </g>
          <path d="M8 90 q-10 10 4 14 M192 90 q10 10 -4 14" stroke="#f4a6b8" strokeWidth="6" fill="none" />
        </svg>
      );
    case "velas":
      return (
        <svg {...comun} aria-label={texto ?? "Velas encendidas"}>
          <defs>
            <radialGradient id="vel-luz" cx=".5" cy=".4" r=".6">
              <stop offset="0" stopColor="#ffe2b0" />
              <stop offset="1" stopColor="#d98a7a" />
            </radialGradient>
          </defs>
          <rect width="200" height="200" fill="url(#vel-luz)" />
          {[
            [56, 92, 30, 90],
            [100, 70, 34, 112],
            [146, 102, 28, 80],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y - 18} rx="16" ry="22" fill="#fff2cf" opacity=".55" />
              <path d={`M${x} ${y - 30} q9 14 0 24 q-9 -10 0 -24z`} fill="#ffb347" />
              <path d={`M${x} ${y - 22} q4 7 0 13 q-4 -6 0 -13z`} fill="#fff4cf" />
              <line x1={x} y1={y - 6} x2={x} y2={y} stroke="#5b2236" strokeWidth="2" />
              <rect x={x - w / 2} y={y} width={w} height={h} rx="6" fill="#fff6ee" />
              <ellipse cx={x} cy={y} rx={w / 2} ry="4" fill="#ffe9da" />
            </g>
          ))}
          <rect y="176" width="200" height="24" fill="#b96a66" opacity=".35" />
          {texto && <TextoMano texto={texto} />}
        </svg>
      );
    case "atardecer":
      return (
        <svg {...comun} aria-label={texto ?? "Atardecer en las montañas"}>
          <defs>
            <linearGradient id="atar-cielo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7a8b8" />
              <stop offset=".55" stopColor="#ffcf9e" />
              <stop offset="1" stopColor="#ffe6c4" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#atar-cielo)" />
          <circle cx="100" cy="112" r="34" fill="#fff3d6" />
          <path d="M0 130 q40 -30 80 -6 q30 -24 70 -4 q30 -10 50 6 v74 h-200z" fill="#e88aa0" />
          <path d="M0 152 q50 -22 100 0 q50 20 100 -4 v52 h-200z" fill="#c9577a" />
          <g stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M40 50 q6 -6 12 0 q6 -6 12 0" />
            <path d="M130 36 q5 -5 10 0 q5 -5 10 0" />
          </g>
          {texto && <TextoMano texto={texto} />}
        </svg>
      );
    case "manta":
    default:
      return (
        <svg {...comun} aria-label={texto ?? "Manta tejida y taza"}>
          <rect width="200" height="200" fill="#fbe1d6" />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x="0" y={i * 26} width="200" height="13" fill={i % 2 ? "#f4b9c6" : "#f7cdb8"} opacity=".7" />
          ))}
          <Tejido color="#b76a73" opacidad={0.12} />
          <circle cx="132" cy="120" r="34" fill="#fff8f2" />
          <circle cx="132" cy="120" r="26" fill="#c98a5e" />
          <path d="M164 112 q14 0 14 10 q0 10 -14 10" stroke="#fff8f2" strokeWidth="7" fill="none" />
          <path d="M40 60 h50 v70 h-50z" fill="#fde3e9" transform="rotate(-10 65 95)" />
          {texto && <TextoMano texto={texto} />}
        </svg>
      );
  }
}

function Margarita({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <ellipse key={i} cx="0" cy={-r * 0.75} rx={r * 0.28} ry={r * 0.6} fill="#fffaf2" transform={`rotate(${i * 36})`} />
      ))}
      <circle r={r * 0.38} fill="#f5b52e" />
    </g>
  );
}

function TextoMano({ texto }: { texto: string }) {
  return (
    <foreignObject x="10" y="120" width="180" height="76">
      <div
        style={{
          fontFamily: "var(--f-mano)",
          color: "#fff",
          fontSize: 26,
          lineHeight: "26px",
          textShadow: "0 2px 10px rgba(58,18,32,.45)",
        }}
      >
        {texto}
      </div>
    </foreignObject>
  );
}
