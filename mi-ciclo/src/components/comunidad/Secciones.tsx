"use client";
// Bloques del feed: historias, reels para ti y chicas para seguir.
import Link from "next/link";
import { Play, Plus, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
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
            <Avatar ciclita={yo?.ciclita ?? "rosa"} fotoId={yo?.fotoId} tamano={66} anillo={mias.vistas ? "visto" : "nuevo"} />
          </Link>
        ) : (
          <Link href="/publicar?tipo=historia" aria-label="Subir tu historia">
            <Avatar ciclita={yo?.ciclita ?? "rosa"} fotoId={yo?.fotoId} tamano={66} mas />
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
          <Avatar ciclita={g.autora.ciclita} fotoId={g.autora.fotoId} tamano={66} anillo={g.vistas ? "visto" : "nuevo"} />
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
      <div className="seccion-cabeza">
        <h2 id="reels-para-ti" className="titulo-s">reels para ti</h2>
        <Link href="/comunidad/reels" className="enlace-vino texto-2">ver todos</Link>
      </div>
      <div className="carrusel">
        {reels.slice(0, 8).map((r) => (
          <Link key={r.id} href={`/comunidad/reels?id=${r.id}`} className={estilos.reelMini} aria-label={`Reel de ${r.autora.alias}`}>
            {r.medios[0] && <MedioVista medio={r.medios[0].tipo === "ilustracion" ? { ...r.medios[0], texto: undefined } : r.medios[0]} autoReproducir />}
            <span className={estilos.reelMiniPlay}>
              <Play size={11} fill="currentColor" />
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

function MarcoFlor({ children }: { children: React.ReactNode }) {
  const petalos = Array.from({ length: 8 });
  return (
    <span className={estilos.marcoFlor}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {petalos.map((_, i) => (
          <circle key={i} cx={50 + 33 * Math.cos((i * Math.PI) / 4)} cy={50 + 33 * Math.sin((i * Math.PI) / 4)} r="17" fill="#fde3e9" />
        ))}
        <circle cx="50" cy="50" r="36" fill="#fde3e9" />
      </svg>
      {children}
    </span>
  );
}

export function ChicasParaSeguir({ perfiles }: { perfiles: PerfilPublico[] }) {
  if (perfiles.length === 0) return null;
  return (
    <section className="seccion" aria-labelledby="chicas-seguir">
      <div className="seccion-cabeza">
        <h2 id="chicas-seguir" className="titulo-s">Chicas para seguir</h2>
        <Link href="/comunidad/buscar" className="enlace-rojo">Ver todas</Link>
      </div>
      <div className="carrusel">
        {perfiles.map((p) => (
          <div key={p.id} className={estilos.sugerencia}>
            <button
              className={estilos.cerrarSugerencia}
              aria-label={`Descartar sugerencia de ${p.alias}`}
              onClick={() => descartarSugerencia(p.id)}
            >
              <X size={15} />
            </button>
            <Link href={rutaPerfil(p.id)} aria-label={`Perfil de ${p.alias}`}>
              <MarcoFlor>
                <Avatar ciclita={p.ciclita} fotoId={p.fotoId} tamano={62} />
              </MarcoFlor>
            </Link>
            <b className="pequeno">{p.alias}</b>
            <span className="mini texto-3">{p.temas.slice(0, 2).join(" · ")}</span>
            <button
              className={estilos.botonSeguir}
              onClick={() => {
                alternarSeguir(p.id);
                avisar(`Ahora sigues a ${p.alias}`);
              }}
            >
              seguir
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
