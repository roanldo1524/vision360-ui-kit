"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Camera, ChevronDown, ChevronLeft, MessageCircle, Music2, Send } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import { Ilustracion } from "@/components/Ilustracion";
import { Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { Compositor, ListaComentarios } from "@/components/comunidad/Comentarios";
import { copiarEnlace, rutaPerfil } from "@/components/comunidad/utiles";
import { alternarFlor, alternarGuardado, alternarSeguir, sumarVista } from "@/lib/comunidad/acciones";
import {
  comentariosDe,
  listaReels,
  useContexto,
  type ComentarioPublico,
  type PublicacionPublica,
} from "@/lib/comunidad/consultas";
import { useUrlMedio } from "@/lib/medios";
import { numeroCorto, vibrar } from "@/lib/utilidades";
import estilos from "./reels.module.css";

function MedioReel({ reel, visible }: { reel: PublicacionPublica; visible: boolean }) {
  const m = reel.medios[0];
  const url = useUrlMedio(m && m.tipo !== "ilustracion" ? m.ref : undefined);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible, url]);
  if (!m) return null;
  if (m.tipo === "ilustracion") return <Ilustracion id={m.ref} className={estilos.lento} />;
  if (!url) return <div className="esqueleto" style={{ width: "100%", height: "100%", borderRadius: 0 }} />;
  if (m.tipo === "video") {
    return <video ref={ref} src={url} className={estilos.video} muted loop playsInline aria-label={reel.texto} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={reel.texto} className={estilos.video} />;
}

