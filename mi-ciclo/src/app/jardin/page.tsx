"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { hoyColombia, rachaSobre } from "@/lib/ciclo";
import { BONO_RACHA, MISIONES, type ClaveMision } from "@/lib/misiones";
import { BONOS, canjearBono, copiarTexto, petalosGanados, type Bono } from "@/lib/jardin/acciones";
import type { Canje } from "@/lib/tipos";
import { Flor } from "@/components/Flor";
import { Circulo, FlorLuna, FlorOndulada } from "@/components/FormasMarca";
import { Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { clases } from "@/lib/utilidades";
import { Jardin } from "./Jardin";
import { Productos } from "@/components/hoy/Bienestar";
import estilos from "./jardin.module.css";

const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });

export default function PaginaJardin() {
  const petalos = useEstado((e) => e.petalos);
  const movimientos = useEstado((e) => e.movimientos);
  const canjes = useEstado((e) => e.canjes);
  const misiones = useEstado((e) => e.misiones);
  const registros = useEstado((e) => e.registros);

  const [porCanjear, setPorCanjear] = useState<Bono | null>(null);
  const [recienCanjeado, setRecienCanjeado] = useState<Canje | null>(null);
  const [verTodo, setVerTodo] = useState(false);

  const hoy = hoyColombia();
  const hechas = (misiones[hoy] ?? []) as ClaveMision[];
  const claves = Object.keys(MISIONES) as ClaveMision[];
  const ganados = petalosGanados(movimientos);
  const racha = rachaSobre(hoy, registros);
  const faltanRacha = BONO_RACHA.dias - (racha % BONO_RACHA.dias);
  const petalosHoy = claves.filter((c) => hechas.includes(c)).reduce((t, c) => t + MISIONES[c].petalos, 0);

  const confirmarCanje = () => {
    if (!porCanjear) return;
    const canje = canjearBono(porCanjear.id);
    setPorCanjear(null);
    if (canje) setRecienCanjeado(canje);
    else avisar("Aún no tienes pétalos suficientes para este bono", "error");
  };

  const destacadoId = BONOS.filter((x) => petalos >= x.petalos).at(-1)?.id;

  return (
    <main className={clases("pagina", estilos.pagina)}>
      {/* Portada de marca: los pétalos son la cifra protagonista */}
      <section className={estilos.portada} aria-labelledby="t-jardin">
        <FlorLuna color="#ff5a66" fondo="var(--rojo)" tamano={280} className={estilos.florGigante} />
        <h1 id="t-jardin" className={estilos.titulo}>
          Tu <em>jardín</em>
        </h1>
        <div className={estilos.dato}>
          <span className={clases(estilos.cifra, "num")}>{petalos.toLocaleString("es-CO")}</span>
          <p className={estilos.datoTexto}>
            <b>pétalos para canjear</b>
            <span>
              Hoy ganaste <b className="num">{petalosHoy}</b> · en total <b className="num">{ganados.toLocaleString("es-CO")}</b>
            </span>
          </p>
        </div>
        <Jardin ganados={ganados} />
      </section>

      <section className={estilos.seccion} aria-labelledby="t-misiones">
        <div className={estilos.cabezaSeccion}>
          <h2 id="t-misiones" className={estilos.tituloSeccion}>
            Misiones de <em>hoy</em>
          </h2>
          <span className={estilos.contador}>
            <b className="num">{hechas.length}</b> de {claves.length}
          </span>
        </div>
        <ul className={estilos.lista}>
          {claves.map((clave) => {
            const m = MISIONES[clave];
            const hecha = hechas.includes(clave);
            return (
              <li key={clave}>
                <Link href={m.enlace} className={estilos.fila} aria-label={`${m.titulo}, ${m.petalos} pétalos${hecha ? ", completada" : ""}`}>
                  <span className={clases(estilos.check, hecha && estilos.checkHecha)} aria-hidden="true">
                    {hecha ? <Check size={18} strokeWidth={3} /> : <Circulo color="#ffb3cf" tamano={16} />}
                  </span>
                  <span className={estilos.filaTexto}>
                    <span className={clases(estilos.filaTitulo, hecha && estilos.tachada)}>{m.titulo}</span>
                    <span className={estilos.filaSub}>+{m.petalos} pétalos</span>
                  </span>
                  {!hecha && <ChevronRight size={20} className={estilos.flecha} aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={estilos.racha} aria-labelledby="t-racha">
        <div className={estilos.rachaCabeza}>
          <span className={estilos.rachaGlifo} aria-hidden="true">
            <FlorOndulada color="#5b3aaa" fondo="#efe4fb" tamano={30} />
          </span>
          <div>
            <h2 id="t-racha" className={estilos.rachaTitulo}>
              {racha === 0 ? "Hoy empieza tu racha" : racha === 1 ? "1 día seguido" : `${racha} días seguidos`}
            </h2>
            <p className={estilos.rachaTexto}>
              Cada {BONO_RACHA.dias} días con tu sobre ganas <b>+{BONO_RACHA.petalos} pétalos</b>.{" "}
              {racha > 0 ? `Te ${faltanRacha === 1 ? "falta" : "faltan"} ${faltanRacha} ${faltanRacha === 1 ? "día" : "días"}.` : ""}
            </p>
          </div>
        </div>
        <div className={estilos.rachaPuntos} aria-hidden="true">
          {Array.from({ length: BONO_RACHA.dias }).map((_, i) => (
            <span key={i} className={clases(estilos.punto, i < racha % BONO_RACHA.dias && estilos.puntoLleno)} />
          ))}
        </div>
      </section>

      <section className={estilos.seccion} aria-labelledby="t-bonos">
        <div className={estilos.cabezaSeccion}>
          <h2 id="t-bonos" className={estilos.tituloSeccion}>
            Canjea tus <em>pétalos</em>
          </h2>
        </div>
        <ul className={estilos.bonos}>
          {BONOS.map((b) => {
            const alcanza = petalos >= b.petalos;
            const progreso = Math.min(100, Math.round((petalos / b.petalos) * 100));
            return (
              <li key={b.id} className={estilos.bono}>
                <div className={estilos.bonoArriba}>
                  <span className={estilos.bonoFoto} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/marca/conf-producto.webp" alt="" />
                  </span>
                  <div className={estilos.bonoTexto}>
                    <h3 className={estilos.bonoTitulo}>{b.titulo}</h3>
                    <p className={estilos.bonoDetalle}>{b.detalle}</p>
                  </div>
                </div>
                <div
                  className={estilos.barra}
                  role="progressbar"
                  aria-valuenow={progreso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progreso hacia ${b.titulo}`}
                >
                  <span style={{ width: `${progreso}%` }} />
                </div>
                <div className={estilos.bonoAbajo}>
                  <p className={estilos.bonoPrecio}>
                    <Flor activa tamano={16} /> <b className="num">{b.petalos}</b> pétalos
                    {!alcanza && <span className={estilos.faltan}> · te faltan {b.petalos - petalos}</span>}
                  </p>
                  {alcanza && (
                    <button
                      className={clases("boton boton-chico", b.id === destacadoId ? "boton-principal" : "boton-secundario")}
                      onClick={() => setPorCanjear(b)}
                    >
                      Canjear
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Productos />

      <section className={estilos.seccion} aria-labelledby="t-mis-bonos">
        <h2 id="t-mis-bonos" className={estilos.tituloSeccion}>
          Mis <em>bonos</em>
        </h2>
        {canjes.length === 0 ? (
          <div className={estilos.vacio}>
            <Circulo color="#ffdced" tamano={28} />
            <p>Aquí verás los bonos que canjees, con su código y el enlace a la tienda.</p>
          </div>
        ) : (
          <ul className={estilos.lista}>
            {canjes.map((c) => (
              <li key={c.id} className={estilos.filaBono}>
                <span className={estilos.filaTexto}>
                  <span className={estilos.filaTitulo}>{c.titulo}</span>
                  <span className={estilos.codigo}>{c.codigo}</span>
                  <span className={estilos.filaSub}>
                    {formatoFecha.format(c.fecha)} · {c.petalos} pétalos
                  </span>
                </span>
                <BotonCopiar codigo={c.codigo} />
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="boton-icono" aria-label={`Usar ${c.codigo} en la tienda`}>
                  <ExternalLink size={18} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={estilos.seccion} aria-labelledby="t-mov">
        <div className={estilos.cabezaSeccion}>
          <h2 id="t-mov" className={estilos.tituloSeccion}>
            Tus <em>movimientos</em>
          </h2>
          {movimientos.length > 6 && (
            <button className={estilos.enlace} onClick={() => setVerTodo((v) => !v)}>
              {verTodo ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>
        {movimientos.length === 0 ? (
          <div className={estilos.vacio}>
            <Circulo color="#ffdced" tamano={28} />
            <p>Completa tu primera misión para ver tus pétalos aquí.</p>
          </div>
        ) : (
          <ul className={estilos.lista}>
            {(verTodo ? movimientos : movimientos.slice(0, 6)).map((m) => (
              <li key={m.id} className={estilos.filaMovimiento}>
                <span className={estilos.filaTexto}>
                  <span className={estilos.filaTitulo}>{m.motivo}</span>
                  <span className={estilos.filaSub}>{formatoFecha.format(m.fecha)}</span>
                </span>
                <span className={clases("num", estilos.cantidad, m.cantidad > 0 ? estilos.gana : estilos.gasta)}>
                  {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Hoja abierta={porCanjear !== null} alCerrar={() => setPorCanjear(null)} titulo="Confirmar canje">
        {porCanjear && (
          <>
            <div className={estilos.resumenCanje}>
              <span className={estilos.bonoFoto} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/marca/conf-producto.webp" alt="" />
              </span>
              <div>
                <p className={estilos.bonoTitulo}>{porCanjear.titulo}</p>
                <p className={estilos.bonoDetalle}>
                  Usas <b className="num">{porCanjear.petalos}</b> pétalos y te quedan <b className="num">{petalos - porCanjear.petalos}</b>.
                </p>
              </div>
            </div>
            <div className="columna" style={{ marginTop: 8 }}>
              <button className="boton boton-principal boton-ancho" onClick={confirmarCanje}>
                Canjear bono
              </button>
              <button className="boton boton-secundario boton-ancho" onClick={() => setPorCanjear(null)}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </Hoja>

      <Hoja abierta={recienCanjeado !== null} alCerrar={() => setRecienCanjeado(null)}>
        {recienCanjeado && (
          <div className={estilos.exito}>
            <FlorLuna color="var(--rojo)" tamano={88} />
            <h2 className={estilos.exitoTitulo}>
              Tu bono está <em>listo</em>
            </h2>
            <p className={estilos.bonoDetalle}>{recienCanjeado.titulo}. Úsalo en la tienda con este código:</p>
            <div className={estilos.codigoGrande}>
              <span className="num">{recienCanjeado.codigo}</span>
              <BotonCopiar codigo={recienCanjeado.codigo} />
            </div>
            <a href={recienCanjeado.url} target="_blank" rel="noopener noreferrer" className="boton boton-principal boton-ancho">
              Ir a la tienda <ExternalLink size={16} />
            </a>
            <p className={estilos.filaSub}>El bono también queda guardado en “Mis bonos”.</p>
          </div>
        )}
      </Hoja>
    </main>
  );
}

function BotonCopiar({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      className="boton-icono"
      aria-label={copiado ? "Código copiado" : `Copiar código ${codigo}`}
      onClick={async () => {
        const ok = await copiarTexto(codigo);
        if (ok) {
          setCopiado(true);
          avisar("Código copiado");
          setTimeout(() => setCopiado(false), 1800);
        } else {
          avisar(`Copia este código: ${codigo}`);
        }
      }}
    >
      {copiado ? <Check size={18} /> : <Copy size={18} />}
    </button>
  );
}
