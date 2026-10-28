import type { Metadata, Viewport } from "next";
import { Fraunces, Lora, Manrope } from "next/font/google";
import localFont from "next/font/local";
import { Marco } from "@/components/Marco";
import "./globals.css";

// Tipografías de miciclo.co: Glodok Display (logo), Manrope (interfaz y primera línea de titulares),
// Fraunces (segunda línea de titulares) y Lora itálica (palabra acento).
const glodok = localFont({
  src: "../fuentes/glodok-display.woff2",
  weight: "400 900",
  variable: "--font-glodok",
  display: "swap",
});
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-fraunces" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "700"], style: ["normal", "italic"], variable: "--font-lora" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Mi Ciclo",
  description: "Tu bienestar, cada día. Acompaña las cuatro fases de tu ciclo con Mi Ciclo.",
  applicationName: "Mi Ciclo",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icono.svg", apple: "/icono-192.png" },
  appleWebApp: { capable: true, title: "Mi Ciclo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f62c39",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${lora.variable} ${manrope.variable} ${glodok.variable} ${fraunces.variable}`}>
      <body>
        <Marco>{children}</Marco>
      </body>
    </html>
  );
}
