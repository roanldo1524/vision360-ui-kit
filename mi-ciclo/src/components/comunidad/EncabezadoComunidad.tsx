"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShieldCheck } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import estilos from "./comunidad.module.css";

const PESTANAS = [
  { href: "/comunidad", etiqueta: "Post" },
  { href: "/comunidad/reels", etiqueta: "Reels" },
  { href: "/comunidad/preguntas", etiqueta: "Preguntas" },
  { href: "/comunidad/perfil", etiqueta: "Mi perfil" },
];

/** Wordmark "Mi Ciclo", buscar y pestañas Post · Reels · Preguntas · Mi perfil. */
export function EncabezadoComunidad() {
  const ruta = usePathname();
  const moderadora = useEstado((e) => e.moderadora);
  return (
    <header className={estilos.encabezado}>
      <div className={estilos.encabezadoFila}>
        <span className={`marca ${estilos.wordmark}`}>Mi Ciclo</span>
        {moderadora ? (
          <Link href="/admin" className="boton-icono" aria-label="Panel de moderación">
            <ShieldCheck size={20} strokeWidth={1.5} />
          </Link>
        ) : (
          <span />
        )}
        <Link href="/comunidad/buscar" className="boton-icono" aria-label="Buscar en la comunidad">
          <Search size={21} strokeWidth={1.5} />
        </Link>
      </div>
      <nav className={estilos.pestanas} aria-label="Secciones de la comunidad">
        {PESTANAS.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={estilos.pestana}
            aria-current={ruta === p.href ? "page" : undefined}
          >
            {p.etiqueta}
          </Link>
        ))}
      </nav>
    </header>
  );
}
