// Contenido de ejemplo de la comunidad para que la app no arranque vacía.
// Son perfiles ficticios con Ciclitas (sin fotos de personas) e ilustraciones.
import type { Comentario, Comunidad, PerfilComunidad, Publicacion } from "./tipos";

const H = 3_600_000;

export const PERFILES_SEMILLA: PerfilComunidad[] = [
  {
    id: "valentina", alias: "valentina", usuario: "valentina", ciclita: "rosa",
    bio: "Rituales simples para los días difíciles. Té, cuadernos y mucha calma.",
    temas: ["rituales", "té"], seguidoras: 1284, floresRecibidas: 860, postsAprobados: 48, estado: "activa",
    destacadas: [
      { titulo: "Mi kit", ilustracion: "cuaderno" }, { titulo: "Té", ilustracion: "taza" },
      { titulo: "Cuaderno", ilustracion: "manta" }, { titulo: "Velas", ilustracion: "velas" },
      { titulo: "Calma", ilustracion: "bolsa" },
    ],
  },
  {
    id: "camila", alias: "camila", usuario: "camila", ciclita: "durazno",
    bio: "Infusiones, respiración y cero culpa.", temas: ["infusiones", "calma"],
    seguidoras: 932, floresRecibidas: 540, postsAprobados: 31, estado: "activa",
    destacadas: [{ titulo: "Infusiones", ilustracion: "infusion" }, { titulo: "Calma", ilustracion: "atardecer" }],
  },
  {
    id: "luna", alias: "luna.m", usuario: "luna.m", ciclita: "lila",
    bio: "Playlists suaves y modo avión los días 1 y 2.", temas: ["música", "descanso"],
    seguidoras: 2410, floresRecibidas: 1720, postsAprobados: 77, estado: "activa",
  },
  {
    id: "valee", alias: "valee", usuario: "valee", ciclita: "menta",
    bio: "Aprendiendo a escuchar mi cuerpo.", temas: ["movimiento", "yoga"],
    seguidoras: 610, floresRecibidas: 300, postsAprobados: 19, estado: "activa",
  },
  {
    id: "sofi", alias: "sofi.r", usuario: "sofi.r", ciclita: "mantequilla",
    bio: "Recetas de fase lútea y antojos sin drama.", temas: ["nutrición", "antojos"],
    seguidoras: 1530, floresRecibidas: 990, postsAprobados: 52, estado: "activa",
  },
  {
    id: "mariana", alias: "mariana", usuario: "mariana.v", ciclita: "flor",
    bio: "Escribo para entenderme. Diario todas las noches.", temas: ["diario", "reflexión"],
    seguidoras: 845, floresRecibidas: 410, postsAprobados: 23, estado: "activa",
  },
];

function pub(p: Partial<Publicacion> & Pick<Publicacion, "id" | "autoraId" | "tipo" | "texto">, ahora: number, horas: number): Publicacion {
  return {
    anonima: false, temas: [], medios: [], estado: "publicada", floresBase: 0,
    ...p,
    creadaEn: ahora - horas * H,
  };
}

function com(c: Partial<Comentario> & Pick<Comentario, "id" | "publicacionId" | "autoraId" | "texto">, ahora: number, horas: number): Comentario {
  return { anonima: false, estado: "publicada", floresBase: 0, ...c, creadoEn: ahora - horas * H };
}

