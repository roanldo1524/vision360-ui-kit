"use client";
// Mi ciclo: portada de marca con el día y la fase, el mes como calendario sereno,
// las cuatro fases con sus formas oficiales, próximos ciclos e historial.
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
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
import { FlorLuna } from "@/components/FormasMarca";
import { BebeAgua, MiObjetivo } from "@/components/hoy/Bienestar";
import { GlifoFase } from "./GlifoFase";
import estilos from "./calendario.module.css";

const ENCABEZADO = ["L", "M", "M", "J", "V", "S", "D"];
const MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ORDEN: Fase[] = ["menstrual", "folicular", "ovulacion", "lutea"];

function nombreCorto(f: Fase) {
  return FASES[f].corta.toLowerCase();
}

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

  const ordenados = [...periodos].sort();
  const duraciones = ordenados.slice(1).map((p, i) => diferenciaDias(ordenados[i], p));
  const promedio = duraciones.length ? Math.round(duraciones.reduce((s, d) => s + d, 0) / duraciones.length) : null;

  const predicciones = Array.from({ length: 3 }, (_, i) => {
    const inicio = sumarDias(info.proximoPeriodo, i * ciclo.duracionCiclo);
    const ovul = sumarDias(inicio, ciclo.duracionCiclo - 14);
    return { inicio, fertilDesde: sumarDias(ovul, -5), fertilHasta: sumarDias(ovul, 1) };
  });

  // Tramos de fase para la línea del ciclo de la portada
  const tramos = ORDEN.map((f) => {
    const dias = Array.from({ length: ciclo.duracionCiclo }, (_, i) => i + 1).filter((n) => faseDelDia(n, ciclo) === f);
    return { fase: f, desde: dias[0], hasta: dias[dias.length - 1], largo: dias.length };
  });

  const yaRegistradaHoy = periodos.includes(hoy);
  const esMesActual = mes === hoy.slice(0, 7);

  return (
    <main className={clases("pagina", estilos.pagina)}>
      {/* Portada de marca */}
      <section className={estilos.portada} aria-label="Tu ciclo hoy">
        <FlorLuna color="#ff5a66" fondo="var(--rojo)" tamano={280} className={estilos.florGigante} />
        <h1 className={estilos.titulo}>
          Mi <em>ciclo</em>
        </h1>
        <div className={estilos.dato}>
          <span className={estilos.cifra} aria-hidden="true">
            {info.diaCiclo}
          </span>
          <div className={estilos.datoTexto}>
            <p className={estilos.datoEtiqueta}>día de {ciclo.duracionCiclo}</p>
            <p className={estilos.faseNombre}>
              Fase <em>{nombreCorto(info.fase)}</em>
            </p>
          </div>
        </div>
        <p className="solo-lector">
          Día {info.diaCiclo} de {ciclo.duracionCiclo}, fase {nombreCorto(info.fase)}. Próximo período el {fechaLarga(info.proximoPeriodo)}.
        </p>

        <div className={estilos.linea} aria-hidden="true">
          {tramos.map((t) => (
            <span
              key={t.fase}
              className={clases(estilos.tramo, t.fase === info.fase && estilos.tramoActual)}
              style={{ flexGrow: t.largo }}
            >
              <span className={estilos.tramoBarra}>
                {t.fase === info.fase && (
                  <span
                    className={estilos.tramoMarca}
                    style={{ left: `${((info.diaCiclo - t.desde + 0.5) / t.largo) * 100}%` }}
                  />
                )}
              </span>
              <span className={estilos.tramoNombre}>{t.fase === "ovulacion" && t.fase !== info.fase ? "Ovul." : FASES[t.fase].corta}</span>
            </span>
          ))}
        </div>

        <div className={estilos.portadaPie}>
          <p className={estilos.proximo}>
            Próximo período
            <b>{fechaLarga(info.proximoPeriodo)}</b>
          </p>
          <button
            className={estilos.botonBlanco}
            onClick={() => (yaRegistradaHoy ? avisar("Ya registraste tu período hoy") : setConfirmar(true))}
          >
            {yaRegistradaHoy ? "Registrado hoy" : "Me llegó hoy"}
          </button>
        </div>
      </section>

      {/* Calendario */}
      <section className={estilos.tarjeta} aria-label="Calendario">
        <div className={estilos.mesCabeza}>
          <h2 className={estilos.mesTitulo}>
            {MESES[numMes - 1].replace(/^./, (c) => c.toUpperCase())} <em>{anio}</em>
          </h2>
          <div className={estilos.mesFlechas}>
            {!esMesActual && (
              <button className={estilos.hoyEnlace} onClick={() => setMes(hoy.slice(0, 7))}>
                Hoy
              </button>
            )}
            <button className={estilos.flecha} aria-label="Mes anterior" onClick={() => moverMes(-1)}>
              <ChevronLeft size={20} />
            </button>
            <button className={estilos.flecha} aria-label="Mes siguiente" onClick={() => moverMes(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className={estilos.rejilla}>
          {ENCABEZADO.map((l, i) => (
            <span key={i} className={estilos.cabeza} aria-hidden="true">
              {l}
            </span>
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
                aria-label={`${fechaLarga(f)}: fase ${FASES[d.fase].corta}${regla ? (futuro ? ", período previsto" : ", período") : ""}${d.fertil ? ", ventana fértil" : ""}${reg?.intimo ? ", día íntimo" : ""}`}
              >
                <span className="num">{Number(f.slice(8))}</span>
                {(reg?.intimo || reg?.animo || reg?.nota) && (
                  <span className={estilos.marcas} aria-hidden="true">
                    {reg?.intimo && <Heart size={7} fill="currentColor" strokeWidth={0} />}
                    {(reg?.animo || reg?.nota) && <span className={estilos.puntoAnimo} />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <ul className={estilos.leyenda}>
          <li>
            <span className={clases(estilos.muestra, estilos.regla)} /> Período
          </li>
          <li>
            <span className={clases(estilos.muestra, estilos.reglaPrevista)} /> Previsto
          </li>
          <li>
            <span className={clases(estilos.muestra, estilos.fertil)} /> Fértil
          </li>
          <li>
            <span className={clases(estilos.muestra, estilos.ovulacion)} /> Ovulación
          </li>
        </ul>
        <p className={estilos.pista}>Toca un día para anotar cómo estuviste.</p>
      </section>

      {/* Las cuatro fases */}
      <section className={estilos.seccion} aria-labelledby="t-fases">
        <h2 id="t-fases" className={estilos.tituloSeccion}>
          Tus <em>fases</em>
        </h2>
        <ul className={estilos.lista}>
          {tramos.map((t) => (
            <li key={t.fase} className={clases(estilos.fila, t.fase === info.fase && estilos.filaActual)}>
              <GlifoFase fase={t.fase} tamano={52} />
              <span className={estilos.filaTexto}>
                <span className={estilos.filaTitulo}>
                  {FASES[t.fase].corta}
                  {t.fase === info.fase && <span className={estilos.ahora}>Ahora</span>}
                </span>
                <span className={estilos.filaSub}>{FASES[t.fase].tono}</span>
              </span>
              <span className={estilos.filaDias}>
                días
                <b className="num">
                  {t.desde}–{t.hasta}
                </b>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Próximos ciclos */}
      <section className={estilos.seccion} aria-labelledby="t-proximos">
        <h2 id="t-proximos" className={estilos.tituloSeccion}>
          Próximos <em>ciclos</em>
        </h2>
        <ul className={estilos.lista}>
          {predicciones.map((p) => {
            const [, mm, dd] = p.inicio.split("-").map(Number);
            return (
              <li key={p.inicio} className={estilos.fila}>
                <span className={estilos.fechaFicha} aria-hidden="true">
                  <b className="num">{dd}</b>
                  <span>{MES_CORTO[mm - 1]}</span>
                </span>
                <span className={estilos.filaTexto}>
                  <span className={estilos.filaTitulo}>Período</span>
                  <span className={estilos.filaSub}>
                    Fértil del {fechaLarga(p.fertilDesde)} al {fechaLarga(p.fertilHasta)}
                  </span>
                </span>
                <span className={estilos.filaDias}>
                  en
                  <b className="num">{diferenciaDias(hoy, p.inicio)} d</b>
                </span>
              </li>
            );
          })}
        </ul>
        <p className={estilos.nota}>Son estimaciones según tu configuración y tus registros. No son un método anticonceptivo.</p>
      </section>

      {/* Historial */}
      <section className={estilos.seccion} aria-labelledby="t-historial">
        <h2 id="t-historial" className={estilos.tituloSeccion}>
          Tu <em>historial</em>
        </h2>
        <div className={estilos.cifras}>
          <div className={estilos.cifraFicha}>
            <b className="num">{Math.max(0, ordenados.length - 1)}</b>
            <span>ciclos registrados</span>
          </div>
          <div className={estilos.cifraFicha}>
            <b className="num">{promedio ?? ciclo.duracionCiclo}</b>
            <span>{promedio ? "días en promedio" : "días configurados"}</span>
          </div>
        </div>
        <ul className={estilos.lista}>
          {[...ordenados].reverse().slice(0, 6).map((p, i, arr) => (
            <li key={p} className={clases(estilos.fila, estilos.filaCompacta)}>
              <span className={estilos.filaTexto}>
                <span className={estilos.filaTituloSans}>
                  {fechaLarga(p)} {p.slice(0, 4)}
                </span>
              </span>
              <span className={estilos.filaSub}>
                {i < arr.length - 1 ? `${diferenciaDias(arr[i + 1], p)} días` : "Primer registro"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <BebeAgua />
      <MiObjetivo />

      <DetalleDia fecha={dia} alCerrar={() => setDia(null)} />
      <Confirmar
        abierta={confirmar}
        alCerrar={() => setConfirmar(false)}
        titulo="¿Te llegó el período hoy?"
        texto={`Registraremos el ${fechaLarga(hoy)} como primer día de tu período y ajustaremos tus predicciones.`}
        accion="Sí, me llegó hoy"
        alConfirmar={() => {
          registrarPeriodo(hoy);
          avisar("Período registrado");
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
          <div className={estilos.detalleFase}>
            <GlifoFase fase={d.fase} tamano={48} />
            <span className={estilos.filaTexto}>
              <span className={estilos.filaTitulo}>
                Fase <em>{nombreCorto(d.fase)}</em>
              </span>
              <span className={estilos.filaSub}>
                Día {d.diaCiclo} del ciclo{d.fertil ? " · ventana fértil" : ""}
              </span>
            </span>
          </div>
          {(animo || (registro?.sintomas.length ?? 0) > 0 || registro?.tomoSobre) && (
            <div className={estilos.detalleRegistro}>
              {animo && (
                <span>
                  Ánimo <b>{animo.nombre}</b>
                </span>
              )}
              {registro?.sintomas.length ? (
                <span>
                  Síntomas <b>{registro.sintomas.join(", ")}</b>
                </span>
              ) : null}
              {registro?.tomoSobre && <span>Tomaste tu sobre de Mi Ciclo</span>}
            </div>
          )}
          <button
            className={estilos.detalleIntimo}
            onClick={() => alternarIntimo(fecha)}
            role="switch"
            aria-checked={!!registro?.intimo}
          >
            <Heart size={18} fill={registro?.intimo ? "currentColor" : "none"} className={estilos.detalleCorazon} />
            <span className={estilos.filaTexto}>
              <span className={estilos.filaTituloSans}>Día íntimo</span>
              <span className={estilos.filaSub}>Solo tú lo ves. Nunca se comparte.</span>
            </span>
            <span className="interruptor" aria-checked={!!registro?.intimo} aria-hidden="true" />
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
                  avisar("Inicio de período quitado");
                  alCerrar();
                }}
              >
                Quitar inicio de período
              </button>
            ) : (
              <button
                className="boton boton-principal boton-ancho"
                onClick={() => {
                  registrarPeriodo(fecha);
                  avisar(`Período registrado el ${fechaLarga(fecha)}`);
                  alCerrar();
                }}
              >
                Mi período empezó este día
              </button>
            ))}
        </>
      )}
    </Hoja>
  );
}
