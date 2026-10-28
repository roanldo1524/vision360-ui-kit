"use client";
// Diario cifrado en el dispositivo: AES-GCM 256 con una clave derivada del PIN
// (PBKDF2-SHA256, 210.000 iteraciones). El texto nunca se guarda en claro y
// nunca se comparte con el vínculo ni con la comunidad.
import { actualizar, leerEstado } from "./almacen";
import { nuevoId } from "./utilidades";

const ITERACIONES = 210_000;
const VERIFICADOR = "miciclo-diario-ok";

export interface EntradaDiario {
  id: string;
  fecha: number;
  texto: string;
  fase?: string;
}

let claveEnMemoria: CryptoKey | null = null;

const aB64 = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))));
const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derivar(pin: string, sal: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: sal as BufferSource, iterations: ITERACIONES, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function cifrar(clave: CryptoKey, texto: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const datos = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, clave, new TextEncoder().encode(texto));
  return { iv: aB64(iv), datos: aB64(datos) };
}

async function descifrar(clave: CryptoKey, iv: string, datos: string): Promise<string> {
  const plano = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deB64(iv) as BufferSource }, clave, deB64(datos) as BufferSource);
  return new TextDecoder().decode(plano);
}

export function tienePin(): boolean {
  return !!leerEstado().diario.sal;
}

export function estaDesbloqueado(): boolean {
  return claveEnMemoria !== null;
}

export function bloquear() {
  claveEnMemoria = null;
}

export async function crearPin(pin: string): Promise<void> {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const clave = await derivar(pin, sal);
  const verificador = await cifrar(clave, VERIFICADOR);
  actualizar((e) => ({ ...e, diario: { sal: aB64(sal), verificador, entradas: [] } }));
  claveEnMemoria = clave;
}

export async function desbloquear(pin: string): Promise<boolean> {
  const { sal, verificador } = leerEstado().diario;
  if (!sal || !verificador) return false;
  try {
    const clave = await derivar(pin, deB64(sal));
    const ok = (await descifrar(clave, verificador.iv, verificador.datos)) === VERIFICADOR;
    if (ok) claveEnMemoria = clave;
    return ok;
  } catch {
    return false;
  }
}

export async function guardarEntrada(texto: string, fase?: string): Promise<void> {
  if (!claveEnMemoria) throw new Error("El diario está bloqueado");
  const { iv, datos } = await cifrar(claveEnMemoria, JSON.stringify({ texto, fase }));
  actualizar((e) => ({
    ...e,
    diario: { ...e.diario, entradas: [{ id: nuevoId("d_"), fecha: Date.now(), iv, datos }, ...e.diario.entradas] },
  }));
}

export async function leerEntradas(): Promise<EntradaDiario[]> {
  if (!claveEnMemoria) return [];
  const clave = claveEnMemoria;
  const salida: EntradaDiario[] = [];
  for (const en of leerEstado().diario.entradas) {
    try {
      const { texto, fase } = JSON.parse(await descifrar(clave, en.iv, en.datos));
      salida.push({ id: en.id, fecha: en.fecha, texto, fase });
    } catch {
      /* entrada ilegible: se omite */
    }
  }
  return salida;
}

export function borrarEntrada(id: string) {
  actualizar((e) => ({ ...e, diario: { ...e.diario, entradas: e.diario.entradas.filter((x) => x.id !== id) } }));
}

/** Olvidé mi PIN: se borra todo el diario (no hay forma de recuperarlo). */
export function reiniciarDiario() {
  claveEnMemoria = null;
  actualizar((e) => ({ ...e, diario: { entradas: [] } }));
}
