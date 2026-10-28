"use client";
// Acciones de la comunidad. Cada una equivale a una acción del servidor:
// la moderación y el anonimato se resuelven aquí, nunca en la pantalla.
import { actualizar, leerEstado } from "@/lib/almacen";
import { completarMisionPorClave } from "@/lib/misiones";
import type {
  Comunidad,
  Estado,
  EstadoPublicacion,
  FondoPregunta,
  Medio,
  Publicacion,
  TipoPublicacion,
} from "@/lib/tipos";
import { extraerTemas, nuevoId } from "@/lib/utilidades";
import { filtrarTexto, PUBLICACIONES_CON_REVISION_PREVIA, REPORTES_PARA_OCULTAR } from "./moderacion";

const YO = "yo";
const HORA = 3_600_000;

function conComunidad(fn: (c: Comunidad, e: Estado) => Comunidad) {
  actualizar((e) => ({ ...e, comunidad: fn(e.comunidad, e) }));
}

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

// ---------- Publicar ----------

export interface NuevaPublicacion {
  tipo: TipoPublicacion;
  texto: string;
  titulo?: string;
  enlace?: string;
  anonima?: boolean;
  fondo?: FondoPregunta;
  medios?: Medio[];
}

export interface ResultadoPublicar {
  ok: boolean;
  id?: string;
  estado?: EstadoPublicacion;
  mensaje: string;
}

/** Decide si una publicación nueva sale de inmediato o queda retenida. */
function decidirEstado(p: NuevaPublicacion, postsAprobados: number): { estado: EstadoPublicacion; motivo?: string } {
  const filtro = filtrarTexto(`${p.titulo ?? ""} ${p.texto}`);
  if (filtro.retener) return { estado: "retenida", motivo: filtro.motivo };
  if (p.tipo === "pregunta" && p.anonima) return { estado: "retenida", motivo: "Pregunta anónima (revisión previa)" };
  if (p.tipo !== "historia" && postsAprobados < PUBLICACIONES_CON_REVISION_PREVIA) {
    return { estado: "retenida", motivo: "Primeras publicaciones de usuaria nueva" };
  }
  return { estado: "publicada" };
}

export function publicar(entrada: NuevaPublicacion): ResultadoPublicar {
  const e = leerEstado();
  const yo = e.comunidad.perfiles.find((p) => p.id === YO);
  if (!yo) return { ok: false, mensaje: "Completa tu perfil para publicar." };
  if (yo.estado === "suspendida") {
    return { ok: false, mensaje: "Tu cuenta de comunidad está suspendida. Escríbenos si crees que es un error." };
  }
  const texto = entrada.texto.trim();
  if (!texto && !(entrada.medios?.length)) return { ok: false, mensaje: "Escribe algo o elige una foto para publicar." };

  const { estado, motivo } = decidirEstado(entrada, yo.postsAprobados);
  const ahora = Date.now();
  const nueva: Publicacion = {
    id: nuevoId("pub_"),
    autoraId: YO,
    tipo: entrada.tipo,
    anonima: Boolean(entrada.anonima),
    titulo: entrada.titulo?.trim() || undefined,
    texto,
    enlace: entrada.enlace?.trim() || undefined,
    temas: extraerTemas(`${entrada.titulo ?? ""} ${texto}`),
    fondo: entrada.fondo,
    medios: (entrada.medios ?? []).slice(0, entrada.tipo === "post" ? 3 : 1),
    estado,
    motivoRetencion: motivo,
    expiraEn: entrada.tipo === "historia" ? ahora + 24 * HORA : undefined,
    creadaEn: ahora,
    floresBase: 0,
    vistas: entrada.tipo === "reel" ? 0 : undefined,
    audio: entrada.tipo === "reel" ? `original · ${yo.usuario}` : undefined,
  };
  conComunidad((c) => ({ ...c, publicaciones: [nueva, ...c.publicaciones] }));
  completarMisionPorClave("publicar", true);

  const nombres: Record<TipoPublicacion, string> = {
    post: "Tu post", pregunta: "Tu pregunta", reel: "Tu reel", historia: "Tu historia",
  };
  if (estado === "retenida") {
    return {
      ok: true, id: nueva.id, estado,
      mensaje:
        motivo === "Primeras publicaciones de usuaria nueva"
          ? `${nombres[entrada.tipo]} está en revisión. Las primeras ${PUBLICACIONES_CON_REVISION_PREVIA} publicaciones de cada chica nueva las revisa el equipo antes de salir. Suele tardar pocas horas.`
          : motivo === "Pregunta anónima (revisión previa)"
            ? "Tu pregunta está en revisión. Las preguntas anónimas las lee una persona del equipo antes de publicarse, para cuidar a todas."
            : `${nombres[entrada.tipo]} está en revisión porque toca un tema que una persona del equipo debe leer primero. Te avisamos cuando salga.`,
    };
  }
  return { ok: true, id: nueva.id, estado, mensaje: `${nombres[entrada.tipo]} ya está en la comunidad.` };
}

