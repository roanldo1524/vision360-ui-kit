"use client";
// Vista pública de la comunidad. Es la única puerta por la que las pantallas leen
// la comunidad: lo anónimo nunca devuelve autoraId ni perfil (salvo a moderadoras),
// y nunca se expone la fase ni datos del ciclo.
import { useMemo, useSyncExternalStore } from "react";
import { useEstado } from "@/lib/almacen";
import type {
  CiclitaId,
  Comentario,
  Comunidad,
  Medio,
  PerfilComunidad,
  Publicacion,
  TipoPublicacion,
} from "@/lib/tipos";

export const YO = "yo";

// ---------- Reloj compartido (evita Date.now() durante el render) ----------
let ahoraActual = Date.now();
const oyentesReloj = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | null = null;

function suscribirReloj(o: () => void) {
  oyentesReloj.add(o);
  if (!intervalo) {
    intervalo = setInterval(() => {
      ahoraActual = Date.now();
      oyentesReloj.forEach((f) => f());
    }, 30_000);
  }
  return () => {
    oyentesReloj.delete(o);
    if (oyentesReloj.size === 0 && intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  };
}

/** Hora actual que se refresca cada 30 s. */
export function useAhora(): number {
  return useSyncExternalStore(suscribirReloj, () => ahoraActual, () => ahoraActual);
}

// ---------- Tipos públicos ----------

export interface AutoraPublica {
  /** null cuando es anónima: no hay perfil al que enlazar */
  id: string | null;
  alias: string;
  usuario: string | null;
  ciclita: CiclitaId;
  fotoId?: string;
  anonima: boolean;
  /** solo para moderadoras: quién es en realidad */
  real?: { id: string; alias: string; usuario: string };
}

export interface PublicacionPublica {
  id: string;
  tipo: TipoPublicacion;
  autora: AutoraPublica;
  esMia: boolean;
  titulo?: string;
  texto: string;
  enlace?: string;
  temas: string[];
  fondo?: Publicacion["fondo"];
  medios: Medio[];
  creadaEn: number;
  expiraEn?: number;
  flores: number;
  diFlor: boolean;
  guardada: boolean;
  numComentarios: number;
  enRevision: boolean;
  sigoAutora: boolean;
  vistas?: number;
  audio?: string;
}

export interface ComentarioPublico {
  id: string;
  publicacionId: string;
  padreId?: string;
  autora: AutoraPublica;
  esMio: boolean;
  esDeLaAutora: boolean;
  texto: string;
  creadoEn: number;
  editado?: boolean;
  flores: number;
  diFlor: boolean;
  enRevision: boolean;
  respuestas: ComentarioPublico[];
}

export interface PerfilPublico extends Omit<PerfilComunidad, "estado"> {
  esYo: boolean;
  sigo: boolean;
  bloqueada: boolean;
  suspendida: boolean;
  publicaciones: number;
}

// ---------- Contexto ----------

export interface Contexto {
  c: Comunidad;
  moderadora: boolean;
  ahora: number;
}

/** Datos base estables para derivar con useMemo. */
export function useContexto(): Contexto {
  const c = useEstado((e) => e.comunidad);
  const moderadora = useEstado((e) => e.moderadora);
  const ahora = useAhora();
  return useMemo(() => ({ c, moderadora, ahora }), [c, moderadora, ahora]);
}

const ANONIMA: AutoraPublica = { id: null, alias: "anónima", usuario: null, ciclita: "anonima", anonima: true };

function perfilDe(c: Comunidad, id: string): PerfilComunidad | undefined {
  return c.perfiles.find((p) => p.id === id);
}

export function autoraPublica(ctx: Contexto, autoraId: string, anonima: boolean): AutoraPublica {
  const p = perfilDe(ctx.c, autoraId);
  if (anonima) {
    return ctx.moderadora && p ? { ...ANONIMA, real: { id: p.id, alias: p.alias, usuario: p.usuario } } : ANONIMA;
  }
  if (!p) return { id: null, alias: "usuaria", usuario: null, ciclita: "rosa", anonima: false };
  return { id: p.id, alias: p.alias, usuario: p.usuario, ciclita: p.ciclita, fotoId: p.fotoId, anonima: false };
}

function autoraVisible(ctx: Contexto, autoraId: string): boolean {
  if (autoraId === YO) return true;
  if (ctx.c.bloqueos.includes(autoraId)) return false;
  return perfilDe(ctx.c, autoraId)?.estado !== "suspendida";
}

/** ¿Se puede mostrar esta publicación a la usuaria actual? */
export function esVisible(ctx: Contexto, p: Publicacion): boolean {
  if (p.estado === "eliminada" || p.estado === "oculta") return false;
  if (p.estado === "retenida" && p.autoraId !== YO) return false;
  if (!autoraVisible(ctx, p.autoraId)) return false;
  if (ctx.c.descartadas.includes(`p:${p.id}`)) return false;
  if (p.tipo === "historia" && (p.expiraEn ?? 0) <= ctx.ahora) return false;
  return true;
}

function comentarioVisible(ctx: Contexto, k: Comentario): boolean {
  if (k.estado === "eliminada" || k.estado === "oculta") return false;
  if (k.estado === "retenida" && k.autoraId !== YO) return false;
  return autoraVisible(ctx, k.autoraId);
}

export function contarComentarios(ctx: Contexto, publicacionId: string): number {
  return ctx.c.comentarios.filter((k) => k.publicacionId === publicacionId && comentarioVisible(ctx, k)).length;
}

export function vistaPublicacion(ctx: Contexto, p: Publicacion): PublicacionPublica {
  const diFlor = ctx.c.flores.includes(`p:${p.id}`);
  return {
    id: p.id,
    tipo: p.tipo,
    autora: autoraPublica(ctx, p.autoraId, p.anonima),
    esMia: p.autoraId === YO,
    titulo: p.titulo,
    texto: p.texto,
    enlace: p.enlace,
    temas: p.temas,
    fondo: p.fondo,
    medios: p.medios,
    creadaEn: p.creadaEn,
    expiraEn: p.expiraEn,
    flores: p.floresBase + (diFlor ? 1 : 0),
    diFlor,
    guardada: ctx.c.guardados.includes(p.id),
    numComentarios: contarComentarios(ctx, p.id),
    enRevision: p.estado === "retenida",
    sigoAutora: !p.anonima && ctx.c.seguimientos.includes(p.autoraId),
    vistas: p.vistas,
    audio: p.audio,
  };
}

function lista(ctx: Contexto, tipo: TipoPublicacion): PublicacionPublica[] {
  return ctx.c.publicaciones
    .filter((p) => p.tipo === tipo && esVisible(ctx, p))
    .sort((a, b) => b.creadaEn - a.creadaEn)
    .map((p) => vistaPublicacion(ctx, p));
}

export const feedPosts = (ctx: Contexto) => lista(ctx, "post");
export const listaPreguntas = (ctx: Contexto) => lista(ctx, "pregunta");

export function listaReels(ctx: Contexto, filtro: "para-ti" | "siguiendo" = "para-ti"): PublicacionPublica[] {
  const todos = lista(ctx, "reel");
  if (filtro === "siguiendo") return todos.filter((r) => r.esMia || r.sigoAutora);
  return todos;
}

export function publicacionPorId(ctx: Contexto, id: string): PublicacionPublica | null {
  const p = ctx.c.publicaciones.find((x) => x.id === id);
  if (!p || !esVisible(ctx, p)) return null;
  return vistaPublicacion(ctx, p);
}

// ---------- Historias ----------

export interface GrupoHistorias {
  autora: AutoraPublica;
  historias: PublicacionPublica[];
  vistas: boolean;
}

export function historiasPorAutora(ctx: Contexto): GrupoHistorias[] {
  const vivas = ctx.c.publicaciones
    .filter((p) => p.tipo === "historia" && !p.anonima && esVisible(ctx, p))
    .sort((a, b) => a.creadaEn - b.creadaEn);
  const grupos = new Map<string, GrupoHistorias>();
  for (const p of vivas) {
    const g = grupos.get(p.autoraId) ?? { autora: autoraPublica(ctx, p.autoraId, false), historias: [], vistas: true };
    g.historias.push(vistaPublicacion(ctx, p));
    if (!ctx.c.historiasVistas.includes(p.id)) g.vistas = false;
    grupos.set(p.autoraId, g);
  }
  const todos = [...grupos.values()];
  // primero las mías, luego las no vistas
  return todos.sort((a, b) => {
    if (a.autora.id === YO) return -1;
    if (b.autora.id === YO) return 1;
    return Number(a.vistas) - Number(b.vistas);
  });
}

// ---------- Comentarios ----------

export function comentariosDe(
  ctx: Contexto,
  publicacionId: string,
  orden: "relevantes" | "recientes" = "relevantes",
): ComentarioPublico[] {
  const pub = ctx.c.publicaciones.find((p) => p.id === publicacionId);
  const visibles = ctx.c.comentarios.filter((k) => k.publicacionId === publicacionId && comentarioVisible(ctx, k));
  const vista = (k: Comentario): ComentarioPublico => {
    const diFlor = ctx.c.flores.includes(`c:${k.id}`);
    // Si la autora de una publicación anónima comenta en ella, su comentario también
    // se muestra anónimo: si no, la etiqueta "Autora" revelaría quién es.
    const anonima = k.anonima || Boolean(pub?.anonima && pub.autoraId === k.autoraId);
    return {
      id: k.id,
      publicacionId: k.publicacionId,
      padreId: k.padreId,
      autora: autoraPublica(ctx, k.autoraId, anonima),
      esMio: k.autoraId === YO,
      // "Autora" no revela identidad: solo indica que quien comenta es quien publicó
      esDeLaAutora: Boolean(pub && pub.autoraId === k.autoraId),
      texto: k.texto,
      creadoEn: k.creadoEn,
      editado: k.editado,
      flores: k.floresBase + (diFlor ? 1 : 0),
      diFlor,
      enRevision: k.estado === "retenida",
      respuestas: [],
    };
  };
  const todos = visibles.map(vista);
  const porId = new Map(todos.map((k) => [k.id, k]));
  const raiz: ComentarioPublico[] = [];
  for (const k of todos) {
    const padre = k.padreId ? porId.get(k.padreId) : undefined;
    if (padre) padre.respuestas.push(k);
    else raiz.push(k);
  }
  raiz.forEach((k) => k.respuestas.sort((a, b) => a.creadoEn - b.creadoEn));
  return raiz.sort((a, b) =>
    orden === "recientes"
      ? b.creadoEn - a.creadoEn
      : b.flores + b.respuestas.length * 2 - (a.flores + a.respuestas.length * 2) || b.creadoEn - a.creadoEn,
  );
}

/** Comentario destacado: el de más flores. */
export function mejorComentario(ctx: Contexto, publicacionId: string): ComentarioPublico | null {
  return comentariosDe(ctx, publicacionId, "relevantes")[0] ?? null;
}

// ---------- Perfiles ----------

export function perfilPublico(ctx: Contexto, id: string): PerfilPublico | null {
  const p = perfilDe(ctx.c, id);
  if (!p) return null;
  const propias = ctx.c.publicaciones.filter(
    (x) => x.autoraId === id && !x.anonima && x.tipo !== "historia" && esVisible(ctx, x),
  );
  const floresPosts = propias.reduce((s, x) => s + x.floresBase + (ctx.c.flores.includes(`p:${x.id}`) ? 1 : 0), 0);
  const { estado, ...resto } = p;
  return {
    ...resto,
    floresRecibidas: p.floresRecibidas + (id === YO ? floresPosts : 0),
    esYo: id === YO,
    sigo: ctx.c.seguimientos.includes(id),
    bloqueada: ctx.c.bloqueos.includes(id),
    suspendida: estado === "suspendida",
    publicaciones: id === YO ? propias.length : Math.max(p.postsAprobados, propias.length),
  };
}

/** Publicaciones de un perfil. Las anónimas nunca aparecen en un perfil ajeno. */
export function publicacionesDe(ctx: Contexto, id: string, tipo: TipoPublicacion): PublicacionPublica[] {
  return ctx.c.publicaciones
    .filter((p) => p.autoraId === id && p.tipo === tipo && (id === YO || !p.anonima) && esVisible(ctx, p))
    .sort((a, b) => b.creadaEn - a.creadaEn)
    .map((p) => vistaPublicacion(ctx, p));
}

export function guardadas(ctx: Contexto): PublicacionPublica[] {
  return ctx.c.guardados
    .map((id) => ctx.c.publicaciones.find((p) => p.id === id))
    .filter((p): p is Publicacion => Boolean(p && esVisible(ctx, p)))
    .map((p) => vistaPublicacion(ctx, p));
}

export function sugerenciasParaSeguir(ctx: Contexto): PerfilPublico[] {
  return ctx.c.perfiles
    .filter(
      (p) =>
        p.id !== YO &&
        p.estado === "activa" &&
        !ctx.c.seguimientos.includes(p.id) &&
        !ctx.c.bloqueos.includes(p.id) &&
        !ctx.c.descartadas.includes(p.id),
    )
    .map((p) => perfilPublico(ctx, p.id)!)
    .filter(Boolean);
}

/** Nombres para "valee y 127 más le dieron flor" (determinístico, sin revelar nada privado). */
export function quienesDieronFlor(ctx: Contexto, pub: PublicacionPublica): { nombres: AutoraPublica[]; texto: string } | null {
  if (pub.flores === 0) return null;
  if (pub.diFlor && pub.flores === 1) return { nombres: [], texto: "Tú le diste flor" };
  const candidatas = ctx.c.perfiles.filter((p) => p.id !== YO && p.id !== pub.autora.id && p.estado === "activa");
  let semilla = 0;
  for (const ch of pub.id) semilla = (semilla * 31 + ch.charCodeAt(0)) % 997;
  const elegidas = Array.from({ length: Math.min(3, candidatas.length, pub.flores) }, (_, i) => candidatas[(semilla + i * 2) % candidatas.length]);
  const unicas = [...new Map(elegidas.map((p) => [p.id, p])).values()];
  const nombres = unicas.map((p) => autoraPublica(ctx, p.id, false));
  const primera = pub.diFlor ? "Tú" : (unicas[0]?.usuario ?? "");
  const resto = pub.flores - 1;
  return { nombres, texto: resto > 0 ? `${primera} y ${resto.toLocaleString("es-CO")} más le dieron flor` : `${primera} le dio flor` };
}

// ---------- Búsqueda ----------

export function buscar(ctx: Contexto, consulta: string): { perfiles: PerfilPublico[]; temas: string[]; publicaciones: PublicacionPublica[] } {
  const q = consulta.trim().toLowerCase().replace(/^[@#]/, "");
  if (!q) return { perfiles: [], temas: [], publicaciones: [] };
  const perfiles = ctx.c.perfiles
    .filter((p) => p.id !== YO && p.estado === "activa" && !ctx.c.bloqueos.includes(p.id))
    .filter((p) => p.usuario.toLowerCase().includes(q) || p.alias.toLowerCase().includes(q) || p.temas.some((t) => t.includes(q)))
    .map((p) => perfilPublico(ctx, p.id)!)
    .filter(Boolean);
  const visibles = ctx.c.publicaciones.filter((p) => p.tipo !== "historia" && esVisible(ctx, p));
  const temas = [...new Set(visibles.flatMap((p) => p.temas))].filter((t) => t.includes(q));
  const publicaciones = visibles
    .filter((p) => p.temas.some((t) => t.includes(q)) || p.texto.toLowerCase().includes(q) || (p.titulo ?? "").toLowerCase().includes(q))
    .sort((a, b) => b.creadaEn - a.creadaEn)
    .map((p) => vistaPublicacion(ctx, p));
  return { perfiles, temas, publicaciones };
}

// ---------- Cola de moderación ----------

export interface ElementoCola {
  clave: string;
  tipo: "publicacion" | "comentario";
  id: string;
  tipoPublicacion?: TipoPublicacion;
  publicacionId: string;
  texto: string;
  titulo?: string;
  medios: Medio[];
  anonima: boolean;
  autora: { id: string; alias: string; usuario: string; estado: "activa" | "suspendida"; postsAprobados: number } | null;
  motivos: string[];
  reportes: { motivo: string; fecha: number }[];
  estado: Publicacion["estado"];
  fecha: number;
}

/** Una sola lista: retenidas + reportadas + primeras publicaciones de usuarias nuevas. */
export function colaModeracion(ctx: Contexto): ElementoCola[] {
  if (!ctx.moderadora) return [];
  const { c } = ctx;
  const abiertos = c.reportes.filter((r) => r.estado === "abierto");
  const autora = (id: string) => {
    const p = perfilDe(c, id);
    return p ? { id: p.id, alias: p.alias, usuario: p.usuario, estado: p.estado, postsAprobados: p.postsAprobados } : null;
  };
  const items: ElementoCola[] = [];
  for (const p of c.publicaciones) {
    if (p.estado === "eliminada") continue;
    const reps = abiertos.filter((r) => r.objeto.tipo === "publicacion" && r.objeto.id === p.id);
    if (p.estado !== "retenida" && reps.length === 0) continue;
    const motivos: string[] = [];
    if (p.estado === "retenida") motivos.push(p.motivoRetencion ?? "Retenida por el filtro");
    if (p.estado === "oculta") motivos.push("Oculta automáticamente (2 reportes)");
    if (reps.length) motivos.push(`${reps.length} ${reps.length === 1 ? "reporte" : "reportes"}`);
    items.push({
      clave: `p:${p.id}`, tipo: "publicacion", id: p.id, tipoPublicacion: p.tipo, publicacionId: p.id,
      texto: p.texto, titulo: p.titulo, medios: p.medios, anonima: p.anonima, autora: autora(p.autoraId),
      motivos, reportes: reps.map((r) => ({ motivo: r.motivo, fecha: r.fecha })), estado: p.estado, fecha: p.creadaEn,
    });
  }
  for (const k of c.comentarios) {
    if (k.estado === "eliminada") continue;
    const reps = abiertos.filter((r) => r.objeto.tipo === "comentario" && r.objeto.id === k.id);
    if (k.estado !== "retenida" && reps.length === 0) continue;
    const motivos: string[] = [];
    if (k.estado === "retenida") motivos.push("Comentario retenido por el filtro");
    if (k.estado === "oculta") motivos.push("Oculto automáticamente (2 reportes)");
    if (reps.length) motivos.push(`${reps.length} ${reps.length === 1 ? "reporte" : "reportes"}`);
    items.push({
      clave: `c:${k.id}`, tipo: "comentario", id: k.id, publicacionId: k.publicacionId, texto: k.texto, medios: [],
      anonima: k.anonima, autora: autora(k.autoraId), motivos,
      reportes: reps.map((r) => ({ motivo: r.motivo, fecha: r.fecha })), estado: k.estado, fecha: k.creadoEn,
    });
  }
  return items.sort((a, b) => b.fecha - a.fecha);
}

export function perfilesSuspendidos(ctx: Contexto): PerfilComunidad[] {
  return ctx.moderadora ? ctx.c.perfiles.filter((p) => p.estado === "suspendida") : [];
}
