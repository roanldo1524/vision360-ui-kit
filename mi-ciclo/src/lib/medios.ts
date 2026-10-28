"use client";
// Fotos y videos de las usuarias, guardados en IndexedDB del navegador.
// En producción esto pasa a Supabase Storage con URLs firmadas.
import { useEffect, useState } from "react";
import { nuevoId } from "./utilidades";

const BD = "miciclo-medios";
const TABLA = "medios";

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rechazar) => {
    const req = indexedDB.open(BD, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(TABLA);
    req.onsuccess = () => resolver(req.result);
    req.onerror = () => rechazar(req.error);
  });
}

async function operar<T>(modo: IDBTransactionMode, fn: (t: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const bd = await abrir();
  return new Promise((resolver, rechazar) => {
    const tx = bd.transaction(TABLA, modo);
    const req = fn(tx.objectStore(TABLA));
    req.onsuccess = () => resolver(req.result);
    req.onerror = () => rechazar(req.error);
  });
}

/** Reduce una foto a máximo 1280 px y JPEG para no llenar el almacenamiento. */
export async function comprimirFoto(archivo: File, lado = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, lado / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  return new Promise((resolver) =>
    lienzo.toBlob((b) => resolver(b ?? archivo), "image/jpeg", 0.85),
  );
}

export async function guardarMedio(blob: Blob): Promise<string> {
  const id = nuevoId("m_");
  await operar("readwrite", (t) => t.put(blob, id));
  return id;
}

export async function leerMedio(id: string): Promise<Blob | undefined> {
  return operar<Blob | undefined>("readonly", (t) => t.get(id) as IDBRequest<Blob | undefined>);
}

export async function borrarMedios(): Promise<void> {
  try {
    await operar("readwrite", (t) => t.clear());
  } catch {
    /* sin medios */
  }
}

const cache = new Map<string, string>();

/** URL de objeto para mostrar un medio guardado. */
export function useUrlMedio(id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(id ? cache.get(id) : undefined);
  useEffect(() => {
    if (!id || cache.has(id)) return;
    let vivo = true;
    leerMedio(id).then((blob) => {
      if (!blob || !vivo) return;
      const u = URL.createObjectURL(blob);
      cache.set(id, u);
      setUrl(u);
    });
    return () => {
      vivo = false;
    };
  }, [id]);
  return id ? (cache.get(id) ?? url) : undefined;
}
