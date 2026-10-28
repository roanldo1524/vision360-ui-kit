"use client";
import { EncabezadoComunidad } from "@/components/comunidad/EncabezadoComunidad";
import { VistaPerfil } from "@/components/comunidad/VistaPerfil";

export default function MiPerfil() {
  return (
    <main className="pagina">
      <EncabezadoComunidad />
      <VistaPerfil id="yo" />
    </main>
  );
}
