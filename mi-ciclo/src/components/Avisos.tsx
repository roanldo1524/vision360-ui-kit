"use client";
// Mensajes breves de confirmación ("Guardado", "Publicado").
import { useSyncExternalStore } from "react";
import estilos from "./Avisos.module.css";

interface Aviso {
  id: number;
  texto: string;
  tono: "normal" | "exito" | "error";
}

let avisos: Aviso[] = [];
let siguiente = 1;
const oyentes = new Set<() => void>();
const emitir = () => oyentes.forEach((o) => o());

export function avisar(texto: string, tono: Aviso["tono"] = "normal") {
  const id = siguiente++;
  avisos = [...avisos, { id, texto, tono }];
  emitir();
  setTimeout(() => {
    avisos = avisos.filter((a) => a.id !== id);
    emitir();
  }, 2600);
}

const vacio: Aviso[] = [];

export function Avisos() {
  const lista = useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => avisos,
    () => vacio,
  );
  return (
    <div className={estilos.zona} role="status" aria-live="polite">
      {lista.map((a) => (
        <div key={a.id} className={`${estilos.aviso} ${estilos[a.tono]}`}>
          {a.texto}
        </div>
      ))}
    </div>
  );
}
