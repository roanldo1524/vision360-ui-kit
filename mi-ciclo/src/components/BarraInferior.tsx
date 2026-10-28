"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, RotateCw, Plus, Sprout, UsersRound } from "lucide-react";
import estilos from "./BarraInferior.module.css";

const ITEMS = [
  { href: "/", etiqueta: "Inicio", Icono: Home },
  { href: "/ciclo", etiqueta: "Mi ciclo", Icono: RotateCw },
  { href: "/publicar", etiqueta: "Publicar", Icono: Plus, central: true },
  { href: "/jardin", etiqueta: "Jardín", Icono: Sprout },
  { href: "/comunidad", etiqueta: "Comunidad", Icono: UsersRound },
];

/** Barra inferior: Inicio · Mi ciclo · + · Jardín · Comunidad */
export function BarraInferior() {
  const ruta = usePathname();
  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));
  return (
    <nav className={estilos.barra} aria-label="Navegación principal">
      {ITEMS.map(({ href, etiqueta, Icono, central }) =>
        central ? (
          <Link key={href} href={href} className={estilos.central} aria-label={etiqueta}>
            <Icono size={24} strokeWidth={2.6} />
          </Link>
        ) : (
          <Link
            key={href}
            href={href}
            className={estilos.item}
            aria-current={activo(href) ? "page" : undefined}
          >
            <span className={estilos.icono}>
              <Icono size={20} strokeWidth={activo(href) ? 2.3 : 1.8} />
            </span>
            <span>{etiqueta}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
