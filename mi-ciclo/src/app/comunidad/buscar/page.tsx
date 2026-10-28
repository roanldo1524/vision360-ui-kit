"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Hash, Search } from "lucide-react";
import { Cabecera } from "@/components/Cabecera";
import { Avatar } from "@/components/Avatar";
import { EstadoVacio } from "@/components/EstadoVacio";
import { TarjetaPost } from "@/components/comunidad/TarjetaPost";
import { rutaPerfil } from "@/components/comunidad/utiles";
import { buscar, sugerenciasParaSeguir, useContexto } from "@/lib/comunidad/consultas";
import { numeroCorto } from "@/lib/utilidades";
import estilos from "./buscar.module.css";

function Buscador() {
  const inicial = useSearchParams().get("q") ?? "";
  const [q, setQ] = useState(inicial);
  const ctx = useContexto();
  const r = useMemo(() => buscar(ctx, q), [ctx, q]);
  const sugeridas = useMemo(() => sugerenciasParaSeguir(ctx), [ctx]);
  const vacio = q.trim() && r.perfiles.length + r.temas.length + r.publicaciones.length === 0;

  return (
    <>
      <Cabecera titulo="Buscar" volverA="/comunidad" />
      <main className="pagina" style={{ paddingTop: 4 }}>
        <label className={estilos.caja} htmlFor="buscar-comunidad">
          <Search size={20} aria-hidden="true" />
          <input
            id="buscar-comunidad"
            autoFocus
            placeholder="Busca @usuarias o #temas"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
          />
        </label>

        {!q.trim() && (
          <section className="seccion">
            <h2 className={estilos.titulo}>
              Chicas que <em>quizá te gusten</em>
            </h2>
            <ListaPerfiles perfiles={sugeridas} />
            <h2 className={estilos.titulo}>
              Explora <em>temas</em>
            </h2>
            <div className="chips">
              {["rituales", "calma", "infusiones", "cólicos", "descanso", "nutrición", "reflexión"].map((t) => (
                <button key={t} className="chip chip-borde seleccionable" onClick={() => setQ(`#${t}`)}>
                  #{t}
                </button>
              ))}
            </div>
          </section>
        )}

        {vacio && <EstadoVacio titulo="Sin resultados" texto={`No encontramos nada para “${q}”. Prueba con otro tema o usuaria.`} />}

        {r.perfiles.length > 0 && (
          <section className="seccion">
            <h2 className={estilos.titulo}>Usuarias</h2>
            <ListaPerfiles perfiles={r.perfiles} />
          </section>
        )}
        {r.temas.length > 0 && (
          <div className="chips">
            {r.temas.map((t) => (
              <button key={t} className="chip chip-borde seleccionable" onClick={() => setQ(`#${t}`)}>
                <Hash size={13} /> {t}
              </button>
            ))}
          </div>
        )}
        {r.publicaciones.length > 0 && (
          <section className="seccion">
            <h2 className={estilos.titulo}>Publicaciones</h2>
            {r.publicaciones.map((p) =>
              p.tipo === "post" ? (
                <TarjetaPost key={p.id} pub={p} ctx={ctx} />
              ) : (
                <Link key={p.id} href={p.tipo === "reel" ? `/comunidad/reels?id=${p.id}` : `/comunidad/p/${p.id}`} className="tarjeta">
                  <span className={estilos.tipo}>{p.tipo === "reel" ? "Reel" : "Pregunta"}</span>
                  <p className={estilos.textoResultado}>{p.texto}</p>
                </Link>
              ),
            )}
          </section>
        )}
      </main>
    </>
  );
}

function ListaPerfiles({ perfiles }: { perfiles: ReturnType<typeof sugerenciasParaSeguir> }) {
  if (perfiles.length === 0) return <p className="texto-2 pequeno">Ya sigues a todas las sugeridas.</p>;
  return (
    <div className={estilos.lista}>
      {perfiles.map((p) => (
        <Link key={p.id} href={rutaPerfil(p.id)} className={estilos.fila}>
          <Avatar ciclita={p.ciclita} fotoId={p.fotoId} tamano={48} />
          <span className={estilos.filaTexto}>
            <b>{p.alias}</b>
            <span>@{p.usuario} · {numeroCorto(p.seguidoras)} en su comunidad</span>
          </span>
          {p.sigo && <span className={estilos.siguiendo}>Siguiendo</span>}
        </Link>
      ))}
    </div>
  );
}

export default function Buscar() {
  return (
    <Suspense>
      <Buscador />
    </Suspense>
  );
}
