"use client";
// Bloques del feed: historias, reels para ti y chicas para seguir.
import Link from "next/link";
import { Play, Plus, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import { FlorOndulada } from "@/components/FormasMarca";
import { MedioVista } from "@/components/MedioVista";
import { avisar } from "@/components/Avisos";
import { useEstado } from "@/lib/almacen";
import { alternarSeguir, descartarSugerencia } from "@/lib/comunidad/acciones";
import type { GrupoHistorias, PerfilPublico, PublicacionPublica } from "@/lib/comunidad/consultas";
import { numeroCorto } from "@/lib/utilidades";
import { rutaPerfil } from "./utiles";
import estilos from "./comunidad.module.css";

export function FilaHistorias({ grupos }: { grupos: GrupoHistorias[] }) {
  const yo = useEstado((e) => e.perfil);
  const mias = grupos.find((g) => g.autora.id === "yo");
  const otras = grupos.filter((g) => g.autora.id !== "yo");
  return (
    <div className={estilos.historias} role="list" aria-label="Historias">
      <div className={estilos.historia} role="listitem">
        {mias ? (
          <Link href="/comunidad/historia/yo" aria-label="Ver tu historia">
            <Avatar ciclita={yo?.ciclita ?? "rosa"} fotoId={yo?.fotoId} tamano={64} anillo={mias.vistas ? "visto" : "nuevo"} />
          </Link>
        ) : (
          <Link href="/publicar?tipo=historia" aria-label="Subir tu historia">
            <Avatar ciclita={yo?.ciclita ?? "rosa"} fotoId={yo?.fotoId} tamano={64} mas />
          </Link>
        )}
        {mias && (
          <Link href="/publicar?tipo=historia" className={estilos.masHistoria} aria-label="Subir otra historia">
            <Plus size={14} strokeWidth={3} />
          </Link>
        )}
        <span>Tu historia</span>
      </div>
      {otras.map((g) => (
        <Link
          key={g.autora.id}
          href={`/comunidad/historia/${g.autora.id}`}
          className={estilos.historia}
          role="listitem"
          aria-label={`Historia de ${g.autora.alias}${g.vistas ? ", vista" : ""}`}
        >
          <Avatar ciclita={g.autora.ciclita} fotoId={g.autora.fotoId} tamano={64} anillo={g.vistas ? "visto" : "nuevo"} />
          <span>{g.autora.alias}</span>
        </Link>
      ))}
    </div>
  );
}

export function ReelsParaTi({ reels }: { reels: PublicacionPublica[] }) {
  if (reels.length === 0) return null;
  return (
    <section className="seccion" aria-labelledby="reels-para-ti">
      <div className={estilos.cabezaSeccion}>
        <h2 id="reels-para-ti" className={estilos.tituloSeccion}>
          Reels <em>para ti</em>
        </h2>
        <Link href="/comunidad/reels" className={estilos.enlaceSeccion}>Ver todos</Link>
      </div>
      <div className="carrusel">
        {reels.slice(0, 8).map((r) => (
          <Link key={r.id} href={`/comunidad/reels?id=${r.id}`} className={estilos.reelMini} aria-label={`Reel de ${r.autora.alias}`}>
            {r.medios[0] && <MedioVista medio={r.medios[0].tipo === "ilustracion" ? { ...r.medios[0], texto: undefined } : r.medios[0]} autoReproducir />}
            <span className={estilos.reelMiniPlay}>
              <Play size={11} fill="currentColor" aria-hidden="true" />
            </span>
            <span className={estilos.reelMiniInfo}>
              <span className={estilos.fila3}>
                <Flor tamano={13} activa={r.diFlor} /> {numeroCorto(r.flores)}
              </span>
              <span>@{r.autora.usuario ?? "anónima"}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Marco con la flor ondulada del brandbook detrás del avatar. */
function MarcoFlor({ children }: { children: React.ReactNode }) {
  return (
    <span className={estilos.marcoFlor}>
      <span aria-hidden="true">
        <FlorOndulada color="#ffdced" fondo="#ffdced" tamano={88} />
      </span>
      {children}
    </span>
  );
}

export function ChicasParaSeguir({ perfiles }: { perfiles: PerfilPublico[] }) {
  if (perfiles.length === 0) return null;
  return (
    <section className="seccion" aria-labelledby="chicas-seguir">
      <div className={estilos.cabezaSeccion}>
        <h2 id="chicas-seguir" className={estilos.tituloSeccion}>
          Chicas <em>para seguir</em>
        </h2>
        <Link href="/comunidad/buscar" className={estilos.enlaceSeccion}>Ver todas</Link>
      </div>
      <div className="carrusel">
        {perfiles.map((p) => (
          <div key={p.id} className={estilos.sugerencia}>
            <button
              className={estilos.cerrarSugerencia}
              aria-label={`Descartar sugerencia de ${p.alias}`}
              onClick={() => descartarSugerencia(p.id)}
            >
              <X size={16} />
            </button>
            <Link href={rutaPerfil(p.id)} aria-label={`Perfil de ${p.alias}`}>
              <MarcoFlor>
                <Avatar ciclita={p.ciclita} fotoId={p.fotoId} tamano={60} />
              </MarcoFlor>
            </Link>
            <b>{p.alias}</b>
            <span className={estilos.sugerenciaTemas}>{p.temas.slice(0, 2).join(" · ")}</span>
            <button
              className={estilos.botonSeguir}
              onClick={() => {
                alternarSeguir(p.id);
                avisar(`Ahora sigues a ${p.alias}`);
              }}
            >
              Seguir
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
