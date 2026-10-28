"use client";
// Acciones del ciclo, del registro diario y de notificaciones.
// Equivalen a las acciones del servidor de la app original.
import { actualizar, leerEstado } from "./almacen";
import { FASES, hoyColombia, infoDia, rachaSobre } from "./ciclo";
import { CONSEJO_DIARIO_NOTIF } from "./consejos";
import { completarMisionPorClave } from "./misiones";
import { notificarSistema } from "./push";
import type { Animo, ConfigCiclo, Fecha, Notificacion, Perfil, RegistroDia } from "./tipos";
import { nuevoId, vibrar } from "./utilidades";

export function completarBienvenida(perfil: Perfil, ciclo: ConfigCiclo) {
  actualizar((e) => ({
    ...e,
    perfil,
    ciclo,
    periodos: [ciclo.ultimoPeriodo],
    comunidad: {
      ...e.comunidad,
      perfiles: [
        ...e.comunidad.perfiles.filter((p) => p.id !== "yo"),
        {
          id: "yo",
          alias: perfil.nombre,
          usuario: perfil.usuario,
          bio: perfil.bio,
          ciclita: perfil.ciclita,
          fotoId: perfil.fotoId,
          temas: [],
          seguidoras: 0,
          floresRecibidas: 0,
          postsAprobados: 0,
          estado: "activa",
        },
      ],
    },
    notificaciones: [
      {
        id: nuevoId("n_"),
        tipo: "sistema",
        titulo: `Bienvenida, ${perfil.nombre}`,
        texto: "Tu ciclo ya está configurado. Toma tu primer sobre y gana tus primeros pétalos.",
        fecha: Date.now(),
        leida: false,
      },
    ],
  }));
}

export function actualizarPerfil(cambios: Partial<Perfil>) {
  actualizar((e) => {
    if (!e.perfil) return e;
    const perfil = { ...e.perfil, ...cambios };
    return {
      ...e,
      perfil,
      comunidad: {
        ...e.comunidad,
        perfiles: e.comunidad.perfiles.map((p) =>
          p.id === "yo"
            ? { ...p, alias: perfil.nombre, usuario: perfil.usuario, bio: perfil.bio, ciclita: perfil.ciclita, fotoId: perfil.fotoId }
            : p,
        ),
      },
    };
  });
}

export function actualizarCiclo(cambios: Partial<ConfigCiclo>) {
  actualizar((e) => (e.ciclo ? { ...e, ciclo: { ...e.ciclo, ...cambios } } : e));
}

function conRegistro(fecha: Fecha, fn: (r: RegistroDia) => RegistroDia) {
  actualizar((e) => {
    const actual = e.registros[fecha] ?? { sintomas: [] };
    return { ...e, registros: { ...e.registros, [fecha]: fn(actual) } };
  });
}

/** "Mi regla llegó hoy" (o en la fecha indicada). */
export function registrarPeriodo(fecha: Fecha = hoyColombia()) {
  vibrar(20);
  actualizar((e) => {
    if (!e.ciclo) return e;
    const periodos = [...new Set([...e.periodos, fecha])].sort();
    const ultimo = periodos[periodos.length - 1];
    return { ...e, periodos, ciclo: { ...e.ciclo, ultimoPeriodo: ultimo } };
  });
}

export function quitarPeriodo(fecha: Fecha) {
  actualizar((e) => {
    if (!e.ciclo) return e;
    const periodos = e.periodos.filter((p) => p !== fecha);
    if (periodos.length === 0) return e; // siempre queda al menos uno
    return { ...e, periodos, ciclo: { ...e.ciclo, ultimoPeriodo: periodos[periodos.length - 1] } };
  });
}

export function marcarSobre(tomo: boolean, fecha: Fecha = hoyColombia()) {
  vibrar(tomo ? 18 : 8);
  conRegistro(fecha, (r) => ({ ...r, tomoSobre: tomo }));
  if (tomo && fecha === hoyColombia()) completarMisionPorClave("tomar_sobre");
}

export function registrarAnimo(animo: Animo, fecha: Fecha = hoyColombia()) {
  vibrar(8);
  conRegistro(fecha, (r) => ({ ...r, animo }));
  if (fecha === hoyColombia()) completarMisionPorClave("registrar_animo");
}

