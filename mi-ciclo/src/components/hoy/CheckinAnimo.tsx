"use client";
import { useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { hoyColombia } from "@/lib/ciclo";
import { guardarSintomas, registrarAnimo } from "@/lib/acciones";
import { ANIMOS, consejoAnimo, SINTOMAS } from "@/lib/consejos";
import type { Fase } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { CaraAnimo } from "./CaraAnimo";
import estilos from "./hoy.module.css";

/** "¿Cómo te sientes hoy?" con caras de ánimo, síntomas y un consejo. */
export function CheckinAnimo({ fase }: { fase: Fase }) {
  const hoy = hoyColombia();
  const registro = useEstado((e) => e.registros[hoy]);
  const [abierta, setAbierta] = useState(false);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const animo = registro?.animo;
  const sintomas = registro?.sintomas ?? [];

  return (
    <section id="animo" className="seccion">
      <div className="seccion-cabeza">
        <h2 className="titulo-m">¿Cómo te sientes hoy?</h2>
        <button
          className="enlace-vino"
          onClick={() => {
            setElegidos(sintomas);
            setAbierta(true);
          }}
        >
          {sintomas.length ? `${sintomas.length} síntomas` : "Otros síntomas"} <ChevronRight size={15} />
        </button>
      </div>
      <div className="carrusel" role="radiogroup" aria-label="Ánimo de hoy">
        {ANIMOS.map((a) => (
          <button
            key={a.id}
            role="radio"
            aria-checked={animo === a.id}
            className={clases(estilos.animo, animo === a.id && estilos.animoElegido)}
            onClick={() => registrarAnimo(a.id)}
          >
            <CaraAnimo animo={a.id} />
            <span className="mini">{a.nombre}</span>
          </button>
        ))}
      </div>
      {animo && (
        <div className={estilos.consejoAnimo} role="status">
          <Sparkles size={18} style={{ flex: "none", marginTop: 2 }} />
          <p className="pequeno">{consejoAnimo(animo, fase)}</p>
        </div>
      )}

      <Hoja abierta={abierta} alCerrar={() => setAbierta(false)} titulo="¿Qué sientes hoy?">
        <p className="pequeno texto-2">Elige todo lo que aplique. Solo tú ves esto.</p>
        <div className="chips">
          {SINTOMAS.map((s) => {
            const activo = elegidos.includes(s);
            return (
              <button
                key={s}
                className="chip chip-borde seleccionable"
                aria-pressed={activo}
                onClick={() => setElegidos(activo ? elegidos.filter((x) => x !== s) : [...elegidos, s])}
              >
                {s}
              </button>
            );
          })}
        </div>
        <button
          className="boton boton-principal boton-ancho"
          onClick={() => {
            guardarSintomas(elegidos);
            setAbierta(false);
            avisar("Síntomas guardados");
          }}
        >
          Guardar
        </button>
      </Hoja>
    </section>
  );
}
