"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeOff, PenLine } from "lucide-react";
import { Ciclita } from "@/components/Ciclita";
import { Avatar } from "@/components/Avatar";
import { EstadoVacio } from "@/components/EstadoVacio";
import { avisar } from "@/components/Avisos";
import { EncabezadoComunidad } from "@/components/comunidad/EncabezadoComunidad";
import { TarjetaPregunta } from "@/components/comunidad/TarjetaPregunta";
import estilos from "@/components/comunidad/comunidad.module.css";
import { publicar } from "@/lib/comunidad/acciones";
import { listaPreguntas, useContexto } from "@/lib/comunidad/consultas";
import { haceCuanto } from "@/lib/utilidades";

export default function Preguntas() {
  const ctx = useContexto();
  const preguntas = useMemo(() => listaPreguntas(ctx), [ctx]);
  // Esperan tu respuesta: de otras, publicadas, con pocas respuestas
  const esperan = useMemo(
    () => preguntas.filter((p) => !p.esMia && !p.enRevision && p.numComentarios < 2).slice(0, 6),
    [preguntas],
  );
  const [texto, setTexto] = useState("");

  const preguntarAnonima = () => {
    const r = publicar({ tipo: "pregunta", texto, anonima: true, fondo: "lila" });
    if (!r.ok) return avisar(r.mensaje, "error");
    setTexto("");
    avisar(r.estado === "retenida" ? "Tu pregunta está en revisión. La verás en Recientes." : "Pregunta publicada");
  };

  return (
    <main className="pagina">
      <EncabezadoComunidad />
      <div>
        <h1 className="titulo-l">pregunta sin miedo</h1>
        <p className="mini texto-3">aquí nadie te juzga.</p>
      </div>

      <form
        className={estilos.tarjetaAnonima}
        onSubmit={(e) => {
          e.preventDefault();
          preguntarAnonima();
        }}
      >
        <div className={estilos.tarjetaAnonimaFila}>
          <p className="titulo-m" style={{ flex: 1 }}>¿Algo que no te atreves a preguntar en voz alta?</p>
          <Ciclita id="anonima" tamano={68} />
        </div>
        <div className={estilos.campoAnonimo}>
          <label htmlFor="pregunta-anonima" className="solo-lector">Escribe tu pregunta</label>
          <input
            id="pregunta-anonima"
            placeholder="Escribe tu pregunta…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={300}
          />
          <button type="submit" className="boton boton-vino boton-chico" disabled={texto.trim().length < 5}>
            <EyeOff size={14} /> Anónima
          </button>
        </div>
        <Link href="/publicar?tipo=pregunta" className="enlace-vino" style={{ alignSelf: "flex-start" }}>
          <PenLine size={14} /> Preguntar con mi nombre o elegir color
        </Link>
      </form>

      {esperan.length > 0 && (
        <section className="seccion" aria-labelledby="esperan">
          <div className="seccion-cabeza">
            <h2 id="esperan" className="titulo-m">Esperan tu respuesta</h2>
            <span className="mini texto-3">{esperan.length} {esperan.length === 1 ? "nueva" : "nuevas"}</span>
          </div>
          <div className="carrusel">
            {esperan.map((p, i) => (
              <article key={p.id} className={`${estilos.esperan} ${i % 2 ? estilos.esperanMenta : estilos.esperanMantequilla}`}>
                <div className="fila mini">
                  <Avatar ciclita={p.autora.ciclita} fotoId={p.autora.fotoId} tamano={22} />
                  <b>{p.autora.alias}</b>
                  <span className="texto-3">· {haceCuanto(p.creadaEn, ctx.ahora)}</span>
                </div>
                <p className={estilos.esperanTexto}>{p.texto}</p>
                <Link href={`/comunidad/p/${p.id}#comentar`} className={estilos.responder}>
                  responder
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="seccion" aria-labelledby="recientes">
        <h2 id="recientes" className="titulo-m">Recientes</h2>
        {preguntas.length === 0 ? (
          <EstadoVacio titulo="Aún no hay preguntas" texto="Haz la primera. Puedes hacerlo de forma anónima." ciclita="anonima" />
        ) : (
          preguntas.map((p) => <TarjetaPregunta key={p.id} pub={p} ctx={ctx} />)
        )}
      </section>
    </main>
  );
}
