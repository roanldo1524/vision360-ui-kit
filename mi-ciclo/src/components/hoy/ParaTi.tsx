"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { Ilustracion } from "@/components/Ilustracion";
import { Ciclita } from "@/components/Ciclita";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import type { Comunidad, Fase } from "@/lib/tipos";
import estilos from "./hoy.module.css";

const DIA = 86_400_000;

// Fotos de la marca según lo que más acompaña cada fase
const FOTO_FASE: Record<Fase, { src: string; alt: string }> = {
  menstrual: { src: "/marca/sint-colicos.webp", alt: "Mujer abrazando su vientre en un día de cólicos" },
  folicular: { src: "/marca/sint-energia.webp", alt: "Mujer sonriendo con energía" },
  ovulacion: { src: "/marca/sint-animo.webp", alt: "Mujer sonriendo y abrazándose" },
  lutea: { src: "/marca/sint-hinchazon.webp", alt: "Mujer haciendo el gesto de todo bien" },
};

function autorasDeHoy(c: Comunidad): string[] {
  const desde = Date.now() - DIA;
  const ids = c.publicaciones
    .filter((p) => p.creadaEn >= desde && p.estado === "publicada" && !p.anonima)
    .map((p) => p.autoraId);
  return [...new Set(ids)];
}

/** Para ti, tu ritual, En pareja y el avance de la comunidad. */
export function ParaTi({ fase }: { fase: Fase }) {
  const comunidad = useEstado((e) => e.comunidad);
  const petalos = useEstado((e) => e.petalos);
  const vinculoActivo = useEstado((e) => e.vinculos.find((v) => v.estado === "activo"));
  const autoras = autorasDeHoy(comunidad);
  const perfiles = comunidad.perfiles.filter((p) => autoras.includes(p.id)).slice(0, 3);
  const foto = FOTO_FASE[fase];

  return (
    <>
      <section className="seccion">
        <h2 className="titulo-m">Para ti</h2>
        <div className="rejilla-2">
          <Link href="/consejos" className={estilos.tarjetaFoto}>
            <div className={estilos.foto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.src} alt={foto.alt} />
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Consejos para tu fase</h3>
              <p className="mini texto-2">Comer, moverte y descansar</p>
              <span className="enlace-rojo">
                Ver consejos <ChevronRight size={14} />
              </span>
            </div>
          </Link>
          <Link href="/diario" className={estilos.tarjetaFoto}>
            <div className={estilos.foto}>
              <Ilustracion id="cuaderno" texto="Hoy me siento…" />
            </div>
            <div className={estilos.tarjetaFotoTexto}>
              <h3 className="titulo-s">Mi diario</h3>
              <p className="mini texto-2">Un espacio solo para ti</p>
              <span className="enlace-rojo">
                Escribir ahora <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Tu ritual: recompra con pétalos */}
      <Link href="/jardin#t-bonos" className={estilos.ritualPromo}>
        <span className={estilos.ritualPromoTexto}>
          <span className={estilos.ritualPromoEtiqueta}>
            <Flor activa tamano={14} /> {petalos} pétalos
          </span>
          <span className={estilos.ritualPromoTitulo}>Lleva tu ritual de 60 días</span>
          <span className={estilos.ritualPromoBajada}>Canjea tus pétalos por descuento en tu próxima caja</span>
          <span className={estilos.ritualPromoBoton}>
            Ver bonos <ArrowRight size={14} />
          </span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/conf-producto.webp" alt="Caja y sobre de Mi Ciclo" className={estilos.ritualPromoFoto} width={170} height={170} />
      </Link>

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
              <span className="enlace-rojo">
                Escribir <ChevronRight size={14} />
              </span>
            </div>
          </Link>
          <Link href="/vinculo" className={estilos.tarjetaFoto}>
            <div className={estilos.foto} style={{ background: "var(--rosa)", display: "grid", placeItems: "center" }}>
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
            <Avatar key={p.id} ciclita={p.ciclita} fotoId={p.fotoId} tamano={36} nombre={p.alias} />
          ))}
        </span>
        <span className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
          <span className="eyebrow" style={{ fontSize: 10 }}>De la comunidad</span>
          <span className="pequeno negrita">
            {autoras.length === 1 ? "1 chica compartió hoy" : `${autoras.length} chicas compartieron hoy`}
          </span>
        </span>
        <ChevronRight size={20} color="var(--rojo)" aria-label="Ver comunidad" />
      </Link>
    </>
  );
}
