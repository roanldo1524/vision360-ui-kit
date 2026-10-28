"use client";
import { Check } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_LETRA, hoyColombia, inicioSemana, rachaSobre, sumarDias } from "@/lib/ciclo";
import { marcarSobre } from "@/lib/acciones";
import { clases } from "@/lib/utilidades";
import { Flor } from "@/components/Flor";
import estilos from "./hoy.module.css";

/** El ritual del sobre: la acción principal del día. */
export function TarjetaRitual() {
  const registros = useEstado((e) => e.registros);
  const hoy = hoyColombia();
  const racha = rachaSobre(hoy, registros);
  const lunes = inicioSemana(hoy);
  const tomoHoy = registros[hoy]?.tomoSobre;

  return (
    <section id="ritual" className={estilos.ritual} aria-label="Tu ritual de hoy">
      <div className={estilos.ritualCabeza}>
        <span className={estilos.sobreMarco} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/ritual-sachet.webp" alt="" width={76} height={76} />
        </span>
        <div className={estilos.ritualTexto}>
          <h2 className={estilos.ritualTitulo}>
            {tomoHoy === true ? "Tu ritual de hoy está listo" : "¿Ya tomaste tu Mi Ciclo hoy?"}
          </h2>
          <p className={estilos.racha}>
            <Flor activa tamano={14} />
            {racha === 0 ? "Hoy empieza tu racha" : racha === 1 ? "1 día seguido" : `${racha} días seguidos`}
          </p>
        </div>
      </div>

      <ol className={estilos.semanaRitual} aria-label="Tu semana con Mi Ciclo">
        {DIAS_LETRA.map((letra, i) => {
          const d = sumarDias(lunes, i);
          const tomado = registros[d]?.tomoSobre === true;
          return (
            <li
              key={d}
              className={clases(estilos.marca, tomado && estilos.marcaHecha, d === hoy && !tomado && estilos.marcaHoy)}
              aria-label={`${letra}: ${tomado ? "tomado" : d > hoy ? "por venir" : "sin registro"}`}
            >
              {tomado ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : <span aria-hidden="true">{letra}</span>}
            </li>
          );
        })}
      </ol>

      {tomoHoy === true ? (
        <div className={estilos.listo} role="status">
          <span>Tu cuerpo te lo agradece.</span>
          <button className={estilos.deshacer} onClick={() => marcarSobre(false)}>
            Deshacer
          </button>
        </div>
      ) : (
        <div className={estilos.ritualAcciones}>
          <button className="boton boton-principal" onClick={() => marcarSobre(true)}>
            Sí, ya lo tomé
          </button>
          <button
            className={clases("boton boton-secundario", tomoHoy === false && estilos.todaviaMarcado)}
            onClick={() => marcarSobre(false)}
            aria-pressed={tomoHoy === false}
          >
            Todavía no
          </button>
        </div>
      )}
    </section>
  );
}
