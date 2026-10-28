"use client";
// Comentarios en hilo con flor por comentario, etiqueta "Autora", editar/eliminar lo propio
// y reportar lo ajeno. Más el compositor con respuestas rápidas.
import { useState } from "react";
import { ArrowUp, ChevronDown, EyeOff, Flag, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import { Confirmar, Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { useEstado } from "@/lib/almacen";
import {
  alternarFlor,
  comentar,
  editarComentario,
  eliminarComentario,
  reportar,
} from "@/lib/comunidad/acciones";
import type { ComentarioPublico } from "@/lib/comunidad/consultas";
import { MOTIVOS_REPORTE, RESPUESTAS_RAPIDAS } from "@/lib/comunidad/moderacion";
import { haceCuanto, vibrar } from "@/lib/utilidades";
import { AvatarAutora, NombreAutora } from "./utiles";
import estilos from "./comunidad.module.css";

interface ItemProps {
  c: ComentarioPublico;
  ahora: number;
  alResponder: (c: ComentarioPublico) => void;
  alMenu: (c: ComentarioPublico) => void;
  esRespuesta?: boolean;
}

function ItemComentario({ c, ahora, alResponder, alMenu, esRespuesta = false }: ItemProps) {
  const [abiertas, setAbiertas] = useState(false);
  return (
    <div className={estilos.comentario}>
      <AvatarAutora autora={c.autora} tamano={esRespuesta ? 30 : 36} />
      <div className={estilos.comentarioCuerpo}>
        <div className={estilos.comentarioCabeza}>
          <b>
            <NombreAutora autora={c.autora} />
          </b>
          {c.esDeLaAutora && <span className={estilos.etiquetaAutora}>Autora</span>}
          <span className="texto-3 mini">{haceCuanto(c.creadoEn, ahora).replace("hace ", "")}</span>
          {c.editado && <span className="texto-3 mini">· editado</span>}
        </div>
        {c.enRevision && <span className="mini" style={{ color: "var(--mantequilla-tinta)", fontWeight: 600 }}>En revisión · solo tú lo ves</span>}
        <p className={estilos.comentarioTexto}>{c.texto}</p>
        <div className={estilos.comentarioAcciones}>
          {!esRespuesta && <button onClick={() => alResponder(c)}>Responder</button>}
          {!esRespuesta && c.respuestas.length > 0 && (
            <button className={estilos.verRespuestas} onClick={() => setAbiertas(!abiertas)}>
              {abiertas ? "Ocultar respuestas" : `Ver ${c.respuestas.length} ${c.respuestas.length === 1 ? "respuesta" : "respuestas"}`}
            </button>
          )}
          <button aria-label="Opciones del comentario" onClick={() => alMenu(c)}>
            <MoreHorizontal size={16} />
          </button>
        </div>
        {abiertas && (
          <div className={estilos.respuestas}>
            {c.respuestas.map((r) => (
              <ItemComentario key={r.id} c={r} ahora={ahora} alResponder={alResponder} alMenu={alMenu} esRespuesta />
            ))}
          </div>
        )}
      </div>
      <button
        className={estilos.florComentario}
        aria-pressed={c.diFlor}
        aria-label={c.diFlor ? "Quitar flor al comentario" : "Dar flor al comentario"}
        onClick={() => {
          vibrar();
          alternarFlor(`c:${c.id}`);
        }}
      >
        <Flor tamano={18} activa={c.diFlor} />
        <span className="num">{c.flores}</span>
      </button>
    </div>
  );
}

interface ListaProps {
  comentarios: ComentarioPublico[];
  ahora: number;
  alResponder: (c: ComentarioPublico) => void;
}

/** Lista en hilo + menú de cada comentario. */
export function ListaComentarios({ comentarios, ahora, alResponder }: ListaProps) {
  const [menu, setMenu] = useState<ComentarioPublico | null>(null);
  const [vista, setVista] = useState<"menu" | "editar" | "eliminar" | "reportar">("menu");
  const [texto, setTexto] = useState("");
  const cerrar = () => {
    setMenu(null);
    setVista("menu");
  };

  return (
    <>
      <div className="columna" style={{ gap: 18 }}>
        {comentarios.map((c) => (
          <ItemComentario
            key={c.id}
            c={c}
            ahora={ahora}
            alResponder={alResponder}
            alMenu={(k) => {
              setMenu(k);
              setTexto(k.texto);
              setVista("menu");
            }}
          />
        ))}
      </div>

      <Hoja abierta={Boolean(menu) && vista === "menu"} alCerrar={cerrar} titulo="Comentario">
        <div className={estilos.opciones}>
          {menu?.esMio ? (
            <>
              <button className={estilos.opcion} onClick={() => setVista("editar")}>
                <Pencil size={18} /> Editar
              </button>
              <button className={`${estilos.opcion} ${estilos.opcionPeligro}`} onClick={() => setVista("eliminar")}>
                <Trash2 size={18} /> Eliminar
              </button>
            </>
          ) : (
            <button className={estilos.opcion} onClick={() => setVista("reportar")}>
              <Flag size={18} /> Reportar
            </button>
          )}
        </div>
      </Hoja>

      <Hoja abierta={Boolean(menu) && vista === "editar"} alCerrar={cerrar} titulo="Editar comentario">
        <label htmlFor="editar-comentario" className="solo-lector">Comentario</label>
        <textarea id="editar-comentario" className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} />
        <button
          className="boton boton-principal boton-ancho"
          disabled={!texto.trim()}
          onClick={() => {
            if (!menu) return;
            const retenido = editarComentario(menu.id, texto);
            avisar(retenido ? "Guardado. Quedó en revisión." : "Comentario editado");
            cerrar();
          }}
        >
          Guardar
        </button>
      </Hoja>

      <Confirmar
        abierta={Boolean(menu) && vista === "eliminar"}
        titulo="¿Eliminar tu comentario?"
        texto="Se borra para todas. No se puede deshacer."
        accion="Eliminar"
        peligro
        alConfirmar={() => {
          if (menu) eliminarComentario(menu.id);
          avisar("Comentario eliminado");
        }}
        alCerrar={cerrar}
      />

      <Hoja abierta={Boolean(menu) && vista === "reportar"} alCerrar={cerrar} titulo="¿Por qué lo reportas?">
        <div className={estilos.opciones}>
          {MOTIVOS_REPORTE.map((m) => (
            <button
              key={m}
              className={estilos.opcion}
              onClick={() => {
                if (!menu) return;
                const oculto = reportar({ tipo: "comentario", id: menu.id }, m);
                avisar(oculto ? "Gracias. Lo ocultamos mientras el equipo lo revisa." : "Gracias. El equipo lo revisará.");
                cerrar();
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </Hoja>
    </>
  );
}

interface CompositorProps {
  publicacionId: string;
  respondiendoA: ComentarioPublico | null;
  alCancelarRespuesta: () => void;
  permitirAnonima?: boolean;
  id?: string;
}

/** Respuestas rápidas + campo para comentar. */
export function Compositor({ publicacionId, respondiendoA, alCancelarRespuesta, permitirAnonima = false, id }: CompositorProps) {
  const yo = useEstado((e) => e.perfil);
  const [texto, setTexto] = useState("");
  const [anonima, setAnonima] = useState(false);

  const enviar = (t: string) => {
    const r = comentar(publicacionId, t, respondiendoA?.padreId ?? respondiendoA?.id, anonima);
    if (!r.ok) return avisar(r.mensaje, "error");
    setTexto("");
    alCancelarRespuesta();
    avisar(r.estado === "retenida" ? r.mensaje : "Comentario publicado");
  };

  return (
    <div className={estilos.compositor} id={id}>
      {respondiendoA && (
        <div className={estilos.respondiendo}>
          <span>
            Respondiendo a <b>{respondiendoA.autora.alias}</b>
          </span>
          <button className="boton-icono" style={{ width: 32, height: 32, minHeight: 32 }} aria-label="Cancelar respuesta" onClick={alCancelarRespuesta}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className={estilos.rapidas}>
        {RESPUESTAS_RAPIDAS.map((r) => (
          <button key={r} className={estilos.rapida} onClick={() => enviar(r)}>
            {r}
          </button>
        ))}
      </div>
      <form
        className={estilos.campoComentario}
        onSubmit={(e) => {
          e.preventDefault();
          if (texto.trim()) enviar(texto);
        }}
      >
        {anonima ? <Avatar ciclita="anonima" tamano={36} /> : yo && <Avatar ciclita={yo.ciclita} fotoId={yo.fotoId} tamano={36} />}
        <div className={estilos.campoComentarioCaja}>
          <label htmlFor={`comentario-${publicacionId}`} className="solo-lector">Escribe un comentario</label>
          <input
            id={`comentario-${publicacionId}`}
            placeholder={respondiendoA ? "Escribe tu respuesta…" : "Escribe un comentario…"}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={500}
          />
          {permitirAnonima && (
            <button
              type="button"
              className="boton-icono"
              style={{ width: 36, height: 36, minHeight: 36, color: anonima ? "var(--lila-tinta)" : "var(--texto-3)" }}
              aria-pressed={anonima}
              aria-label={anonima ? "Responder con mi nombre" : "Responder como anónima"}
              onClick={() => setAnonima(!anonima)}
            >
              <EyeOff size={17} />
            </button>
          )}
          <button type="submit" className={estilos.enviar} disabled={!texto.trim()} aria-label="Enviar comentario">
            <ArrowUp size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export function SelectorOrden({ orden, alCambiar }: { orden: "relevantes" | "recientes"; alCambiar: (o: "relevantes" | "recientes") => void }) {
  return (
    <button
      className="enlace-vino texto-2"
      onClick={() => alCambiar(orden === "relevantes" ? "recientes" : "relevantes")}
      aria-label={`Ordenar comentarios. Ahora: ${orden === "relevantes" ? "Más relevantes" : "Más recientes"}`}
    >
      {orden === "relevantes" ? "Más relevantes" : "Más recientes"} <ChevronDown size={14} />
    </button>
  );
}
