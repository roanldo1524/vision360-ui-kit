export function nuevoId(prefijo = ""): string {
  const aleatorio =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefijo}${aleatorio}`;
}

/** "hace 2 h", "hace 3 días"… */
export function haceCuanto(instante: number, ahora: number = Date.now()): string {
  const s = Math.max(0, Math.round((ahora - instante) / 1000));
  if (s < 60) return "ahora";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hace 1 día";
  if (d < 7) return `hace ${d} días`;
  const sem = Math.round(d / 7);
  return sem === 1 ? "hace 1 semana" : `hace ${sem} semanas`;
}

/** 1284 → "1.284", 24800 → "24,8k", 1200000 → "1,2 mil" estilo de la maqueta */
export function numeroCorto(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")}k`;
  return n.toLocaleString("es-CO");
}

export function clases(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}

/** Extrae #temas de un texto. */
export function extraerTemas(texto: string): string[] {
  const encontrados = texto.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(encontrados.map((t) => t.slice(1).toLowerCase()))];
}

export function vibrar(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* sin vibración */
  }
}
