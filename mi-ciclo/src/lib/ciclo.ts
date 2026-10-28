// Cálculos del ciclo. Todo en fechas de calendario de Colombia (America/Bogota).
import type { ConfigCiclo, Fase, Fecha } from "./tipos";

const ZONA = "America/Bogota";
const DIA_MS = 86_400_000;

/** Fecha de hoy en Colombia como "AAAA-MM-DD". */
export function hoyColombia(ahora: Date = new Date()): Fecha {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

/** Convierte "AAAA-MM-DD" a un número de días desde epoch (sin horas). */
export function aDias(fecha: Fecha): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.round(Date.UTC(a, m - 1, d) / DIA_MS);
}

export function desdeDias(dias: number): Fecha {
  return new Date(dias * DIA_MS).toISOString().slice(0, 10);
}

export function sumarDias(fecha: Fecha, n: number): Fecha {
  return desdeDias(aDias(fecha) + n);
}

export function diferenciaDias(desde: Fecha, hasta: Fecha): number {
  return aDias(hasta) - aDias(desde);
}

/** 0 = lunes … 6 = domingo */
export function diaSemana(fecha: Fecha): number {
  const d = new Date(aDias(fecha) * DIA_MS).getUTCDay();
  return (d + 6) % 7;
}

export function inicioSemana(fecha: Fecha): Fecha {
  return sumarDias(fecha, -diaSemana(fecha));
}

export const DIAS_CORTOS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
export const DIAS_LETRA = ["L", "M", "M", "J", "V", "S", "D"];
export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function numeroDia(fecha: Fecha): number {
  return Number(fecha.slice(8, 10));
}

export function fechaLarga(fecha: Fecha): string {
  const [, m, d] = fecha.split("-").map(Number);
  return `${d} de ${MESES[m - 1]}`;
}

/** Último inicio de regla que sea <= fecha, usando el historial registrado. */
export function inicioCicloPara(
  fecha: Fecha,
  config: ConfigCiclo,
  periodos: Fecha[],
): Fecha {
  const conocidos = [...new Set([config.ultimoPeriodo, ...periodos])]
    .filter((p) => p <= fecha)
    .sort();
  if (conocidos.length > 0) {
    const ultimo = conocidos[conocidos.length - 1];
    // Si la fecha va más allá de un ciclo completo, se proyecta hacia adelante.
    const pasados = diferenciaDias(ultimo, fecha);
    const vueltas = Math.floor(pasados / config.duracionCiclo);
    return sumarDias(ultimo, vueltas * config.duracionCiclo);
  }
  // Fecha anterior a todo lo registrado: se proyecta hacia atrás.
  const base = config.ultimoPeriodo;
  const atras = diferenciaDias(fecha, base);
  const vueltas = Math.ceil(atras / config.duracionCiclo);
  return sumarDias(base, -vueltas * config.duracionCiclo);
}

export interface InfoDia {
  fecha: Fecha;
  diaCiclo: number; // 1..duracionCiclo
  fase: Fase;
  inicioCiclo: Fecha;
  proximoPeriodo: Fecha;
  diasParaPeriodo: number;
  ovulacion: Fecha;
  ventanaFertil: { desde: Fecha; hasta: Fecha };
  diasParaVentana: number; // 0 si ya está en ventana, negativo si ya pasó
  fertil: boolean;
}

/** Fases con días proporcionales al ciclo de cada usuaria. */
export function faseDelDia(diaCiclo: number, config: ConfigCiclo): Fase {
  const ovul = config.duracionCiclo - 13; // día de ovulación estimado (15 en un ciclo de 28)
  if (diaCiclo <= config.duracionRegla) return "menstrual";
  if (diaCiclo < ovul - 1) return "folicular";
  if (diaCiclo <= ovul + 1) return "ovulacion";
  return "lutea";
}

export function infoDia(fecha: Fecha, config: ConfigCiclo, periodos: Fecha[]): InfoDia {
  const inicio = inicioCicloPara(fecha, config, periodos);
  const diaCiclo = diferenciaDias(inicio, fecha) + 1;
  const proximo = sumarDias(inicio, config.duracionCiclo);
  const ovulacion = sumarDias(inicio, config.duracionCiclo - 14);
  const ventana = { desde: sumarDias(ovulacion, -5), hasta: sumarDias(ovulacion, 1) };
  const fertil = fecha >= ventana.desde && fecha <= ventana.hasta;
  let diasParaVentana = diferenciaDias(fecha, ventana.desde);
  if (fertil) diasParaVentana = 0;
  if (fecha > ventana.hasta) {
    // la siguiente ventana fértil es la del próximo ciclo
    diasParaVentana = diferenciaDias(fecha, sumarDias(ventana.desde, config.duracionCiclo));
  }
  return {
    fecha,
    diaCiclo,
    fase: faseDelDia(diaCiclo, config),
    inicioCiclo: inicio,
    proximoPeriodo: proximo,
    diasParaPeriodo: diferenciaDias(fecha, proximo),
    ovulacion,
    ventanaFertil: ventana,
    diasParaVentana,
    fertil,
  };
}

/** ¿El día cae dentro de una regla (registrada o proyectada)? */
export function esDiaRegla(fecha: Fecha, config: ConfigCiclo, periodos: Fecha[]): boolean {
  return infoDia(fecha, config, periodos).diaCiclo <= config.duracionRegla;
}

export const FASES: Record<
  Fase,
  {
    nombre: string;
    corta: string;
    descripcion: string;
    tono: string;
    chips: string[];
    color: string; // variable CSS
    pastel: string;
  }
> = {
  menstrual: {
    nombre: "Fase Menstrual",
    corta: "Menstrual",
    descripcion: "Momento para cuidarte y descansar",
    tono: "Pausa, calor, descanso",
    chips: ["Energía baja", "Descanso", "Hierro"],
    color: "var(--fase-menstrual)",
    pastel: "var(--rosa)",
  },
  folicular: {
    nombre: "Fase Folicular",
    corta: "Folicular",
    descripcion: "Tu energía sube. Buen momento para empezar cosas",
    tono: "Planear, empezar cosas",
    chips: ["Energía en subida", "Planear", "Movimiento"],
    color: "var(--fase-folicular)",
    pastel: "var(--durazno)",
  },
  ovulacion: {
    nombre: "Fase de Ovulación",
    corta: "Ovulación",
    descripcion: "Más sociable y con más energía",
    tono: "Aprovechar, conectar",
    chips: ["Energía alta", "Conectar", "Hidratación"],
    color: "var(--fase-ovulacion)",
    pastel: "var(--lila)",
  },
  lutea: {
    nombre: "Fase Lútea",
    corta: "Lútea",
    descripcion: "Menos exigencia y más cuidado contigo",
    tono: "Menos exigencia, más cuidado",
    chips: ["Antojos", "Sensibilidad", "Magnesio"],
    color: "var(--fase-lutea)",
    pastel: "var(--mantequilla)",
  },
};

/** Racha de días seguidos con sobre tomado, contando hasta hoy (o ayer si hoy falta). */
export function rachaSobre(
  hoy: Fecha,
  registros: Record<Fecha, { tomoSobre?: boolean }>,
): number {
  let dia = registros[hoy]?.tomoSobre ? hoy : sumarDias(hoy, -1);
  let racha = 0;
  while (registros[dia]?.tomoSobre) {
    racha += 1;
    dia = sumarDias(dia, -1);
  }
  return racha;
}
