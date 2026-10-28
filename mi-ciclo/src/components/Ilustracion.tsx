// Piezas gráficas de marca para el contenido de ejemplo y los espacios sin foto.
// Siguen el brandbook: campo de color plano de la paleta, una forma oficial grande
// y recortada, y, si hay frase, la frase en Fraunces itálica. Sin dibujos ni degradados.
import type { CSSProperties } from "react";
import { Circulo, Estrella, FlorLuna, FlorOndulada, Luna } from "./FormasMarca";

export const ILUSTRACIONES = ["cuaderno", "taza", "bolsa", "infusion", "antifaz", "velas", "atardecer", "manta"] as const;
export type IlustracionId = (typeof ILUSTRACIONES)[number];

type Forma = typeof Luna;

const PIEZAS: Record<string, { fondo: string; forma: Forma; color: string; tinta: string; pos: CSSProperties; escala: number; giro?: number }> = {
  cuaderno: { fondo: "#ffdced", forma: FlorLuna, color: "#f62c39", tinta: "#1f0526", pos: { right: "-30%", top: "-30%" }, escala: 0.9 },
  taza: { fondo: "#e7bef8", forma: Luna, color: "#5b3aaa", tinta: "#1f0526", pos: { right: "-8%", top: "-6%" }, escala: 0.8 },
  bolsa: { fondo: "#f62c39", forma: FlorLuna, color: "#ff5a66", tinta: "#ffffff", pos: { left: "-20%", bottom: "-24%" }, escala: 1 },
  infusion: { fondo: "#fff0f5", forma: Estrella, color: "#f62c39", tinta: "#1f0526", pos: { right: "-14%", top: "-12%" }, escala: 0.85 },
  antifaz: { fondo: "#5b3aaa", forma: Luna, color: "#e7bef8", tinta: "#ffffff", pos: { left: "-6%", top: "-4%" }, escala: 0.75, giro: 180 },
  velas: { fondo: "#ffdced", forma: Circulo, color: "#ff8fab", tinta: "#1f0526", pos: { right: "-18%", bottom: "-18%" }, escala: 0.8 },
  atardecer: { fondo: "#f62c39", forma: Circulo, color: "#ffdced", tinta: "#ffffff", pos: { left: "18%", bottom: "-38%" }, escala: 0.9 },
  manta: { fondo: "#e7bef8", forma: FlorOndulada, color: "#ffffff", tinta: "#1f0526", pos: { right: "-24%", bottom: "-22%" }, escala: 0.95 },
};

interface Props {
  id: string;
  texto?: string;
  className?: string;
  style?: CSSProperties;
}

export function Ilustracion({ id, texto, className, style }: Props) {
  const p = PIEZAS[id] ?? PIEZAS.cuaderno;
  const Forma = p.forma;
  return (
    <div
      className={className}
      role="img"
      aria-label={texto ?? "Pieza gráfica de Mi Ciclo"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: p.fondo,
        containerType: "size",
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: `${p.escala * 100}cqmin`,
          height: `${p.escala * 100}cqmin`,
          transform: p.giro ? `rotate(${p.giro}deg)` : undefined,
          ...p.pos,
        }}
      >
        <Forma color={p.color} fondo={p.fondo} tamano={1000} className="pieza-forma" />
      </span>
      {texto && (
        <p
          style={{
            position: "absolute",
            left: "9cqw",
            right: "12cqw",
            bottom: "9cqh",
            margin: 0,
            fontFamily: "var(--f-titulo)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "clamp(13px, 10cqmin, 40px)",
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            color: p.tinta,
            textWrap: "balance",
          }}
        >
          {texto}
        </p>
      )}
    </div>
  );
}
