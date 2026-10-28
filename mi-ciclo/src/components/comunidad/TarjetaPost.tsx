"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clock, ExternalLink, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Flor } from "@/components/Flor";
import { Estrella } from "@/components/FormasMarca";
import { Avatar } from "@/components/Avatar";
import { MedioVista } from "@/components/MedioVista";
import { avisar } from "@/components/Avisos";
import { alternarFlor, alternarGuardado, alternarSeguir, comentar } from "@/lib/comunidad/acciones";
import {
  mejorComentario,
  quienesDieronFlor,
  type Contexto,
  type PublicacionPublica,
} from "@/lib/comunidad/consultas";
import { useEstado } from "@/lib/almacen";
import { haceCuanto, vibrar } from "@/lib/utilidades";
import type { Medio } from "@/lib/tipos";
import { MenuPublicacion } from "./MenuPublicacion";
import { AvatarAutora, ChipTema, copiarEnlace, NombreAutora, TextoConTemas } from "./utiles";
import estilos from "./comunidad.module.css";

export function Mosaico({ medios, alTocar }: { medios: Medio[]; alTocar?: () => void }) {
  const n = Math.min(3, medios.length);
  if (n === 0) return null;
  const clase = n === 1 ? estilos.mosaico1 : n === 2 ? estilos.mosaico2 : estilos.mosaico3;
  return (
    <button type="button" className={`${estilos.mosaico} ${clase}`} onClick={alTocar} aria-label="Abrir publicación">
      {medios.slice(0, 3).map((m, i) => (
        <div key={i} className={estilos.mosaicoCelda}>
          <MedioVista medio={m} />
        </div>
      ))}
    </button>
  );
}

export function AvisoRevision({ texto = "En revisión · solo tú la ves por ahora" }: { texto?: string }) {
  return (
    <div className={estilos.revision}>
      <Clock size={15} /> {texto}
    </div>
  );
}

interface Props {
  pub: PublicacionPublica;
  ctx: Contexto;
}

