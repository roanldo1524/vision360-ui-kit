"use client";
import Link from "next/link";
import { ChevronRight, Heart, Plus } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { Ilustracion } from "@/components/Ilustracion";
import { Ciclita } from "@/components/Ciclita";
import { Avatar } from "@/components/Avatar";
import type { Comunidad, Fase } from "@/lib/tipos";
import estilos from "./hoy.module.css";

const DIA = 86_400_000;

const ESCENA_FASE: Record<Fase, string> = { menstrual: "antifaz", folicular: "atardecer", ovulacion: "infusion", lutea: "taza" };

function autorasDeHoy(c: Comunidad): string[] {
  const desde = Date.now() - DIA;
  const ids = c.publicaciones
    .filter((p) => p.creadaEn >= desde && p.estado === "publicada" && !p.anonima)
    .map((p) => p.autoraId);
  return [...new Set(ids)];
}

/** Consejos y diario; En pareja; avance de la comunidad. */
export function ParaTi({ fase }: { fase: Fase }) {
  const comunidad = useEstado((e) => e.comunidad);
  const vinculoActivo = useEstado((e) => e.vinculos.find((v) => v.estado === "activo"));
  const autoras = autorasDeHoy(comunidad);
  const perfiles = comunidad.perfiles.filter((p) => autoras.includes(p.id)).slice(0, 3);

  return (
    <>
      <div className={estilos.par}>
        <Link href="/consejos" className={`${estilos.bloque} ${estilos.bloqueLila}`}>
          <span className={estilos.bloqueImagen} aria-hidden="true">
            <Ilustracion id={ESCENA_FASE[fase]} />
          </span>
          <span className={estilos.bloqueTexto}>
            <span className={estilos.bloqueTitulo}>Consejos para tu fase</span>
            <span className={`${estilos.pildora} ${estilos.pildoraLila}`}>
              Ver consejos <ChevronRight size={15} />
            </span>
          </span>
        </Link>
        <Link href="/diario" className={estilos.bloque}>
          <span className={estilos.bloqueImagen} aria-hidden="true">
            <Ilustracion id="cuaderno" texto="Hoy me siento…" />
          </span>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloCarmesi}`}>Mi diario</span>
            <span className={estilos.bloqueSub}>Un espacio para ti</span>
            <span className={estilos.pildora}>
              Escribir ahora <ChevronRight size={15} />
            </span>
          </span>
        </Link>
      </div>

      <div className={estilos.par}>
        <Link href="/vinculo#notas" className={estilos.bloque}>
          <span className={estilos.corazones} aria-hidden="true">
            <Heart fill="#ff9ab4" stroke="none" size={70} />
            <Heart fill="#ffc2d2" stroke="none" size={52} />
          </span>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloCarmesi}`}>
              <Heart fill="var(--rojo)" stroke="none" size={22} className={estilos.corazonTitulo} /> Tu espacio con tu amor
            </span>
            <span className={estilos.bloqueSub}>Lo que escribas hoy desaparecerá en 24 horas.</span>
            <span className={estilos.pildora}>
              Escribir <ChevronRight size={15} />
            </span>
          </span>
        </Link>
        <Link href="/vinculo" className={`${estilos.bloque} ${estilos.bloqueLila}`}>
          <span className={estilos.parejaAvatares} aria-hidden="true">
            <Ciclita id="rosa" tamano={50} feliz />
            <span className={estilos.parejaMas}>
              {vinculoActivo ? <Ciclita id="menta" tamano={44} /> : <Plus size={22} />}
            </span>
          </span>
          <span className={estilos.bloqueTexto}>
            <span className={`${estilos.bloqueTitulo} ${estilos.tituloCarmesi}`}>Sincroniza tu ritmo</span>
            <span className={estilos.bloqueSub}>
              {vinculoActivo ? `Conectada con ${vinculoActivo.nombre ?? "tu vínculo"}` : "y tus momentos con tu pareja."}
            </span>
            <span className={estilos.pildora}>
              {vinculoActivo ? "Ver vínculo" : "Invitar"} <ChevronRight size={15} />
            </span>
          </span>
        </Link>
      </div>

      <Link href="/comunidad" className={estilos.comunidad}>
        <span className={estilos.pila}>
          {(perfiles.length ? perfiles : comunidad.perfiles.slice(0, 3)).map((p) => (
            <Avatar key={p.id} ciclita={p.ciclita} fotoId={p.fotoId} tamano={36} nombre={p.alias} />
          ))}
        </span>
        <span className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
          <span className={estilos.etiqueta}>De la comunidad</span>
          <span className="pequeno negrita">
            {autoras.length === 1 ? "1 chica compartió hoy" : `${autoras.length} chicas compartieron hoy`}
          </span>
        </span>
        <ChevronRight size={22} color="var(--rojo)" aria-label="Ver comunidad" />
      </Link>
    </>
  );
}
