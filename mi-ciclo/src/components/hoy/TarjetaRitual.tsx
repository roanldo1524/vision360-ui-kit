"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_LETRA, hoyColombia, inicioSemana, rachaSobre, sumarDias } from "@/lib/ciclo";
import { guardarMotivo, marcarSobre } from "@/lib/acciones";
import { MOTIVOS } from "@/lib/consejos";
import { clases } from "@/lib/utilidades";
import { Flor } from "@/components/Flor";
import estilos from "./hoy.module.css";

/** "¿Ya tomaste Mi Ciclo hoy?": racha, semana y botones. */
export function TarjetaRitual() {
  const registros = useEstado((e) => e.registros);
  const motivo = useEstado((e) => e.perfil?.motivo);
  const hoy = hoyColombia();
  const racha = rachaSobre(hoy, registros);
  const lunes = inicioSemana(hoy);
  const tomoHoy = registros[hoy]?.tomoSobre;

  return (
    <section id="ritual" className={estilos.ritual}>
      <div className={estilos.ritualCabeza}>
        <div className="columna" style={{ gap: 8, minWidth: 0 }}>
          <h2 className="titulo-m">¿Ya tomaste Mi Ciclo hoy?</h2>
          <span className={estilos.racha}>
            <Flor activa tamano={16} />
            {racha === 0 ? "Empieza tu racha hoy" : racha === 1 ? "1 día seguido" : `${racha} días seguidos`}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/ritual-sachet.webp" alt="Sobre de Mi Ciclo sabor manzana" className={estilos.sachet} width={92} height={92} />
      </div>

      <ol className={estilos.semanaRitual} aria-label="Tu semana">
        {DIAS_LETRA.map((letra, i) => {
          const d = sumarDias(lunes, i);
          const tomado = registros[d]?.tomoSobre === true;
          const esHoy = d === hoy;
          return (
            <li key={d} className={estilos.diaRitual}>
              <span className="mini texto-3">{letra}</span>
              <span
                className={clases(estilos.marca, tomado && estilos.marcaHecha, esHoy && !tomado && estilos.marcaHoy)}
                aria-label={tomado ? "Tomado" : esHoy ? "Hoy, pendiente" : d > hoy ? "Próximo" : "Sin registro"}
              >
                {tomado && <Check size={14} strokeWidth={3} />}
              </span>
            </li>
          );
        })}
      </ol>

      {tomoHoy === true ? (
        <div className={estilos.listo}>
          <Check size={18} /> <span>¡Listo por hoy! Tu cuerpo te lo agradece.</span>
          <button className="enlace-vino" style={{ marginLeft: "auto" }} onClick={() => marcarSobre(false)}>
            Deshacer
          </button>
        </div>
      ) : (
        <div className="rejilla-2">
          <button className="boton boton-secundario" onClick={() => marcarSobre(true)}>
            Sí, ya la tomé
          </button>
          <button
            className={clases("boton boton-secundario", tomoHoy === false && estilos.botonMarcado)}
            onClick={() => marcarSobre(false)}
            aria-pressed={tomoHoy === false}
          >
            Todavía no
          </button>
        </div>
      )}
      {tomoHoy === false && (
        <p className="pequeno texto-2">Te lo recordamos más tarde. Un vaso de agua y tu sobre: listo en un minuto.</p>
      )}

      <div className={estilos.motivo}>
        <label htmlFor="motivo" className="pequeno negrita">¿Por qué estás con Mi Ciclo hoy?</label>
        <div className={estilos.selector}>
          <select id="motivo" value={motivo ?? ""} onChange={(e) => guardarMotivo(e.target.value)}>
            <option value="" disabled>
              Selecciona
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
