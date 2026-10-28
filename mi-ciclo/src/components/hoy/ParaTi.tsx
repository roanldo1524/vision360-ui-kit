"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { Circulo, FlorLuna, Luna } from "@/components/FormasMarca";
import { Avatar } from "@/components/Avatar";
import type { Comunidad, Fase } from "@/lib/tipos";
import estilos from "./hoy.module.css";

const DIA = 86_400_000;

// Fotos reales de la marca según lo que más acompaña cada fase
const FOTO_FASE: Record<Fase, string> = {
  menstrual: "/marca/sint-colicos.webp",
  folicular: "/marca/sint-energia.webp",
  ovulacion: "/marca/sint-animo.webp",
  lutea: "/marca/sint-hinchazon.webp",
};

const SUB_FASE: Record<Fase, string> = {
  menstrual: "Calor, pausa y alivio para los cólicos",
  folicular: "Energía nueva para empezar cosas",
  ovulacion: "Conectar y moverte con ganas",
  lutea: "Menos exigencia, más cuidado",
};

function autorasDeHoy(c: Comunidad): string[] {
  const desde = Date.now() - DIA;
  const ids = c.publicaciones
    .filter((p) => p.creadaEn >= desde && p.estado === "publicada" && !p.anonima)
    .map((p) => p.autoraId);
  return [...new Set(ids)];
}

/** "Para ti hoy" como una lista serena, y la comunidad al final. */
export function ParaTi({ fase }: { fase: Fase }) {
  const comunidad = useEstado((e) => e.comunidad);
  const vinculoActivo = useEstado((e) => e.vinculos.find((v) => v.estado === "activo"));
  const autoras = autorasDeHoy(comunidad);
  const perfiles = comunidad.perfiles.filter((p) => autoras.includes(p.id)).slice(0, 3);

  const filas = [
    {
      href: "/consejos",
      titulo: "Consejos para tu fase",
      sub: SUB_FASE[fase],
      // eslint-disable-next-line @next/next/no-img-element
      imagen: <img src={FOTO_FASE[fase]} alt="" />,
      fondo: undefined as string | undefined,
    },
    {
      href: "/diario",
      titulo: "Mi diario",
      sub: "Un espacio solo para ti",
      fondo: "#efe4fb",
      imagen: <Luna color="#5b3aaa" tamano={30} />,
    },
    {
      href: "/vinculo#notas",
      titulo: "Tu espacio con tu amor",
      sub: "Notas que se borran en 24 horas",
      fondo: "#ffe4ea",
      imagen: <FlorLuna color="#f62c39" fondo="#ffe4ea" tamano={34} />,
    },
    {
      href: "/vinculo",
      titulo: "Sincroniza tu ritmo",
      sub: vinculoActivo ? `Conectada con ${vinculoActivo.nombre ?? "tu vínculo"}` : "Invita a tu pareja, mamá o amiga",
      fondo: "#fff0f5",
      imagen: (
        <span className={estilos.miniCiclitas}>
          <Circulo color="#ff8fab" tamano={22} />
          <Circulo color="#c99af0" tamano={22} />
        </span>
      ),
    },
  ];

  return (
    <>
      <section className={estilos.paraTi} aria-labelledby="t-para-ti">
        <h2 id="t-para-ti" className={estilos.tituloSeccion}>
          Para ti <em>hoy</em>
        </h2>
        <ul className={estilos.lista}>
          {filas.map((f) => (
            <li key={f.href + f.titulo}>
              <Link href={f.href} className={estilos.fila}>
                <span className={estilos.filaImagen} style={f.fondo ? { background: f.fondo } : undefined} aria-hidden="true">
                  {f.imagen}
                </span>
                <span className={estilos.filaTexto}>
                  <span className={estilos.filaTitulo}>{f.titulo}</span>
                  <span className={estilos.filaSub}>{f.sub}</span>
                </span>
                <ChevronRight size={20} className={estilos.filaFlecha} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/comunidad" className={estilos.comunidad}>
        <span className={estilos.pila} aria-hidden="true">
          {(perfiles.length ? perfiles : comunidad.perfiles.slice(0, 3)).map((p) => (
            <Avatar key={p.id} ciclita={p.ciclita} fotoId={p.fotoId} tamano={34} />
          ))}
        </span>
        <span className={estilos.comunidadTexto}>
          <b>{autoras.length === 1 ? "1 chica compartió hoy" : `${autoras.length} chicas compartieron hoy`}</b>
          <span>Entra a la comunidad</span>
        </span>
        <ChevronRight size={20} className={estilos.filaFlecha} aria-hidden="true" />
      </Link>
    </>
  );
}
