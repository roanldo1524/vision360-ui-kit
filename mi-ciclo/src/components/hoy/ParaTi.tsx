"use client";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { Ilustracion } from "@/components/Ilustracion";
import { Ciclita } from "@/components/Ciclita";
import { Avatar } from "@/components/Avatar";
import type { Comunidad } from "@/lib/tipos";
import estilos from "./hoy.module.css";

const DIA = 86_400_000;

function autorasDeHoy(c: Comunidad): string[] {
  const desde = Date.now() - DIA;
  const ids = c.publicaciones
    .filter((p) => p.creadaEn >= desde && p.estado === "publicada" && !p.anonima)
    .map((p) => p.autoraId);
  return [...new Set(ids)];
}

/** Para ti, En pareja y el avance de la comunidad. */
export function ParaTi() {
  const comunidad = useEstado((e) => e.comunidad);
  const vinculoActivo = useEstado((e) => e.vinculos.find((v) => v.estado === "activo"));
  const autoras = autorasDeHoy(comunidad);
  const perfiles = comunidad.perfiles.filter((p) => autoras.includes(p.id)).slice(0, 3);

  return (
    <>
      <section className="seccion">
        <h2 className="titulo-m">Para ti</h2>
        <div className="rejilla-2">
          <Link href="/consejos" className={estilos.tarjetaFoto}>
            <div className={estilos.foto}>
              <Ilustracion id="antifaz" />
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Consejos para tu fase</h3>
              <p className="mini texto-2">Comer, moverte y descansar</p>
              <span className="enlace-rojo">Ver consejos <ChevronRight size={14} /></span>
            </div>
          </Link>
          <Link href="/diario" className={estilos.tarjetaFoto}>
            <div className={estilos.foto}>
              <Ilustracion id="cuaderno" texto="Hoy me siento…" />
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Mi diario</h3>
              <p className="mini texto-2">Un espacio solo para ti</p>
              <span className="enlace-rojo">Escribir ahora <ChevronRight size={14} /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className="seccion">
        <h2 className="titulo-m">En pareja</h2>
        <div className="rejilla-2">
          <Link href="/vinculo#notas" className={estilos.tarjetaFoto}>
            <div className={estilos.foto}>
              <Ilustracion id="bolsa" />
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Tu espacio con tu amor</h3>
              <p className="mini texto-2">Notas que duran 24 h</p>
              <span className="enlace-rojo">Escribir <ChevronRight size={14} /></span>
            </div>
          </Link>
          <Link href="/vinculo" className={estilos.tarjetaFoto}>
            <div className={estilos.foto} style={{ background: "var(--menta)", display: "grid", placeItems: "center" }}>
              <div className="fila" style={{ gap: 0 }}>
                <Ciclita id="rosa" tamano={56} />
                <span className={estilos.masVinculo}>
                  {vinculoActivo ? <Ciclita id="menta" tamano={48} /> : <Plus size={20} />}
                </span>
              </div>
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Sincroniza tu ritmo</h3>
              <p className="mini texto-2">
                {vinculoActivo ? `Conectada con ${vinculoActivo.nombre ?? "tu vínculo"}` : "Acompáñense en cada fase"}
              </p>
              <span className="enlace-rojo">
                {vinculoActivo ? "Ver vínculo" : "Invitar a tu pareja"} <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <Link href="/comunidad" className={estilos.comunidad}>
        <span className={estilos.pila}>
          {(perfiles.length ? perfiles : comunidad.perfiles.slice(0, 3)).map((p) => (
            <Avatar key={p.id} ciclita={p.ciclita} fotoId={p.fotoId} tamano={34} nombre={p.alias} />
          ))}
        </span>
        <span className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ fontSize: 9.5 }}>De la comunidad</span>
          <span className="pequeno negrita">
            {autoras.length === 1 ? "1 chica compartió hoy" : `${autoras.length} chicas compartieron hoy`}
          </span>
        </span>
        <span className="enlace-rojo">Ver comunidad <ChevronRight size={14} /></span>
      </Link>
    </>
  );
}