/** Post del feed: autora, mosaico o frase, flor, comentarios, enviar, guardar. */
export function TarjetaPost({ pub, ctx }: Props) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [comentario, setComentario] = useState("");
  const yo = useEstado((e) => e.perfil);
  const destacado = mejorComentario(ctx, pub.id);
  const flores = quienesDieronFlor(ctx, pub);
  const abrir = () => router.push(`/comunidad/p/${pub.id}`);
  const esCita = pub.medios.length === 0;

  const enviarComentario = () => {
    const r = comentar(pub.id, comentario);
    if (!r.ok) return avisar(r.mensaje, "error");
    setComentario("");
    avisar(r.estado === "retenida" ? r.mensaje : "Comentario publicado");
  };

  return (
    <article className={estilos.post} aria-label={`Publicación de ${pub.autora.alias}`}>
      <div className={estilos.postCabeza}>
        <AvatarAutora autora={pub.autora} />
        <div className={estilos.postAutora}>
          <div className={estilos.postNombre}>
            <NombreAutora autora={pub.autora} />
            <ChipTema tema={pub.temas[0]} anonima={pub.autora.anonima} />
          </div>
          <span className={estilos.tiempo}>{haceCuanto(pub.creadaEn, ctx.ahora)}</span>
        </div>
        {!pub.esMia && pub.autora.id && !pub.sigoAutora && (
          <button
            className={estilos.seguir}
            onClick={() => {
              alternarSeguir(pub.autora.id!);
              avisar(`Ahora sigues a ${pub.autora.alias}`);
            }}
          >
            Seguir
          </button>
        )}
        <button className="boton-icono" aria-label="Más opciones" onClick={() => setMenu(true)}>
          <MoreHorizontal size={20} strokeWidth={1.8} />
        </button>
      </div>

      {pub.enRevision && <AvisoRevision />}

      {esCita ? (
        <Link href={`/comunidad/p/${pub.id}`} className={`${estilos.cita} ${estilos[`fondo-${pub.fondo ?? "lila"}`]}`}>
          <span className={estilos.citaForma} style={{ opacity: 0.16 }} aria-hidden="true">
            <Estrella color="currentColor" tamano={150} />
          </span>
          <span className={estilos.citaComillas} aria-hidden="true">“</span>
          <p className={estilos.citaTexto}>{pub.texto}</p>
        </Link>
      ) : (
        <Mosaico medios={pub.medios} alTocar={abrir} />
      )}

      <div className={estilos.acciones}>
        <button
          className={`${estilos.accion} ${pub.diFlor ? estilos.florActiva : ""}`}
          aria-pressed={pub.diFlor}
          aria-label={pub.diFlor ? "Quitar flor" : "Dar flor"}
          onClick={() => {
            vibrar();
            alternarFlor(`p:${pub.id}`);
          }}
        >
          <Flor activa={pub.diFlor} tamano={24} />
          {esCita && pub.flores > 0 && <span className="num">{pub.flores}</span>}
        </button>
        <Link href={`/comunidad/p/${pub.id}#comentar`} className={estilos.accion} aria-label="Comentarios">
          <MessageCircle size={22} strokeWidth={1.8} />
          <span className="num">{pub.numComentarios}</span>
        </Link>
        <button className={estilos.accion} aria-label="Enviar" onClick={() => copiarEnlace(`/comunidad/p/${pub.id}`, "Enlace copiado para enviar")}>
          <Send size={21} strokeWidth={1.8} />
        </button>
        <span className={estilos.espaciador} />
        <button
          className={estilos.accion}
          aria-pressed={pub.guardada}
          aria-label={pub.guardada ? "Quitar de guardados" : "Guardar"}
          onClick={() => avisar(alternarGuardado(pub.id) ? "Guardado en tu perfil" : "Quitado de guardados")}
        >
          <Bookmark size={22} strokeWidth={1.8} fill={pub.guardada ? "currentColor" : "none"} />
        </button>
      </div>

      {!esCita && flores && (
        <div className={estilos.leDieronFlor}>
          {flores.nombres.length > 0 && (
            <span className={estilos.pila}>
              {flores.nombres.map((a) => (
                <Avatar key={a.id} ciclita={a.ciclita} fotoId={a.fotoId} tamano={22} />
              ))}
            </span>
          )}
          <span>{flores.texto}</span>
        </div>
      )}

      {!esCita && (pub.texto || pub.titulo) && (
        <p className={estilos.pie}>
          <b>{pub.autora.alias}</b>
          <TextoConTemas texto={pub.texto || pub.titulo || ""} />
        </p>
      )}
      {pub.enlace && (
        <a href={pub.enlace} target="_blank" rel="noopener noreferrer" className={estilos.enlaceExterno}>
          <ExternalLink size={14} /> {pub.enlace.replace(/^https?:\/\//, "")}
        </a>
      )}

      {pub.numComentarios > 1 && (
        <Link href={`/comunidad/p/${pub.id}`} className={estilos.verComentarios}>
          Ver los {pub.numComentarios} comentarios
        </Link>
      )}
      {destacado && (
        <p className={estilos.comentarioDestacado}>
          <b>{destacado.autora.alias}</b> {destacado.texto}
        </p>
      )}

      {!esCita && (
        <form
          className={estilos.comentarioRapido}
          onSubmit={(e) => {
            e.preventDefault();
            enviarComentario();
          }}
        >
          {yo && <Avatar ciclita={yo.ciclita} fotoId={yo.fotoId} tamano={32} />}
          <label htmlFor={`com-${pub.id}`} className="solo-lector">Agrega un comentario</label>
          <input
            id={`com-${pub.id}`}
            placeholder="Agrega un comentario…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
          />
          {comentario.trim() && (
            <button type="submit" className={estilos.publicarMini}>
              Publicar
            </button>
          )}
        </form>
      )}

      <MenuPublicacion pub={pub} abierto={menu} alCerrar={() => setMenu(false)} />
    </article>
  );
}
