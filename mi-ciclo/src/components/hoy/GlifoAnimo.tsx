import type { Animo } from "@/lib/tipos";
import { Circulo, Estrella, FlorLuna, FlorOndulada, Luna } from "@/components/FormasMarca";

// Cada ánimo es una forma oficial del brandbook, en un tono de la paleta.
const GLIFOS: Record<Animo, { forma: typeof Luna; color: string; fondo: string; giro?: number }> = {
  feliz: { forma: Estrella, color: "#f62c39", fondo: "#ffe4ea" },
  tranquila: { forma: Luna, color: "#5b3aaa", fondo: "#efe4fb" },
  normal: { forma: Circulo, color: "#ff8fab", fondo: "#fff0f5" },
  sensible: { forma: FlorLuna, color: "#c99af0", fondo: "#f5ebfc" },
  irritable: { forma: FlorOndulada, color: "#e3202f", fondo: "#ffe4e6" },
  cansada: { forma: Luna, color: "#b9a3e8", fondo: "#f1ecfa", giro: 180 },
};

export function GlifoAnimo({ animo, tamano = 56 }: { animo: Animo; tamano?: number }) {
  const g = GLIFOS[animo];
  const Forma = g.forma;
  return (
    <span
      aria-hidden="true"
      style={{
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        background: g.fondo,
        display: "grid",
        placeItems: "center",
        transform: g.giro ? `rotate(${g.giro}deg)` : undefined,
      }}
    >
      <Forma color={g.color} fondo={g.fondo} tamano={Math.round(tamano * 0.56)} />
    </span>
  );
}
