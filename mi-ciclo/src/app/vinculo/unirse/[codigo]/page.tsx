"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEstado } from "@/lib/almacen";
import { ROLES } from "@/lib/consejos";
import { aceptarInvitacion } from "@/lib/vinculo/acciones";
import type { RolVinculo } from "@/lib/tipos";
import { Ciclita } from "@/components/Ciclita";
import { FlorLuna } from "@/components/FormasMarca";
import { EstadoVacio } from "@/components/EstadoVacio";
import estilos from "../../vinculo.module.css";

/** Pantalla que ve quien abre el enlace de invitación: elige su rol y su nombre. */
export default function PaginaUnirse() {
  const { codigo } = useParams<{ codigo: string }>();
  const vinculo = useEstado((e) => e.vinculos.find((v) => v.codigo === codigo));
  const perfil = useEstado((e) => e.perfil);
  const [rol, setRol] = useState<RolVinculo | null>(null);
  const [nombre, setNombre] = useState("");
  const [enviado, setEnviado] = useState(false);

  const nombreElla = perfil?.nombre ?? "Ella";

  if (!vinculo) {
    return (
      <main className="pagina pagina-sin-barra" style={{ paddingTop: 48 }}>
        <EstadoVacio
          titulo="Este enlace ya no funciona"
          texto="Puede que la invitación se haya cancelado. Pídele que te envíe un enlace nuevo."
          accion={<Link href="/" className="boton boton-secundario">Ir a Mi Ciclo</Link>}
        />
      </main>
    );
  }

  if (enviado || vinculo.estado !== "pendiente") {
    return (
      <main className="pagina pagina-sin-barra" style={{ paddingTop: 48 }}>
        <div className={`tarjeta ${estilos.centro}`}>
          <FlorLuna color="var(--rojo)" tamano={72} />
          <h1 className={estilos.tituloUnirse}>
            {vinculo.estado === "activo" ? "Ya están vinculados" : `Listo, ${vinculo.nombre ?? nombre}`}
          </h1>
          <p className={estilos.textoHoja}>
            {vinculo.estado === "activo"
              ? "Desde ahora recibes un consejo diario para acompañarla."
              : `${nombreElla} debe confirmar tu rol. Cuando lo haga, empezarás a recibir un consejo diario según su fase.`}
          </p>
          <Link href="/vinculo" className="boton boton-secundario">Volver a Mi Ciclo (demo)</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`pagina pagina-sin-barra ${estilos.unirse}`} style={{ paddingTop: 28 }}>
      <div className={estilos.centro}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/logo-rojo.svg" alt="Mi Ciclo" className={estilos.logoUnirse} width={92} height={24} />
        <Ciclita id={perfil?.ciclita ?? "rosa"} tamano={88} feliz />
        <h1 className={estilos.tituloUnirse}>
          {nombreElla} te invitó a <em>acompañarla</em>
        </h1>
        <p className={estilos.textoHoja} style={{ maxWidth: 320 }}>
          Recibirás un consejo diario según su fase. Ella decide qué se comparte y su diario siempre es privado.
        </p>
      </div>

      <form
        className="columna"
        style={{ gap: 18 }}
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!rol || !nombre.trim()) return;
          aceptarInvitacion(codigo, rol, nombre);
          setEnviado(true);
        }}
      >
        <fieldset className="columna" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="etiqueta" style={{ marginBottom: 8 }}>¿Quién eres para {nombreElla}?</legend>
          <div className={estilos.rolesTarjetas}>
            {(Object.keys(ROLES) as RolVinculo[]).map((r) => (
              <button type="button" key={r} className={estilos.rolTarjeta} aria-pressed={rol === r} onClick={() => setRol(r)}>
                <span className={estilos.rolNombre}>{ROLES[r].nombre}</span>
                <span className={estilos.rolTexto}>{ROLES[r].descripcion}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="campo">
          <label htmlFor="nombre-vinculo">Tu nombre</label>
          <input
            id="nombre-vinculo"
            className="entrada"
            placeholder="Como te dice ella"
            maxLength={40}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <button type="submit" className="boton boton-principal boton-ancho" disabled={!rol || !nombre.trim()}>
          Unirme
        </button>
      </form>
    </main>
  );
}
