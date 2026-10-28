"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Cabecera } from "@/components/Cabecera";
import { VistaPerfil } from "@/components/comunidad/VistaPerfil";
import { perfilPublico, useContexto } from "@/lib/comunidad/consultas";

export default function PerfilUsuaria() {
  const { id } = useParams<{ id: string }>();
  const ctx = useContexto();
  const perfil = useMemo(() => perfilPublico(ctx, id), [ctx, id]);
  const [menu, setMenu] = useState(false);
  const ajeno = id !== "yo";
  return (
    <>
      <Cabecera
        titulo={perfil ? perfil.usuario : "Perfil"}
        derecha={
          ajeno && perfil && !perfil.bloqueada ? (
            <button className="boton-icono" aria-label="Opciones del perfil" onClick={() => setMenu(true)}>
              <MoreHorizontal size={20} />
            </button>
          ) : null
        }
      />
      <main className="pagina" style={{ paddingTop: 4 }}>
        <VistaPerfil id={id} menuAjeno={menu} alCerrarMenuAjeno={() => setMenu(false)} />
      </main>
    </>
  );
}
