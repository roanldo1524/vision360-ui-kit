import type { Metadata, Viewport } from "next";
import { Caveat, Chonburi, DM_Sans, Lora } from "next/font/google";
import { Marco } from "@/components/Marco";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-lora" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dmsans" });
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });
const chonburi = Chonburi({ subsets: ["latin"], weight: "400", variable: "--font-chonburi" });

export const metadata: Metadata = {
  title: "Mi Ciclo",
  description: "Tu bienestar, cada día. Acompaña las cuatro fases de tu ciclo con Mi Ciclo.",
  applicationName: "Mi Ciclo",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icono.svg", apple: "/icono-192.png" },
  appleWebApp: { capable: true, title: "Mi Ciclo", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${lora.variable} ${dmSans.variable} ${caveat.variable} ${chonburi.variable}`}>
      <body>
        <Marco>{children}</Marco>
      </body>
    </html>
  );
}
