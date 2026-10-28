"use client";
// Hoja inferior (bottom sheet) para menús, selectores y confirmaciones.
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import estilos from "./Hoja.module.css";

interface Props {
  abierta: boolean;
  alCerrar: () => void;
  titulo?: string;
  children: ReactNode;
}

export function Hoja({ abierta, alCerrar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);
  return (
    <dialog
      ref={ref}
      className={estilos.hoja}
      onClose={alCerrar}
      onClick={(e) => {
        if (e.target === ref.current) alCerrar();
      }}
      aria-label={titulo}
    >
      {abierta && (
        <div className={estilos.contenido}>
          <div className={estilos.asa} aria-hidden="true" />
          {titulo && (
            <div className={estilos.cabeza}>
              <h2 className="titulo-m">{titulo}</h2>
              <button className="boton-icono" onClick={alCerrar} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}

interface ConfirmarProps {
  abierta: boolean;
  titulo: string;
  texto: string;
  accion: string;
  peligro?: boolean;
  alConfirmar: () => void;
  alCerrar: () => void;
}

/** Confirmación dentro de la página (no usa confirm()). */
export function Confirmar({ abierta, titulo, texto, accion, peligro, alConfirmar, alCerrar }: ConfirmarProps) {
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo={titulo}>
      <p className="texto-2">{texto}</p>
      <div className="columna" style={{ marginTop: 18 }}>
        <button
          className={`boton boton-ancho ${peligro ? "boton-vino" : "boton-principal"}`}
          onClick={() => {
            alConfirmar();
            alCerrar();
          }}
        >
          {accion}
        </button>
        <button className="boton boton-ancho boton-secundario" onClick={alCerrar}>
          Cancelar
        </button>
      </div>
    </Hoja>
  );
}
