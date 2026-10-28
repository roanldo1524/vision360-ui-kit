"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Bell, CalendarHeart, Flame, Lightbulb, Settings, UsersRound } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { marcarNotificacionesLeidas } from "@/lib/acciones";
import type { TipoNotificacion } from "@/lib/tipos";
import { haceCuanto } from "@/lib/utilidades";
import { Cabecera } from "@/components/Cabecera";
import { EstadoVacio } from "@/components/EstadoVacio";

const ICONO: Record<TipoNotificacion, { Icono: typeof Bell; fondo: string; tinta: string }> = {
  consejo: { Icono: Lightbulb, fondo: "var(--mantequilla)", tinta: "var(--mantequilla-tinta)" },
  racha: { Icono: Flame, fondo: "var(--rosa)", tinta: "var(--rosa-tinta)" },
  fase: { Icono: CalendarHeart, fondo: "var(--lila)", tinta: "var(--lila-tinta)" },
  comunidad: { Icono: UsersRound, fondo: "var(--menta)", tinta: "var(--menta-tinta)" },
  sistema: { Icono: Bell, fondo: "var(--durazno)", tinta: "var(--durazno-tinta)" },
};

export function Notificaciones() {
  const lista = useEstado((e) => e.notificaciones);

  useEffect(() => {
    const t = setTimeout(marcarNotificacionesLeidas, 1200);
    return () => clearTimeout(t);
  }, []);

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
      <main className="pagina pagina-sin-barra" style={{ paddingTop: 4 }}>
        {lista.length === 0 ? (
          <EstadoVacio titulo="Todo al día" texto="Aquí verás tu consejo diario, tu racha y los cambios de fase." />
        ) : (
          <div className="lista">
            {lista.map((n) => {
              const { Icono, fondo, tinta } = ICONO[n.tipo];
              const contenido = (
                <>
                  <span className="lista-icono" style={{ background: fondo, color: tinta }}>
                    <Icono size={17} />
                  </span>
                  <span className="lista-texto">
                    <span className="pequeno negrita">{n.titulo}</span>
                    <span className="pequeno texto-2">{n.texto}</span>
                    <span className="mini texto-3">{haceCuanto(n.fecha)}</span>
                  </span>
                  {!n.leida && <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--rojo)", flex: "none" }} aria-label="Sin leer" />}
                </>
              );
              return n.enlace ? (
                <Link key={n.id} href={n.enlace} className="lista-item">{contenido}</Link>
              ) : (
                <div key={n.id} className="lista-item">{contenido}</div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
