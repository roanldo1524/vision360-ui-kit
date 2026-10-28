"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  Bookmark,
  Camera,
  Copy,
  Flag,
  Grid2x2,
  Layers,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Ciclita, CICLITAS, CICLITAS_ELEGIBLES } from "@/components/Ciclita";
import { Flor } from "@/components/Flor";
import { Ilustracion, ILUSTRACIONES } from "@/components/Ilustracion";
import { MedioVista } from "@/components/MedioVista";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Confirmar, Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { useEstado } from "@/lib/almacen";
import { actualizarPerfil } from "@/lib/acciones";
import { agregarDestacada, alternarSeguir, bloquear, desbloquear, reportar } from "@/lib/comunidad/acciones";
import {
  guardadas,
  historiasPorAutora,
  perfilPublico,
  publicacionesDe,
  useContexto,
  type PublicacionPublica,
} from "@/lib/comunidad/consultas";
import { MOTIVOS_REPORTE } from "@/lib/comunidad/moderacion";
import { comprimirFoto, guardarMedio } from "@/lib/medios";
import { numeroCorto } from "@/lib/utilidades";
import type { CiclitaId } from "@/lib/tipos";
import { TarjetaPregunta } from "./TarjetaPregunta";
import { copiarEnlace } from "./utiles";
import cs from "./comunidad.module.css";
import estilos from "./perfil.module.css";

type Pestana = "posts" | "reels" | "preguntas" | "guardados";

function Mosaico({ pubs }: { pubs: PublicacionPublica[] }) {
  return (
    <div className={estilos.mosaico}>
      {pubs.map((p, i) => (
        <Link
          key={p.id}
          href={`/comunidad/p/${p.id}`}
          className={estilos.celda}
          style={{ aspectRatio: i % 3 === 0 ? "4 / 5" : "1 / 1" }}
          aria-label={p.titulo ?? p.texto.slice(0, 40)}
        >
          {p.medios[0] ? (
            <MedioVista medio={p.medios[0]} />
          ) : (
            <span className={`${estilos.celdaTexto} ${cs[`fondo-${p.fondo ?? "lila"}`]}`}>{p.texto}</span>
          )}
          {p.medios.length > 1 && (
            <span className={estilos.multiple}>
              <Layers size={14} />
            </span>
          )}
          {p.enRevision && <span className={estilos.enRevision}>En revisión</span>}
        </Link>
      ))}
    </div>
  );
}

