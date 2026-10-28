"use client";
// Inicio fiel a la referencia aprobada: saludo, semana, tarjeta de fase con anillo,
// ritual con motivo, ánimo, consejos y diario, pareja y comunidad.
// Colores del brandbook y tipografías de miciclo.co.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight, Gift, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { DIAS_CORTOS, FASES, fechaLarga, hoyColombia, infoDia, inicioSemana, numeroDia, sumarDias } from "@/lib/ciclo";
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

export function Hoy() {
  const perfil = useEstado((e) => e.perfil);
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const sinLeer = useEstado((e) => e.notificaciones.some((n) => !n.leida));
  const petalos = useEstado((e) => e.petalos);
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
  const palabras = fase.nombre.split(" ");
  const reglaHoy = periodos.includes(hoy);

  return (
    <main className={clases("pagina", estilos.inicio)}>
      {/* Saludo */}
      <header className={estilos.cabeza}>
        <div className={estilos.saludo}>
          <span className={estilos.hola}>Hola,</span>
          <h1 className={estilos.nombre}>{perfil.nombre}</h1>
          <span className={estilos.lema}>Tu bienestar, cada día</span>
        </div>
        <nav className={estilos.acciones} aria-label="Accesos">
          <Link href="/ajustes" className={estilos.accion} aria-label="Ajustes">
            <Settings size={22} strokeWidth={1.8} />
          </Link>
          <Link href="/jardin" className={clases(estilos.accion, estilos.accionRoja)} aria-label={`Recompensas: ${petalos} pétalos`}>
            <Gift size={22} strokeWidth={1.8} />
            {petalos > 0 && <span className={estilos.punto} />}
          </Link>
          <Link href="/notificaciones" className={estilos.accion} aria-label={sinLeer ? "Notificaciones, tienes nuevas" : "Notificaciones"}>
            <Bell size={22} strokeWidth={1.8} />
            {sinLeer && <span className={estilos.punto} />}
          </Link>
        </nav>
      </header>

      {/* Semana */}
      <section className={estilos.semana} aria-label="Semana">
        <button className={estilos.flecha} aria-label="Semana anterior" onClick={() => setSemana(semana - 1)}>
          <ChevronLeft size={22} />
        </button>
        <div className={estilos.dias}>
          {dias.map((d, i) => (
            <button
              key={d}
              className={clases(estilos.dia, d === hoy && estilos.diaHoy, d === elegido && d !== hoy && estilos.diaElegido)}
              onClick={() => setElegido(d)}
              aria-pressed={d === elegido}
              aria-label={`${fechaLarga(d)}, fase ${FASES[infoDia(d, ciclo, periodos).fase].corta}`}
            >
              <span className={estilos.diaNombre}>{d === hoy ? "HOY" : DIAS_CORTOS[i]}</span>
              <span className={estilos.diaNumero}>{numeroDia(d)}</span>
            </button>
          ))}
        </div>
        <button className={estilos.flecha} aria-label="Semana siguiente" onClick={() => setSemana(semana + 1)}>
          <ChevronRight size={22} />
        </button>
      </section>

      {/* Tarjeta de fase */}
      <section className={estilos.fase} aria-label="Tu fase">
        <div className={estilos.faseTexto}>
          <span className={estilos.etiqueta}>{esHoy ? "Tu fase actual" : fechaLarga(elegido)}</span>
          <h2 className={estilos.faseNombre}>
            {palabras.slice(0, -1).join(" ")}
            <br />
            {palabras[palabras.length - 1]}
          </h2>
          <p className={estilos.faseDescripcion}>{fase.descripcion}.</p>
          {esHoy ? (
            <button
              className={estilos.botonFase}
              onClick={() => (reglaHoy ? avisar("Ya registraste tu período hoy") : setConfirmarPeriodo(true))}
            >
              {reglaHoy ? "Período registrado" : "Registrar período"} <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          ) : (
            <button
              className={estilos.botonFase}
              onClick={() => {
                setElegido(hoy);
                setSemana(0);
              }}
            >
              Volver a hoy <ChevronRight size={18} strokeWidth={2.4} />
            </button>
          )}
        </div>
        <div className={estilos.faseAnillo}>
          <AnilloFase dia={info.diaCiclo} total={ciclo.duracionCiclo} regla={ciclo.duracionRegla} ciclita={perfil.ciclita} tamano={148} />
        </div>
        <p className={estilos.prediccion}>
          Próximo período en <b className="num">{info.diasParaPeriodo} días</b> ·{" "}
          {info.fertil ? <b>ventana fértil hoy</b> : <>ventana fértil en <b className="num">{info.diasParaVentana} días</b></>}
        </p>
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
