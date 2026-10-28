"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import { MedioVista } from "@/components/MedioVista";
import { alternarFlor } from "@/lib/comunidad/acciones";
import { mejorComentario, type Contexto, type PublicacionPublica } from "@/lib/comunidad/consultas";
import { haceCuanto, vibrar } from "@/lib/utilidades";
import { AvisoRevision } from "./TarjetaPost";
import { AvatarAutora, NombreAutora } from "./utiles";
import estilos from "./comunidad.module.css";

/** Pregunta en "Recientes": autora, pregunta en Lora, foto opcional, mejor respuesta, contadores. */
export function TarjetaPregunta({ pub, ctx }: { pub: PublicacionPublica; ctx: Contexto }) {
  const mejor = mejorComentario(ctx, pub.id);
  return (
    <article className={estilos.pregunta}>
      <div className={estilos.postCabeza}>
        <AvatarAutora autora={pub.autora} tamano={38} />
        <div className={estilos.postAutora}>
          <span className={estilos.postNombre}>
            <NombreAutora autora={pub.autora} />
          </span>
          <span className="mini texto-3">{haceCuanto(pub.creadaEn, ctx.ahora).replace(/^h/, "H")}</span>
        </div>
      </div>
      {pub.enRevision && <AvisoRevision texto="En revisión · la leerá una persona del equipo" />}
      <Link href={`/comunidad/p/${pub.id}`} className={estilos.preguntaTexto}>
        {pub.texto}
      </Link>
      {pub.medios[0] && (
        <Link href={`/comunidad/p/${pub.id}`} className={estilos.preguntaFoto}>
          <MedioVista medio={pub.medios[0]} />
        </Link>
      )}
      {mejor && (
        <Link href={`/comunidad/p/${pub.id}`} className={estilos.mejorRespuesta}>
          <Avatar ciclita={mejor.autora.ciclita} fotoId={mejor.autora.fotoId} tamano={24} />
          <span>
            <b>{mejor.autora.alias}</b> {mejor.texto}
          </span>
        </Link>
      )}
      <div className={estilos.contadores}>
        <Link href={`/comunidad/p/${pub.id}#comentar`} className={estilos.contador}>
          <MessageCircle size={14} /> {pub.numComentarios} {pub.numComentarios === 1 ? "respuesta" : "respuestas"}
        </Link>
        <button
          className={estilos.contador}
          aria-pressed={pub.diFlor}
          onClick={() => {
            vibrar();
            alternarFlor(`p:${pub.id}`);
          }}
        >
          <Flor tamano={15} activa={pub.diFlor} /> {pub.flores} flores
        </button>
      </div>
    </article>
  );
}
