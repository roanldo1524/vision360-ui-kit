"use client";
// Notificaciones: lista serena agrupada en nuevas y anteriores, con las formas de la marca.
import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { marcarNotificacionesLeidas } from "@/lib/acciones";
import type { Notificacion, TipoNotificacion } from "@/lib/tipos";
import { clases, haceCuanto } from "@/lib/utilidades";
import { Cabecera } from "@/components/Cabecera";
import { Circulo, Estrella, FlorLuna, Luna } from "@/components/FormasMarca";
import estilos from "./notificaciones.module.css";

const GLIFO: Record<TipoNotificacion, { fondo: string; forma: React.ReactNode }> = {
  consejo: { fondo: "#f5ebfc", forma: <Estrella color="#b07ee0" tamano={22} /> },
  racha: { fondo: "#ffe4ea", forma: <FlorLuna color="#f62c39" fondo="#ffe4ea" tamano={26} /> },
  fase: { fondo: "#efe4fb", forma: <Luna color="#5b3aaa" tamano={20} /> },
  comunidad: { fondo: "#fff0f5", forma: <Circulo color="#ff8fab" tamano={18} /> },
  sistema: { fondo: "#ffe4ea", forma: <Circulo color="#f62c39" tamano={16} /> },
};

function Fila({ n }: { n: Notificacion }) {
  const g = GLIFO[n.tipo];
  const contenido = (
    <>
      <span className={estilos.glifo} style={{ background: g.fondo }} aria-hidden="true">
        {g.forma}
      </span>
      <span className={estilos.texto}>
        <span className={estilos.titulo}>{n.titulo}</span>
        <span className={estilos.cuerpo}>{n.texto}</span>
        <span className={estilos.tiempo}>{haceCuanto(n.fecha)}</span>
      </span>
      {!n.leida ? (
        <span className={estilos.nuevo} aria-label="Sin leer" />
      ) : n.enlace ? (
        <ChevronRight size={18} className={estilos.flecha} aria-hidden="true" />
      ) : null}
    </>
  );
  return n.enlace ? (
    <Link href={n.enlace} className={clases(estilos.fila, !n.leida && estilos.filaNueva)}>
      {contenido}
    </Link>
  ) : (
    <div className={clases(estilos.fila, !n.leida && estilos.filaNueva)}>{contenido}</div>
  );
}

export function Notificaciones() {
  const lista = useEstado((e) => e.notificaciones);

  useEffect(() => {
    const t = setTimeout(marcarNotificacionesLeidas, 1600);
    return () => clearTimeout(t);
  }, []);

  const nuevas = lista.filter((n) => !n.leida);
  const antes = lista.filter((n) => n.leida);

  return (
    <>
      <Cabecera
        titulo="Notificaciones"
        derecha={
          <Link href="/ajustes" className="boton-icono" aria-label="Ajustes de notificaciones">
            <Settings size={19} />
          </Link>
        }
      />
      <main className={clases("pagina pagina-sin-barra", estilos.pagina)}>
        <h1 className={estilos.encabezado}>
          Tus <em>avisos</em>
        </h1>
        {lista.length === 0 ? (
          <div className={estilos.vacio}>
            <span className={estilos.vacioGlifo} aria-hidden="true">
              <Luna color="#5b3aaa" tamano={30} />
            </span>
            <p className={estilos.vacioTitulo}>Todo está en calma</p>
            <p className={estilos.vacioTexto}>Aquí verás tu consejo del día, tu racha y los cambios de fase.</p>
          </div>
        ) : (
          <>
            {nuevas.length > 0 && (
              <section className={estilos.grupo} aria-labelledby="t-nuevas">
                <h2 id="t-nuevas" className={estilos.grupoTitulo}>
                  Nuevas
                </h2>
                <div className={estilos.lista}>
                  {nuevas.map((n) => (
                    <Fila key={n.id} n={n} />
                  ))}
                </div>
              </section>
            )}
            {antes.length > 0 && (
              <section className={estilos.grupo} aria-labelledby="t-antes">
                <h2 id="t-antes" className={estilos.grupoTitulo}>
                  Anteriores
                </h2>
                <div className={estilos.lista}>
                  {antes.map((n) => (
                    <Fila key={n.id} n={n} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
