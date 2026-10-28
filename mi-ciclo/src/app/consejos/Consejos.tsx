"use client";
import { useState } from "react";
import { Apple, Footprints, Heart, Moon } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { FASES, hoyColombia, infoDia } from "@/lib/ciclo";
import { CATEGORIAS, CONSEJOS_FASE, type Categoria } from "@/lib/consejos";
import type { Fase } from "@/lib/tipos";
import { Cabecera } from "@/components/Cabecera";
import { Ilustracion } from "@/components/Ilustracion";

const ICONOS: Record<Categoria, typeof Apple> = { Comer: Apple, Moverte: Footprints, Descansar: Moon, Sentir: Heart };
const ESCENA: Record<Fase, string> = { menstrual: "bolsa", folicular: "atardecer", ovulacion: "infusion", lutea: "antifaz" };
const PASTEL: Record<Categoria, string> = { Comer: "var(--durazno)", Moverte: "var(--menta)", Descansar: "var(--lila)", Sentir: "var(--rosa)" };

export function Consejos() {
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const actual = ciclo ? infoDia(hoyColombia(), ciclo, periodos).fase : "menstrual";
  const [fase, setFase] = useState<Fase>(actual);
  const datos = FASES[fase];

  return (
    <>
      <Cabecera titulo="Consejos para tu fase" />
      <main className="pagina pagina-sin-barra" style={{ paddingTop: 4 }}>
        <div className="carrusel" role="group" aria-label="Fases">
          {(Object.keys(FASES) as Fase[]).map((f) => (
            <button
              key={f}
              className="chip chip-borde seleccionable"
              aria-pressed={fase === f}
              onClick={() => setFase(f)}
            >
              {FASES[f].corta}
              {f === actual ? " · hoy" : ""}
            </button>
          ))}
        </div>

        <section className="tarjeta" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 150 }}>
            <Ilustracion id={ESCENA[fase]} />
          </div>
          <div className="columna" style={{ padding: 18, gap: 6 }}>
            <span className="eyebrow eyebrow-rojo">{fase === actual ? "Tu fase actual" : "Fase"}</span>
            <h1 className="titulo-l">{datos.nombre}</h1>
            <p className="texto-2">{datos.descripcion}. Tono de estos días: {datos.tono.toLowerCase()}.</p>
          </div>
        </section>

        {CATEGORIAS.map((cat) => {
          const Icono = ICONOS[cat];
          return (
            <section key={cat} className="seccion">
              <h2 className="titulo-m fila" style={{ gap: 10 }}>
                <span className="lista-icono" style={{ background: PASTEL[cat], color: "var(--vino)" }}>
                  <Icono size={17} />
                </span>
                {cat}
              </h2>
              <ul className="columna" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {CONSEJOS_FASE[fase][cat].map((c) => (
                  <li key={c} className="tarjeta" style={{ padding: "14px 16px" }}>
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <p className="ayuda">Estos consejos acompañan, no reemplazan una consulta médica. Si algo te preocupa, habla con tu médica.</p>
      </main>
    </>
  );
}
