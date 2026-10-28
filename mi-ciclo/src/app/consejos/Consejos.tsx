"use client";
// Consejos para tu fase: selector de fases con sus formas, foto real de la marca
// y cuatro bloques serenos (comer, moverte, descansar, sentir).
import { useState } from "react";
import { useEstado } from "@/lib/almacen";
import { FASES, hoyColombia, infoDia } from "@/lib/ciclo";
import { CATEGORIAS, CONSEJOS_FASE, type Categoria } from "@/lib/consejos";
import type { Fase } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Cabecera } from "@/components/Cabecera";
import { Estrella, FlorLuna, Luna } from "@/components/FormasMarca";
import { GlifoFase } from "@/app/ciclo/GlifoFase";
import estilos from "./consejos.module.css";

const ORDEN: Fase[] = ["menstrual", "folicular", "ovulacion", "lutea"];

// Fotos reales de miciclo.co según lo que más acompaña cada fase
const FOTO: Record<Fase, { src: string; alt: string }> = {
  menstrual: { src: "/marca/sint-colicos.webp", alt: "Mujer abrazando su vientre en un día de cólicos" },
  folicular: { src: "/marca/sint-energia.webp", alt: "Mujer sonriendo con energía" },
  ovulacion: { src: "/marca/sint-animo.webp", alt: "Mujer sonriendo y abrazándose" },
  lutea: { src: "/marca/sint-hinchazon.webp", alt: "Mujer tranquila haciendo un gesto de todo bien" },
};

const TITULO: Record<Categoria, [string, string]> = {
  Comer: ["Para", "comer"],
  Moverte: ["Para", "moverte"],
  Descansar: ["Para", "descansar"],
  Sentir: ["Para", "sentir"],
};

function Miniatura({ categoria }: { categoria: Categoria }) {
  if (categoria === "Comer")
    return (
      <span className={estilos.mini} style={{ background: "#ffe4ea" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/manzanas.webp" alt="" />
      </span>
    );
  const forma =
    categoria === "Moverte" ? (
      <Estrella color="#b07ee0" tamano={28} />
    ) : categoria === "Descansar" ? (
      <Luna color="#5b3aaa" tamano={26} />
    ) : (
      <FlorLuna color="#f62c39" fondo="#fff0f5" tamano={30} />
    );
  const fondo = categoria === "Moverte" ? "#f5ebfc" : categoria === "Descansar" ? "#efe4fb" : "#fff0f5";
  return (
    <span className={estilos.mini} style={{ background: fondo }}>
      {forma}
    </span>
  );
}

export function Consejos() {
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const actual = ciclo ? infoDia(hoyColombia(), ciclo, periodos).fase : "menstrual";
  const [fase, setFase] = useState<Fase>(actual);
  const datos = FASES[fase];
  const nombre = datos.corta.toLowerCase();

  return (
    <>
      <Cabecera titulo="Consejos" />
      <main className={clases("pagina pagina-sin-barra", estilos.pagina)}>
        <header className={estilos.encabezado}>
          <h1 className={estilos.titulo}>
            Para tu fase <em>{nombre}</em>
          </h1>
          <p className={estilos.bajada}>{datos.descripcion}.</p>
        </header>

        <div className={estilos.fases} role="tablist" aria-label="Fases del ciclo">
          {ORDEN.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={fase === f}
              className={clases(estilos.faseBoton, fase === f && estilos.faseActiva)}
              onClick={() => setFase(f)}
            >
              <GlifoFase fase={f} tamano={44} />
              <span className={estilos.faseNombre}>{FASES[f].corta}</span>
              <span className={estilos.faseHoy}>{f === actual ? "Hoy" : " "}</span>
            </button>
          ))}
        </div>

        <figure className={estilos.foto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOTO[fase].src} alt={FOTO[fase].alt} />
          <figcaption className={estilos.cita}>{CONSEJOS_FASE[fase].Sentir[0]}</figcaption>
        </figure>

        {CATEGORIAS.map((cat) => (
          <section key={cat} className={estilos.bloque} aria-labelledby={`t-${cat}`}>
            <div className={estilos.bloqueCabeza}>
              <Miniatura categoria={cat} />
              <h2 id={`t-${cat}`} className={estilos.bloqueTitulo}>
                {TITULO[cat][0]} <em>{TITULO[cat][1]}</em>
              </h2>
            </div>
            <ul className={estilos.consejos}>
              {CONSEJOS_FASE[fase][cat].map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ))}

        <p className={estilos.nota}>Estos consejos acompañan, no reemplazan una consulta médica. Si algo te preocupa, habla con tu médica.</p>
      </main>
    </>
  );
}
