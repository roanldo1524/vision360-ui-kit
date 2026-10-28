"use client";
// Inicio con el lenguaje del brandbook: campo Rojo Coral con la flor-luna recortada,
// el día del ciclo como cifra grande en la letra del logo y el ciclo como 28 círculos.
// Debajo, tres momentos en orden y un solo botón rojo (el ritual del sobre).
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_CORTOS, FASES, faseDelDia, fechaLarga, hoyColombia, infoDia, inicioSemana, numeroDia, sumarDias } from "@/lib/ciclo";
import { CONSEJOS_FASE } from "@/lib/consejos";
import { registrarPeriodo } from "@/lib/acciones";
import type { Fecha } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { FlorLuna } from "@/components/FormasMarca";
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
  const faseHoy = infoDia(hoy, ciclo, periodos).fase;
  const nombreFase = fase.nombre.replace("Fase de ", "").replace("Fase ", "").toLowerCase();
  const diaSemana = DIAS_LARGOS[(new Date(`${hoy}T12:00:00Z`).getUTCDay() + 6) % 7];
  const consejo = CONSEJOS_FASE[info.fase].Sentir[0];
  const ofrecerRegistro = esHoy && !periodos.includes(hoy) && (info.diasParaPeriodo <= 3 || info.diaCiclo > ciclo.duracionCiclo);

  return (
    <main className={clases("pagina", estilos.inicio)}>
      {/* Portada roja de marca */}
      <section className={estilos.portada} aria-label="Tu día">
        <FlorLuna color="#ff5a66" fondo="var(--rojo)" tamano={300} className={estilos.florGigante} />

        <header className={estilos.barraSuperior}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo-blanco.svg" alt="Mi Ciclo" className={estilos.logo} width={92} height={24} />
          <nav className={estilos.accesos} aria-label="Accesos">
            <Link href="/notificaciones" className={estilos.acceso} aria-label={sinLeer ? "Notificaciones, tienes nuevas" : "Notificaciones"}>
              <Bell size={20} strokeWidth={1.8} />
              {sinLeer && <span className={estilos.puntito} />}
            </Link>
            <Link href="/ajustes" className={estilos.acceso} aria-label="Ajustes">
              <Settings size={20} strokeWidth={1.8} />
            </Link>
          </nav>
        </header>

        <div className={estilos.saludo}>
          <p className={estilos.fecha}>
            {diaSemana} {fechaLarga(hoy)}
          </p>
          <h1 className={estilos.hola}>
            Hola, <em>{perfil.nombre}</em>
          </h1>
        </div>

        <div className={estilos.dato}>
          <span className={estilos.cifra} aria-hidden="true">
            {info.diaCiclo}
          </span>
          <div className={estilos.datoTexto}>
            <p className={estilos.datoEtiqueta}>
              {esHoy ? "día de tu ciclo" : `día, el ${fechaLarga(elegido)}`} · de {ciclo.duracionCiclo}
            </p>
            <h2 className={estilos.faseNombre}>
              Fase <em>{nombreFase}</em>
            </h2>
          </div>
        </div>
        <p className="solo-lector">
          Día {info.diaCiclo} de {ciclo.duracionCiclo}, fase {nombreFase}
        </p>

        <ol className={estilos.puntos} aria-hidden="true">
          {Array.from({ length: ciclo.duracionCiclo }, (_, i) => {
            const d = i + 1;
            const f = faseDelDia(d, ciclo);
            return (
              <li
                key={d}
                className={clases(
                  estilos.punto,
                  f === "menstrual" && estilos.puntoRegla,
                  f === "ovulacion" && estilos.puntoOvulacion,
                  d < info.diaCiclo && estilos.puntoPasado,
                  d === info.diaCiclo && estilos.puntoHoy,
                )}
              />
            );
          })}
        </ol>

        <p className={estilos.consejo}>{esHoy ? consejo : fase.descripcion + "."}</p>

        <div className={estilos.portadaPie}>
          <p className={estilos.prediccion}>
            Período en <b className="num">{info.diasParaPeriodo} días</b>
            <span aria-hidden="true"> · </span>
            {info.fertil ? <b>ventana fértil hoy</b> : <>fértil en <b className="num">{info.diasParaVentana} días</b></>}
          </p>
          {!esHoy ? (
            <button
              className={estilos.enlaceBlanco}
              onClick={() => {
                setElegido(hoy);
                setSemana(0);
              }}
            >
              Volver a hoy
            </button>
          ) : ofrecerRegistro ? (
            <button className={estilos.enlaceBlanco} onClick={() => setConfirmarPeriodo(true)}>
              Registrar período <ArrowRight size={16} />
            </button>
          ) : (
            <Link href="/ciclo" className={estilos.enlaceBlanco}>
              Mi ciclo <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </section>

      {/* Semana */}
      <section className={estilos.semana} aria-label="Semana">
        <button className={estilos.flecha} aria-label="Semana anterior" onClick={() => setSemana(semana - 1)}>
          <ChevronLeft size={20} />
        </button>
        <div className={estilos.dias}>
          {dias.map((d, i) => {
            const fd = infoDia(d, ciclo, periodos);
            return (
              <button
                key={d}
                className={clases(estilos.dia, d === hoy && estilos.diaHoy, d === elegido && d !== hoy && estilos.diaElegido)}
                onClick={() => setElegido(d)}
                aria-pressed={d === elegido}
                aria-label={`${fechaLarga(d)}, fase ${FASES[fd.fase].corta}`}
              >
                <span className={estilos.diaNombre}>{d === hoy ? "Hoy" : DIAS_CORTOS[i].slice(0, 1) + DIAS_CORTOS[i].slice(1).toLowerCase()}</span>
                <span className={estilos.diaNumero}>{numeroDia(d)}</span>
                <span
                  className={estilos.diaRegla}
                  style={{ visibility: fd.diaCiclo <= ciclo.duracionRegla ? "visible" : "hidden" }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <button className={estilos.flecha} aria-label="Semana siguiente" onClick={() => setSemana(semana + 1)}>
          <ChevronRight size={20} />
        </button>
      </section>

      <TarjetaRitual />
      <CheckinAnimo fase={faseHoy} />
      <ParaTi fase={faseHoy} />

      <Confirmar
        abierta={confirmarPeriodo}
        alCerrar={() => setConfirmarPeriodo(false)}
        titulo="¿Te llegó el período hoy?"
        texto={`Registraremos el ${fechaLarga(hoy)} como el primer día de tu período y ajustaremos tus predicciones.`}
        accion="Sí, me llegó hoy"
        alConfirmar={() => {
          registrarPeriodo(hoy);
          avisar("Período registrado. Cuídate mucho hoy");
        }}
      />
    </main>
  );
}
