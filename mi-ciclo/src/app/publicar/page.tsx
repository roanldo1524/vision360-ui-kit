"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Check, ChevronDown, ChevronLeft, EyeOff, ImagePlus, Link2, Play, X } from "lucide-react";
import { Ciclita } from "@/components/Ciclita";
import { Flor } from "@/components/Flor";
import { Estrella, FlorLuna, FlorOndulada } from "@/components/FormasMarca";
import { Ilustracion } from "@/components/Ilustracion";
import { MedioVista } from "@/components/MedioVista";
import { avisar } from "@/components/Avisos";
import { publicar, type ResultadoPublicar } from "@/lib/comunidad/acciones";
import { comprimirFoto, guardarMedio } from "@/lib/medios";
import type { FondoPregunta, Medio, TipoPublicacion } from "@/lib/tipos";
import { extraerTemas } from "@/lib/utilidades";
import estilos from "./publicar.module.css";

const TIPOS: { id: TipoPublicacion; etiqueta: string }[] = [
  { id: "post", etiqueta: "Post" },
  { id: "pregunta", etiqueta: "Pregunta" },
  { id: "historia", etiqueta: "Historia" },
  { id: "reel", etiqueta: "Reel" },
];

const MAXIMO: Record<TipoPublicacion, number> = { post: 3, historia: 1, reel: 1, pregunta: 1 };
const FONDOS: FondoPregunta[] = ["lila", "rosa", "menta", "durazno"];
// Los ids se conservan; los colores son los del brandbook
const NOMBRE_FONDO: Record<FondoPregunta, string> = {
  lila: "Violeta",
  rosa: "Rosa",
  menta: "Violeta oscuro",
  durazno: "Rojo Coral",
};
const LIMITE_VIDEO = 60 * 1024 * 1024;

const GALERIA: Medio[] = [
  { tipo: "ilustracion", ref: "taza" },
  { tipo: "ilustracion", ref: "antifaz" },
  { tipo: "ilustracion", ref: "cuaderno", texto: "Pequeñas rutinas, grandes cambios." },
  { tipo: "ilustracion", ref: "bolsa" },
  { tipo: "ilustracion", ref: "infusion" },
  { tipo: "ilustracion", ref: "velas" },
  { tipo: "ilustracion", ref: "atardecer" },
  { tipo: "ilustracion", ref: "cuaderno", texto: "Cada fase también tiene su magia." },
  { tipo: "ilustracion", ref: "manta" },
];

const clave = (m: Medio) => (m.tipo === "ilustracion" ? `i:${m.ref}:${m.texto ?? ""}` : `m:${m.ref}`);

function esTipo(t: string | null): t is TipoPublicacion {
  return t === "post" || t === "pregunta" || t === "historia" || t === "reel";
}

