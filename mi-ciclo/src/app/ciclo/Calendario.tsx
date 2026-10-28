"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Droplet, Heart } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import {
  diaSemana, diferenciaDias, faseDelDia, FASES, fechaLarga, hoyColombia, infoDia, MESES, sumarDias,
} from "@/lib/ciclo";
import { alternarIntimo, guardarNotaDia, quitarPeriodo, registrarPeriodo } from "@/lib/acciones";
import { ANIMOS } from "@/lib/consejos";
import type { Fase, Fecha } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import { Hoja, Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { BebeAgua, MiObjetivo } from "@/components/hoy/Bienestar";
import estilos from "./calendario.module.css";

const ENCABEZADO = ["L", "M", "M", "J", "V", "S", "D"];

export function Calendario() {
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const registros = useEstado((e) => e.registros);
  const hoy = hoyColombia();
  const [mes, setMes] = useState(hoy.slice(0, 7)); // "AAAA-MM"
  const [dia, setDia] = useState<Fecha | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const celdas = useMemo(() => {
    const primero = `${mes}-01`;
    const [a, m] = mes.split("-").map(Number);
    const total = new Date(Date.UTC(a, m, 0)).getUTCDate();
    const vacias = diaSemana(primero);
    return [
      ...Array.from({ length: vacias }, () => null),
      ...Array.from({ length: total }, (_, i) => sumarDias(primero, i)),
    ];
  }, [mes]);

  if (!ciclo) return null;
  const info = infoDia(hoy, ciclo, periodos);
  const [anio, numMes] = mes.split("-").map(Number);

  function moverMes(n: number) {
    const fecha = new Date(Date.UTC(anio, numMes - 1 + n, 1));
    setMes(fecha.toISOString().slice(0, 7));
  }

  // Historial de ciclos registrados
  const ordenados = [...periodos].sort();
  const duraciones = ordenados.slice(1).map((p, i) => diferenciaDias(ordenados[i], p));
  const promedio = duraciones.length ? Math.round(duraciones.reduce((s, d) => s + d, 0) / duraciones.length) : null;

  // Predicciones: próximos 3 ciclos
  const predicciones = Array.from({ length: 3 }, (_, i) => {
    const inicio = sumarDias(info.proximoPeriodo, i * ciclo.duracionCiclo);
    const ovul = sumarDias(inicio, ciclo.duracionCiclo - 14);
    return { inicio, fertilDesde: sumarDias(ovul, -5), fertilHasta: sumarDias(ovul, 1) };
  });

  const yaRegistradaHoy = periodos.includes(hoy);

  return (
    <main className="pagina">
      <header className="columna" style={{ gap: 4 }}>
        <span className="eyebrow eyebrow-rojo">Mi ciclo</span>
        <h1 className="titulo-xl">
          Día {info.diaCiclo} <span className="texto-3" style={{ fontSize: 22 }}>de {ciclo.duracionCiclo}</span>
        </h1>
        <p className="texto-2">
          {FASES[info.fase].nombre} · próximo periodo el <b className="num" style={{ color: "var(--vino)" }}>{fechaLarga(info.proximoPeriodo)}</b>
        </p>
      </header>

      <button
        className="boton boton-principal boton-ancho"
        onClick={() => (yaRegistradaHoy ? avisar("Ya registraste tu regla hoy") : setConfirmar(true))}
      >
        <Droplet size={18} /> {yaRegistradaHoy ? "Regla registrada hoy" : "Mi regla llegó hoy"}
      </button>

      <section className="tarjeta" aria-label="Calendario">
        <div className="fila-entre">
          <button className="boton-icono" aria-label="Mes anterior" onClick={() => moverMes(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="titulo-m" style={{ textTransform: "capitalize" }}>
            {MESES[numMes - 1]} {anio}
          </h2>
          <button className="boton-icono" aria-label="Mes siguiente" onClick={() => moverMes(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className={estilos.rejilla}>
          {ENCABEZADO.map((l, i) => (
            <span key={i} className={estilos.cabeza}>{l}</span>
          ))}
          {celdas.map((f, i) => {
            if (!f) return <span key={`v${i}`} />;
            const d = infoDia(f, ciclo, periodos);
            const regla = d.diaCiclo <= ciclo.duracionRegla;
            const futuro = f > hoy;
            const reg = registros[f];
            return (
              <button
                key={f}
                className={clases(
                  estilos.celda,
                  regla && (futuro ? estilos.reglaPrevista : estilos.regla),
                  !regla && d.fertil && estilos.fertil,
                  f === d.ovulacion && estilos.ovulacion,
                  f === hoy && estilos.hoy,
                )}
                onClick={() => setDia(f)}
                aria-label={`${fechaLarga(f)}: ${FASES[d.fase].corta}${regla ? ", regla" : ""}${d.fertil ? ", ventana fértil" : ""}${reg?.intimo ? ", día íntimo" : ""}`}
              >
                <span className="num">{Number(f.slice(8))}</span>
                <span className={estilos.marcas}>
                  {reg?.intimo && <Heart size={8} fill="currentColor" />}
                  {reg?.animo && <span className={estilos.puntoAnimo} />}
                </span>
              </button>
            );
          })}
        </div>
        <ul className={estilos.leyenda}>
          <li><span className={clases(estilos.muestra, estilos.regla)} /> Regla</li>
          <li><span className={clases(estilos.muestra, estilos.reglaPrevista)} /> Regla prevista</li>
          <li><span className={clases(estilos.muestra, estilos.fertil)} /> Ventana fértil</li>
          <li><span className={clases(estilos.muestra, estilos.ovulacion)} /> Ovulación</li>
          <li><Heart size={10} fill="currentColor" color="var(--rosa-tinta)" /> Día íntimo</li>
        </ul>
      </section>

      <section className="seccion">
        <h2 className="titulo-m">Tus fases</h2>
        <div className={estilos.fases}>
          {(Object.keys(FASES) as Fase[]).map((f) => {
            const dias = Array.from({ length: ciclo.duracionCiclo }, (_, i) => i + 1).filter((n) => faseDelDia(n, ciclo) === f);
            return (
              <div key={f} className={clases(estilos.faseFila, f === info.fase && estilos.faseActual)}>
                <span className={estilos.faseColor} style={{ background: FASES[f].color }} />
                <div className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                  <span className="negrita pequeno">{FASES[f].corta}</span>
                  <span className="mini texto-2">{FASES[f].tono}</span>
                </div>
                <span className="mini texto-2 num">
                  Días {dias[0]}–{dias[dias.length - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="seccion">
        <h2 className="titulo-m">Próximos ciclos</h2>
        <div className="lista">
          {predicciones.map((p) => (
            <div key={p.inicio} className="lista-item">
              <span className="lista-icono"><Droplet size={17} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno">Periodo · {fechaLarga(p.inicio)}</span>
                <span className="mini texto-2">Ventana fértil del {fechaLarga(p.fertilDesde)} al {fechaLarga(p.fertilHasta)}</span>
              </span>
              <span className="mini texto-3 num">en {diferenciaDias(hoy, p.inicio)} d</span>
            </div>
          ))}
        </div>
        <p className="ayuda">Son estimaciones según tu configuración y tus registros. No son un método anticonceptivo.</p>
      </section>

      <section className="seccion">
        <h2 className="titulo-m">Tu historial</h2>
        <div className="tarjeta columna">
          <div className="fila-entre">
            <span className="pequeno texto-2">Ciclos registrados</span>
            <span className="negrita num">{Math.max(0, ordenados.length - 1)}</span>
          </div>
          <div className="fila-entre">
            <span className="pequeno texto-2">Duración promedio</span>
            <span className="negrita num">{promedio ? `${promedio} días` : `${ciclo.duracionCiclo} días (configurado)`}</span>
          </div>
          <hr className="separador" />
          <ul className="columna" style={{ listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
            {[...ordenados].reverse().slice(0, 6).map((p, i, arr) => (
              <li key={p} className="fila-entre pequeno">
                <span>Inicio · {fechaLarga(p)} {p.slice(0, 4)}</span>
                <span className="texto-2 num">
                  {i < arr.length - 1 ? `${diferenciaDias(arr[i + 1], p)} días` : "primer registro"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BebeAgua />
      <MiObjetivo />

      <DetalleDia fecha={dia} alCerrar={() => setDia(null)} />
      <Confirmar
        abierta={confirmar}
        alCerrar={() => setConfirmar(false)}
        titulo="¿Te llegó la regla hoy?"
        texto={`Registraremos el ${fechaLarga(hoy)} como primer día de tu regla y ajustaremos tus predicciones.`}
        accion="Sí, registrar"
        alConfirmar={() => {
          registrarPeriodo(hoy);
          avisar("Regla registrada");
        }}
      />
    </main>
  );
}

function DetalleDia({ fecha, alCerrar }: { fecha: Fecha | null; alCerrar: () => void }) {
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const registro = useEstado((e) => (fecha ? e.registros[fecha] : undefined));
  const hoy = hoyColombia();
  const [nota, setNota] = useState<{ fecha: string; texto: string } | null>(null);
  if (!ciclo) return null;
  const d = fecha ? infoDia(fecha, ciclo, periodos) : null;
  const esInicio = fecha ? periodos.includes(fecha) : false;
  const futuro = fecha ? fecha > hoy : false;
  const textoNota = nota && nota.fecha === fecha ? nota.texto : (registro?.nota ?? "");
  const animo = ANIMOS.find((a) => a.id === registro?.animo);

  return (
    <Hoja abierta={fecha !== null} alCerrar={alCerrar} titulo={fecha ? fechaLarga(fecha) : ""}>
      {d && fecha && (
        <>
          <div className="fila" style={{ gap: 8 }}>
            <span className="chip" style={{ background: FASES[d.fase].pastel, color: "var(--vino)" }}>
              {FASES[d.fase].corta}
            </span>
            <span className="chip chip-borde">Día {d.diaCiclo} del ciclo</span>
            {d.fertil && <span className="chip chip-lila">Ventana fértil</span>}
          </div>
          {(animo || (registro?.sintomas.length ?? 0) > 0 || registro?.tomoSobre) && (
            <div className="tarjeta-plana columna" style={{ gap: 4 }}>
              {animo && <span className="pequeno">Ánimo: <b>{animo.nombre}</b></span>}
              {registro?.sintomas.length ? <span className="pequeno">Síntomas: {registro.sintomas.join(", ")}</span> : null}
              {registro?.tomoSobre && <span className="pequeno">Tomaste tu sobre de Mi Ciclo</span>}
            </div>
          )}
          <button
            className="lista-item tarjeta-plana"
            style={{ borderRadius: 18 }}
            onClick={() => alternarIntimo(fecha)}
            aria-pressed={!!registro?.intimo}
          >
            <span className="lista-icono"><Heart size={17} fill={registro?.intimo ? "currentColor" : "none"} /></span>
            <span className="lista-texto">
              <span className="negrita pequeno">Día íntimo</span>
              <span className="mini texto-2">Solo tú lo ves. Nunca se comparte.</span>
            </span>
            <span className="interruptor" role="switch" aria-checked={!!registro?.intimo} aria-label="Día íntimo" />
          </button>
          <div className="campo">
            <label htmlFor="nota-dia">Nota del día</label>
            <textarea
              id="nota-dia"
              className="entrada"
              placeholder="¿Algo que quieras recordar?"
              value={textoNota}
              onChange={(e) => setNota({ fecha, texto: e.target.value })}
              onBlur={() => nota && guardarNotaDia(fecha, nota.texto)}
            />
          </div>
          {!futuro &&
            (esInicio ? (
              <button
                className="boton boton-secundario boton-ancho"
                disabled={periodos.length <= 1}
                onClick={() => {
                  quitarPeriodo(fecha);
                  avisar("Inicio de regla quitado");
                  alCerrar();
                }}
              >
                Quitar inicio de regla
              </button>
            ) : (
              <button
                className="boton boton-vino boton-ancho"
                onClick={() => {
                  registrarPeriodo(fecha);
                  avisar(`Regla registrada el ${fechaLarga(fecha)}`);
                  alCerrar();
                }}
              >
                Mi regla empezó este día
              </button>
            ))}
        </>
      )}
    </Hoja>
  );
}