export function editarPublicacion(id: string, cambios: { texto: string; titulo?: string }) {
  const filtro = filtrarTexto(`${cambios.titulo ?? ""} ${cambios.texto}`);
  conComunidad((c) => ({
    ...c,
    publicaciones: c.publicaciones.map((p) =>
      p.id === id && p.autoraId === YO
        ? {
            ...p,
            texto: cambios.texto.trim(),
            titulo: cambios.titulo?.trim() || undefined,
            temas: extraerTemas(`${cambios.titulo ?? ""} ${cambios.texto}`),
            estado: filtro.retener ? "retenida" : p.estado,
            motivoRetencion: filtro.retener ? filtro.motivo : p.motivoRetencion,
          }
        : p,
    ),
  }));
  return filtro.retener;
}

export function eliminarPublicacion(id: string) {
  conComunidad((c) => ({
    ...c,
    publicaciones: c.publicaciones.map((p) => (p.id === id && p.autoraId === YO ? { ...p, estado: "eliminada" } : p)),
  }));
}

// ---------- Comentarios ----------

export function comentar(publicacionId: string, texto: string, padreId?: string, anonima = false): ResultadoPublicar {
  const e = leerEstado();
  const limpio = texto.trim();
  if (!limpio) return { ok: false, mensaje: "Escribe un comentario." };
  const yo = e.comunidad.perfiles.find((p) => p.id === YO);
  if (yo?.estado === "suspendida") return { ok: false, mensaje: "Tu cuenta de comunidad está suspendida." };
  const pub = e.comunidad.publicaciones.find((p) => p.id === publicacionId);
  if (!pub) return { ok: false, mensaje: "Esta publicación ya no existe." };
  // Si respondo en mi propia publicación anónima, mi comentario también es anónimo:
  // así nadie puede unir la publicación con mi perfil.
  const esAnonima = anonima || (pub.anonima && pub.autoraId === YO);
  const filtro = filtrarTexto(limpio);
  const id = nuevoId("com_");
  conComunidad((c) => ({
    ...c,
    comentarios: [
      ...c.comentarios,
      {
        id, publicacionId, padreId, autoraId: YO, anonima: esAnonima, texto: limpio,
        estado: filtro.retener ? "retenida" : "publicada", creadoEn: Date.now(), floresBase: 0,
      },
    ],
  }));
  if (!filtro.retener) completarMisionPorClave("comentar", true);
  return filtro.retener
    ? { ok: true, id, estado: "retenida", mensaje: "Tu comentario está en revisión antes de publicarse." }
    : { ok: true, id, estado: "publicada", mensaje: "Comentario publicado" };
}

export function editarComentario(id: string, texto: string) {
  const filtro = filtrarTexto(texto);
  conComunidad((c) => ({
    ...c,
    comentarios: c.comentarios.map((k) =>
      k.id === id && k.autoraId === YO
        ? { ...k, texto: texto.trim(), editado: true, estado: filtro.retener ? "retenida" : k.estado }
        : k,
    ),
  }));
  return filtro.retener;
}

