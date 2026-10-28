"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { hoyColombia, rachaSobre } from "@/lib/ciclo";
import { guardarMotivo, marcarSobre } from "@/lib/acciones";
import { MOTIVOS } from "@/lib/consejos";
import { clases } from "@/lib/utilidades";
import { Flor } from "@/components/Flor";
import estilos from "./hoy.module.css";

/** "¿Ya tomaste Mi Ciclo hoy?" con Sí / No, racha y el motivo, como en la referencia. */
export function TarjetaRitual() {
  const registros = useEstado((e) => e.registros);
  const motivo = useEstado((e) => e.perfil?.motivo);
  const hoy = hoyColombia();
  const racha = rachaSobre(hoy, registros);
  const tomoHoy = registros[hoy]?.tomoSobre;

  return (
    <section id="ritual" className={estilos.ritual} aria-label="Tu ritual de hoy">
      <div className={estilos.ritualIzq}>
        <h2 className={estilos.ritualTitulo}>¿Ya tomaste Mi Ciclo hoy?</h2>
        <div className={estilos.siNo}>
          <button
            className={clases(estilos.si, tomoHoy === true && estilos.siHecho)}
            onClick={() => marcarSobre(tomoHoy !== true)}
            aria-pressed={tomoHoy === true}
          >
            {tomoHoy === true && <Check size={18} strokeWidth={3} aria-hidden="true" />}Sí
          </button>
          <button
            className={clases(estilos.no, tomoHoy === false && estilos.noHecho)}
            onClick={() => marcarSobre(false)}
            aria-pressed={tomoHoy === false}
          >
            No
          </button>
        </div>
        <p className={estilos.racha}>
          <Flor activa tamano={14} />
          {racha === 0 ? "Hoy empieza tu racha" : racha === 1 ? "1 día seguido" : `${racha} días seguidos`}
        </p>
      </div>

      <div className={estilos.ritualDer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/ritual-sachet.webp" alt="" className={estilos.ritualProducto} aria-hidden="true" width={120} height={120} />
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
          <ChevronDown size={18} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