export function VistaPerfil({ id }: { id: string }) {
  const router = useRouter();
  const ctx = useContexto();
  const perfil = useMemo(() => perfilPublico(ctx, id), [ctx, id]);
  const posts = useMemo(() => publicacionesDe(ctx, id, "post"), [ctx, id]);
  const reels = useMemo(() => publicacionesDe(ctx, id, "reel"), [ctx, id]);
  const preguntas = useMemo(() => publicacionesDe(ctx, id, "pregunta"), [ctx, id]);
  const misGuardadas = useMemo(() => (id === "yo" ? guardadas(ctx) : []), [ctx, id]);
  const tieneHistoria = useMemo(() => historiasPorAutora(ctx).find((g) => g.autora.id === id), [ctx, id]);
  const bloqueadas = useMemo(() => ctx.c.perfiles.filter((p) => ctx.c.bloqueos.includes(p.id)), [ctx]);
  const moderadora = useEstado((e) => e.moderadora);
  const [pestana, setPestana] = useState<Pestana>("posts");
  const [hoja, setHoja] = useState<null | "menu" | "editar" | "destacada" | "reportar" | "bloquear" | "bloqueadas">(null);

  if (!perfil) {
    return <EstadoVacio titulo="Este perfil no existe" texto="Puede que la usuaria haya eliminado su cuenta." />;
  }
  if (perfil.suspendida && !perfil.esYo) {
    return <EstadoVacio titulo="Perfil no disponible" texto="Esta cuenta está suspendida por no cumplir las normas de la comunidad." />;
  }
  if (perfil.bloqueada) {
    return (
      <EstadoVacio
        titulo={`Bloqueaste a ${perfil.alias}`}
        texto="No ves su contenido y ella no ve el tuyo."
        accion={
          <button className="boton boton-secundario" onClick={() => { desbloquear(perfil.id); avisar("Desbloqueada"); }}>
            Desbloquear
          </button>
        }
      />
    );
  }

  const PESTANAS: { id: Pestana; Icono: typeof Grid2x2; etiqueta: string }[] = [
    { id: "posts", Icono: Grid2x2, etiqueta: "Publicaciones" },
    { id: "reels", Icono: Play, etiqueta: "Reels" },
    { id: "preguntas", Icono: MessageCircle, etiqueta: "Preguntas" },
    ...(perfil.esYo ? [{ id: "guardados" as Pestana, Icono: Bookmark, etiqueta: "Guardados" }] : []),
  ];

  return (
    <>
      <section className={estilos.cabeza}>
        {perfil.esYo && (
          <button className={`boton-icono ${estilos.masOpciones}`} aria-label="Opciones del perfil" onClick={() => setHoja("menu")}>
            <MoreHorizontal size={20} />
          </button>
        )}
        <div className={estilos.filaDatos}>
          <div className={estilos.avatarZona}>
            {tieneHistoria ? (
              <Link href={`/comunidad/historia/${id}`} aria-label="Ver historia">
                <Avatar ciclita={perfil.ciclita} fotoId={perfil.fotoId} tamano={84} anillo={tieneHistoria.vistas ? "visto" : "nuevo"} nombre={perfil.alias} />
              </Link>
            ) : (
              <Avatar ciclita={perfil.ciclita} fotoId={perfil.fotoId} tamano={84} anillo="nuevo" nombre={perfil.alias} />
            )}
            {perfil.esYo && (
              <Link href="/publicar?tipo=historia" className={estilos.masAvatar} aria-label="Subir historia">
                <Plus size={14} strokeWidth={3} />
              </Link>
            )}
          </div>
          <dl className={estilos.numeros}>
            <div>
              <dt className="num">{numeroCorto(perfil.publicaciones)}</dt>
              <dd>publicaciones</dd>
            </div>
            <div>
              <dt className="num">{numeroCorto(perfil.seguidoras)}</dt>
              <dd>comunidad</dd>
            </div>
            <div>
              <dt className="num">
                <Flor tamano={13} activa /> {numeroCorto(perfil.floresRecibidas)}
              </dt>
              <dd>flores</dd>
            </div>
          </dl>
        </div>

        <div className={estilos.nombreFila}>
          <div className="columna" style={{ gap: 0, minWidth: 0, flex: 1 }}>
            <h1 className="titulo-s">{perfil.alias}</h1>
            <span className="mini texto-3">@{perfil.usuario}</span>
          </div>
          {!perfil.esYo && (
            <div className="fila" style={{ gap: 6 }}>
              <button
                className={`boton boton-chico ${perfil.sigo ? "boton-secundario" : "boton-principal"}`}
                aria-pressed={perfil.sigo}
                onClick={() => {
                  const sigue = alternarSeguir(perfil.id);
                  avisar(sigue ? `Ahora sigues a ${perfil.alias}` : `Dejaste de seguir a ${perfil.alias}`);
                }}
              >
                {perfil.sigo ? "Siguiendo" : "Seguir"}
              </button>
              <button
                className="boton-icono boton-icono-blanco"
                aria-label="Enviar perfil"
                onClick={() => copiarEnlace(`/comunidad/u/${perfil.id}`, "Enlace del perfil copiado")}
              >
                <Send size={17} />
              </button>
            </div>
          )}
        </div>
        {perfil.bio && <p className={estilos.bio}>{perfil.bio}</p>}

        <div className={estilos.destacadas}>
          {perfil.esYo && (
            <button className={estilos.destacada} onClick={() => setHoja("destacada")}>
              <span className={estilos.destacadaNueva}>
                <Plus size={20} />
              </span>
              <span>Nueva</span>
            </button>
          )}
          {(perfil.destacadas ?? []).map((d, i) => (
            <div key={i} className={estilos.destacada}>
              <span className={estilos.destacadaImagen}>
                <Ilustracion id={d.ilustracion} />
              </span>
              <span>{d.titulo}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={estilos.pestanas} role="tablist" aria-label="Contenido del perfil">
        {PESTANAS.map(({ id: pid, Icono, etiqueta }) => (
          <button
            key={pid}
            role="tab"
            aria-selected={pestana === pid}
            aria-label={etiqueta}
            className={estilos.pestana}
            onClick={() => setPestana(pid)}
          >
            <Icono size={20} />
          </button>
        ))}
      </div>

      {pestana === "posts" &&
        (posts.length ? (
          <Mosaico pubs={posts} />
        ) : (
          <EstadoVacio
            titulo={perfil.esYo ? "Aún no compartes nada" : "Todavía no hay publicaciones"}
            texto={perfil.esYo ? "Comparte un ritual o algo que te ayude. Otras chicas lo agradecerán." : `${perfil.alias} todavía no ha publicado.`}
            accion={perfil.esYo ? <Link href="/publicar" className="boton boton-principal">Publicar</Link> : undefined}
          />
        ))}
      {pestana === "reels" &&
        (reels.length ? (
          <div className={estilos.reels}>
            {reels.map((r) => (
              <Link key={r.id} href={`/comunidad/reels?id=${r.id}`} className={estilos.reel} aria-label={r.texto}>
                {r.medios[0] && <MedioVista medio={r.medios[0].tipo === "ilustracion" ? { ...r.medios[0], texto: undefined } : r.medios[0]} />}
                <span className={estilos.vistas}>
                  <Play size={12} fill="currentColor" /> {numeroCorto(r.vistas ?? 0)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EstadoVacio titulo="Sin reels" texto={perfil.esYo ? "Graba tu ritual en video y compártelo." : "Aún no ha subido reels."} accion={perfil.esYo ? <Link href="/publicar?tipo=reel" className="boton boton-secundario"><Camera size={16} /> Subir reel</Link> : undefined} />
        ))}
      {pestana === "preguntas" &&
        (preguntas.length ? (
          <div className="columna" style={{ gap: 12 }}>
            {preguntas.map((p) => (
              <TarjetaPregunta key={p.id} pub={p} ctx={ctx} />
            ))}
            {perfil.esYo && preguntas.some((p) => p.autora.anonima) && (
              <p className="mini texto-3">Tus preguntas anónimas solo las ves tú aquí. Nadie más puede saber que son tuyas.</p>
            )}
          </div>
        ) : (
          <EstadoVacio titulo="Sin preguntas" texto={perfil.esYo ? "Pregunta sin miedo, también de forma anónima." : "Aún no ha hecho preguntas."} ciclita="anonima" />
        ))}
      {pestana === "guardados" &&
        (misGuardadas.length ? <Mosaico pubs={misGuardadas} /> : <EstadoVacio titulo="Nada guardado aún" texto="Toca el marcador en una publicación para tenerla a mano aquí." />)}

      {/* ----- Hojas ----- */}
      <Hoja abierta={hoja === "menu"} alCerrar={() => setHoja(null)} titulo="Tu perfil">
        <div className={cs.opciones}>
          <button className={cs.opcion} onClick={() => setHoja("editar")}>
            <Pencil size={18} /> Editar perfil
          </button>
          <button className={cs.opcion} onClick={() => { copiarEnlace("/comunidad/u/yo", "Enlace de tu perfil copiado"); setHoja(null); }}>
            <Copy size={18} /> Copiar enlace de mi perfil
          </button>
          <button className={cs.opcion} onClick={() => setHoja("bloqueadas")}>
            <Ban size={18} /> Cuentas bloqueadas ({bloqueadas.length})
          </button>
          <button className={cs.opcion} onClick={() => router.push("/admin")}>
            <ShieldCheck size={18} /> {moderadora ? "Panel de moderación" : "Moderación (equipo)"}
          </button>
        </div>
      </Hoja>

      {perfil.esYo && hoja === "editar" && <EditarPerfil alCerrar={() => setHoja(null)} />}

      {perfil.esYo && hoja === "destacada" && <NuevaDestacada alCerrar={() => setHoja(null)} />}

      <Hoja abierta={hoja === "bloqueadas"} alCerrar={() => setHoja(null)} titulo="Cuentas bloqueadas">
        {bloqueadas.length === 0 ? (
          <p className="texto-2 pequeno">No has bloqueado a nadie.</p>
        ) : (
          <div className="lista">
            {bloqueadas.map((b) => (
              <div key={b.id} className="lista-item">
                <Ciclita id={b.ciclita} tamano={36} />
                <span className="lista-texto">
                  <b>{b.alias}</b>
                  <span className="mini texto-3">@{b.usuario}</span>
                </span>
                <button className="boton boton-chico boton-secundario" onClick={() => { desbloquear(b.id); avisar("Desbloqueada"); }}>
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        )}
      </Hoja>

      {!perfil.esYo && (
        <>
          <Hoja abierta={hoja === "reportar"} alCerrar={() => setHoja(null)} titulo={`Reportar a ${perfil.alias}`}>
            <div className={cs.opciones}>
              {MOTIVOS_REPORTE.map((m) => (
                <button
                  key={m}
                  className={cs.opcion}
                  onClick={() => {
                    // se reporta su publicación más reciente para que llegue a la cola con contexto
                    const ultima = posts[0] ?? preguntas[0] ?? reels[0];
                    if (ultima) reportar({ tipo: "publicacion", id: ultima.id }, `Perfil: ${m}`);
                    avisar("Gracias. El equipo revisará este perfil.");
                    setHoja(null);
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </Hoja>
          <Confirmar
            abierta={hoja === "bloquear"}
            titulo={`¿Bloquear a ${perfil.alias}?`}
            texto="No verás nada de lo que publique y ella no sabrá que la bloqueaste."
            accion="Bloquear"
            peligro
            alConfirmar={() => {
              bloquear(perfil.id);
              avisar("Bloqueada");
              router.push("/comunidad");
            }}
            alCerrar={() => setHoja(null)}
          />
        </>
      )}
    </>
  );
}

/** Menú "···" de la cabecera de un perfil ajeno. */
export function MenuPerfilAjeno({ alReportar, alBloquear }: { alReportar: () => void; alBloquear: () => void }) {
  return (
    <div className={cs.opciones}>
      <button className={cs.opcion} onClick={alReportar}>
        <Flag size={18} /> Reportar
      </button>
      <button className={`${cs.opcion} ${cs.opcionPeligro}`} onClick={alBloquear}>
        <Ban size={18} /> Bloquear
      </button>
    </div>
  );
}

function EditarPerfil({ alCerrar }: { alCerrar: () => void }) {
  const perfil = useEstado((e) => e.perfil);
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [usuario, setUsuario] = useState(perfil?.usuario ?? "");
  const [bio, setBio] = useState(perfil?.bio ?? "");
  const [ciclita, setCiclita] = useState<CiclitaId>(perfil?.ciclita ?? "rosa");
  const [fotoId, setFotoId] = useState<string | undefined>(perfil?.fotoId);
  const [subiendo, setSubiendo] = useState(false);
  const usuarioValido = /^[a-z0-9._]{3,24}$/.test(usuario);

  return (
    <Hoja abierta alCerrar={alCerrar} titulo="Editar perfil">
      <div className="fila" style={{ gap: 14 }}>
        <Avatar ciclita={ciclita} fotoId={fotoId} tamano={64} />
        <div className="columna" style={{ gap: 6 }}>
          <label className="boton boton-secundario boton-chico" htmlFor="foto-perfil">
            <Camera size={15} /> {subiendo ? "Subiendo…" : "Subir foto"}
          </label>
          <input
            id="foto-perfil"
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setSubiendo(true);
              try {
                setFotoId(await guardarMedio(await comprimirFoto(f, 600)));
              } catch {
                avisar("No pudimos leer esa foto. Prueba con otra.", "error");
              }
              setSubiendo(false);
            }}
          />
          {fotoId && (
            <button className="enlace-vino" onClick={() => setFotoId(undefined)}>
              <Trash2 size={13} /> Usar mi Ciclita
            </button>
          )}
        </div>
      </div>
      <span className="etiqueta">Tu Ciclita</span>
      <div className="fila" style={{ flexWrap: "wrap", gap: 8 }}>
        {CICLITAS_ELEGIBLES.map((c) => (
          <button
            key={c}
            className={estilos.ciclitaOpcion}
            aria-pressed={ciclita === c}
            aria-label={CICLITAS[c].nombre}
            onClick={() => setCiclita(c)}
          >
            <Ciclita id={c} tamano={44} />
          </button>
        ))}
      </div>
      <div className="campo">
        <label htmlFor="perfil-nombre">Nombre</label>
        <input id="perfil-nombre" className="entrada" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={30} />
      </div>
      <div className="campo">
        <label htmlFor="perfil-usuario">Usuario</label>
        <input
          id="perfil-usuario"
          className="entrada"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value.toLowerCase().replace(/\s/g, ""))}
          maxLength={24}
        />
        {!usuarioValido && <span className="error-campo">Entre 3 y 24 caracteres: letras, números, punto o guion bajo.</span>}
      </div>
      <div className="campo">
        <label htmlFor="perfil-bio">Biografía</label>
        <textarea id="perfil-bio" className="entrada" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} />
        <span className="ayuda">{bio.length}/150 · No compartas datos de tu ciclo ni de salud aquí.</span>
      </div>
      <button
        className="boton boton-principal boton-ancho"
        disabled={!nombre.trim() || !usuarioValido}
        onClick={() => {
          actualizarPerfil({ nombre: nombre.trim(), usuario, bio: bio.trim(), ciclita, fotoId });
          avisar("Perfil actualizado");
          alCerrar();
        }}
      >
        Guardar
      </button>
    </Hoja>
  );
}

function NuevaDestacada({ alCerrar }: { alCerrar: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [ilustracion, setIlustracion] = useState<string>("taza");
  return (
    <Hoja abierta alCerrar={alCerrar} titulo="Nueva destacada">
      <div className="campo">
        <label htmlFor="destacada-titulo">Nombre</label>
        <input id="destacada-titulo" className="entrada" placeholder="Rituales, Cólicos, Calma…" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={14} />
      </div>
      <span className="etiqueta">Portada</span>
      <div className={estilos.portadas}>
        {ILUSTRACIONES.map((i) => (
          <button key={i} className={estilos.portada} aria-pressed={ilustracion === i} aria-label={i} onClick={() => setIlustracion(i)}>
            <Ilustracion id={i} />
          </button>
        ))}
      </div>
      <button
        className="boton boton-principal boton-ancho"
        disabled={!titulo.trim()}
        onClick={() => {
          agregarDestacada(titulo, ilustracion);
          avisar("Destacada creada");
          alCerrar();
        }}
      >
        Crear destacada
      </button>
    </Hoja>
  );
}