export function eliminarComentario(id: string) {
  conComunidad((c) => ({
    ...c,
    comentarios: c.comentarios.map((k) => (k.id === id && k.autoraId === YO ? { ...k, estado: "eliminada" } : k)),
  }));
}

// ---------- Reacciones y guardados ----------

/** Flor a una publicación ("p:<id>") o a un comentario ("c:<id>"). Devuelve true si quedó dada. */
export function alternarFlor(clave: string): boolean {
  const dada = !leerEstado().comunidad.flores.includes(clave);
  conComunidad((c) => ({ ...c, flores: alternar(c.flores, clave) }));
  if (dada) completarMisionPorClave("dar_flor", true);
  return dada;
}

export function alternarGuardado(publicacionId: string): boolean {
  const guardada = !leerEstado().comunidad.guardados.includes(publicacionId);
  conComunidad((c) => ({ ...c, guardados: alternar(c.guardados, publicacionId) }));
  return guardada;
}

// ---------- Seguir y bloquear ----------

export function alternarSeguir(perfilId: string): boolean {
  if (perfilId === YO) return false;
  const sigue = !leerEstado().comunidad.seguimientos.includes(perfilId);
  conComunidad((c) => ({
    ...c,
    seguimientos: alternar(c.seguimientos, perfilId),
    perfiles: c.perfiles.map((p) => (p.id === perfilId ? { ...p, seguidoras: Math.max(0, p.seguidoras + (sigue ? 1 : -1)) } : p)),
  }));
  return sigue;
}

function bloquearId(perfilId: string) {
  if (perfilId === YO) return;
  conComunidad((c) => ({
    ...c,
    bloqueos: c.bloqueos.includes(perfilId) ? c.bloqueos : [...c.bloqueos, perfilId],
    seguimientos: c.seguimientos.filter((s) => s !== perfilId),
  }));
}

export function bloquear(perfilId: string) {
  bloquearId(perfilId);
}

/** Bloquea a la autora de una publicación sin revelar quién es (sirve también para anónimas). */
export function bloquearAutoraDe(publicacionId: string) {
  const p = leerEstado().comunidad.publicaciones.find((x) => x.id === publicacionId);
  if (p) bloquearId(p.autoraId);
}

export function desbloquear(perfilId: string) {
  conComunidad((c) => ({ ...c, bloqueos: c.bloqueos.filter((b) => b !== perfilId) }));
}

// ---------- Reportes ----------

/** Reporta contenido. Con 2 reportes abiertos se oculta hasta que se revise. Devuelve true si quedó oculto. */
export function reportar(objeto: { tipo: "publicacion" | "comentario"; id: string }, motivo: string): boolean {
  const c = leerEstado().comunidad;
  const yaLoReporte = c.reportes.some(
    (r) => r.objeto.id === objeto.id && r.objeto.tipo === objeto.tipo && r.reportadaPor === YO && r.estado === "abierto",
  );
  if (yaLoReporte) return false;
  const abiertos = c.reportes.filter((r) => r.objeto.id === objeto.id && r.objeto.tipo === objeto.tipo && r.estado === "abierto").length + 1;
  const ocultar = abiertos >= REPORTES_PARA_OCULTAR;
  conComunidad((cc) => ({
    ...cc,
    reportes: [
      ...cc.reportes,
      { id: nuevoId("rep_"), objeto, motivo, reportadaPor: YO, estado: "abierto", fecha: Date.now() },
    ],
    publicaciones:
      ocultar && objeto.tipo === "publicacion"
        ? cc.publicaciones.map((p) => (p.id === objeto.id && p.estado === "publicada" ? { ...p, estado: "oculta" } : p))
        : cc.publicaciones,
    comentarios:
      ocultar && objeto.tipo === "comentario"
        ? cc.comentarios.map((k) => (k.id === objeto.id && k.estado === "publicada" ? { ...k, estado: "oculta" } : k))
        : cc.comentarios,
    // Lo que yo reporto deja de aparecerme de inmediato.
    descartadas: objeto.tipo === "publicacion" ? [...cc.descartadas, `p:${objeto.id}`] : cc.descartadas,
  }));
  return ocultar;
}

