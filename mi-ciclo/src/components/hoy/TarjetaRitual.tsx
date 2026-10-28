"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_LETRA, hoyColombia, inicioSemana, rachaSobre, sumarDias } from "@/lib/ciclo";
import { guardarMotivo, marcarSobre } from "@/lib/acciones";
import { MOTIVOS } from "@/lib/consejos";
import { clases } from "@/lib/utilidades";
import { Flor } from "@/components/Flor";
import estilos from "./hoy.module.css";

/** "¿Ya tomaste Mi Ciclo hoy?" con Sí/No, racha, semana y motivo. */
export function TarjetaRitual() {
  const registros = useEstado((e) => e.registros);
  const motivo = useEstado((e) => e.perfil?.motivo);
  const hoy = hoyColombia();
  const racha = rachaSobre(hoy, registros);
  const lunes = inicioSemana(hoy);
  const tomoHoy = registros[hoy]?.tomoSobre;

  return (
    <section id="ritual" className={estilos.ritual}>
      <div className={estilos.ritualIzq}>
        <h2 className={estilos.ritualTitulo}>¿Ya tomaste Mi Ciclo hoy?</h2>
        <div className={estilos.siNo}>
          <button
            className={clases(estilos.si, tomoHoy === true && estilos.siActivo)}
            onClick={() => marcarSobre(tomoHoy !== true)}
            aria-pressed={tomoHoy === true}
          >
            {tomoHoy === true && <Check size={16} strokeWidth={3} />} Sí
          </button>
          <button
            className={clases(estilos.no, tomoHoy === false && estilos.noActivo)}
            onClick={() => marcarSobre(false)}
            aria-pressed={tomoHoy === false}
          >
            No
          </button>
        </div>
        <span className={estilos.racha}>
          <Flor activa tamano={14} /> {racha === 1 ? "1 día seguido" : `${racha} días seguidos`}
        </span>
        <ol className={estilos.semanaRitual} aria-label="Tu semana">
          {DIAS_LETRA.map((letra, i) => {
            const d = sumarDias(lunes, i);
            const tomado = registros[d]?.tomoSobre === true;
            return (
              <li key={d} className={clases(estilos.marca, tomado && estilos.marcaHecha, d === hoy && !tomado && estilos.marcaHoy)}>
                <span className="solo-lector">{tomado ? "tomado" : "sin registro"}</span>
                {tomado ? <Check size={10} strokeWidth={3.5} /> : letra}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={estilos.ritualDer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/ritual-sachet.webp" alt="" className={estilos.ritualFondo} aria-hidden="true" />
        <label htmlFor="motivo" className={estilos.motivoTitulo}>
          ¿Por qué estás con Mi Ciclo hoy?
        </label>
        <p className={estilos.motivoAyuda}>Cuéntanos tu motivo para acompañarte mejor.</p>
        <div className={estilos.selector}>
          <select id="motivo" value={motivo ?? ""} onChange={(e) => guardarMotivo(e.target.value)}>
            <option value="" disabled>
              Selecciona una opción
            </option>
            {MOTIVOS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
