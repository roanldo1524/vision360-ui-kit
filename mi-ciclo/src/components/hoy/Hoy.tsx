"use client";
// Inicio: un lugar tranquilo. Tres momentos en orden (tu fase, tu ritual, cómo te sientes)
// y lo demás en una lista serena. Un solo botón rojo: el ritual del sobre.
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_CORTOS, FASES, fechaLarga, hoyColombia, infoDia, inicioSemana, numeroDia, sumarDias } from "@/lib/ciclo";
import { CONSEJOS_FASE } from "@/lib/consejos";
import { registrarPeriodo } from "@/lib/acciones";
import type { Fecha } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { AnilloFase } from "./AnilloFase";
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
  // El registro del período solo se ofrece cuando tiene sentido: cerca de la fecha prevista o si ya pasó
  const ofrecerRegistro = esHoy && !periodos.includes(hoy) && (info.diasParaPeriodo <= 3 || info.diaCiclo > ciclo.duracionCiclo);

  return (
    <main className={clases("pagina", estilos.inicio)}>
      <header className={estilos.barraSuperior}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/logo-rojo.svg" alt="Mi Ciclo" className={estilos.logo} width={92} height={24} />
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

      <section className={estilos.saludo}>
        <p className={estilos.fecha}>
          {diaSemana} {fechaLarga(hoy)}
        </p>
        <h1 className={estilos.hola}>
          Hola, <em>{perfil.nombre}</em>
        </h1>
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

      {/* Portada de la fase */}
      <section className={estilos.fase} aria-label="Tu fase">
        <span className={estilos.florFondo} aria-hidden="true" />
        <div className={estilos.faseCuerpo}>
          <div className={estilos.faseTexto}>
            <p className={estilos.faseEtiqueta}>{esHoy ? `Tu fase · día ${info.diaCiclo}` : `El ${fechaLarga(elegido)} · día ${info.diaCiclo}`}</p>
            <h2 className={estilos.faseNombre}>
              Fase <em>{nombreFase}</em>
            </h2>
            <p className={estilos.faseConsejo}>{esHoy ? consejo : fase.descripcion + "."}</p>
          </div>
          <AnilloFase dia={info.diaCiclo} total={ciclo.duracionCiclo} regla={ciclo.duracionRegla} ciclita={perfil.ciclita} tamano={146} />
        </div>
        <div className={estilos.fasePie}>
          <p className={estilos.prediccion}>
            Próximo período en <b className="num">{info.diasParaPeriodo} días</b>
            <span aria-hidden="true"> · </span>
            {info.fertil ? <b>ventana fértil hoy</b> : <>ventana fértil en <b className="num">{info.diasParaVentana} días</b></>}
          </p>
          {!esHoy ? (
            <button
              className={estilos.enlaceFase}
              onClick={() => {
                setElegido(hoy);
                setSemana(0);
              }}
            >
              Volver a hoy
            </button>
          ) : ofrecerRegistro ? (
            <button className={estilos.enlaceFase} onClick={() => setConfirmarPeriodo(true)}>
              Registrar período <ArrowRight size={16} />
            </button>
          ) : (
            <Link href="/ciclo" className={estilos.enlaceFase}>
              Ver mi ciclo <ArrowRight size={16} />
            </Link>
          )}
        </div>
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
