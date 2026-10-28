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

  function tocarVaso(i: number) {
    if (i < llenos) {
      sumarAgua(-VASO_ML);
      return;
    }
    sumarAgua(VASO_ML);
    if (tomada + VASO_ML >= meta && tomada < meta) avisar("¡Meta de agua cumplida!", "exito");
  }

  return (
    <section className={estilos.tarjetaBlanca} aria-label="Bebe agua">
      <div className="fila-entre" style={{ alignItems: "flex-start" }}>
        <div>
          <h2 className={estilos.tituloSans}>
            Bebe agua <Droplet size={20} fill="#4aa8ff" stroke="none" style={{ verticalAlign: -2 }} />
          </h2>
          <p className={clases("num", estilos.aguaCuenta)}>
            {tomada} ml / {meta} ml
          </p>
        </div>
        <button className={estilos.enlaceLila} onClick={() => setAjustes(true)}>
          Ajustes <ChevronRight size={16} />
        </button>
      </div>
      <div className={estilos.barraAgua} role="progressbar" aria-valuemin={0} aria-valuemax={meta} aria-valuenow={tomada} aria-label="Agua de hoy">
        <span style={{ width: `${Math.min(100, (tomada / meta) * 100)}%` }} />
      </div>
      <div className={estilos.vasos}>
        {Array.from({ length: vasos }, (_, i) => {
          const lleno = i < llenos;
          const siguiente = i === llenos;
          return (
            <button
              key={i}
              className={clases(estilos.vaso, lleno && estilos.vasoLleno, siguiente && estilos.vasoSiguiente)}
              onClick={() => tocarVaso(i)}
              aria-label={lleno ? `Quitar vaso ${i + 1}` : `Tomé un vaso de ${VASO_ML} ml`}
            >
              <span className={estilos.vasoForma}>
                {lleno && <span className={estilos.vasoAgua} />}
                {siguiente && <Plus size={20} />}
              </span>
              <span className="mini">{VASO_ML} ml</span>
            </button>
          );
        })}
      </div>

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
                avisar(`Meta: ${ml} ml al día`);
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
  { id: "periodo", nombre: "Seguir mi periodo" },
  { id: "concebir", nombre: "Intento concebir" },
  { id: "embarazo", nombre: "Seguir mi embarazo" },
] as const;

export function MiObjetivo() {
  const objetivo = useEstado((e) => e.objetivo ?? "periodo");
  const embarazo = useEstado((e) => e.embarazo ?? false);
  return (
    <section className={estilos.tarjetaBlanca} aria-label="Mi objetivo">
      <h2 className={clases(estilos.tituloSans, estilos.tituloCarmesiSans)}>
        <span className={estilos.diana} aria-hidden="true" /> Mi objetivo
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
      <Link href="/ajustes" className={estilos.filaAjuste}>
        <span className={estilos.aro} aria-hidden="true" />
        <span className="columna" style={{ gap: 0, flex: 1, minWidth: 0 }}>
          <b>Configuración de predicción</b>
          <span className="pequeno texto-2">Para periodos, ciclo y ovulación</span>
        </span>
        <ChevronRight size={20} />
      </Link>
      <div className={estilos.filaAjuste}>
        <span className={estilos.barriga} aria-hidden="true" />
        <b style={{ flex: 1 }}>Embarazo</b>
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
    </section>
  );
}

/* ---------- Productos recomendados ---------- */
function Botella() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-label="Botella de agua rosada">
      <rect width="120" height="120" fill="#f9dbe3" />
      <rect x="44" y="14" width="32" height="16" rx="5" fill="#e98aa3" />
      <path d="M76 20 h10 a6 6 0 0 1 0 12 h-10" fill="none" stroke="#e98aa3" strokeWidth="4" />
      <rect x="38" y="28" width="44" height="80" rx="12" fill="#f4a9bc" />
      <rect x="44" y="34" width="8" height="64" rx="4" fill="#fff" opacity=".35" />
      <text x="60" y="76" fontSize="9" fontFamily="var(--f-display)" fill="#e01e37" textAnchor="middle" transform="rotate(-90 60 70)">
        Mi Ciclo
      </text>
    </svg>
  );
}

export function Productos() {
  const productos = [
    {
      id: "mi-ciclo",
      nombre: "Mi Ciclo",
      detalle: "Complemento diario",
      url: `${TIENDA}/?${utm("caja_mi_ciclo")}`,
      // eslint-disable-next-line @next/next/no-img-element
      imagen: <img src="/marca/conf-producto.webp" alt="Caja y sobre de Mi Ciclo" />,
    },
    {
      id: "almohadilla",
      nombre: "Almohadilla térmica",
      detalle: "para cólicos",
      url: `${TIENDA}/?${utm("almohadilla_termica")}`,
      imagen: <Ilustracion id="bolsa" />,
    },
    {
      id: "botella",
      nombre: "Botella de agua",
      detalle: "con recordatorios",
      url: `${TIENDA}/?${utm("botella_agua")}`,
      imagen: <Botella />,
    },
  ];
  return (
    <section className={estilos.tarjetaBlanca} aria-label="Productos recomendados">
      <div className="fila-entre">
        <h2 className={clases("titulo-m", estilos.tituloCarmesi)}>Productos recomendados</h2>
        <a href={`${TIENDA}/?${utm("ver_todos")}`} target="_blank" rel="noopener noreferrer" className="enlace-rojo">
          Ver todos <ChevronRight size={15} />
        </a>
      </div>
      <div className={estilos.productos}>
        {productos.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className={estilos.producto}>
            <span className={estilos.productoImagen}>{p.imagen}</span>
            <span className={estilos.productoTexto}>
              <b>{p.nombre}</b>
              <span>{p.detalle}</span>
            </span>
            <span className={estilos.carrito} aria-label={`Comprar ${p.nombre}`}>
              <ShoppingCart size={17} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
