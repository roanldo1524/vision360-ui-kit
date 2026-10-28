"use client";
// Menú "···" de una publicación: editar o eliminar lo propio; reportar, ocultar o bloquear lo ajeno.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, EyeOff, Flag, Link2, Pencil, Trash2 } from "lucide-react";
import { Confirmar, Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import {
  bloquearAutoraDe,
  editarPublicacion,
  eliminarPublicacion,
  ocultarParaMi,
  reportar,
} from "@/lib/comunidad/acciones";
import type { PublicacionPublica } from "@/lib/comunidad/consultas";
import { MOTIVOS_REPORTE } from "@/lib/comunidad/moderacion";
import { copiarEnlace } from "./utiles";
import estilos from "./comunidad.module.css";

interface Props {
  pub: PublicacionPublica;
  abierto: boolean;
  alCerrar: () => void;
  /** a dónde ir si la publicación desaparece de la pantalla actual */
  alSalir?: string;
}

export function MenuPublicacion({ pub, abierto, alCerrar, alSalir }: Props) {
  const router = useRouter();
  const [vista, setVista] = useState<"menu" | "reportar" | "editar" | "eliminar" | "bloquear" | null>(null);
  const [texto, setTexto] = useState(pub.texto);
  const [titulo, setTitulo] = useState(pub.titulo ?? "");

  const cerrarTodo = () => {
    setVista(null);
    alCerrar();
  };
  const actual = abierto ? (vista ?? "menu") : null;
  const salir = () => {
    if (alSalir) router.push(alSalir);
  };

  return (
    <>
      <Hoja abierta={actual === "menu"} alCerrar={cerrarTodo} titulo="Opciones">
        <div className={estilos.opciones}>
          <button className={estilos.opcion} onClick={() => { copiarEnlace(`/comunidad/p/${pub.id}`); cerrarTodo(); }}>
            <Link2 size={19} /> Copiar enlace
          </button>
          {pub.esMia ? (
            <>
              {pub.tipo !== "historia" && (
                <button className={estilos.opcion} onClick={() => { setTexto(pub.texto); setTitulo(pub.titulo ?? ""); setVista("editar"); }}>
                  <Pencil size={19} /> Editar
                </button>
              )}
              <button className={`${estilos.opcion} ${estilos.opcionPeligro}`} onClick={() => setVista("eliminar")}>
                <Trash2 size={19} /> Eliminar
              </button>
            </>
          ) : (
            <>
              <button className={estilos.opcion} onClick={() => setVista("reportar")}>
                <Flag size={19} /> Reportar
              </button>
              <button
                className={estilos.opcion}
                onClick={() => {
                  ocultarParaMi(pub.id);
                  avisar("Ya no verás esta publicación");
                  cerrarTodo();
                  salir();
                }}
              >
                <EyeOff size={19} /> No me interesa
              </button>
              <button className={`${estilos.opcion} ${estilos.opcionPeligro}`} onClick={() => setVista("bloquear")}>
                <Ban size={19} /> Bloquear a {pub.autora.anonima ? "esta autora" : pub.autora.alias}
              </button>
            </>
          )}
        </div>
      </Hoja>

      <Hoja abierta={actual === "reportar"} alCerrar={cerrarTodo} titulo="¿Por qué la reportas?">
        <p className="texto-2 pequeno">
          Tu reporte es anónimo. Con dos reportes la publicación se oculta hasta que el equipo la revise.
        </p>
        <div className={estilos.opciones}>
          {MOTIVOS_REPORTE.map((m) => (
            <button
              key={m}
              className={estilos.opcion}
              onClick={() => {
                const oculta = reportar({ tipo: "publicacion", id: pub.id }, m);
                avisar(oculta ? "Gracias. La ocultamos mientras el equipo la revisa." : "Gracias. El equipo lo revisará.");
                cerrarTodo();
                salir();
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </Hoja>

      <Hoja abierta={actual === "editar"} alCerrar={cerrarTodo} titulo="Editar publicación">
        {pub.tipo === "post" && (
          <div className="campo">
            <label htmlFor={`titulo-${pub.id}`}>Título (opcional)</label>
            <input id={`titulo-${pub.id}`} className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} />
          </div>
        )}
        <div className="campo">
          <label htmlFor={`texto-${pub.id}`}>Texto</label>
          <textarea id={`texto-${pub.id}`} className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1200} />
          <span className="ayuda">Usa #temas para que otras chicas lo encuentren.</span>
        </div>
        <button
          className="boton boton-principal boton-ancho"
          disabled={!texto.trim() && pub.medios.length === 0}
          onClick={() => {
            const retenida = editarPublicacion(pub.id, { texto, titulo });
            avisar(retenida ? "Guardado. Quedó en revisión por su contenido." : "Cambios guardados");
            cerrarTodo();
          }}
        >
          Guardar cambios
        </button>
      </Hoja>

      <Confirmar
        abierta={actual === "eliminar"}
        titulo="¿Eliminar esta publicación?"
        texto="Se borra para todas, con sus comentarios y flores. No se puede deshacer."
        accion="Eliminar"
        peligro
        alConfirmar={() => {
          eliminarPublicacion(pub.id);
          avisar("Publicación eliminada");
          salir();
        }}
        alCerrar={cerrarTodo}
      />

      <Confirmar
        abierta={actual === "bloquear"}
        titulo="¿Bloquear a esta autora?"
        texto="No verás nada de lo que publique y ella no sabrá que la bloqueaste. Puedes desbloquearla desde Mi perfil."
        accion="Bloquear"
        peligro
        alConfirmar={() => {
          bloquearAutoraDe(pub.id);
          avisar("Bloqueada");
          salir();
        }}
        alCerrar={cerrarTodo}
      />
    </>
  );
}