export function guardarSintomas(sintomas: string[], fecha: Fecha = hoyColombia()) {
  conRegistro(fecha, (r) => ({ ...r, sintomas }));
}

export function alternarIntimo(fecha: Fecha) {
  conRegistro(fecha, (r) => ({ ...r, intimo: !r.intimo }));
}

export function guardarNotaDia(fecha: Fecha, nota: string) {
  conRegistro(fecha, (r) => ({ ...r, nota }));
}

export function guardarMotivo(motivo: string) {
  actualizarPerfil({ motivo });
}

// ---------- Notificaciones ----------

export function agregarNotificacion(n: Omit<Notificacion, "id" | "fecha" | "leida">, alSistema = true) {
  const { ajustes } = leerEstado();
  if (n.tipo !== "sistema" && !ajustes.notificaciones[n.tipo]) return;
  actualizar((e) => ({
    ...e,
    notificaciones: [{ ...n, id: nuevoId("n_"), fecha: Date.now(), leida: false }, ...e.notificaciones].slice(0, 60),
  }));
  if (alSistema) notificarSistema(n.titulo, n.texto, n.enlace);
}

export function marcarNotificacionesLeidas() {
  actualizar((e) => ({ ...e, notificaciones: e.notificaciones.map((n) => ({ ...n, leida: true })) }));
}

const CLAVE_DIA = "miciclo:ultimo-dia";

/** Se ejecuta al abrir la app: misión de abrir, consejo del día, cambio de fase y racha. */
export function alAbrirApp() {
  const e = leerEstado();
  if (!e.perfil || !e.ciclo) return;
  const hoy = hoyColombia();
  completarMisionPorClave("abrir_app", true);

  let ultimo: string | null = null;
  try {
    ultimo = localStorage.getItem(CLAVE_DIA);
    localStorage.setItem(CLAVE_DIA, hoy);
  } catch {
    /* sin almacenamiento */
  }
  if (ultimo === hoy) return;

  const info = infoDia(hoy, e.ciclo, e.periodos);
  agregarNotificacion({ tipo: "consejo", titulo: "Tu consejo de hoy", texto: CONSEJO_DIARIO_NOTIF[info.fase], enlace: "/consejos" });

  if (ultimo) {
    const ayer = infoDia(ultimo, e.ciclo, e.periodos);
    if (ayer.fase !== info.fase) {
      agregarNotificacion({
        tipo: "fase",
        titulo: `Empezó tu ${FASES[info.fase].nombre.toLowerCase()}`,
        texto: FASES[info.fase].descripcion + ".",
        enlace: "/ciclo",
      });
    }
  }
  const racha = rachaSobre(hoy, e.registros);
  if (racha >= 2 && !e.registros[hoy]?.tomoSobre) {
    agregarNotificacion({
      tipo: "racha",
      titulo: `Llevas ${racha} días seguidos`,
      texto: "Toma tu sobre de hoy para no perder tu racha.",
      enlace: "/#ritual",
    });
  }
  if (info.diasParaPeriodo === 2) {
    agregarNotificacion({ tipo: "fase", titulo: "Tu periodo llegaría en 2 días", texto: "Ten a mano tu kit de cuidado.", enlace: "/ciclo" });
  }
}

// ---------- Agua y objetivo ----------

export const VASO_ML = 200;

export function sumarAgua(ml: number = VASO_ML, fecha: Fecha = hoyColombia()) {
  actualizar((e) => ({ ...e, agua: { ...e.agua, [fecha]: Math.max(0, (e.agua[fecha] ?? 0) + ml) } }));
}

export function cambiarMetaAgua(ml: number) {
  actualizar((e) => ({ ...e, metaAgua: Math.min(4000, Math.max(1000, ml)) }));
}

export function elegirObjetivo(objetivo: "periodo" | "concebir" | "embarazo") {
  actualizar((e) => ({ ...e, objetivo, embarazo: objetivo === "embarazo" ? true : e.embarazo }));
}

export function alternarEmbarazo() {
  actualizar((e) => ({ ...e, embarazo: !e.embarazo, objetivo: !e.embarazo ? "embarazo" : "periodo" }));
}
