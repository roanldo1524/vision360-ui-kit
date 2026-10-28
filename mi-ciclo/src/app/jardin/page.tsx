"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, ExternalLink, Gift, Flame, Sprout } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { hoyColombia, rachaSobre } from "@/lib/ciclo";
import { BONO_RACHA, MISIONES, type ClaveMision } from "@/lib/misiones";
import { BONOS, canjearBono, copiarTexto, petalosGanados, type Bono } from "@/lib/jardin/acciones";
import type { Canje } from "@/lib/tipos";
import { Flor } from "@/components/Flor";
import { Ciclita } from "@/components/Ciclita";
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
  const ciclita = useEstado((e) => e.perfil?.ciclita ?? "rosa");

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

  return (
    <main className="pagina">
      <header className={estilos.cabeza}>
        <div>
          <p className="eyebrow eyebrow-rojo">Tu jardín</p>
          <h1 className="titulo-xl">Jardín</h1>
        </div>
        <Ciclita id={ciclita} tamano={48} feliz />
      </header>

      <section className={estilos.heroe} aria-label="Tus pétalos">
        <div className={estilos.saldo}>
          <div className="fila" style={{ gap: 8 }}>
            <span className={estilos.florSaldo}><Flor activa tamano={26} /></span>
            <span className="eyebrow">Pétalos disponibles</span>
          </div>
          <p className={clases(estilos.numero, "num")}>{petalos.toLocaleString("es-CO")}</p>
          <p className="texto-2 pequeno">
            Hoy ganaste <strong className="num">{petalosHoy}</strong> · En total has cultivado{" "}
            <strong className="num">{ganados.toLocaleString("es-CO")}</strong>
          </p>
        </div>
        <Jardin ganados={ganados} ciclita={ciclita} />
      </section>

      <section className="seccion" aria-labelledby="t-misiones">
        <div className="seccion-cabeza">
          <h2 id="t-misiones" className="titulo-m">Misiones de hoy</h2>
          <span className="chip chip-menta num">{hechas.length}/{claves.length}</span>
        </div>
        <ul className={clases("lista", estilos.misiones)}>
          {claves.map((clave) => {
            const m = MISIONES[clave];
            const hecha = hechas.includes(clave);
            return (
              <li key={clave}>
                <Link href={m.enlace} className="lista-item" aria-label={`${m.titulo}${hecha ? ", completada" : ""}`}>
                  <span className={clases(estilos.check, hecha && estilos.checkHecha)} aria-hidden="true">
                    {hecha ? <Check size={16} strokeWidth={3} /> : <Sprout size={16} />}
                  </span>
                  <span className="lista-texto">
                    <span className={clases("negrita pequeno", hecha && estilos.tachada)}>{m.titulo}</span>
                    <span className="mini texto-3">+{m.petalos} pétalos</span>
                  </span>
                  {!hecha && <ChevronRight size={18} className="texto-3" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={estilos.racha} aria-label="Tu racha">
        <span className={estilos.rachaIcono}><Flame size={22} /></span>
        <div style={{ minWidth: 0 }}>
          <p className="titulo-s">{racha === 1 ? "1 día seguido" : `${racha} días seguidos`}</p>
          <p className="pequeno texto-2">
            Cada {BONO_RACHA.dias} días tomando tu sobre ganas <strong>+{BONO_RACHA.petalos} pétalos</strong>.{" "}
            {racha > 0 ? `Te faltan ${faltanRacha} ${faltanRacha === 1 ? "día" : "días"}.` : "Empieza hoy."}
          </p>
          <div className={estilos.rachaPuntos} aria-hidden="true">
            {Array.from({ length: BONO_RACHA.dias }).map((_, i) => (
              <span key={i} className={clases(estilos.punto, i < racha % BONO_RACHA.dias && estilos.puntoLleno)} />
            ))}
          </div>
        </div>
      </section>

      <section className="seccion" aria-labelledby="t-bonos">
        <div className="seccion-cabeza">
          <h2 id="t-bonos" className="titulo-m">Canjea tus pétalos</h2>
        </div>
        <div className="columna">
          {BONOS.map((b, _i, todos) => {
            const alcanza = petalos >= b.petalos;
            // Solo el mejor bono alcanzable lleva el rojo de acción principal
            const destacado = todos.filter((x) => petalos >= x.petalos).at(-1)?.id === b.id;
            const progreso = Math.min(100, Math.round((petalos / b.petalos) * 100));
            return (
              <article key={b.id} className={clases(estilos.bono, estilos[`bono_${b.color}`])}>
                <div className={estilos.bonoIcono} aria-hidden="true"><Gift size={20} /></div>
                <div className={estilos.bonoTexto}>
                  <h3 className="titulo-s">{b.titulo}</h3>
                  <p className="mini texto-2">{b.detalle}</p>
                  <div className={estilos.barra} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso hacia ${b.titulo}`}>
                    <span style={{ width: `${progreso}%` }} />
                  </div>
                  <p className="mini negrita num">
                    <Flor activa tamano={12} className={estilos.florMini} /> {b.petalos} pétalos
                    {!alcanza && <span className="texto-3"> · te faltan {b.petalos - petalos}</span>}
                  </p>
                </div>
                <button
                  className={clases("boton boton-chico", destacado ? "boton-principal" : alcanza ? "boton-vino" : "boton-secundario")}
                  disabled={!alcanza}
                  onClick={() => setPorCanjear(b)}
                >
                  Canjear
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <Productos />

      <section className="seccion" aria-labelledby="t-mis-bonos">
        <h2 id="t-mis-bonos" className="titulo-m">Mis bonos</h2>
        {canjes.length === 0 ? (
          <div className="tarjeta-plana pequeno texto-2">
            Aquí verás los bonos que canjees, con su código y el enlace a la tienda.
          </div>
        ) : (
          <ul className="lista">
            {canjes.map((c) => (
              <li key={c.id} className="lista-item">
                <span className="lista-icono" aria-hidden="true"><Gift size={18} /></span>
                <span className="lista-texto">
                  <span className="negrita pequeno">{c.titulo}</span>
                  <span className={clases("mini texto-2", estilos.codigo)}>{c.codigo}</span>
                  <span className="mini texto-3">{formatoFecha.format(c.fecha)} · {c.petalos} pétalos</span>
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

      <section className="seccion" aria-labelledby="t-mov">
        <div className="seccion-cabeza">
          <h2 id="t-mov" className="titulo-m">Movimientos</h2>
          {movimientos.length > 6 && (
            <button className="enlace-vino" onClick={() => setVerTodo((v) => !v)}>
              {verTodo ? "Ver menos" : "Ver todos"}
            </button>
          )}
        </div>
        {movimientos.length === 0 ? (
          <div className="tarjeta-plana pequeno texto-2">Completa tu primera misión para ver tus pétalos aquí.</div>
        ) : (
          <ul className="lista">
            {(verTodo ? movimientos : movimientos.slice(0, 6)).map((m) => (
              <li key={m.id} className="lista-item">
                <span className="lista-texto">
                  <span className="pequeno">{m.motivo}</span>
                  <span className="mini texto-3">{formatoFecha.format(m.fecha)}</span>
                </span>
                <span className={clases("negrita num pequeno", m.cantidad > 0 ? estilos.gana : estilos.gasta)}>
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
            <p className="texto-2">
              Vas a cambiar <strong className="num">{porCanjear.petalos} pétalos</strong> por{" "}
              <strong>{porCanjear.titulo.toLowerCase()}</strong>. Te quedarán{" "}
              <strong className="num">{petalos - porCanjear.petalos}</strong>.
            </p>
            <div className="columna" style={{ marginTop: 8 }}>
              <button className="boton boton-principal boton-ancho" onClick={confirmarCanje}>Canjear bono</button>
              <button className="boton boton-secundario boton-ancho" onClick={() => setPorCanjear(null)}>Cancelar</button>
            </div>
          </>
        )}
      </Hoja>

      <Hoja abierta={recienCanjeado !== null} alCerrar={() => setRecienCanjeado(null)}>
        {recienCanjeado && (
          <div className={estilos.exito}>
            <Ciclita id="flor" tamano={84} feliz />
            <h2 className="titulo-l">¡Tu bono está listo!</h2>
            <p className="texto-2 pequeno">{recienCanjeado.titulo}. Úsalo en la tienda con este código:</p>
            <div className={estilos.codigoGrande}>
              <span className="num">{recienCanjeado.codigo}</span>
              <BotonCopiar codigo={recienCanjeado.codigo} />
            </div>
            <a href={recienCanjeado.url} target="_blank" rel="noopener noreferrer" className="boton boton-principal boton-ancho">
              Ir a la tienda <ExternalLink size={16} />
            </a>
            <p className="mini texto-3">El bono también queda guardado en “Mis bonos”.</p>
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
