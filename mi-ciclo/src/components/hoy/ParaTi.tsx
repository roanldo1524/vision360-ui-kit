"use client";
import Link from "next/link";
import { ChevronRight, Heart, Plus } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { FlorLuna } from "@/components/FormasMarca";
import { Ciclita } from "@/components/Ciclita";
import { Avatar } from "@/components/Avatar";
import type { Comunidad, Fase } from "@/lib/tipos";
import estilos from "./hoy.module.css";

const DIA = 86_400_000;

// Foto real de la marca para "Consejos para tu fase"
const FOTO_FASE: Record<Fase, string> = {
  menstrual: "/marca/sint-colicos.webp",
  folicular: "/marca/sint-energia.webp",
  ovulacion: "/marca/sint-animo.webp",
  lutea: "/marca/sint-hinchazon.webp",
};

function autorasDeHoy(c: Comunidad): string[] {
  const desde = Date.now() - DIA;
  const ids = c.publicaciones
    .filter((p) => p.creadaEn >= desde && p.estado === "publicada" && !p.anonima)
    .map((p) => p.autoraId);
  return [...new Set(ids)];
}

/** Consejos y diario, En pareja y el avance de la comunidad (referencia aprobada). */
export function ParaTi({ fase }: { fase: Fase }) {
  const comunidad = useEstado((e) => e.comunidad);
  const vinculoActivo = useEstado((e) => e.vinculos.find((v) => v.estado === "activo"));
  const autoras = autorasDeHoy(comunidad);
  const perfiles = comunidad.perfiles.filter((p) => autoras.includes(p.id)).slice(0, 3);

  return (
    <>
      <div className={estilos.par}>
        <Link href="/consejos" className={`${estilos.bloque} ${estilos.bloqueLila}`}>
          <span className={estilos.bloqueTexto}>
            <span className={estilos.bloqueTitulo}>Consejos para tu fase</span>
            <span className={`${estilos.pildora} ${estilos.pildoraLila}`}>
              Ver consejos <ChevronRight size={16} strokeWidth={2.4} />
            </span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOTO_FASE[fase]} alt="" className={estilos.bloqueFoto} aria-hidden="true" />
        </Link>
        <Link href="/diario" className={estilos.bloque}>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloRojo}`}>Mi diario</span>
            <span className={estilos.bloqueSub}>Un espacio para ti</span>
            <span className={estilos.pildora}>
              Escribir ahora <ChevronRight size={16} strokeWidth={2.4} />
            </span>
          </span>
          <span className={estilos.bloquePieza} aria-hidden="true">
            <FlorLuna color="var(--rojo)" fondo="#ffe6f0" tamano={58} />
          </span>
        </Link>
      </div>

      <div className={estilos.par}>
        <Link href="/vinculo#notas" className={estilos.bloque}>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloRojo}`}>
              <Heart size={20} fill="var(--rojo)" stroke="none" className={estilos.corazon} aria-hidden="true" />
              Tu espacio con tu amor
            </span>
            <span className={estilos.bloqueSub}>Lo que escribas hoy desaparecerá en 24 horas.</span>
            <span className={estilos.pildora}>
              Escribir <ChevronRight size={16} strokeWidth={2.4} />
            </span>
          </span>
        </Link>
        <Link href="/vinculo" className={`${estilos.bloque} ${estilos.bloqueLila}`}>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloRojo}`}>Sincroniza tu ritmo</span>
            <span className={estilos.bloqueSub}>
              {vinculoActivo ? `Conectada con ${vinculoActivo.nombre ?? "tu vínculo"}` : "y tus momentos con tu pareja."}
            </span>
            <span className={estilos.pildora}>
              {vinculoActivo ? "Ver vínculo" : "Invitar"} <ChevronRight size={16} strokeWidth={2.4} />
            </span>
          </span>
          <span className={estilos.pareja} aria-hidden="true">
            <Ciclita id="rosa" tamano={46} feliz />
            <span className={estilos.parejaMas}>{vinculoActivo ? <Ciclita id="lila" tamano={40} /> : <Plus size={22} />}</span>
          </span>
        </Link>
      </div>

      <Link href="/comunidad" className={estilos.comunidad}>
        <span className={estilos.pila} aria-hidden="true">
          {(perfiles.length ? perfiles : comunidad.perfiles.slice(0, 3)).map((p) => (
            <Avatar key={p.id} ciclita={p.ciclita} fotoId={p.fotoId} tamano={36} />
          ))}
        </span>
        <span className={estilos.comunidadTexto}>
          <span className={estilos.etiqueta}>Comunidad</span>
          <b>{autoras.length === 1 ? "1 chica compartió hoy" : `${autoras.length} chicas compartieron hoy`}</b>
        </span>
        <span className={estilos.enlace} aria-hidden="true">
          <ChevronRight size={20} />
        </span>
      </Link>
    </>
  );
}
