"use client";
// Bebe agua, Mi objetivo y Productos recomendados (segunda referencia de Inicio).
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Droplet, Plus, ShoppingCart } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { hoyColombia } from "@/lib/ciclo";
import { alternarEmbarazo, cambiarMetaAgua, elegirObjetivo, sumarAgua, VASO_ML } from "@/lib/acciones";
import { clases } from "@/lib/utilidades";
import { Hoja } from "@/components/Hoja";
import { Ilustracion } from "@/components/Ilustracion";
import { Circulo, Estrella } from "@/components/FormasMarca";
import { avisar } from "@/components/Avisos";
import estilos from "./bienestar.module.css";

const TIENDA = "https://miciclo.co";
const utm = (contenido: string) =>
  `utm_source=app&utm_medium=inicio&utm_campaign=productos_recomendados&utm_content=${contenido}`;

/* ---------- Bebe agua ---------- */
export function BebeAgua() {
  const hoy = hoyColombia();
  const tomada = useEstado((e) => e.agua?.[hoy] ?? 0);
  const meta = useEstado((e) => e.metaAgua ?? 2000);
  const [ajustes, setAjustes] = useState(false);
  const vasos = Math.ceil(meta / VASO_ML);
  const llenos = Math.floor(tomada / VASO_ML);
  const cumplida = tomada >= meta;

  function tocarVaso(i: number) {
    if (i < llenos) {
      sumarAgua(-VASO_ML);
      return;
    }
    sumarAgua(VASO_ML);
    if (tomada + VASO_ML >= meta && tomada < meta) avisar("Meta de agua cumplida", "exito");
  }

  return (
    <section className={estilos.tarjeta} aria-labelledby="t-agua">
      <div className={estilos.cabeza}>
        <h2 id="t-agua" className={estilos.titulo}>
          Bebe <em>agua</em>
        </h2>
        <button className={estilos.botonSuave} onClick={() => setAjustes(true)}>
          Meta {(meta / 1000).toLocaleString("es-CO")} L
        </button>
      </div>
      <p className={estilos.cuenta}>
        <b className="num">{tomada.toLocaleString("es-CO")}</b>
        <span>/ {meta.toLocaleString("es-CO")} ml{cumplida ? " · cumplida" : ""}</span>
      </p>
      <div className={estilos.gotas} role="group" aria-label={`Vasos de agua: ${llenos} de ${vasos}`}>
        {Array.from({ length: vasos }, (_, i) => {
          const lleno = i < llenos;
          const siguiente = i === llenos;
          return (
            <button
              key={i}
              className={clases(estilos.gota, lleno && estilos.gotaLlena, siguiente && estilos.gotaSiguiente)}
              onClick={() => tocarVaso(i)}
              aria-label={lleno ? `Quitar vaso ${i + 1}` : `Tomé un vaso de ${VASO_ML} ml`}
            >
              {siguiente ? <Plus size={18} /> : <Droplet size={16} fill={lleno ? "currentColor" : "none"} />}
            </button>
          );
        })}
      </div>
      <p className={estilos.ayuda}>Cada toque suma un vaso de {VASO_ML} ml.</p>

      <Hoja abierta={ajustes} alCerrar={() => setAjustes(false)} titulo="Tu meta de agua">
        <p className="pequeno texto-2">¿Cuánta agua quieres tomar al día?</p>
        <div className="chips">
          {[1500, 2000, 2500, 3000].map((ml) => (
            <button
              key={ml}
              className="chip chip-borde seleccionable"
              aria-pressed={meta === ml}
              onClick={() => {
                cambiarMetaAgua(ml);
                avisar(`Meta: ${ml.toLocaleString("es-CO")} ml al día`);
              }}
            >
              {ml.toLocaleString("es-CO")} ml
            </button>
          ))}
        </div>
      </Hoja>
    </section>
  );
}

/* ---------- Mi objetivo ---------- */
const OBJETIVOS = [
  { id: "periodo", nombre: "Seguir mi período" },
  { id: "concebir", nombre: "Intento concebir" },
  { id: "embarazo", nombre: "Seguir mi embarazo" },
] as const;

