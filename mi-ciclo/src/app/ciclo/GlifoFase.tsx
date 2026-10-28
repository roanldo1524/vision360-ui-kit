// Cada fase del ciclo tiene su forma oficial del brandbook.
import type { Fase } from "@/lib/tipos";
import { Circulo, Estrella, FlorLuna, Luna } from "@/components/FormasMarca";

export const ESTILO_FASE: Record<Fase, { forma: typeof Luna; color: string; fondo: string }> = {
  menstrual: { forma: FlorLuna, color: "#f62c39", fondo: "#ffe4ea" },
  folicular: { forma: Circulo, color: "#ff8fab", fondo: "#fff0f5" },
  ovulacion: { forma: Estrella, color: "#b07ee0", fondo: "#f5ebfc" },
  lutea: { forma: Luna, color: "#5b3aaa", fondo: "#efe4fb" },
};

export function GlifoFase({ fase, tamano = 44 }: { fase: Fase; tamano?: number }) {
  const e = ESTILO_FASE[fase];
  const Forma = e.forma;
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        width: tamano,
        height: tamano,
        borderRadius: "50%",
        background: e.fondo,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Forma color={e.color} fondo={e.fondo} tamano={Math.round(tamano * 0.56)} />
    </span>
  );
}
