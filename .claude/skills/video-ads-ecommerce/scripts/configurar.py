#!/usr/bin/env python3
"""Configura la carpeta de trabajo del equipo (una vez por computador).

Crea esta estructura (los nombres se pueden usar tal cual al hablarle a Claude):
  <carpeta>/
    1 Material crudo/     videos y fotos que llegan, una subcarpeta por producto (no se tocan)
    2 Referentes/         videos cuyo estilo de edición se quiere copiar
    3 Resultados/         videos terminados, por producto y fecha
    Fichas/               una ficha .md por producto (la memoria de cada producto)
    Estilos/              fichas de estilos de edición aprendidos
    Musica/               música con licencia por mood/temporada (+ indice.json)
    Voces/                muestras de voz (con permiso) para clonar, por país
    Pedidos/              pedidos de lote (pedido.json) por producto
y guarda la configuración en ~/.video-ads/config.json (tienda, país, colores, voces).

Uso: python configurar.py "D:\\Editor IA" [--tienda "Mi tienda"] [--pais CO] [--colores E6007E,FFD400,FFD400]
     python configurar.py --ver        (muestra la configuración actual)
"""
import argparse, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import leer_config, guardar_config, CONFIG

CARPETAS = ["1 Material crudo", "2 Referentes", "3 Resultados", "Fichas", "Estilos", "Musica", "Voces", "Pedidos"]

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta", nargs="?"); ap.add_argument("--tienda"); ap.add_argument("--pais")
    ap.add_argument("--colores", help="gancho,cta,resaltado en hex"); ap.add_argument("--ver", action="store_true")
    ap.add_argument("--sin-musica", action="store_true", help="no generar la música base con código")
    a = ap.parse_args()
    c = leer_config()
    if a.ver or not a.carpeta:
        print(json.dumps(c, ensure_ascii=False, indent=1) if c else "Sin configurar todavía."); print("Archivo:", CONFIG); return
    raiz = os.path.abspath(os.path.expanduser(a.carpeta))
    for d in CARPETAS: os.makedirs(os.path.join(raiz, d), exist_ok=True)
    c["carpeta_trabajo"] = raiz
    if a.tienda: c["tienda"] = a.tienda
    if a.pais: c["pais"] = a.pais.upper()
    if a.colores:
        g, ct, r = (a.colores.split(",") + ["FFD400", "FFD400"])[:3]
        c["colores"] = {"gancho": g, "cta": ct, "resaltado": r}
    c.setdefault("pais", "CO"); c.setdefault("colores", {"gancho": "E6007E", "cta": "FFD400", "resaltado": "FFD400"})
    guardar_config(c)
    musica = os.path.join(raiz, "Musica")
    if not a.sin_musica and not os.path.exists(os.path.join(musica, "generada_codigo")):
        subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "biblioteca_musica.py"),
                        musica, "--generar"], check=False)
    print(f"Listo. Carpeta de trabajo: {raiz}")
    for d in CARPETAS: print("  -", d)
    print("Configuración guardada en", CONFIG)

if __name__ == "__main__":
    main()