export function comunidadInicial(ahora: number = Date.now()): Comunidad {
  const publicaciones: Publicacion[] = [
    pub({
      id: "p1", autoraId: "valentina", tipo: "post", titulo: "Mi kit de los días difíciles",
      texto: "mi kit para los días difíciles: bolsa caliente, té y escribir un rato. ¿cuál es el tuyo? #rituales #calma",
      temas: ["rituales", "calma"], floresBase: 128,
      medios: [
        { tipo: "ilustracion", ref: "cuaderno", texto: "Días difíciles también son parte de mi fuerza" },
        { tipo: "ilustracion", ref: "taza" },
        { tipo: "ilustracion", ref: "bolsa" },
      ],
    }, ahora, 2),
    pub({
      id: "p2", autoraId: "valee", tipo: "post", anonima: true, fondo: "lila",
      texto: "Hoy aprendí que bajar el ritmo también es avanzar.", temas: ["reflexión"], floresBase: 212,
    }, ahora, 4),
    pub({
      id: "p3", autoraId: "camila", tipo: "post", titulo: "Infusión de la tarde",
      texto: "manzanilla con un toque de jengibre. me acompaña desde el día 1 #infusiones",
      temas: ["infusiones"], floresBase: 411,
      medios: [
        { tipo: "ilustracion", ref: "infusion" },
        { tipo: "ilustracion", ref: "manta" },
        { tipo: "ilustracion", ref: "velas" },
      ],
    }, ahora, 6),
    pub({
      id: "p4", autoraId: "sofi", tipo: "post", titulo: "Antojo de fase lútea",
      texto: "chocolate oscuro, banano y nueces. el antojo existe y también se puede cuidar #nutrición",
      temas: ["nutrición"], floresBase: 96,
      medios: [{ tipo: "ilustracion", ref: "antifaz" }],
    }, ahora, 20),
    // Preguntas
    pub({
      id: "q1", autoraId: "sofi", tipo: "pregunta", anonima: true,
      texto: "¿Es normal tener el periodo dos veces en un mismo mes?", temas: ["ciclo"], floresBase: 14,
    }, ahora, 0.15),
    pub({
      id: "q2", autoraId: "luna", tipo: "pregunta",
      texto: "¿Les cuesta más dormir los días antes del periodo?", temas: ["descanso"], floresBase: 22,
    }, ahora, 1),
    pub({
      id: "q3", autoraId: "valentina", tipo: "pregunta",
      texto: "¿Qué infusiones les han ayudado con los cólicos? Me encantaría leer sus recomendaciones.",
      temas: ["cólicos", "infusiones"], floresBase: 76,
      medios: [{ tipo: "ilustracion", ref: "infusion" }],
    }, ahora, 24),
    pub({
      id: "q4", autoraId: "mariana", tipo: "pregunta", anonima: true,
      texto: "¿Ustedes también sienten ansiedad unos días antes del periodo? ¿Qué les ha funcionado?",
      temas: ["emociones"], floresBase: 91,
    }, ahora, 48),
    pub({
      id: "q5", autoraId: "luna", tipo: "pregunta", anonima: true, estado: "retenida",
      motivoRetencion: "Tema de riesgo: medicamentos",
      texto: "¿Alguien ha tomado pastillas para el dolor todos los días del periodo? ¿Es peligroso?",
      temas: ["cólicos"], floresBase: 0,
    }, ahora, 0.5),
    // Reels
    pub({
      id: "r1", autoraId: "valentina", tipo: "reel", texto: "Mi ritual de té para los días pesados: manzanilla, manta y el celular lejos por 20 minutos.",
      temas: ["rituales"], floresBase: 1200, vistas: 15400, audio: "original · valentina",
      medios: [{ tipo: "ilustracion", ref: "taza", texto: "Mi ritual de domingo" }],
    }, ahora, 5),
    pub({
      id: "r2", autoraId: "camila", tipo: "reel", texto: "3 respiraciones que me bajan los cólicos un poquito.",
      temas: ["calma"], floresBase: 980, vistas: 9800, audio: "lluvia suave",
      medios: [{ tipo: "ilustracion", ref: "atardecer", texto: "Respira conmigo" }],
    }, ahora, 9),
    pub({
      id: "r3", autoraId: "luna", tipo: "reel", texto: "Playlist suave y modo avión. Así se ve mi día 1.",
      temas: ["descanso"], floresBase: 2400, vistas: 31000, audio: "playlist de luna",
      medios: [{ tipo: "ilustracion", ref: "velas", texto: "Día 1, modo avión" }],
    }, ahora, 14),
    pub({
      id: "r4", autoraId: "sofi", tipo: "reel", texto: "Snack de fase lútea en 2 minutos.",
      temas: ["nutrición"], floresBase: 640, vistas: 7200, audio: "original · sofi.r",
      medios: [{ tipo: "ilustracion", ref: "manta", texto: "Antojo con cariño" }],
    }, ahora, 30),
    // Historias
    ...["valentina", "camila", "luna", "mariana"].map((autora, i) =>
      pub({
        id: `h-${autora}`, autoraId: autora, tipo: "historia",
        texto: ["Mi ritual de domingo", "Té y manta", "Hoy toca descanso", "Escribir antes de dormir"][i],
        medios: [{ tipo: "ilustracion", ref: ["taza", "infusion", "velas", "cuaderno"][i] }],
        expiraEn: ahora + (20 - i * 3) * H,
      }, ahora, 3 + i * 3),
    ),
  ];

  const comentarios: Comentario[] = [
    com({ id: "c1", publicacionId: "p1", autoraId: "luna", texto: "yo le sumo playlist suave y modo avión.", floresBase: 12 }, ahora, 1),
    com({ id: "c2", publicacionId: "p1", autoraId: "camila", texto: "Una meditación de respiración de 5 minutos me cambia el día.", floresBase: 5 }, ahora, 1),
    com({ id: "c3", publicacionId: "p1", padreId: "c1", autoraId: "valentina", texto: "¡Me encanta! ¿me pasas la playlist?", floresBase: 3 }, ahora, 0.5),
    com({ id: "c4", publicacionId: "q3", autoraId: "camila", texto: "Manzanilla con jengibre y una bolsa de agua caliente, sin falta.", floresBase: 32 }, ahora, 20),
    com({ id: "c5", publicacionId: "q4", autoraId: "mariana", texto: "Escribir lo que siento antes de dormir. Me ordena la cabeza.", floresBase: 18 }, ahora, 40),
    com({ id: "c6", publicacionId: "p3", autoraId: "sofi", texto: "La voy a probar esta noche", floresBase: 2 }, ahora, 5),
    com({ id: "c7", publicacionId: "p2", autoraId: "valee", texto: "Necesitaba leer esto hoy.", floresBase: 9 }, ahora, 3),
  ];

  return {
    perfiles: PERFILES_SEMILLA.map((p) => ({ ...p })),
    publicaciones,
    comentarios,
    flores: [],
    guardados: [],
    seguimientos: ["camila"],
    bloqueos: [],
    // Reporte previo de otra usuaria: con uno más, el contenido se oculta hasta revisión.
    reportes: [
      {
        id: "rep-semilla-1", objeto: { tipo: "publicacion", id: "p4" }, motivo: "Información de salud dudosa",
        reportadaPor: "valee", estado: "abierto", fecha: ahora - 5 * H,
      },
    ],
    descartadas: [],
    historiasVistas: [],
  };
}

/** Las historias de ejemplo se renuevan para que la demo siempre tenga historias vivas. */
export function renovarHistoriasSemilla(c: Comunidad, ahora: number = Date.now()): Comunidad {
  let cambio = false;
  const publicaciones = c.publicaciones.map((p, i) => {
    if (p.tipo === "historia" && p.id.startsWith("h-") && (p.expiraEn ?? 0) < ahora) {
      cambio = true;
      return { ...p, creadaEn: ahora - (2 + i) * H, expiraEn: ahora + (22 - i) * H };
    }
    return p;
  });
  return cambio ? { ...c, publicaciones } : c;
}
