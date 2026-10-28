"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bookmark, ExternalLink, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Cabecera } from "@/components/Cabecera";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Flor } from "@/components/Flor";
import { MedioVista } from "@/components/MedioVista";
import { avisar } from "@/components/Avisos";
import { Compositor, ListaComentarios, SelectorOrden } from "@/components/comunidad/Comentarios";
import { MenuPublicacion } from "@/components/comunidad/MenuPublicacion";
import { AvisoRevision } from "@/components/comunidad/TarjetaPost";
import { AvatarAutora, ChipTema, copiarEnlace, NombreAutora, TextoConTemas } from "@/components/comunidad/utiles";
import cs from "@/components/comunidad/comunidad.module.css";
import { alternarFlor, alternarGuardado } from "@/lib/comunidad/acciones";
import { comentariosDe, publicacionPorId, useContexto, type ComentarioPublico } from "@/lib/comunidad/consultas";
import { haceCuanto, numeroCorto, vibrar } from "@/lib/utilidades";
import estilos from "./detalle.module.css";

export default function Detalle() {
  const { id } = useParams<{ id: string }>();
  const ctx = useContexto();
  const pub = useMemo(() => publicacionPorId(ctx, id), [ctx, id]);
  const [orden, setOrden] = useState<"relevantes" | "recientes">("relevantes");
  const comentarios = useMemo(() => comentariosDe(ctx, id, orden), [ctx, id, orden]);
  const [respondiendo, setRespondiendo] = useState<ComentarioPublico | null>(null);
  const [menu, setMenu] = useState(false);
  const [foto, setFoto] = useState(0);

  if (!pub) {
    return (
      <>
        <Cabecera titulo="Publicación" volverA="/comunidad" />
        <main className="pagina pagina-sin-barra">
          <EstadoVacio
            titulo="Esta publicación ya no está"
            texto="Puede que la autora la haya borrado o que esté en revisión."
            accion={<Link href="/comunidad" className="boton boton-secundario">Volver a la comunidad</Link>}
          />
        </main>
      </>
    );
  }

  const esPregunta = pub.tipo === "pregunta";
  const sinFoto = pub.medios.length === 0;

  return (
    <>
      <Cabecera
        titulo={
          <span className={estilos.titulo}>
            <b>{pub.autora.alias}</b>
            <span className="mini texto-3">{esPregunta ? "pregunta" : "publicación"}</span>
          </span>
        }
        derecha={
          <button className="boton-icono boton-icono-blanco" aria-label="Más opciones" onClick={() => setMenu(true)}>
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <main className={`pagina pagina-sin-barra ${estilos.pagina}`}>
        {pub.enRevision && <AvisoRevision />}

        {!sinFoto && (
          <div className={estilos.carrusel}>
            <div
              className={estilos.pista}
              onScroll={(e) => {
                const el = e.currentTarget;
                setFoto(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {pub.medios.map((m, i) => (
                <div key={i} className={estilos.diapositiva}>
                  <MedioVista medio={m} />
                </div>
              ))}
            </div>
            {pub.medios.length > 1 && (
              <span className={estilos.contador}>
                {foto + 1}/{pub.medios.length}
              </span>
            )}
          </div>
        )}

        <div className="fila">
          <AvatarAutora autora={pub.autora} tamano={36} />
          <div className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
            <b className="pequeno"><NombreAutora autora={pub.autora} /></b>
            <span className="mini texto-3">{haceCuanto(pub.creadaEn, ctx.ahora)}</span>
          </div>
          <ChipTema tema={pub.temas[0]} anonima={pub.autora.anonima} />
        </div>

        {sinFoto ? (
          <div className={`${cs.cita} ${cs[`fondo-${pub.fondo ?? (esPregunta ? "durazno" : "lila")}`]}`}>
            {!esPregunta && <span className={cs.citaComillas} aria-hidden="true">“</span>}
            <h1 className={cs.citaTexto}>{pub.texto}</h1>
          </div>
        ) : (
          <div className="columna" style={{ gap: 6 }}>
            {pub.titulo && <h1 className="titulo-m">{pub.titulo}</h1>}
            {esPregunta && <h1 className="titulo-m">{pub.texto}</h1>}
            {!esPregunta && (
              <p className={estilos.texto}>
                <TextoConTemas texto={pub.texto} />
              </p>
            )}
          </div>
        )}
        {pub.enlace && (
          <a href={pub.enlace} target="_blank" rel="noopener noreferrer" className={cs.enlaceExterno}>
            <ExternalLink size={14} /> {pub.enlace.replace(/^https?:\/\//, "")}
          </a>
        )}

        <div className={cs.acciones}>
          <button
            className={`${cs.accion} ${pub.diFlor ? cs.florActiva : ""}`}
            aria-pressed={pub.diFlor}
            aria-label={pub.diFlor ? "Quitar flor" : "Dar flor"}
            onClick={() => {
              vibrar();
              alternarFlor(`p:${pub.id}`);
            }}
          >
            <Flor activa={pub.diFlor} tamano={22} />
            <span className="num">{numeroCorto(pub.flores)} flores</span>
          </button>
          <a href="#comentar" className={cs.accion}>
            <MessageCircle size={20} /> <span className="num">{pub.numComentarios} comentarios</span>
          </a>
          <span className={cs.espaciador} />
          <button className={cs.accion} aria-label="Enviar" onClick={() => copiarEnlace(`/comunidad/p/${pub.id}`)}>
            <Send size={19} />
          </button>
          <button
            className={cs.accion}
            aria-pressed={pub.guardada}
            aria-label={pub.guardada ? "Quitar de guardados" : "Guardar"}
            onClick={() => avisar(alternarGuardado(pub.id) ? "Guardado en tu perfil" : "Quitado de guardados")}
          >
            <Bookmark size={20} fill={pub.guardada ? "currentColor" : "none"} />
          </button>
        </div>

        <hr className="separador" />

        <section className="seccion" aria-labelledby="titulo-comentarios">
          <div className="seccion-cabeza">
            <h2 id="titulo-comentarios" className="titulo-l">{esPregunta ? "Respuestas" : "Comentarios"}</h2>
            <SelectorOrden orden={orden} alCambiar={setOrden} />
          </div>
          {comentarios.length === 0 ? (
            <p className="texto-2 pequeno">Sé la primera en responder. Una palabra amable puede cambiarle el día.</p>
          ) : (
            <ListaComentarios comentarios={comentarios} ahora={ctx.ahora} alResponder={setRespondiendo} />
          )}
        </section>

        <Compositor
          id="comentar"
          publicacionId={pub.id}
          respondiendoA={respondiendo}
          alCancelarRespuesta={() => setRespondiendo(null)}
          permitirAnonima={esPregunta}
        />
      </main>
      <MenuPublicacion pub={pub} abierto={menu} alCerrar={() => setMenu(false)} alSalir="/comunidad" />
    </>
  );
}
