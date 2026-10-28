"use client";
// Marco de la app: espera a cargar los datos locales, envía a la bienvenida si
// aún no hay perfil y decide en qué pantallas va la barra inferior.
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEstado, useHidratado } from "@/lib/almacen";
import { alAbrirApp } from "@/lib/acciones";
import { BarraInferior } from "./BarraInferior";
import { Avisos } from "./Avisos";

const PUBLICAS = ["/bienvenida", "/legal", "/vinculo/unirse"];
const CON_BARRA = ["/", "/ciclo", "/jardin", "/comunidad", "/comunidad/reels-lista", "/comunidad/preguntas", "/comunidad/perfil"];

function llevaBarra(ruta: string) {
  if (ruta === "/") return true;
  if (ruta.startsWith("/comunidad/historia") || ruta.startsWith("/comunidad/reels") || ruta.startsWith("/comunidad/p/")) return false;
  return CON_BARRA.some((r) => r !== "/" && ruta.startsWith(r));
}

export function Marco({ children }: { children: ReactNode }) {
  const hidratado = useHidratado();
  const tienePerfil = useEstado((e) => e.perfil !== null && e.ciclo !== null);
  const ruta = usePathname();
  const router = useRouter();
  const publica = PUBLICAS.some((p) => ruta.startsWith(p));

  useEffect(() => {
    if (!hidratado) return;
    if (!tienePerfil && !publica) router.replace("/bienvenida");
  }, [hidratado, tienePerfil, publica, router]);

  useEffect(() => {
    if (hidratado && tienePerfil) alAbrirApp();
  }, [hidratado, tienePerfil]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const listo = hidratado && (tienePerfil || publica);

  return (
    <div className="marco">
      {listo ? children : <EsqueletoInicio />}
      {listo && tienePerfil && llevaBarra(ruta) && <BarraInferior />}
      <Avisos />
    </div>
  );
}

function EsqueletoInicio() {
  return (
    <div className="pagina" aria-busy="true" aria-label="Cargando">
      <div className="esqueleto" style={{ height: 56, width: "50%" }} />
      <div className="esqueleto" style={{ height: 64 }} />
      <div className="esqueleto" style={{ height: 230, borderRadius: 24 }} />
      <div className="esqueleto" style={{ height: 170, borderRadius: 24 }} />
    </div>
  );
}
