#!/usr/bin/env python3
"""Organiza la biblioteca de música del equipo para que el editor elija sola la canción
correcta por mood y temporada (y corte al ritmo).

Estructura sugerida (el nombre de las carpetas se vuelve etiqueta):
  Musica/
    energetico/   urbano/   tropical/   chill/   emotivo/   epico/   divertido/
    temporadas/navidad/  temporadas/madres/  temporadas/amor_amistad/  temporadas/black_friday/ ...
Solo música con licencia comercial o generada (generar_musica.py). Ver references/audio.md.

Uso: python3 biblioteca_musica.py Musica/                 (crea/actualiza Musica/indice.json)
     python3 biblioteca_musica.py Musica/ --generar        (además crea pistas con código por estilo)
"""
import argparse, json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
EXT = (".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac")
# palabras del nombre/carpeta → etiquetas
MOODS = {"energetico": ["energ", "gym", "fitness", "electro", "house", "edm", "upbeat", "hype"],
         "urbano": ["dembow", "regueton", "reggaeton", "urban", "trap", "hiphop", "hip-hop"],
         "tropical": ["tropical", "champeta", "salsa", "cumbia", "vallenato", "caribe", "afro"],
         "chill": ["chill", "lofi", "lo-fi", "relax", "acoustic", "acustic", "soft"],
         "emotivo": ["emotiv", "piano", "sad", "inspira", "cinematic-soft"],
         "epico": ["epic", "epico", "cinemat", "trailer", "build"],
         "divertido": ["fun", "divertid", "quirky", "comedy", "happy", "ukulele"]}
TEMPS = {"navidad": ["navidad", "christmas", "xmas", "festivo", "aguinaldo", "decembr"],
         "madres": ["madre", "mother", "mama"], "padres": ["padre", "father"],
         "amor_amistad": ["amor", "amistad", "love", "valentin"], "black_friday": ["black", "cyber", "friday"],
         "halloween": ["halloween", "terror"], "regreso_clases": ["clases", "school", "escolar"],
         "verano": ["verano", "summer", "vacacion", "playa"], "prima": ["prima"]}

def etiquetar(ruta):
    r = ruta.lower()
    mood = [k for k, ws in MOODS.items() if any(w in r for w in ws)]
    temp = [k for k, ws in TEMPS.items() if any(w in r for w in ws)]
    return mood, temp

def analizar(p):
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                             capture_output=True, text=True).stdout or 0)
    bpm = None
    nombre = os.path.basename(p).lower()
    import re
    m = re.search(r"(\d{2,3})\s*bpm", nombre)
    if m: bpm = float(m.group(1))
    else:
        try:
            import librosa
            y, sr = librosa.load(p, sr=22050, mono=True, duration=60)
            t, _ = librosa.beat.beat_track(y=y, sr=sr); bpm = round(float(t if not hasattr(t, "__len__") else t[0]))
        except Exception:
            pass
    return d, bpm

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta"); ap.add_argument("--generar", action="store_true")
    a = ap.parse_args()
    if a.generar:
        dest = os.path.join(a.carpeta, "generada_codigo"); os.makedirs(dest, exist_ok=True)
        subprocess.run([sys.executable, os.path.join(AQUI, "generar_musica.py"), "todo", dest], check=True)
    pistas = []
    for raiz, _, archivos in os.walk(a.carpeta):
        for f in sorted(archivos):
            if not f.lower().endswith(EXT): continue
            p = os.path.join(raiz, f); rel = os.path.relpath(p, a.carpeta)
            mood, temp = etiquetar(rel)
            # estilos generados con código → mood
            for est, md in {"dembow": "urbano", "trap": "urbano", "electro": "energetico", "lofi": "chill",
                            "festivo": "energetico", "tropical": "tropical", "epico": "epico"}.items():
                if f.startswith(est) and md not in mood: mood.append(md)
            if f.startswith("festivo") and "navidad" not in temp: temp.append("navidad")
            d, bpm = analizar(p)
            pistas.append(dict(archivo=rel, dur=round(d, 1), bpm=bpm, mood=mood, temporada=temp))
            print(f"{rel:55s} {d:6.1f}s  {bpm or '?':>5} bpm  {mood} {temp}")
    json.dump(pistas, open(os.path.join(a.carpeta, "indice.json"), "w"), ensure_ascii=False, indent=1)
    print(f"\n{len(pistas)} pistas indexadas en {os.path.join(a.carpeta, 'indice.json')}")

if __name__ == "__main__":
    main()
