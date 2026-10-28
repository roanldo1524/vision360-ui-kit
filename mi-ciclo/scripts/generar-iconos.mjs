// Genera los íconos PNG de la PWA a partir de public/icono.svg.
// Uso: node scripts/generar-iconos.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(raiz, "public/icono.svg"), "utf8");

const navegador = await chromium.launch();
const pagina = await navegador.newPage();

async function generar(tamano, archivo, maskable = false) {
  await pagina.setViewportSize({ width: tamano, height: tamano });
  // La versión maskable deja margen seguro (80 %) sobre fondo rojo.
  const interior = maskable ? Math.round(tamano * 0.8) : tamano;
  const fondo = maskable ? "#e01e37" : "transparent";
  await pagina.setContent(
    `<html><body style="margin:0;background:${fondo};display:grid;place-items:center;width:${tamano}px;height:${tamano}px">
      <div style="width:${interior}px;height:${interior}px">${svg.replace("<svg ", `<svg width="${interior}" height="${interior}" `)}</div>
    </body></html>`,
  );
  await pagina.screenshot({ path: join(raiz, "public", archivo), omitBackground: !maskable });
  console.log("listo", archivo);
}

await generar(192, "icono-192.png");
await generar(512, "icono-512.png");
await generar(512, "icono-maskable-512.png", true);
await navegador.close();
