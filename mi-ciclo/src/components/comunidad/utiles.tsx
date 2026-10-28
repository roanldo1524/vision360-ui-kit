"use client";
import Link from "next/link";
import { Fragment } from "react";
import { avisar } from "@/components/Avisos";
import type { AutoraPublica } from "@/lib/comunidad/consultas";
import { Avatar } from "@/components/Avatar";
import estilos from "./comunidad.module.css";

/** Copia el enlace de una pantalla de la comunidad. */
export async function copiarEnlace(ruta: string, mensaje = "Enlace copiado") {
  const url = `${window.location.origin}${ruta}`;
  try {
    await navigator.clipboard.writeText(url);
    avisar(mensaje);
  } catch {
    avisar("No pudimos copiar el enlace. Inténtalo de nuevo.", "error");
  }
}

/** Texto con #temas resaltados y enlazados a la búsqueda. */
export function TextoConTemas({ texto }: { texto: string }) {
  const partes = texto.split(/(#[\p{L}\p{N}_]+)/gu);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("#") ? (
          <Link key={i} href={`/comunidad/buscar?q=${encodeURIComponent(p)}`} className={estilos.hashtag}>
            {p}
          </Link>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** Avatar de autora: enlaza al perfil solo si NO es anónima. */
export function AvatarAutora({ autora, tamano = 40 }: { autora: AutoraPublica; tamano?: number }) {
  const avatar = <Avatar ciclita={autora.ciclita} fotoId={autora.fotoId} tamano={tamano} nombre={autora.alias} />;
  if (!autora.id) return avatar;
  return (
    <Link href={rutaPerfil(autora.id)} aria-label={`Perfil de ${autora.alias}`} style={{ display: "inline-flex" }}>
      {avatar}
    </Link>
  );
}

export function NombreAutora({ autora }: { autora: AutoraPublica }) {
  if (!autora.id) return <span>{autora.alias}</span>;
  return <Link href={rutaPerfil(autora.id)}>{autora.alias}</Link>;
}

export function rutaPerfil(id: string) {
  return id === "yo" ? "/comunidad/perfil" : `/comunidad/u/${id}`;
}

const CLASE_TEMA = [estilos.tema, `${estilos.tema} ${estilos.temaDurazno}`, `${estilos.tema} ${estilos.temaLila}`];

export function ChipTema({ tema, anonima = false }: { tema?: string; anonima?: boolean }) {
  if (!tema) return null;
  let h = 0;
  for (const ch of tema) h = (h + ch.charCodeAt(0)) % 3;
  return <span className={anonima ? `${estilos.tema} ${estilos.temaLila}` : CLASE_TEMA[h]}>{tema}</span>;
}
