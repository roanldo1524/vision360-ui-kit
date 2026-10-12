#!/usr/bin/env python3
"""Sinapsis: sugiere conexiones entre notas del segundo cerebro.

Convierte cada nota en un vector TF-IDF y calcula la similitud coseno entre
todas las parejas. Las parejas parecidas que todavía NO están enlazadas se
escriben en `_sistema/Sinapsis sugeridas.md` para revisarlas en Obsidian.

Solo usa la librería estándar de Python (sin internet, sin instalar nada).

Uso:
    python3 _sistema/sinapsis.py                # desde la raíz del vault
    python3 _sistema/sinapsis.py --umbral 0.15 --max 5
"""
import argparse
import math
import re
import unicodedata
from collections import Counter
from pathlib import Path

VAULT = Path(__file__).resolve().parent.parent
CARPETAS = ["01-Neuronas", "02-Lobulos", "03-Proyectos", "04-Areas", "05-Recursos"]
SALIDA = VAULT / "_sistema" / "Sinapsis sugeridas.md"

STOPWORDS = set("""
a al algo algunas algunos ante antes como con contra cual cuando de del desde
donde durante e el ella ellas ellos en entre era es esa esas ese eso esos esta
estas este esto estos fue ha hay la las le les lo los mas me mi mis mucho muy
nada ni no nos o otra otro para pero poco por porque que quien se ser si sin
sobre solo su sus tambien tan te tiene tu un una uno unos y ya yo the and of to
in is it for on with this that neurona lobulo tipo tags estado creado sinapsis
""".split())

ENLACE = re.compile(r"\[\[([^\]|#]+)")
FRONTMATTER = re.compile(r"\A---\n.*?\n---\n", re.S)


def normalizar(texto):
    texto = unicodedata.normalize("NFKD", texto.lower())
    return "".join(c for c in texto if not unicodedata.combining(c))


def tokens(texto):
    texto = FRONTMATTER.sub("", texto)
    texto = re.sub(r"```.*?```", " ", texto, flags=re.S)
    palabras = re.findall(r"[a-zñ]{3,}", normalizar(texto))
    # raíz muy simple: recorta plurales para unir "nota" y "notas"
    return [p[:-1] if p.endswith("s") and len(p) > 4 else p
            for p in palabras if p not in STOPWORDS]


def cargar_notas():
    notas = {}
    for carpeta in CARPETAS:
        for ruta in (VAULT / carpeta).rglob("*.md"):
            texto = ruta.read_text(encoding="utf-8")
            notas[ruta.stem] = {
                "tokens": tokens(ruta.stem + " " + texto),
                "enlaces": {e.strip() for e in ENLACE.findall(texto)},
            }
    return notas


def vectores_tfidf(notas):
    n = len(notas)
    df = Counter(t for nota in notas.values() for t in set(nota["tokens"]))
    vecs = {}
    for nombre, nota in notas.items():
        tf = Counter(nota["tokens"])
        vec = {t: (c / len(nota["tokens"])) * math.log((1 + n) / (1 + df[t]))
               for t, c in tf.items()} if nota["tokens"] else {}
        norma = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        vecs[nombre] = {t: v / norma for t, v in vec.items()}
    return vecs


def coseno(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(t, 0.0) for t, v in a.items())


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--umbral", type=float, default=0.10,
                    help="similitud mínima para sugerir (0-1)")
    ap.add_argument("--max", type=int, default=3,
                    help="sugerencias máximas por nota")
    args = ap.parse_args()

    notas = cargar_notas()
    vecs = vectores_tfidf(notas)
    nombres = sorted(notas)

    lineas = [
        "---", "tipo: sistema", "tags: [sistema]", "---",
        "# 🔗 Sinapsis sugeridas", "",
        f"Generado por `sinapsis.py` (umbral {args.umbral}). "
        "Revisa cada sugerencia y, si tiene sentido, añade el enlace en la nota "
        "explicando *por qué* se conectan.", "",
    ]
    total = 0
    huerfanas = []
    for nombre in nombres:
        enlazadas = notas[nombre]["enlaces"]
        if not enlazadas and not any(nombre in notas[o]["enlaces"] for o in nombres):
            huerfanas.append(nombre)
        candidatos = sorted(
            ((coseno(vecs[nombre], vecs[otro]), otro) for otro in nombres
             if otro != nombre and otro not in enlazadas
             and nombre not in notas[otro]["enlaces"]),
            reverse=True)
        candidatos = [(s, o) for s, o in candidatos if s >= args.umbral][:args.max]
        if candidatos:
            lineas.append(f"## [[{nombre}]]")
            lineas += [f"- [[{o}]] — similitud {s:.2f}" for s, o in candidatos]
            lineas.append("")
            total += len(candidatos)

    if huerfanas:
        lineas += ["## ⚠️ Neuronas huérfanas (sin ninguna conexión)"]
        lineas += [f"- [[{h}]]" for h in huerfanas] + [""]

    SALIDA.write_text("\n".join(lineas), encoding="utf-8")
    print(f"{len(notas)} notas analizadas, {total} sinapsis sugeridas, "
          f"{len(huerfanas)} huérfanas → {SALIDA.relative_to(VAULT)}")


if __name__ == "__main__":
    main()
