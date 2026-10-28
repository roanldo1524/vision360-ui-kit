"use client";
import { useEffect, useState } from "react";

/** Hora actual que se refresca cada minuto (para notas que vencen a las 24 h). */
export function useAhora(intervalo = 60_000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), intervalo);
    return () => clearInterval(t);
  }, [intervalo]);
  return ahora;
}
