"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, EyeOff, ShieldCheck, Trash2, UserX } from "lucide-react";
import { Cabecera } from "@/components/Cabecera";
import { Ciclita } from "@/components/Ciclita";
import { EstadoVacio } from "@/components/EstadoVacio";
import { MedioVista } from "@/components/MedioVista";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import {
  activarModeradora,
  moderarComentario,
  moderarPublicacion,
  suspenderAutora,
} from "@/lib/comunidad/acciones";
import { colaModeracion, perfilesSuspendidos, useContexto, type ElementoCola } from "@/lib/comunidad/consultas";
import { haceCuanto } from "@/lib/utilidades";
import estilos from "./admin.module.css";

type Filtro = "todo" | "retenidas" | "reportadas";

const NOMBRE_TIPO = { post: "Post", pregunta: "Pregunta", reel: "Reel", historia: "Historia" } as const;

export default function Admin() {
  const ctx = useContexto();
  const cola = useMemo(() => colaModeracion(ctx), [ctx]);
  const suspendidas = useMemo(() => perfilesSuspendidos(ctx), [ctx]);
  const [filtro, setFiltro] = useState<Filtro>("todo");
  const [suspender, setSuspender] = useState<ElementoCola | null>(null);

  if (!ctx.moderadora) {
    return (
      <>
        <Cabecera titulo="Moderación" volverA="/comunidad" />
        <main className="pagina pagina-sin-barra">
          <EstadoVacio
            ciclita="anonima"
            titulo="Solo para el equipo de moderación"
            texto="Aquí se revisan las publicaciones retenidas y reportadas. En producción este acceso depende del rol de la cuenta."
            accion={
              <button className="boton boton-vino" onClick={() => { activarModeradora(true); avisar("Modo moderadora activado"); }}>
                <ShieldCheck size={16} /> Activar modo moderadora (demo)
              </button>
            }
          />
        </main>
      </>
    );
  }

  const visibles = cola.filter((i) =>
    filtro === "todo" ? true : filtro === "retenidas" ? i.estado === "retenida" : i.reportes.length > 0 || i.estado === "oculta",
  );
  const nRetenidas = cola.filter((i) => i.estado === "retenida").length;
  const nReportadas = cola.filter((i) => i.reportes.length > 0 || i.estado === "oculta").length;

  const decidir = (i: ElementoCola, d: "aprobar" | "ocultar" | "eliminar") => {
    if (i.tipo === "publicacion") moderarPublicacion(i.id, d);
    else moderarComentario(i.id, d);
    avisar(d === "aprobar" ? "Aprobada y publicada" : d === "ocultar" ? "Oculta" : "Eliminada");
  };

  return (
    <>
      <Cabecera titulo="Moderación" volverA="/comunidad" />
      <main className="pagina pagina-sin-barra">
        <section className={estilos.resumen}>
          <div>
            <span className="titulo-l num">{cola.length}</span>
            <span className="mini texto-2">en la cola</span>
          </div>
          <div>
            <span className="titulo-l num">{nRetenidas}</span>
            <span className="mini texto-2">retenidas</span>
          </div>
          <div>
            <span className="titulo-l num">{nReportadas}</span>
            <span className="mini texto-2">reportadas</span>
          </div>
        </section>

        <div className="segmento" role="tablist" aria-label="Filtrar cola">
          {(["todo", "retenidas", "reportadas"] as Filtro[]).map((f) => (
            <button key={f} role="tab" aria-selected={filtro === f} onClick={() => setFiltro(f)}>
              {f === "todo" ? "Todo" : f === "retenidas" ? "Retenidas" : "Reportadas"}
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <EstadoVacio ciclita="menta" titulo="Cola al día" texto="No hay nada pendiente por revisar. Buen trabajo." />
        ) : (
          visibles.map((i) => (
            <article key={i.clave} className={estilos.item}>
              <div className="fila-entre">
                <span className="chips">
                  <span className="chip chip-borde">
                    {i.tipo === "comentario" ? "Comentario" : NOMBRE_TIPO[i.tipoPublicacion ?? "post"]}
                  </span>
                  {i.anonima && <span className="chip chip-lila">Anónima</span>}
                  {i.estado === "oculta" && <span className="chip chip-durazno">Oculta</span>}
                </span>
                <span className="mini texto-3">{haceCuanto(i.fecha, ctx.ahora)}</span>
              </div>

              <div className={estilos.autora}>
                <Ciclita id={i.anonima ? "anonima" : "rosa"} tamano={34} />
                <div className="lista-texto">
                  <b className="pequeno">
                    {i.autora ? `${i.autora.alias} · @${i.autora.usuario}` : "Autora desconocida"}
                  </b>
                  <span className="mini texto-3">
                    {i.anonima ? "Identidad real, solo visible para moderación · " : ""}
                    {i.autora ? `${i.autora.postsAprobados} publicaciones aprobadas` : ""}
                    {i.autora?.estado === "suspendida" ? " · suspendida" : ""}
                  </span>
                </div>
              </div>

              <div className="chips">
                {i.motivos.map((m) => (
                  <span key={m} className="chip chip-mantequilla">{m}</span>
                ))}
              </div>

              <div className={estilos.contenido}>
                {i.medios[0] && (
                  <span className={estilos.miniatura}>
                    <MedioVista medio={i.medios[0]} />
                  </span>
                )}
                <div className="columna" style={{ gap: 4, minWidth: 0 }}>
                  {i.titulo && <b className="pequeno">{i.titulo}</b>}
                  <p className={estilos.texto}>{i.texto}</p>
                  {i.tipo === "comentario" && (
                    <Link href={`/comunidad/p/${i.publicacionId}`} className="enlace-vino mini">Ver publicación</Link>
                  )}
                </div>
              </div>

              {i.reportes.length > 0 && (
                <ul className={estilos.reportes}>
                  {i.reportes.map((r, k) => (
                    <li key={k}>“{r.motivo}” · {haceCuanto(r.fecha, ctx.ahora)}</li>
                  ))}
                </ul>
              )}

              <div className={estilos.acciones}>
                <button className="boton boton-vino boton-chico" onClick={() => decidir(i, "aprobar")}>
                  <Check size={15} /> Aprobar
                </button>
                <button className="boton boton-secundario boton-chico" onClick={() => decidir(i, "ocultar")}>
                  <EyeOff size={15} /> Ocultar
                </button>
                <button className="boton boton-secundario boton-chico" onClick={() => decidir(i, "eliminar")}>
                  <Trash2 size={15} /> Eliminar
                </button>
                {i.autora && i.autora.id !== "yo" && i.autora.estado !== "suspendida" && (
                  <button className="boton boton-fantasma boton-chico" onClick={() => setSuspender(i)}>
                    <UserX size={15} /> Suspender autora
                  </button>
                )}
              </div>
            </article>
          ))
        )}

        {suspendidas.length > 0 && (
          <section className="seccion">
            <h2 className="titulo-s">Cuentas suspendidas</h2>
            <div className="lista">
              {suspendidas.map((p) => (
                <div key={p.id} className="lista-item">
                  <Ciclita id={p.ciclita} tamano={36} />
                  <span className="lista-texto">
                    <b>{p.alias}</b>
                    <span className="mini texto-3">@{p.usuario}</span>
                  </span>
                  <button className="boton boton-chico boton-secundario" onClick={() => { suspenderAutora(p.id, false); avisar("Cuenta reactivada"); }}>
                    Reactivar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button className="boton boton-fantasma" onClick={() => { activarModeradora(false); avisar("Modo moderadora desactivado"); }}>
          Salir del modo moderadora
        </button>

        <Confirmar
          abierta={suspender !== null}
          titulo={`¿Suspender a ${suspender?.autora?.alias ?? "esta autora"}?`}
          texto="No podrá publicar ni comentar y su contenido dejará de verse en la comunidad. Puedes reactivarla después."
          accion="Suspender"
          peligro
          alConfirmar={() => {
            if (suspender?.autora) suspenderAutora(suspender.autora.id);
            if (suspender) decidir(suspender, "ocultar");
            avisar("Cuenta suspendida");
          }}
          alCerrar={() => setSuspender(null)}
        />
      </main>
    </>
  );
}