function Reel({ reel, alComentarios }: { reel: PublicacionPublica; alComentarios: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [mas, setMas] = useState(false);
  const contada = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting && !contada.current) {
          contada.current = true;
          sumarVista(reel.id);
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reel.id]);

  const titulo = reel.medios[0]?.tipo === "ilustracion" ? reel.medios[0].texto : undefined;

  return (
    <article ref={ref} className={estilos.reel} id={`reel-${reel.id}`} aria-label={`Reel de ${reel.autora.alias}`}>
      <div className={estilos.medio}>
        <MedioReel reel={reel} visible={visible} />
      </div>
      <div className={estilos.sombra} />
      {titulo && <p className={estilos.tituloMano}>{titulo}</p>}

      <div className={estilos.lateral}>
        <button
          className={estilos.lateralBoton}
          aria-pressed={reel.diFlor}
          aria-label={reel.diFlor ? "Quitar flor" : "Dar flor"}
          onClick={() => {
            vibrar();
            alternarFlor(`p:${reel.id}`);
          }}
        >
          <Flor tamano={30} activa={reel.diFlor} />
          <span>{numeroCorto(reel.flores)}</span>
        </button>
        <button className={estilos.lateralBoton} aria-label="Comentarios" onClick={alComentarios}>
          <MessageCircle size={28} />
          <span>{reel.numComentarios}</span>
        </button>
        <button className={estilos.lateralBoton} aria-label="Enviar" onClick={() => copiarEnlace(`/comunidad/reels?id=${reel.id}`, "Enlace del reel copiado")}>
          <Send size={26} />
          <span>Enviar</span>
        </button>
        <button
          className={estilos.lateralBoton}
          aria-pressed={reel.guardada}
          aria-label={reel.guardada ? "Quitar de guardados" : "Guardar"}
          onClick={() => avisar(alternarGuardado(reel.id) ? "Reel guardado" : "Quitado de guardados")}
        >
          <Bookmark size={26} fill={reel.guardada ? "currentColor" : "none"} />
          <span>Guardar</span>
        </button>
      </div>

      <div className={estilos.info}>
        <div className={estilos.autora}>
          {reel.autora.id ? (
            <Link href={rutaPerfil(reel.autora.id)} className={estilos.autoraEnlace}>
              <Avatar ciclita={reel.autora.ciclita} fotoId={reel.autora.fotoId} tamano={34} />
              <b>{reel.autora.alias}</b>
            </Link>
          ) : (
            <span className={estilos.autoraEnlace}>
              <Avatar ciclita="anonima" tamano={34} />
              <b>anónima</b>
            </span>
          )}
          {!reel.esMia && reel.autora.id && (
            <button
              className={estilos.seguir}
              aria-pressed={reel.sigoAutora}
              onClick={() => {
                const s = alternarSeguir(reel.autora.id!);
                avisar(s ? `Ahora sigues a ${reel.autora.alias}` : `Dejaste de seguir a ${reel.autora.alias}`);
              }}
            >
              {reel.sigoAutora ? "siguiendo" : "seguir"}
            </button>
          )}
        </div>
        {reel.enRevision && <span className={estilos.revision}>En revisión · solo tú lo ves</span>}
        <button className={`${estilos.texto} ${mas ? estilos.textoAbierto : ""}`} onClick={() => setMas(!mas)}>
          {reel.texto}
          {!mas && reel.texto.length > 70 && <span className={estilos.mas}> más</span>}
        </button>
        <div className={estilos.meta}>
          {reel.temas[0] && <span className={estilos.tema}>#{reel.temas[0]}</span>}
          <span className={estilos.audio}>
            <Music2 size={13} />
            <span className={estilos.audioTexto}>{reel.audio ?? `original · ${reel.autora.alias}`}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function Reels() {
  const router = useRouter();
  const inicial = useSearchParams().get("id");
  const ctx = useContexto();
  const [filtro, setFiltro] = useState<"para-ti" | "siguiendo">("para-ti");
  const reels = useMemo(() => listaReels(ctx, filtro), [ctx, filtro]);
  const [comentariosDeId, setComentariosDeId] = useState<string | null>(null);
  const comentarios = useMemo(() => (comentariosDeId ? comentariosDe(ctx, comentariosDeId) : []), [ctx, comentariosDeId]);
  const [respondiendo, setRespondiendo] = useState<ComentarioPublico | null>(null);

  useEffect(() => {
    if (inicial) document.getElementById(`reel-${inicial}`)?.scrollIntoView({ block: "start" });
  }, [inicial]);

  return (
    <div className={estilos.contenedor}>
      <header className={estilos.cabecera}>
        <button className={estilos.icono} aria-label="Volver" onClick={() => router.push("/comunidad")}>
          <ChevronLeft size={26} />
        </button>
        <b className={estilos.marcaReels}>Reels</b>
        <div className={estilos.filtros} role="tablist">
          {(["para-ti", "siguiendo"] as const).map((f) => (
            <button key={f} role="tab" aria-selected={filtro === f} className={estilos.filtro} onClick={() => setFiltro(f)}>
              {f === "para-ti" ? "Para ti" : "Siguiendo"}
            </button>
          ))}
        </div>
        <Link href="/publicar?tipo=reel" className={estilos.icono} aria-label="Subir un reel">
          <Camera size={22} />
        </Link>
      </header>

      <div className={estilos.lista}>
        {reels.length === 0 ? (
          <div className={estilos.vacio}>
            <p className="titulo-m">{filtro === "siguiendo" ? "Las chicas que sigues aún no suben reels" : "Todavía no hay reels"}</p>
            <Link href="/publicar?tipo=reel" className="boton boton-principal">
              <Camera size={16} /> Subir el primero
            </Link>
          </div>
        ) : (
          reels.map((r, i) => (
            <div key={r.id} className={estilos.ranura}>
              <Reel reel={r} alComentarios={() => setComentariosDeId(r.id)} />
              {i === 0 && reels.length > 1 && (
                <span className={estilos.siguiente} aria-hidden="true">
                  <ChevronDown size={14} /> siguiente
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <Hoja abierta={comentariosDeId !== null} alCerrar={() => setComentariosDeId(null)} titulo="Comentarios">
        {comentarios.length === 0 ? (
          <p className="texto-2 pequeno">Sé la primera en comentar.</p>
        ) : (
          <ListaComentarios comentarios={comentarios} ahora={ctx.ahora} alResponder={setRespondiendo} />
        )}
        {comentariosDeId && (
          <Compositor publicacionId={comentariosDeId} respondiendoA={respondiendo} alCancelarRespuesta={() => setRespondiendo(null)} />
        )}
      </Hoja>
    </div>
  );
}

export default function PaginaReels() {
  return (
    <Suspense>
      <Reels />
    </Suspense>
  );
}
