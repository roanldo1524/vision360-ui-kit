#!/usr/bin/env python3
"""Limpia metadatos de uno o varios videos sin recodificar (rápido, sin pérdida de calidad).

Quita etiquetas, capítulos, nombre del programa/encoder y la información oculta que CapCut,
Premiere, el celular o x264 dejan dentro del archivo.
Uso: python3 limpiar_metadatos.py video.mp4 [salida.mp4]
     python3 limpiar_metadatos.py carpeta/          (limpia todos los .mp4/.mov de la carpeta)
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import limpiar_metadatos

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    obj = sys.argv[1]
    archivos = ([os.path.join(obj, f) for f in sorted(os.listdir(obj)) if f.lower().endswith((".mp4", ".mov", ".m4v"))]
                if os.path.isdir(obj) else [obj])
    for f in archivos:
        sal = sys.argv[2] if len(sys.argv) > 2 and not os.path.isdir(obj) else f
        r = limpiar_metadatos(f, sal)
        print(f"limpio: {sal}" + (f"  (quedan rastros: {r})" if r else ""))

if __name__ == "__main__":
    main()
