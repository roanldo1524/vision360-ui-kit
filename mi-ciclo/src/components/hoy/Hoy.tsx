"use client";
// Inicio como portada de revista: el día del ciclo es la cifra gigante, la Ciclita
// se superpone a ella y la fase se lee como titular.
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Gift, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import {
  DIAS_LETRA, faseDelDia, FASES, fechaLarga, hoyColombia, infoDia, inicioSemana, numeroDia, sumarDias,
} from "@/lib/ciclo";
import { registrarPeriodo } from "@/lib/acciones";
import type { Fecha } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Ciclita } from "@/components/Ciclita";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { TarjetaRitual } from "./TarjetaRitual";
import { CheckinAnimo } from "./CheckinAnimo";
import { ParaTi } from "./ParaTi";
import estilos from "./hoy.module.css";

const DIAS_LARGOS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export function Hoy() {
  const perfil = useEstado((e) => e.perfil);
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const sinLeer = useEstado((e) => e.notificaciones.some((n) => !n.leida));
  const hoy = hoyColombia();
  const [semana, setSemana] = useState(0);
  const [elegido, setElegido] = useState<Fecha>(hoy);
  const [confirmarPeriodo, setConfirmarPeriodo] = useState(false);

  const lunes = sumarDias(inicioSemana(hoy), semana * 7);
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)), [lunes]);

  if (!perfil || !ciclo) return null;
  const info = infoDia(elegido, ciclo, periodos);
  const fase = FASES[info.fase];
  const esHoy = elegido === hoy;
  const reglaRegistradaHoy = periodos.includes(hoy);
  const diaSem = DIAS_LARGOS[(new Date(`${elegido}T12:00:00Z`).getUTCDay() + 6) % 7];

  return (
    <main className={clases("pagina", estilos.fondo)}>
      {/* Mancheta */}
      <header className={estilos.mancheta}>
        <div className={estilos.saludo}>
          <span className={estilos.fechaHoy}>
            {DIAS_LARGOS[(new Date(`${hoy}T12:00:00Z`).getUTCDay() + 6) % 7]} {fechaLarga(hoy)}
          </span>
          <h1 className={estilos.nombre}>
            Hola, {perfil.nombre}<span className={estilos.punto}>.</span>
          </h1>
        </div>
        <nav className={estilos.acciones} aria-label="Accesos">
          <Link href="/ajustes" className="boton-icono" aria-label="Ajustes">
            <Settings size={20} strokeWidth={1.5} />
          </Link>
          <Link href="/jardin" className="boton-icono" aria-label="Recompensas">
            <Gift size={20} strokeWidth={1.5} />
          </Link>
          <Link
            href="/notificaciones"
            className={clases("boton-icono", estilos.campana)}
            aria-label={sinLeer ? "Notificaciones sin leer" : "Notificaciones"}
          >
            <Bell size={20} strokeWidth={1.5} />
            {sinLeer && <span className={estilos.puntoRojo} />}
          </Link>
        </nav>
      </header>

      {/* Semana: números crudos entre dos reglas */}
      <section className={estilos.semana} aria-label="Semana">
        <button className={estilos.flecha} aria-label="Semana anterior" onClick={() => setSemana(semana - 1)}>
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <div className={estilos.dias}>
          {dias.map((d, i) => {
            const fd = infoDia(d, ciclo, periodos);
            return (
              <button
                key={d}
                className={clases(estilos.dia, d === hoy && estilos.diaHoy, d === elegido && estilos.diaElegido)}
                onClick={() => setElegido(d)}
                aria-pressed={d === elegido}
                aria-label={`${fechaLarga(d)}, ${FASES[fd.fase].corta}`}
              >
                <span className={estilos.diaNombre}>{DIAS_LETRA[i]}</span>
                <span className={estilos.diaNumero}>{numeroDia(d)}</span>
                <span
                  className={estilos.diaRegla}
                  style={{ opacity: fd.diaCiclo <= ciclo.duracionRegla ? 1 : 0 }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <button className={estilos.flecha} aria-label="Semana siguiente" onClick={() => setSemana(semana + 1)}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </section>

      {/* Portada de la fase */}
      <section className={estilos.portada} aria-label="Tu fase">
        <p className={estilos.kicker}>
          {esHoy ? "Hoy estás en el día" : `El ${diaSem} ${fechaLarga(elegido)} será el día`}
        </p>
        <div className={estilos.cifraZona}>
          <span className={estilos.cifra} aria-label={`Día ${info.diaCiclo} de ${ciclo.duracionCiclo}`}>
            {info.diaCiclo}
          </span>
          <span className={estilos.deTotal}>/{ciclo.duracionCiclo}</span>
          <span className={estilos.personaje}>
            <Ciclita id={perfil.ciclita} tamano={118} feliz={info.fase !== "menstrual"} />
          </span>
        </div>

        <ReglaCiclo dia={info.diaCiclo} total={ciclo.duracionCiclo} regla={ciclo.duracionRegla} />

        <div className={estilos.titular}>
          <h2 className={estilos.faseNombre}>
            {fase.nombre.replace("Fase ", "Fase ")}
          </h2>
          <p className={estilos.bajada}>
            {fase.descripcion}. <span className="texto-2">{fase.chips.join(" · ")}.</span>
          </p>
        </div>

        <dl className={estilos.datos}>
          <div>
            <dt>Próximo periodo</dt>
            <dd>
              <span className="num">{info.diasParaPeriodo}</span>
              <small>días</small>
            </dd>
          </div>
          <div>
            <dt>{info.fertil ? "Ventana fértil" : "Ventana fértil en"}</dt>
            <dd>
              {info.fertil ? (
                <span className={estilos.ahora}>ahora</span>
              ) : (
                <>
                  <span className="num">{info.diasParaVentana}</span>
                  <small>días</small>
                </>
              )}
            </dd>
          </div>
        </dl>

        {esHoy ? (
          <button
            className="boton boton-principal boton-ancho"
            onClick={() => (reglaRegistradaHoy ? avisar("Ya registraste tu regla hoy") : setConfirmarPeriodo(true))}
          >
            {reglaRegistradaHoy ? "Regla registrada hoy" : "Registrar periodo"} <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="boton boton-secundario boton-ancho"
            onClick={() => {
              setElegido(hoy);
              setSemana(0);
            }}
          >
            Volver a hoy
          </button>
        )}
      </section>

      <TarjetaRitual />
      <CheckinAnimo fase={infoDia(hoy, ciclo, periodos).fase} />
      <ParaTi />

      <Confirmar
        abierta={confirmarPeriodo}
        alCerrar={() => setConfirmarPeriodo(false)}
        titulo="¿Te llegó la regla hoy?"
        texto={`Registraremos el ${fechaLarga(hoy)} como el primer día de tu regla y ajustaremos tus predicciones.`}
        accion="Sí, mi regla llegó hoy"
        alConfirmar={() => {
          registrarPeriodo(hoy);
          avisar("Regla registrada. Cuídate mucho hoy");
        }}
      />
    </main>
  );
}

/** El ciclo como una regla de imprenta: un trazo por día, el de hoy en rojo y más alto. */
function ReglaCiclo({ dia, total, regla }: { dia: number; total: number; regla: number }) {
  const config = { ultimoPeriodo: "", duracionCiclo: total, duracionRegla: regla };
  const fases: { nombre: string; desde: number; hasta: number }[] = [];
  for (let d = 1; d <= total; d++) {
    const f = FASES[faseDelDia(d, config)].corta;
    const ultima = fases[fases.length - 1];
    if (ultima && ultima.nombre === f) ultima.hasta = d;
    else fases.push({ nombre: f, desde: d, hasta: d });
  }
  return (
    <div className={estilos.regla} role="img" aria-label={`Día ${dia} de ${total}`}>
      <div className={estilos.trazos} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={clases(estilos.trazo, i + 1 < dia && estilos.trazoPasado, i + 1 === dia && estilos.trazoHoy)}
          />
        ))}
      </div>
      <div className={estilos.tramos} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {fases.map((f) => (
          <span key={f.desde} style={{ gridColumn: `${f.desde} / ${f.hasta + 1}` }}>
            {f.hasta - f.desde >= 4 ? f.nombre : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
