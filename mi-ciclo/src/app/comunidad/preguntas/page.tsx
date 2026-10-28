"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { EyeOff, PenLine } from "lucide-react";
import { Luna } from "@/components/FormasMarca";
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
      <div className={estilos.portadaPreguntas}>
        <h1 className={estilos.tituloPagina}>
          Pregunta <em>sin miedo</em>
        </h1>
        <p className={estilos.bajada}>Aquí nadie te juzga.</p>
      </div>

      <form
        className={estilos.tarjetaAnonima}
        onSubmit={(e) => {
          e.preventDefault();
          preguntarAnonima();
        }}
      >
        <span className={estilos.tarjetaAnonimaForma} aria-hidden="true">
          <Luna color="#e7bef8" tamano={140} />
        </span>
        <div className={estilos.tarjetaAnonimaFila}>
          <p className={estilos.tarjetaAnonimaTitulo}>
            ¿Algo que no te atreves a preguntar <em>en voz alta?</em>
          </p>
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
          <button type="submit" className="boton boton-principal" disabled={texto.trim().length < 5}>
            <EyeOff size={16} /> Anónima
          </button>
        </div>
        <Link href="/publicar?tipo=pregunta" className={estilos.enlaceAnonimo}>
          <PenLine size={16} /> Preguntar con mi nombre o elegir color
        </Link>
      </form>

      {esperan.length > 0 && (
        <section className="seccion" aria-labelledby="esperan">
          <div className={estilos.cabezaSeccion}>
            <h2 id="esperan" className={estilos.tituloSeccion}>
              Esperan <em>tu respuesta</em>
            </h2>
            <span className={estilos.tiempo}>{esperan.length} {esperan.length === 1 ? "nueva" : "nuevas"}</span>
          </div>
          <div className="carrusel">
            {esperan.map((p, i) => (
              <article key={p.id} className={`${estilos.esperan} ${i % 2 ? estilos.esperanMenta : estilos.esperanMantequilla}`}>
                <div className={estilos.esperanCabeza}>
                  <Avatar ciclita={p.autora.ciclita} fotoId={p.autora.fotoId} tamano={28} />
                  <b>{p.autora.alias}</b>
                  <span>· {haceCuanto(p.creadaEn, ctx.ahora)}</span>
                </div>
                <p className={estilos.esperanTexto}>{p.texto}</p>
                <Link href={`/comunidad/p/${p.id}#comentar`} className={estilos.responder}>
                  Responder
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="seccion" aria-labelledby="recientes">
        <h2 id="recientes" className={estilos.tituloSeccion}>
          Preguntas <em>recientes</em>
        </h2>
        {preguntas.length === 0 ? (
          <EstadoVacio titulo="Aún no hay preguntas" texto="Haz la primera. Puedes hacerlo de forma anónima." ciclita="anonima" />
        ) : (
          preguntas.map((p) => <TarjetaPregunta key={p.id} pub={p} ctx={ctx} />)
        )}
      </section>
    </main>
  );
}