/** "No me interesa": deja de mostrarme esta publicación. */
export function ocultarParaMi(publicacionId: string) {
  conComunidad((c) => ({ ...c, descartadas: [...c.descartadas, `p:${publicacionId}`] }));
}

export function descartarSugerencia(perfilId: string) {
  conComunidad((c) => ({ ...c, descartadas: [...c.descartadas, perfilId] }));
}

export function marcarHistoriaVista(id: string) {
  if (leerEstado().comunidad.historiasVistas.includes(id)) return;
  conComunidad((c) => ({ ...c, historiasVistas: [...c.historiasVistas, id] }));
}

export function sumarVista(reelId: string) {
  conComunidad((c) => ({
    ...c,
    publicaciones: c.publicaciones.map((p) => (p.id === reelId ? { ...p, vistas: (p.vistas ?? 0) + 1 } : p)),
  }));
}

export function agregarDestacada(titulo: string, ilustracion: string) {
  conComunidad((c) => ({
    ...c,
    perfiles: c.perfiles.map((p) =>
      p.id === YO ? { ...p, destacadas: [...(p.destacadas ?? []), { titulo: titulo.trim() || "Nueva", ilustracion }] } : p,
    ),
  }));
}

// ---------- Moderación (panel admin) ----------

export function activarModeradora(activa: boolean) {
  actualizar((e) => ({ ...e, moderadora: activa }));
}

function cerrarReportes(c: Comunidad, id: string): Comunidad["reportes"] {
  return c.reportes.map((r) => (r.objeto.id === id ? { ...r, estado: "resuelto" } : r));
}

export function moderarPublicacion(id: string, decision: "aprobar" | "ocultar" | "eliminar") {
  if (!leerEstado().moderadora) return;
  const estado: EstadoPublicacion = decision === "aprobar" ? "publicada" : decision === "ocultar" ? "oculta" : "eliminada";
  conComunidad((c) => {
    const pub = c.publicaciones.find((p) => p.id === id);
    const sumaAprobado = decision === "aprobar" && pub && pub.estado === "retenida" && pub.tipo !== "historia";
    return {
      ...c,
      publicaciones: c.publicaciones.map((p) => (p.id === id ? { ...p, estado, motivoRetencion: undefined } : p)),
      perfiles: sumaAprobado
        ? c.perfiles.map((p) => (p.id === pub.autoraId ? { ...p, postsAprobados: p.postsAprobados + 1 } : p))
        : c.perfiles,
      reportes: cerrarReportes(c, id),
      // si la aprobaron, que vuelva a verse aunque la haya reportado
      descartadas: decision === "aprobar" ? c.descartadas.filter((d) => d !== `p:${id}`) : c.descartadas,
    };
  });
}

export function moderarComentario(id: string, decision: "aprobar" | "ocultar" | "eliminar") {
  if (!leerEstado().moderadora) return;
  const estado: EstadoPublicacion = decision === "aprobar" ? "publicada" : decision === "ocultar" ? "oculta" : "eliminada";
  conComunidad((c) => ({
    ...c,
    comentarios: c.comentarios.map((k) => (k.id === id ? { ...k, estado } : k)),
    reportes: cerrarReportes(c, id),
  }));
}

export function suspenderAutora(perfilId: string, suspender = true) {
  if (!leerEstado().moderadora) return;
  conComunidad((c) => ({
    ...c,
    perfiles: c.perfiles.map((p) => (p.id === perfilId ? { ...p, estado: suspender ? "suspendida" : "activa" } : p)),
  }));
}
