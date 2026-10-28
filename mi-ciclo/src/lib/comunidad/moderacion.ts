// Moderación híbrida: publicación inmediata con filtro automático que retiene lo dudoso.
// Los temas de riesgo siempre pasan por revisión humana.

const PALABRAS_PROHIBIDAS = [
  "idiota", "estupida", "estúpida", "imbecil", "imbécil", "puta", "perra", "zorra",
  "malparida", "hijueputa", "gonorrea", "maldita", "asquerosa", "fea gorda",
  "gana dinero", "link en mi bio", "escríbeme al whatsapp", "escribeme al whatsapp",
];

const TEMAS_RIESGO: { patron: RegExp; tema: string }[] = [
  { patron: /autolesi|cortarme|hacerme daño|lastimarme/i, tema: "autolesión" },
  { patron: /suicid|matarme|no quiero vivir|quitarme la vida/i, tema: "autolesión" },
  { patron: /embaraz|aborto|abortar/i, tema: "embarazo" },
  { patron: /medicament|pastilla|antibiótic|antibiotic|ibuprofeno|anticoncept|dosis/i, tema: "medicamentos" },
];

export interface ResultadoFiltro {
  retener: boolean;
  motivo?: string;
}

function normalizar(t: string) {
  return t.toLowerCase();
}

/** Revisa un texto con el filtro automático. */
export function filtrarTexto(texto: string): ResultadoFiltro {
  const t = normalizar(texto);
  const prohibida = PALABRAS_PROHIBIDAS.find((p) => t.includes(p));
  if (prohibida) return { retener: true, motivo: "Lenguaje que no va con la comunidad" };
  const riesgo = TEMAS_RIESGO.find((r) => r.patron.test(texto));
  if (riesgo) return { retener: true, motivo: `Tema de riesgo: ${riesgo.tema}` };
  return { retener: false };
}

export const PUBLICACIONES_CON_REVISION_PREVIA = 3;
export const REPORTES_PARA_OCULTAR = 2;

export const MOTIVOS_REPORTE = [
  "Lenguaje ofensivo o acoso",
  "Información de salud peligrosa",
  "Spam o publicidad",
  "Contenido sexual o violento",
  "Revela datos de otra persona",
  "Otro motivo",
];

export const RESPUESTAS_RAPIDAS = ["Te entiendo", "Gracias por compartir", "Fuerza, tú puedes", "Me pasa igual"];