function Publicar() {
  const router = useRouter();
  const param = useSearchParams().get("tipo");
  const [tipo, setTipo] = useState<TipoPublicacion>(esTipo(param) ? param : "post");
  const [paso, setPaso] = useState<"elegir" | "detalles" | "exito">("elegir");
  const [seleccion, setSeleccion] = useState<Medio[]>([]);
  const [subidas, setSubidas] = useState<Medio[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [enlace, setEnlace] = useState("");
  const [anonima, setAnonima] = useState(false);
  const [fondo, setFondo] = useState<FondoPregunta>("lila");
  const [resultado, setResultado] = useState<ResultadoPublicar | null>(null);

  const maximo = MAXIMO[tipo];
  const cerrar = () => router.push("/comunidad");
  const cambiarTipo = (t: TipoPublicacion) => {
    setTipo(t);
    setPaso("elegir");
    setSeleccion((s) => s.filter((m) => t !== "historia" || m.tipo !== "video").slice(0, MAXIMO[t]));
    if (t === "historia" || t === "reel") setAnonima(false);
  };

  const alternar = (m: Medio) => {
    const k = clave(m);
    setSeleccion((s) => {
      if (s.some((x) => clave(x) === k)) return s.filter((x) => clave(x) !== k);
      if (maximo === 1) return [m];
      if (s.length >= maximo) {
        avisar(`Puedes elegir hasta ${maximo} fotos`);
        return s;
      }
      return [...s, m];
    });
  };

  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setSubiendo(true);
    const nuevos: Medio[] = [];
    for (const f of Array.from(archivos).slice(0, maximo)) {
      try {
        if (f.type.startsWith("video/")) {
          if (tipo !== "reel") {
            avisar("Los videos se suben como reel.", "error");
            continue;
          }
          if (f.size > LIMITE_VIDEO) {
            avisar("El video pesa más de 60 MB. Recórtalo o grábalo más corto.", "error");
            continue;
          }
          nuevos.push({ tipo: "video", ref: await guardarMedio(f) });
        } else if (f.type.startsWith("image/")) {
          nuevos.push({ tipo: "foto", ref: await guardarMedio(await comprimirFoto(f)) });
        }
      } catch {
        avisar("No pudimos leer ese archivo. Prueba con otro.", "error");
      }
    }
    setSubidas((s) => [...nuevos, ...s]);
    setSeleccion((s) => (maximo === 1 ? nuevos.slice(0, 1) : [...s, ...nuevos].slice(0, maximo)));
    setSubiendo(false);
  };

  const compartir = () => {
    const r = publicar({
      tipo,
      texto,
      titulo: tipo === "post" ? titulo : undefined,
      enlace: tipo === "post" ? enlace : undefined,
      anonima: tipo === "post" || tipo === "pregunta" ? anonima : false,
      fondo: tipo === "pregunta" ? fondo : tipo === "post" && seleccion.length === 0 ? "lila" : undefined,
      medios:
        tipo === "historia" && seleccion[0]?.tipo === "ilustracion" && texto.trim()
          ? [{ ...seleccion[0], texto: undefined }]
          : seleccion,
    });
    if (!r.ok) return avisar(r.mensaje, "error");
    setResultado(r);
    setPaso("exito");
  };

  const enlaceValido = !enlace.trim() || /^https?:\/\/\S+\.\S+/.test(enlace.trim());

  // ---------- Éxito ----------
  if (paso === "exito" && resultado) {
    const retenida = resultado.estado === "retenida";
    return (
      <main className={`pagina pagina-sin-barra ${estilos.exito}`}>
        <div className={estilos.exitoMarca} aria-hidden="true">
          <FlorOndulada color={retenida ? "#f3e2fb" : "#ffdced"} fondo={retenida ? "#f3e2fb" : "#ffdced"} tamano={168} />
          <Ciclita id={retenida ? "lila" : "flor"} tamano={104} feliz />
        </div>
        <h1 className={estilos.exitoTitulo}>
          {retenida ? (
            <>
              Ya casi <em>está lista</em>
            </>
          ) : (
            <>
              Ya está <em>en la comunidad</em>
            </>
          )}
        </h1>
        <p className={estilos.exitoTexto}>
          {retenida
            ? resultado.mensaje
            : "Gracias por compartir. Lo que cuentas puede acompañar a otra chica que lo necesita hoy."}
        </p>
        {resultado.petalos ? (
          <span className={estilos.petalos}>
            <Flor activa tamano={16} /> +{resultado.petalos} pétalos por compartir
          </span>
        ) : null}
        <div className="columna" style={{ width: "100%", maxWidth: 320, marginTop: 8 }}>
          <Link
            href={
              tipo === "historia"
                ? "/comunidad/historia/yo"
                : tipo === "reel"
                  ? `/comunidad/reels?id=${resultado.id}`
                  : `/comunidad/p/${resultado.id}`
            }
            className="boton boton-principal boton-ancho"
          >
            {retenida ? "Ver cómo quedó" : "Verla en la comunidad"}
          </Link>
          <Link href="/comunidad" className="boton boton-secundario boton-ancho">
            Volver a la comunidad
          </Link>
        </div>
      </main>
    );
  }

  const selector = (
    <div className={estilos.selector} role="tablist" aria-label="Qué quieres publicar">
      {TIPOS.map((t) => (
        <button key={t.id} role="tab" aria-selected={tipo === t.id} onClick={() => cambiarTipo(t.id)}>
          {t.etiqueta}
        </button>
      ))}
    </div>
  );

  // ---------- Pregunta ----------
  if (tipo === "pregunta") {
    return (
      <div className={estilos.pantalla}>
        <header className={estilos.barra}>
          <button className="boton-icono" aria-label="Cerrar" onClick={cerrar}>
            <X size={22} />
          </button>
          <b>Nueva pregunta</b>
          <button className={estilos.siguiente} disabled={texto.trim().length < 5} onClick={compartir}>
            Publicar
          </button>
        </header>
        <main className={estilos.cuerpo}>
          <div className={`${estilos.lienzoPregunta} ${estilos[`fondo-${fondo}`]}`}>
            <span className={estilos.lienzoForma} aria-hidden="true">
              <Estrella color="currentColor" tamano={190} />
            </span>
            {anonima && <Ciclita id="anonima" tamano={52} />}
            <label htmlFor="texto-pregunta" className="solo-lector">Tu pregunta</label>
            <textarea
              id="texto-pregunta"
              className={estilos.textoPregunta}
              placeholder="¿Qué quieres preguntarle a la comunidad?"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={280}
              autoFocus
            />
            <span className={estilos.contadorTexto}>{texto.length}/280</span>
          </div>
          <div className={estilos.filaColor}>
            <span>Color de fondo</span>
            <div className="fila" style={{ gap: 8 }}>
              {FONDOS.map((f) => (
                <button
                  key={f}
                  className={`${estilos.punto} ${estilos[`fondo-${f}`]}`}
                  aria-pressed={fondo === f}
                  aria-label={`Fondo ${NOMBRE_FONDO[f]}`}
                  onClick={() => setFondo(f)}
                >
                  {fondo === f && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
          <FilaAnonima anonima={anonima} alCambiar={setAnonima} texto="Preguntar como anónima" />
          <p className={estilos.ayudaPequena}>
            Las preguntas anónimas las lee una persona del equipo antes de salir. Nadie más puede saber que son tuyas.
          </p>
          <button className="boton boton-principal boton-ancho" disabled={texto.trim().length < 5} onClick={compartir}>
            Publicar pregunta
          </button>
        </main>
        {selector}
      </div>
    );
  }

  // ---------- Detalles (post, historia, reel) ----------
  if (paso === "detalles") {
    const temas = extraerTemas(`${titulo} ${texto}`);
    return (
      <div className={estilos.pantalla}>
        <header className={estilos.barra}>
          <button className="boton-icono" aria-label="Volver a elegir fotos" onClick={() => setPaso("elegir")}>
            <ChevronLeft size={24} />
          </button>
          <b>{tipo === "historia" ? "Tu historia" : tipo === "reel" ? "Nuevo reel" : "Nueva publicación"}</b>
          <span />
        </header>
        <main className={estilos.cuerpo}>
          {tipo === "historia" ? (
            <div className={estilos.previaHistoria}>
              {seleccion[0] && <MedioVista medio={seleccion[0].tipo === "ilustracion" && texto.trim() ? { ...seleccion[0], texto: undefined } : seleccion[0]} />}
              {texto.trim() && <p className={estilos.textoMano}>{texto}</p>}
            </div>
          ) : (
            <div className={estilos.miniaturas}>
              {seleccion.map((m) => (
                <span key={clave(m)} className={estilos.miniatura}>
                  <MedioVista medio={m} />
                </span>
              ))}
              {seleccion.length === 0 && (
                <span className={`${estilos.miniatura} ${estilos.miniaturaVacia}`}>Solo texto</span>
              )}
            </div>
          )}

          {tipo === "post" && (
            <div className="campo">
              <label htmlFor="titulo">Título (opcional)</label>
              <input id="titulo" className="entrada" placeholder="Mi kit de los días difíciles" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} />
            </div>
          )}
          <div className="campo">
            <label htmlFor="pie">{tipo === "historia" ? "Texto sobre la foto (opcional)" : tipo === "reel" ? "Descripción" : "Pie de foto"}</label>
            {tipo === "historia" ? (
              <input id="pie" className="entrada" placeholder="Mi ritual de domingo" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={60} />
            ) : (
              <textarea
                id="pie"
                className="entrada"
                placeholder="Cuenta qué te ayuda. Usa #temas como #rituales o #calma"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                maxLength={1200}
              />
            )}
            {tipo !== "historia" && temas.length > 0 && (
              <div className="chips">
                {temas.map((t) => (
                  <span key={t} className="chip chip-lila">#{t}</span>
                ))}
              </div>
            )}
          </div>
          {tipo === "post" && (
            <>
              <div className="campo">
                <label htmlFor="enlace">Enlace (opcional)</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="enlace"
                    className="entrada"
                    style={{ paddingLeft: 40 }}
                    inputMode="url"
                    placeholder="https://"
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                  />
                  <Link2 size={17} style={{ position: "absolute", left: 14, top: 15, color: "var(--texto-3)" }} />
                </div>
                {!enlaceValido && <span className="error-campo">Escribe el enlace completo, empezando por https://</span>}
              </div>
              <FilaAnonima anonima={anonima} alCambiar={setAnonima} texto="Publicar como anónima" />
            </>
          )}
          {tipo === "historia" && <p className={estilos.ayudaPequena}>Tu historia desaparece a las 24 horas.</p>}
          <p className={estilos.ayudaPequena}>
            No compartas datos de salud de otras personas. Las fotos de personas solo con su permiso.
          </p>
          <button
            className="boton boton-principal boton-ancho"
            disabled={!enlaceValido || (seleccion.length === 0 && !texto.trim())}
            onClick={compartir}
          >
            {tipo === "historia" ? "Compartir historia" : tipo === "reel" ? "Publicar reel" : "Compartir"}
          </button>
        </main>
      </div>
    );
  }

  // ---------- Elegir fotos ----------
  const previa = seleccion[seleccion.length - 1];
  const galeria = [...subidas, ...GALERIA];
  return (
    <div className={estilos.pantalla}>
      <header className={estilos.barra}>
        <button className="boton-icono" aria-label="Cerrar" onClick={cerrar}>
          <X size={22} />
        </button>
        <b>{tipo === "historia" ? "Nueva historia" : tipo === "reel" ? "Nuevo reel" : "Nueva publicación"}</b>
        <button
          className={estilos.siguiente}
          disabled={tipo !== "post" && seleccion.length === 0}
          onClick={() => setPaso("detalles")}
        >
          Siguiente
        </button>
      </header>

      <div className={estilos.previa}>
        {previa ? (
          <MedioVista medio={previa} />
        ) : (
          <div className={estilos.previaVacia}>
            <span className={estilos.previaForma} aria-hidden="true">
              <FlorLuna color="#ffffff" fondo="#ffdced" tamano={260} />
            </span>
            <span className={estilos.previaIcono}>
              <ImagePlus size={24} />
            </span>
            <p>
              {tipo === "post"
                ? "Elige hasta 3 fotos o sigue sin fotos para publicar solo texto"
                : tipo === "reel"
                  ? "Sube un video vertical o elige una imagen"
                  : "Elige una foto para tu historia"}
            </p>
          </div>
        )}
        {tipo === "post" && seleccion.length > 0 && (
          <span className={estilos.contador}>
            {seleccion.length} de 3 fotos
          </span>
        )}
      </div>

      <div className={estilos.galeriaCabeza}>
        <span className="negrita">
          Recientes <ChevronDown size={16} style={{ display: "inline", verticalAlign: "middle" }} />
        </span>
        <span className="chip chip-borde">Hasta {maximo} {maximo === 1 ? (tipo === "reel" ? "video" : "foto") : "fotos"}</span>
      </div>

      <div className={estilos.galeria}>
        <label className={`${estilos.celda} ${estilos.subir}`} htmlFor="subir-medios">
          {subiendo ? <span>Subiendo…</span> : <><Camera size={22} /><span>Subir</span></>}
        </label>
        <input
          id="subir-medios"
          type="file"
          hidden
          multiple={maximo > 1}
          accept={tipo === "reel" ? "video/*,image/*" : "image/*"}
          onChange={(e) => {
            subir(e.target.files);
            e.target.value = "";
          }}
        />
        {galeria.map((m) => {
          const k = clave(m);
          const pos = seleccion.findIndex((x) => clave(x) === k);
          return (
            <button
              key={k}
              className={`${estilos.celda} ${pos >= 0 ? estilos.elegida : ""}`}
              aria-pressed={pos >= 0}
              aria-label={pos >= 0 ? `Quitar foto ${pos + 1}` : "Elegir foto"}
              onClick={() => alternar(m)}
            >
              {m.tipo === "ilustracion" ? <Ilustracion id={m.ref} texto={m.texto} /> : <MedioVista medio={m} />}
              {m.tipo === "video" && (
                <span className={estilos.esVideo}>
                  <Play size={12} fill="currentColor" />
                </span>
              )}
              <span className={estilos.marca}>{pos >= 0 ? (maximo > 1 ? pos + 1 : <Check size={13} />) : ""}</span>
            </button>
          );
        })}
      </div>
      {selector}
    </div>
  );
}

function FilaAnonima({ anonima, alCambiar, texto }: { anonima: boolean; alCambiar: (v: boolean) => void; texto: string }) {
  return (
    <div className={estilos.filaAnonima}>
      <Ciclita id="anonima" tamano={44} />
      <div className="lista-texto">
        <b style={{ fontSize: 15 }}>
          <EyeOff size={15} style={{ display: "inline", verticalAlign: "-2px" }} /> {texto}
        </b>
        <span className="pequeno texto-2">Se mostrará la Ciclita anónima. Tu perfil nunca se enlaza.</span>
      </div>
      <button
        role="switch"
        aria-checked={anonima}
        aria-label={texto}
        className="interruptor"
        onClick={() => alCambiar(!anonima)}
      />
    </div>
  );
}

export default function PaginaPublicar() {
  return (
    <Suspense>
      <Publicar />
    </Suspense>
  );
}
