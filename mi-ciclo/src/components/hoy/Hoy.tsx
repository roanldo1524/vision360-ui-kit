"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Gift, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import {
  DIAS_CORTOS, FASES, fechaLarga, hoyColombia, infoDia, inicioSemana, numeroDia, sumarDias,
} from "@/lib/ciclo";
import { registrarPeriodo } from "@/lib/acciones";
import type { Fecha } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Flor } from "@/components/Flor";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { AnilloFase } from "./AnilloFase";
import { TarjetaRitual } from "./TarjetaRitual";
import { CheckinAnimo } from "./CheckinAnimo";
import { ParaTi } from "./ParaTi";
import estilos from "./hoy.module.css";

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

  return (
    <main className={clases("pagina", estilos.fondo)}>
      {/* Encabezado */}
      <header className="fila-entre" style={{ alignItems: "flex-start" }}>
        <div className="columna" style={{ gap: 2 }}>
          <span className="pequeno texto-2">Hola,</span>
          <h1 className="titulo-l" style={{ fontSize: 28 }}>{perfil.nombre}</h1>
          <span className="eyebrow fila" style={{ gap: 4 }}>
            Tu bienestar, cada día <Flor activa tamano={12} />
          </span>
        </div>
        <div className="fila" style={{ gap: 6 }}>
          <Link href="/ajustes" className="boton-icono boton-icono-blanco" aria-label="Ajustes">
            <Settings size={19} />
          </Link>
          <Link href="/jardin" className="boton-icono boton-icono-blanco" aria-label="Recompensas">
            <Gift size={19} />
          </Link>
          <Link href="/notificaciones" className={clases("boton-icono boton-icono-blanco", estilos.campana)} aria-label={sinLeer ? "Notificaciones sin leer" : "Notificaciones"}>
            <Bell size={19} />
            {sinLeer && <span className={estilos.puntoRojo} />}
          </Link>
        </div>
      </header>

      {/* Semana */}
      <section className={clases("tarjeta", estilos.semana)} aria-label="Semana">
        <button className={estilos.flecha} aria-label="Semana anterior" onClick={() => setSemana(semana - 1)}>
          <ChevronLeft size={18} />
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
                aria-label={`${fechaLarga(d)}, ${FASES[fd.fase].corta}`}
              >
                <span className={estilos.diaNombre}>{d === hoy ? "HOY" : DIAS_CORTOS[i]}</span>
                <span className={estilos.diaNumero}>{numeroDia(d)}</span>
                <span className={estilos.diaPunto} style={{ background: FASES[fd.fase].color, opacity: fd.diaCiclo <= ciclo.duracionRegla ? 1 : 0.35 }} />
              </button>
            );
          })}
        </div>
        <button className={estilos.flecha} aria-label="Semana siguiente" onClick={() => setSemana(semana + 1)}>
          <ChevronRight size={18} />
        </button>
      </section>

      {/* Tarjeta de fase */}
      <section className={clases("tarjeta", estilos.fase)} style={{ ["--pastel" as string]: fase.pastel, ["--tono" as string]: fase.color }}>
        <div className={estilos.faseTexto}>
          <span className="eyebrow eyebrow-rojo">{esHoy ? "Tu fase actual" : `El ${fechaLarga(elegido)}`}</span>
          <h2 className={estilos.faseNombre}>
            {fase.nombre.split(" ").slice(0, -1).join(" ")}
            <br />
            {fase.nombre.split(" ").slice(-1)}
          </h2>
          <p className="pequeno texto-2">{fase.descripcion}</p>
          {esHoy ? (
            <button
              className="boton boton-principal boton-chico"
              style={{ alignSelf: "flex-start", marginTop: 6 }}
              onClick={() => (reglaRegistradaHoy ? avisar("Ya registraste tu regla hoy") : setConfirmarPeriodo(true))}
            >
              {reglaRegistradaHoy ? "Regla registrada" : "Registrar periodo"} <ChevronRight size={16} />
            </button>
          ) : (
            <button className="boton boton-secundario boton-chico" style={{ alignSelf: "flex-start", marginTop: 6 }} onClick={() => { setElegido(hoy); setSemana(0); }}>
              Volver a hoy
            </button>
          )}
        </div>
        <AnilloFase dia={info.diaCiclo} total={ciclo.duracionCiclo} regla={ciclo.duracionRegla} ciclita={perfil.ciclita} />
        <div className={estilos.faseAbajo}>
          <span className="eyebrow">En esta fase</span>
          <div className="chips">
            {fase.chips.map((c, i) => (
              <span key={c} className={clases("chip", ["", "chip-lila", "chip-mantequilla"][i])}>{c}</span>
            ))}
          </div>
          <p className={clases("pequeno texto-2 fila", estilos.prediccion)}>
            <CalendarDays size={15} />
            <span>
              Próximo periodo en <b className="num">{info.diasParaPeriodo} días</b>
              {" · "}
              {info.fertil ? (
                <>Estás en tu <b>ventana fértil</b></>
              ) : (
                <>Ventana fértil en <b className="num">{info.diasParaVentana} días</b></>
              )}
            </span>
          </p>
        </div>
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