export function MiObjetivo() {
  const objetivo = useEstado((e) => e.objetivo ?? "periodo");
  const embarazo = useEstado((e) => e.embarazo ?? false);
  return (
    <section className={estilos.tarjeta} aria-labelledby="t-objetivo">
      <h2 id="t-objetivo" className={estilos.titulo}>
        Mi <em>objetivo</em>
      </h2>
      <div className={estilos.objetivos} role="radiogroup" aria-label="Objetivo">
        {OBJETIVOS.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={objetivo === o.id}
            className={clases(estilos.objetivo, objetivo === o.id && estilos.objetivoActivo)}
            onClick={() => {
              elegirObjetivo(o.id);
              avisar(`Objetivo: ${o.nombre.toLowerCase()}`);
            }}
          >
            {o.nombre}
          </button>
        ))}
      </div>
      <div className={estilos.filas}>
        <Link href="/ajustes" className={estilos.fila}>
          <span className={estilos.glifo} style={{ background: "#f5ebfc" }} aria-hidden="true">
            <Estrella color="#b07ee0" tamano={22} />
          </span>
          <span className={estilos.filaTexto}>
            <b>Configuración de predicción</b>
            <span>Duración del ciclo y del período</span>
          </span>
          <ChevronRight size={20} className={estilos.flecha} aria-hidden="true" />
        </Link>
        <div className={estilos.fila}>
          <span className={estilos.glifo} style={{ background: "#ffe4ea" }} aria-hidden="true">
            <Circulo color="#f62c39" tamano={20} />
          </span>
          <span className={estilos.filaTexto}>
            <b>Modo embarazo</b>
            <span>Pausa las predicciones del período</span>
          </span>
          <button
            className="interruptor"
            role="switch"
            aria-checked={embarazo}
            aria-label="Modo embarazo"
            onClick={() => {
              alternarEmbarazo();
              avisar(embarazo ? "Modo embarazo desactivado" : "Modo embarazo activado");
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Productos recomendados ---------- */
export function Productos() {
  const productos = [
    {
      id: "mi-ciclo",
      nombre: "Mi Ciclo",
      detalle: "Tu ritual de 30 sobres",
      url: `${TIENDA}/?${utm("caja_mi_ciclo")}`,
      // eslint-disable-next-line @next/next/no-img-element
      imagen: <img src="/marca/conf-producto.webp" alt="" />,
    },
    {
      id: "almohadilla",
      nombre: "Almohadilla térmica",
      detalle: "Calor para los cólicos",
      url: `${TIENDA}/?${utm("almohadilla_termica")}`,
      imagen: <Ilustracion id="bolsa" />,
    },
    {
      id: "botella",
      nombre: "Botella de agua",
      detalle: "Con recordatorios",
      url: `${TIENDA}/?${utm("botella_agua")}`,
      imagen: <Ilustracion id="velas" />,
    },
  ];
  return (
    <section className={estilos.productosSeccion} aria-labelledby="t-productos">
      <div className={estilos.productosCabeza}>
        <h2 id="t-productos" className={estilos.productosTitulo}>
          Para tu <em>ritual</em>
        </h2>
        <a href={`${TIENDA}/?${utm("ver_todos")}`} target="_blank" rel="noopener noreferrer" className={estilos.productosEnlace}>
          Ver tienda <ChevronRight size={16} aria-hidden="true" />
        </a>
      </div>
      <ul className={estilos.productos}>
        {productos.map((p) => (
          <li key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className={estilos.producto} aria-label={`${p.nombre}, ${p.detalle}. Abrir en la tienda`}>
              <span className={estilos.productoImagen} aria-hidden="true">
                {p.imagen}
                <span className={estilos.carrito}>
                  <ShoppingCart size={16} />
                </span>
              </span>
              <span className={estilos.productoTexto}>
                <b>{p.nombre}</b>
                <span>{p.detalle}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
