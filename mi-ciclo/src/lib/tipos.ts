// Tipos compartidos de toda la app. Los nombres siguen el modelo de datos
// propuesto en el documento maestro (sección 06) para migrar luego a Supabase.

export type Fecha = string; // "AAAA-MM-DD" en hora de Colombia
export type Instante = number; // milisegundos desde epoch

export type Fase = "menstrual" | "folicular" | "ovulacion" | "lutea";

export type CiclitaId =
  | "rosa"
  | "durazno"
  | "lila"
  | "menta"
  | "mantequilla"
  | "flor"
  | "anonima";

export type Animo =
  | "feliz"
  | "tranquila"
  | "normal"
  | "sensible"
  | "irritable"
  | "cansada";

export interface Perfil {
  nombre: string;
  usuario: string; // sin @
  bio: string;
  ciclita: CiclitaId;
  fotoId?: string; // id de medio en IndexedDB
  creadaEn: Instante;
  motivo?: string; // ¿Por qué estás con Mi Ciclo?
}

export interface ConfigCiclo {
  ultimoPeriodo: Fecha;
  duracionCiclo: number; // 21–40
  duracionRegla: number; // 2–8
}

export interface RegistroDia {
  animo?: Animo;
  sintomas: string[];
  tomoSobre?: boolean; // true = sí, false = todavía no
  intimo?: boolean;
  nota?: string;
}

export interface MovimientoPetalos {
  id: string;
  fecha: Instante;
  cantidad: number; // positivo gana, negativo canjea
  motivo: string;
}

export interface Canje {
  id: string;
  fecha: Instante;
  bonoId: string;
  titulo: string;
  codigo: string;
  petalos: number;
  url: string; // tienda con UTM
}

export type TipoNotificacion = "consejo" | "racha" | "fase" | "comunidad" | "sistema";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  texto: string;
  fecha: Instante;
  leida: boolean;
  enlace?: string;
}

export type RolVinculo = "pareja" | "mama" | "papa" | "amiga";

export interface Vinculo {
  id: string;
  codigo: string;
  rol?: RolVinculo;
  nombre?: string;
  estado: "pendiente" | "por_confirmar" | "activo";
  creadoEn: Instante;
}

export interface NotaPareja {
  id: string;
  texto: string;
  de: "yo" | "vinculo";
  creadaEn: Instante; // dura 24 h
}

export interface EntradaDiarioCifrada {
  id: string;
  fecha: Instante;
  iv: string; // base64
  datos: string; // base64 (AES-GCM)
}

export interface Diario {
  sal?: string; // base64; sin sal = diario sin PIN todavía
  verificador?: { iv: string; datos: string };
  entradas: EntradaDiarioCifrada[];
}

export interface Ajustes {
  notificaciones: Record<Exclude<TipoNotificacion, "sistema">, boolean>;
  privacidadVinculo: {
    fase: boolean;
    animo: boolean;
    sintomas: boolean;
    regla: boolean;
  };
  recordatorioHora: string; // "HH:MM"
}

// ---------- Comunidad ----------

export type EstadoPublicacion = "publicada" | "retenida" | "oculta" | "eliminada";
export type TipoPublicacion = "post" | "pregunta" | "reel" | "historia";

export interface PerfilComunidad {
  id: string; // "yo" para la usuaria actual
  alias: string;
  usuario: string;
  bio: string;
  ciclita: CiclitaId;
  fotoId?: string;
  temas: string[];
  seguidoras: number;
  floresRecibidas: number;
  postsAprobados: number;
  estado: "activa" | "suspendida";
  destacadas?: { titulo: string; ilustracion: string }[];
}

export type Medio =
  | { tipo: "ilustracion"; ref: string; texto?: string }
  | { tipo: "foto"; ref: string } // id en IndexedDB
  | { tipo: "video"; ref: string; poster?: string };

export type FondoPregunta = "lila" | "rosa" | "menta" | "durazno";

export interface Publicacion {
  id: string;
  autoraId: string;
  tipo: TipoPublicacion;
  anonima: boolean;
  titulo?: string;
  texto: string;
  enlace?: string;
  temas: string[];
  fondo?: FondoPregunta;
  medios: Medio[];
  estado: EstadoPublicacion;
  motivoRetencion?: string;
  expiraEn?: Instante; // historias
  creadaEn: Instante;
  floresBase: number; // flores de otras usuarias (semilla)
  vistas?: number;
  audio?: string;
}

export interface Comentario {
  id: string;
  publicacionId: string;
  padreId?: string;
  autoraId: string;
  anonima: boolean;
  texto: string;
  estado: EstadoPublicacion;
  creadoEn: Instante;
  editado?: boolean;
  floresBase: number;
}

export interface Reporte {
  id: string;
  objeto: { tipo: "publicacion" | "comentario"; id: string };
  motivo: string;
  reportadaPor: string;
  estado: "abierto" | "resuelto";
  fecha: Instante;
}

export interface Comunidad {
  perfiles: PerfilComunidad[];
  publicaciones: Publicacion[];
  comentarios: Comentario[];
  flores: string[]; // "p:<id>" o "c:<id>" a los que yo di flor
  guardados: string[]; // ids de publicaciones
  seguimientos: string[]; // ids de perfiles que sigo
  bloqueos: string[];
  reportes: Reporte[];
  descartadas: string[]; // sugerencias de "Chicas para seguir" cerradas
  historiasVistas: string[];
}

export interface Estado {
  version: number;
  perfil: Perfil | null;
  ciclo: ConfigCiclo | null;
  periodos: Fecha[]; // inicios de regla registrados
  registros: Record<Fecha, RegistroDia>;
  petalos: number;
  movimientos: MovimientoPetalos[];
  misiones: Record<Fecha, string[]>; // claves de misiones completadas por día
  canjes: Canje[];
  notificaciones: Notificacion[];
  ajustes: Ajustes;
  vinculos: Vinculo[];
  notasPareja: NotaPareja[];
  diario: Diario;
  comunidad: Comunidad;
  moderadora: boolean;
}
