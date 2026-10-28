"use client";
// Canje de pétalos por bonos de descuento con enlace a la tienda y UTM.
import { actualizar, leerEstado } from "../almacen";
import { sumarPetalos } from "../misiones";
import type { Canje } from "../tipos";
import { nuevoId } from "../utilidades";

export interface Bono {
  id: string;
  titulo: string;
  detalle: string;
  petalos: number;
  color: "rosa" | "lila" | "menta";
}

export const BONOS: Bono[] = [
  { id: "10off", titulo: "10% en tu próxima caja", detalle: "Para tu siguiente compra de Mi Ciclo.", petalos: 150, color: "rosa" },
  { id: "20off", titulo: "20% en tu próxima caja", detalle: "Un premio a tu constancia.", petalos: 300, color: "lila" },
  { id: "envio15", titulo: "Envío gratis + 15%", detalle: "Tu caja llega a casa sin costo de envío.", petalos: 450, color: "menta" },
];

export const TIENDA = "https://miciclo.co";

const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function bloque(n = 4): string {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => LETRAS[b % LETRAS.length]).join("");
}

/** Código único tipo MICICLO-XXXX-XXXX que no se repite con canjes anteriores. */
export function generarCodigo(existentes: string[] = []): string {
  let codigo = "";
  do {
    codigo = `MICICLO-${bloque()}-${bloque()}`;
  } while (existentes.includes(codigo));
  return codigo;
}

export function urlTienda(codigo: string, bonoId: string, canjeId: string): string {
  const params = new URLSearchParams({
    redirect: "/products/mi-ciclo",
    utm_source: "app",
    utm_medium: "petalos",
    utm_campaign: `canje_${bonoId}`,
    utm_content: canjeId,
  });
  return `${TIENDA}/discount/${encodeURIComponent(codigo)}?${params.toString()}`;
}

/** Canjea un bono. Devuelve el canje o null si no alcanzan los pétalos. */
export function canjearBono(bonoId: string): Canje | null {
  const bono = BONOS.find((b) => b.id === bonoId);
  const e = leerEstado();
  if (!bono || e.petalos < bono.petalos) return null;
  const id = nuevoId("cj_");
  const codigo = generarCodigo(e.canjes.map((c) => c.codigo));
  const canje: Canje = {
    id,
    fecha: Date.now(),
    bonoId: bono.id,
    titulo: bono.titulo,
    codigo,
    petalos: bono.petalos,
    url: urlTienda(codigo, bono.id, id),
  };
  sumarPetalos(-bono.petalos, `Canje: ${bono.titulo}`);
  actualizar((s) => ({ ...s, canjes: [canje, ...s.canjes] }));
  return canje;
}

/** Pétalos ganados en total (sin restar canjes): hacen crecer el jardín. */
export function petalosGanados(movs: { cantidad: number }[]): number {
  return movs.reduce((t, m) => (m.cantidad > 0 ? t + m.cantidad : t), 0);
}

export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
