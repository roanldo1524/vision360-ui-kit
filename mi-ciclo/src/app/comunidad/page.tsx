"use client";
import { Fragment, useMemo } from "react";
import Link from "next/link";
import { EncabezadoComunidad } from "@/components/comunidad/EncabezadoComunidad";
import { TarjetaPost } from "@/components/comunidad/TarjetaPost";
import { ChicasParaSeguir, FilaHistorias, ReelsParaTi } from "@/components/comunidad/Secciones";
import { EstadoVacio } from "@/components/EstadoVacio";
import {
  feedPosts,
  historiasPorAutora,
  listaReels,
  sugerenciasParaSeguir,
  useContexto,
} from "@/lib/comunidad/consultas";

export default function Comunidad() {
  const ctx = useContexto();
  const posts = useMemo(() => feedPosts(ctx), [ctx]);
  const historias = useMemo(() => historiasPorAutora(ctx), [ctx]);
  const reels = useMemo(() => listaReels(ctx), [ctx]);
  const sugerencias = useMemo(() => sugerenciasParaSeguir(ctx), [ctx]);

  return (
    <main className="pagina">
      <EncabezadoComunidad />
      <FilaHistorias grupos={historias} />
      {posts.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay publicaciones"
          texto="Sé la primera en compartir un ritual, una frase o algo que te ayude en estos días."
          accion={<Link href="/publicar" className="boton boton-principal">Publicar</Link>}
        />
      ) : (
        posts.map((p, i) => (
          <Fragment key={p.id}>
            <TarjetaPost pub={p} ctx={ctx} />
            {i === 0 && <ReelsParaTi reels={reels} />}
            {i === 2 && <ChicasParaSeguir perfiles={sugerencias} />}
          </Fragment>
        ))
      )}
      {posts.length > 0 && posts.length < 3 && <ChicasParaSeguir perfiles={sugerencias} />}
    </main>
  );
}
