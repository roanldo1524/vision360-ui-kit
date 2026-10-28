"use client";
import type { Medio } from "@/lib/tipos";
import { useUrlMedio } from "@/lib/medios";
import { Ilustracion } from "./Ilustracion";

interface Props {
  medio: Medio;
  className?: string;
  /** en reels e historias el video se reproduce solo, sin sonido */
  autoReproducir?: boolean;
}

/** Muestra una ilustración, una foto o un video guardado, llenando su caja. */
export function MedioVista({ medio, className, autoReproducir = false }: Props) {
  const url = useUrlMedio(medio.tipo === "ilustracion" ? undefined : medio.ref);
  const caja = { width: "100%", height: "100%", objectFit: "cover" as const, display: "block" };
  if (medio.tipo === "ilustracion") {
    return <Ilustracion id={medio.ref} texto={medio.texto} className={className} />;
  }
  if (!url) return <div className={`esqueleto ${className ?? ""}`} style={{ ...caja, borderRadius: 0 }} />;
  if (medio.tipo === "video") {
    return (
      <video
        src={url}
        className={className}
        style={caja}
        muted
        loop
        playsInline
        autoPlay={autoReproducir}
        controls={!autoReproducir}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Foto de la publicación" className={className} style={caja} />;
}
