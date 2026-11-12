#!/usr/bin/env python3
"""Crea (o amplía) la biblioteca de música del equipo con IA (Suno vía kie.ai), organizada
por estilo y temporada para Colombia. Cada estilo da 2 versiones instrumentales.
Después indexa todo con biblioteca_musica.py para que editar_auto.py elija sola por --mood/--temporada.

Costo aproximado: ~12 créditos (≈ USD 0.06) por estilo. Los estilos que ya existen se saltan.
Uso: python crear_biblioteca.py Musica/ [--dur 60] [--solo campo_carranga,navidad] [--simular] [--paralelo 4]
"""
import argparse, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
SIN_VOZ = "instrumental, no vocals"
# carpeta (se vuelve etiqueta de mood/temporada) → estilo para Suno
ESTILOS = {
    "campo/popular": "Colombian música popular instrumental, requinto guitar lead, nostalgic rural cantina vibe, warm, mid tempo",
    "campo/carranga": "Colombian carranga instrumental, tiple and requinto, guacharaca, cheerful rural Boyacá folk, upbeat",
    "campo/llanera": "Colombian llanera joropo instrumental, harp, cuatro and maracas, energetic, plains",
    "campo/vallenato": "Colombian vallenato instrumental, accordion lead, caja and guacharaca, joyful",
    "tropical/cumbia": "Colombian cumbia instrumental, gaita flutes, tambora drums, festive, danceable",
    "tropical/champeta": "Colombian champeta instrumental, African guitar riffs, bouncy bass, Caribbean party",
    "tropical/salsa": "Cali salsa instrumental, brass section, piano montuno, congas, energetic",
    "urbano/reggaeton": "modern reggaeton instrumental, dembow beat, catchy synth, youthful, commercial",
    "urbano/afrobeat": "afrobeats pop instrumental, smooth groove, bright, summery",
    "energetico/electro": "energetic house electronic instrumental, motivational, punchy drums, advertising",
    "energetico/rock": "powerful instrumental rock, driving electric guitars, tools and work, strong and confident",
    "chill/lofi": "lofi chill instrumental, soft keys, vinyl texture, cozy home",
    "chill/lifestyle": "lifestyle chill house instrumental, acoustic guitar, airy pads, warm morning",
    "emotivo/piano": "emotional cinematic piano instrumental, soft strings, hopeful and tender",
    "epico/trailer": "epic cinematic trailer instrumental, rising build-up, big reveal hit, orchestral and percussion",
    "divertido/ukulele": "fun quirky ukulele and whistle instrumental, playful, light percussion",
    "temporadas/navidad": "Colombian Christmas aguinaldo instrumental, tambora, maracas, festive December parranda",
    "temporadas/madres": "warm acoustic ballad instrumental, gentle guitar and piano, tender, Mother's Day",
    "temporadas/black_friday": "urgent hype electronic instrumental, fast tempo, countdown energy, sale event",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("carpeta"); ap.add_argument("--dur", type=int, default=60)
    ap.add_argument("--solo", default="", help="claves separadas por coma (ej. campo_carranga,navidad)")
    ap.add_argument("--simular", action="store_true"); ap.add_argument("--paralelo", type=int, default=4)
    a = ap.parse_args()
    filtro = [x.strip() for x in a.solo.split(",") if x.strip()]
    trabajos = []
    for carpeta, estilo in ESTILOS.items():
        clave = carpeta.replace("/", "_")
        if filtro and not any(f in clave for f in filtro): continue
        dest = os.path.join(a.carpeta, *carpeta.split("/"))
        if os.path.exists(os.path.join(dest, ".hecho")):
            print(f"ya existe: {carpeta}"); continue
        trabajos.append((carpeta, estilo, dest))
    print(f"{len(trabajos)} estilos por generar · costo aprox. USD {len(trabajos) * 0.06:.2f}")

    def hacer(t):
        carpeta, estilo, dest = t
        r = subprocess.run([sys.executable, os.path.join(AQUI, "musica_ia.py"), dest, "--estilo", f"{estilo}, {SIN_VOZ}",
                            "--titulo", carpeta.split("/")[-1].replace("_", " ").title(), "--dur", str(a.dur)]
                           + (["--simular"] if a.simular else []), capture_output=True, text=True)
        ok = r.returncode == 0
        print(("ok    " if ok else "ERROR ") + carpeta + ("" if ok else ": " + (r.stderr or r.stdout)[-300:]), flush=True)
        if ok and not a.simular:  # nombre descriptivo para que se vea el estilo en la biblioteca
            for f in os.listdir(dest):
                if f.startswith("musica_") and f.endswith(".mp3"):
                    os.rename(os.path.join(dest, f), os.path.join(dest, f"{carpeta.replace('/', '_')}_{f[7:]}"))
            open(os.path.join(dest, ".hecho"), "w").write("ok")
        return ok
    with ThreadPoolExecutor(max_workers=max(1, a.paralelo)) as ex:
        res = list(ex.map(hacer, trabajos))
    if not a.simular:
        subprocess.run([sys.executable, os.path.join(AQUI, "biblioteca_musica.py"), a.carpeta])
    print(f"listo: {sum(res)}/{len(res)} estilos")


if __name__ == "__main__":
    main()
