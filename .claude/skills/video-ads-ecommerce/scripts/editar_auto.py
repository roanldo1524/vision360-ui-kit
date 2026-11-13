#!/usr/bin/env python3
"""Editor automático de anuncios "dopamínicos" (rápidos, con ritmo y sonido), sin créditos.

Dos modos:
  montaje  Junta varios clips (b-roll, producto, UGC) cortados AL RITMO de la música,
           con voz en off opcional. Ideal para producto, demos, faceless, slideshow.
  ugc      Un video de una persona hablando: quita silencios, hace jump-cuts con zoom
           alterno, subtítulos palabra a palabra de lo que dice, música de fondo bajita.

En ambos agrega: texto gancho arriba en los primeros segundos, efectos de sonido
(impacto al inicio, whoosh en transiciones, pop en el gancho, cha-ching en la oferta),
zoom punch, barra de progreso, tarjeta final con CTA/oferta, música con "ducking"
(baja sola cuando hay voz), volumen -14 LUFS, 1080x1920 y metadatos limpios.

Ejemplos:
  python3 editar_auto.py montaje --clips carpeta_clips/ --musica cancion.mp3 \
      --voz voz.wav --subs voz.json --gancho "¿TU PISO SIEMPRE SUCIO?" \
      --cta "PIDE EL TUYO HOY" --oferta "PAGO CONTRAENTREGA · ENVÍO GRATIS" -o final.mp4
  python3 editar_auto.py ugc --video crudo.mp4 --biblioteca ~/musica --mood energetico \
      --gancho "3 RAZONES PARA..." --cta "TOCA EL ENLACE" -o final.mp4

Opciones de estilo: --preset dopamina|ugc|premium, --resaltado FFD400, --fuente Montserrat|Anton,
  --color-gancho E6007E, --color-cta FFD400 (usa los colores de la marca/tienda).
Plan creativo (lo que hace que el video NO sea genérico): --plan escenas.json. Cada elemento va
en un segundo ("t") o, mejor, anclado a lo que se dice ("en": "cinco gramos"): así cae justo en
la palabra aunque la voz cambie de duración. P. ej.
  [{"t": 3.2, "dur": 1.5, "texto": "5 g de creatina", "estilo": "caja", "sfx": "pop"},
   {"t": 9.0, "dur": 2, "texto": "$89.900", "estilo": "precio", "pos": 0.3, "sfx": "cha_ching"}]
Velocidad: --rapido usa codificación más veloz (para lotes grandes); ~1-2 min por video de 30 s en CPU.
"""
import argparse, glob, json, os, random, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from subtitulos import crear_ass, ts  # noqa: E402
from comun import FONTS, SFX, codificador, ff_ruta, hilos, limpiar_metadatos, whisper_opciones  # noqa: E402

W, H, FPS = 1080, 1920, 30
# Transiciones entre tomas (montaje): (nombre xfade de ffmpeg, duración s, efecto de sonido).
# Regla de oficio: cortas (0.15-0.25 s), mezcladas con cortes secos, nunca la misma dos veces seguidas,
# deslizamientos siempre hacia el mismo lado, y cada una con su sonido.
TRANSICIONES = {
    "dopamina": dict(prob=0.55, pool=[("hlwind", 0.22, "whoosh"), ("zoomin", 0.24, "whoosh_corto"),
                                      ("slideleft", 0.2, "whoosh"), ("hblur", 0.22, "whoosh_corto"),
                                      ("fadewhite", 0.16, "impacto"), ("pixelize", 0.2, "glitch")]),
    "ugc":      dict(prob=0.25, pool=[("hblur", 0.2, "whoosh_corto"), ("zoomin", 0.22, "whoosh_corto"),
                                      ("smoothleft", 0.22, "whoosh")]),
    "premium":  dict(prob=0.6, pool=[("fade", 0.35, None), ("smoothleft", 0.3, "whoosh"), ("fadeblack", 0.35, None),
                                     ("circleopen", 0.35, "sparkle")]),
    "cine":     dict(prob=0.45, pool=[("fade", 0.4, None), ("smoothleft", 0.35, None), ("hblur", 0.3, None)]),
}

PRESETS = {
    # beats por plano, zoom punch, probabilidad de whoosh por corte, volumen música con voz
    # música con voz ≈ -18 dB bajo la voz (a -11/-14 dB "se come la voz"); sfx_gap = mínimo entre efectos
    "dopamina": dict(beats=(2, 2, 3), punch=1.12, push=0.06, whoosh=0.8, sfx_gap=1.2, musica_con_voz=0.13, estilo="dopamina"),
    "ugc":      dict(beats=(2, 4), punch=1.10, push=0.04, whoosh=0.5, sfx_gap=2.0, musica_con_voz=0.11, estilo="dopamina"),
    "premium":  dict(beats=(4, 8), punch=1.0,  push=0.05, whoosh=0.3, sfx_gap=3.0, musica_con_voz=0.12, estilo="frase"),
}
VIDEO_EXT = (".mp4", ".mov", ".m4v", ".webm", ".mkv")
IMG_EXT = (".jpg", ".jpeg", ".png", ".webp")


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout or 0)


def tiene_audio(p):
    return bool(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index",
                                "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip())


def beats_de(musica, bpm=None):
    """Tiempos de beat de la canción (librosa si está; si no, rejilla con el BPM dado o 120)."""
    if not bpm:
        try:
            import librosa
            y, sr = librosa.load(musica, sr=22050, mono=True, duration=180)
            tempo, b = librosa.beat.beat_track(y=y, sr=sr)
            bt = librosa.frames_to_time(b, sr=sr)
            if len(bt) > 8:
                return list(bt), float(tempo if not hasattr(tempo, "__len__") else tempo[0])
        except Exception as e:
            print("aviso: no pude detectar el ritmo automáticamente:", e)
        bpm = 120
    paso = 60.0 / bpm
    return [i * paso for i in range(int(dur(musica) / paso) + 1)], bpm


def elegir_musica(biblioteca, mood=None, temporada=None, min_dur=0):
    """Escoge una canción de la biblioteca (ver biblioteca_musica.py) por mood/temporada."""
    idx = os.path.join(biblioteca, "indice.json")
    if os.path.exists(idx):
        pistas = json.load(open(idx))
        def ok(p):
            return ((not mood or mood in p.get("mood", [])) and (not temporada or temporada in p.get("temporada", []))
                    and p.get("dur", 0) >= min_dur * 0.6)
        cand = [p for p in pistas if ok(p)] or [p for p in pistas if not temporada or temporada in p.get("temporada", [])] or pistas
        if cand:
            p = random.choice(cand); print(f"música: {p['archivo']} ({p.get('bpm', '?')} bpm)")
            return os.path.join(biblioteca, p["archivo"]), p.get("bpm")
    arch = [f for f in glob.glob(os.path.join(biblioteca, "**", "*"), recursive=True)
            if f.lower().endswith((".mp3", ".wav", ".m4a", ".ogg", ".flac"))]
    filtro = [f for f in arch if any(k and k.lower() in f.lower() for k in (mood, temporada))] or arch
    if not filtro:
        sys.exit(f"No hay música en {biblioteca}")
    f = random.choice(filtro); print("música:", f); return f, None


def render_plano(src, ss, d, out, zoom_ini, zoom_fin, es_img, con_audio, extra=0.0):
    """Un plano normalizado a 1080x1920/30fps. Zoom fijo (punch) o animado (push-in / Ken Burns).
    extra: segundos de más al final, que se solapan con el plano siguiente en una transición."""
    d = d + extra
    n = max(1, int(round(d * FPS)))
    cubrir = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    if abs(zoom_fin - zoom_ini) > 1e-3:
        vf = (f"{cubrir},fps={FPS},zoompan=z='{zoom_ini}+({zoom_fin}-{zoom_ini})*on/{n}':d=1:"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS}")
    elif zoom_ini > 1.0:
        vf = (f"scale={int(W*zoom_ini)//2*2}:{int(H*zoom_ini)//2*2}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H},setsar=1,fps={FPS}")
    else:
        vf = f"{cubrir},fps={FPS}"
    vf += ",tpad=stop_mode=clone:stop_duration=1,format=yuv420p"   # nunca quedarse corto de cuadros
    if es_img:
        cmd = ["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(FPS), "-t", f"{d:.3f}", "-i", src]
    else:
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{d:.3f}", "-i", src]
    if con_audio:
        cmd += ["-map", "0:v", "-map", "0:a", "-af", "aresample=48000,aformat=channel_layouts=stereo"]
    else:
        cmd += ["-f", "lavfi", "-t", f"{d:.3f}", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a"]
    cmd += ["-vf", vf, "-frames:v", str(n), *codificador("intermedio"),
            "-r", str(FPS), "-c:a", "aac", "-ar", "48000", "-ac", "2", "-af" if not con_audio else "-af",
            "apad" if not con_audio else "aresample=48000,aformat=channel_layouts=stereo,apad", "-t", f"{n / FPS:.3f}", out]
    sh(cmd)


def planos_completos(clips, beats):
    """Cada clip una vez, en orden, recortado para terminar en el beat más cercano a su final."""
    planos, t = [], 0.0
    for c in clips:
        es_img = c.lower().endswith(IMG_EXT); ld = 3.5 if es_img else dur(c)
        fin_ideal = t + ld - 0.15
        fin = max([b for b in beats if t + 1.0 <= b <= fin_ideal] or [fin_ideal])
        d = max(1.0, fin - t)
        planos.append(dict(src=c, ss=0.0, d=d, img=es_img)); t += d
    return planos


def planos_montaje(clips, beats, total, preset, rnd):
    """Reparte la duración total en planos que empiezan y terminan en beats."""
    planos, i, t = [], 0, 0.0
    bi = 0
    while t < total - 0.05:
        nb = rnd.choice(preset["beats"]) if t > 3 else 1  # el gancho va más rápido
        fin_idx = min(bi + nb, len(beats) - 1)
        fin = beats[fin_idx] if fin_idx > bi else t + 0.5 * nb
        fin = min(fin, total)
        if total - fin < 0.6: fin = total  # no dejar un plano mini al final
        d = max(0.35, fin - t)
        src = clips[i % len(clips)]; i += 1
        es_img = src.lower().endswith(IMG_EXT)
        ld = 4.0 if es_img else dur(src)
        ss = 0.0 if es_img or ld <= d + 0.2 else rnd.uniform(0, max(0, ld - d - 0.1))
        planos.append(dict(src=src, ss=ss, d=min(d, ld) if not es_img else d, img=es_img))
        t += planos[-1]["d"]; bi = fin_idx
        if bi >= len(beats) - 1:  # se acabaron los beats: seguir con rejilla de 0.5 s
            beats = beats + [beats[-1] + 0.5 * (k + 1) for k in range(int(total * 2) + 4)]
    return planos


def palabras_de(video):
    """Palabras con tiempos (Whisper). Se usan para cortar SOLO entre palabras y para subtítulos exactos."""
    from transcribir import cargar_audio
    from faster_whisper import WhisperModel
    dev, ct, mod = whisper_opciones()
    segs, info = WhisperModel(mod, device=dev, compute_type=ct).transcribe(
        cargar_audio(video), word_timestamps=True, vad_filter=True)
    pal = [dict(start=w.start, end=w.end, word=w.word.strip()) for s in segs for w in s.words if w.word.strip()]
    return pal, info.language

def cortes_por_palabras(pal, D, pausa_max=0.30, pausa_queda=0.12, plano_max=3.0):
    """Bloques de habla sin silencios largos; parte bloques largos en huecos entre palabras
    (nunca a mitad de palabra). Devuelve planos [(ini, fin)] y palabras en la nueva línea de tiempo."""
    if not pal: return [(0, D)], []
    bloques = [[pal[0]]]
    for w in pal[1:]:
        (bloques.append([w]) if w["start"] - bloques[-1][-1]["end"] >= pausa_max else bloques[-1].append(w))
    planos = []
    for bl in bloques:
        ini = max(0, bl[0]["start"] - pausa_queda / 2); grupo_ini = ini
        for k in range(1, len(bl)):
            hueco = bl[k]["start"] - bl[k - 1]["end"]
            if bl[k]["start"] - grupo_ini >= plano_max - 0.5 and hueco >= 0.04:
                corte = bl[k - 1]["end"] + hueco / 2
                planos.append((grupo_ini, corte)); grupo_ini = corte
        planos.append((grupo_ini, min(D, bl[-1]["end"] + 0.10)))
    # nueva línea de tiempo de cada palabra
    nuevas, t_nuevo = [], 0.0
    for (a, b) in planos:
        for w in pal:
            if a - 0.01 <= w["start"] < b:
                nuevas.append(dict(w, start=t_nuevo + (w["start"] - a), end=t_nuevo + (min(w["end"], b) - a)))
        t_nuevo += b - a
    return planos, nuevas

def agrupar(pal, n=3):
    """Grupos de hasta n palabras (o hasta un signo de puntuación) con tiempos exactos."""
    g, out = [], []
    for w in pal:
        g.append(w)
        if len(g) >= n or w["word"][-1:] in ".,?!;:":
            out.append(dict(start=g[0]["start"], end=g[-1]["end"], text=" ".join(x["word"] for x in g))); g = []
    if g: out.append(dict(start=g[0]["start"], end=g[-1]["end"], text=" ".join(x["word"] for x in g)))
    for i in range(len(out) - 1):  # sin parpadeos entre grupos
        out[i]["end"] = max(out[i]["end"], min(out[i + 1]["start"], out[i]["end"] + 0.4))
    return out

def offset_climax(musica, objetivo):
    """Segundo de la canción donde arranca su parte más fuerte, menos 'objetivo': así el clímax
    de la música cae en el momento fuerte del video (revelación/oferta)."""
    try:
        import librosa, numpy as np
        y, sr = librosa.load(musica, sr=22050, mono=True, duration=240)
        rms = librosa.feature.rms(y=y, hop_length=512)[0]
        t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
        win = int(4 * sr / 512)
        e = np.convolve(rms, np.ones(win) / win, mode="same")
        subida = np.r_[np.zeros(win), e[win:] - e[:-win]]
        validos = t >= objetivo
        if not validos.any(): return 0.0
        i = int(np.argmax(np.where(validos, subida, -1)))
        return max(0.0, float(t[i]) - objetivo)
    except Exception:
        return 0.0

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modo", choices=["montaje", "ugc"])
    ap.add_argument("--clips", nargs="*", default=[], help="archivos o carpetas con clips/fotos (montaje)")
    ap.add_argument("--en-orden", action="store_true", help="usar los clips en el orden dado (videos Frankenstein con guion)")
    ap.add_argument("--inicio", help="clip o foto con el que arranca el video (la toma del gancho)")
    ap.add_argument("--transiciones", default="auto", choices=["auto", "todas", "no"],
                    help="auto: mezcla cortes secos y transiciones según el preset; todas: una en cada corte; no: solo cortes")
    ap.add_argument("--pos-subs", type=float, default=0.6, help="altura de los subtítulos (0 arriba, 1 abajo); útil para tapar zonas desenfocadas")
    ap.add_argument("--claves", default="", help="palabras clave del producto (se resaltan en los subtítulos)")
    ap.add_argument("--color-clave", default="00E676", help="color de las palabras clave en subtítulos")
    ap.add_argument("--subs-caja", action="store_true", help="subtítulos sobre caja oscura (tapa mejor textos viejos)")
    ap.add_argument("--planos-completos", action="store_true",
                    help="cada clip se usa una vez, casi completo, cortado en el beat (escenas IA / cine)")
    ap.add_argument("--look", default=None, choices=["suave", "calido", "lifestyle", "frio", "contraste"],
                    help="color final: suave (luminoso y delicado, marcas de bienestar/belleza), calido, lifestyle (más dramático), frio, contraste")
    ap.add_argument("--cine", action="store_true",
                    help="atajo de video cinematográfico: sin textos ni subtítulos, sin barra, sin SFX llamativos, planos completos, look lifestyle")
    ap.add_argument("--video", help="video crudo con persona hablando (ugc)")
    ap.add_argument("--musica"); ap.add_argument("--biblioteca"); ap.add_argument("--mood"); ap.add_argument("--temporada")
    ap.add_argument("--bpm", type=float)
    ap.add_argument("--voz", help="voz en off (wav/mp3)"); ap.add_argument("--subs", help="json de tiempos de la voz")
    ap.add_argument("--transcribir", action="store_true", help="sacar subtítulos de la voz con Whisper si no hay --subs")
    ap.add_argument("--duracion", type=float, help="duración objetivo (montaje sin voz). Por defecto 20 s")
    ap.add_argument("--gancho", default=""); ap.add_argument("--gancho-dur", type=float, default=2.8)
    ap.add_argument("--cta", default=""); ap.add_argument("--oferta", default=""); ap.add_argument("--cta-dur", type=float, default=2.6)
    ap.add_argument("--preset", default="dopamina", choices=list(PRESETS))
    from comun import leer_config
    _col = leer_config().get("colores", {})
    ap.add_argument("--resaltado", default=_col.get("resaltado", "FFD400")); ap.add_argument("--fuente", default="Montserrat")
    ap.add_argument("--color-cta", default=_col.get("cta", "FFD400")); ap.add_argument("--color-gancho", default=_col.get("gancho", "E6007E"))
    ap.add_argument("--plan", help="json de escenas: [{t, dur, texto, estilo: grande|caja|precio, pos, sfx}]")
    ap.add_argument("--sin-barra", action="store_true"); ap.add_argument("--sin-sfx", action="store_true")
    ap.add_argument("--semilla", type=int, default=None, help="misma semilla = misma edición (para variantes)")
    ap.add_argument("--rapido", action="store_true")
    ap.add_argument("--climax-en", type=float, default=None, help="segundo del video donde debe caer la parte fuerte de la música")
    ap.add_argument("--sin-climax", action="store_true", help="la música arranca desde el inicio de la canción")
    ap.add_argument("-o", "--salida", required=True)
    a = ap.parse_args()
    P = PRESETS[a.preset]; rnd = random.Random(a.semilla)
    plan = json.load(open(a.plan)) if a.plan else []
    if a.cine:
        a.sin_barra = True; a.sin_sfx = True; a.planos_completos = True; a.en_orden = True
        a.look = a.look or "suave"; a.gancho = a.gancho if a.gancho else ""
    off_musica = None
    tmp = tempfile.mkdtemp(prefix="edit_")
    try:
        # ---------- voz y duración ----------
        voz, subs = a.voz, []
        if a.subs: subs = json.load(open(a.subs))
        if a.modo == "ugc":
            if not a.video: sys.exit("modo ugc necesita --video")
            pal, lang = palabras_de(a.video)
            partes, pal_nuevas = cortes_por_palabras(pal, dur(a.video))
            planos = [dict(src=a.video, ss=s, d=e - s, img=False) for s, e in partes]
            total_voz = sum(p["d"] for p in planos)
            if not subs: subs = agrupar(pal_nuevas)
            print(f"ugc ({lang}): {len(planos)} planos, {dur(a.video):.1f}s → {total_voz:.1f}s sin pausas muertas")
        else:
            clips = []
            for c in a.clips:
                if os.path.isdir(c):
                    clips += sorted(f for f in glob.glob(os.path.join(c, "*")) if f.lower().endswith(VIDEO_EXT + IMG_EXT))
                else:
                    clips.append(c)
            if not clips: sys.exit("modo montaje necesita --clips")
            if not a.en_orden: rnd.shuffle(clips)
            if a.inicio:  # la toma del gancho manda en los primeros segundos
                clips = [a.inicio] + [c for c in clips if os.path.abspath(c) != os.path.abspath(a.inicio)]
            total_voz = dur(voz) if voz else (a.duracion or 20.0)
        total = total_voz + (a.cta_dur if a.cta else 0) + 0.3

        # ---------- música ----------
        musica, bpm = a.musica, a.bpm
        if not musica and a.biblioteca:
            musica, bpm_i = elegir_musica(a.biblioteca, a.mood, a.temporada, total); bpm = bpm or bpm_i
        beats = None
        if a.modo == "montaje":
            if musica:
                beats, bpm = beats_de(musica, bpm)
                print(f"ritmo: {bpm:.0f} bpm")
                # alinear el clímax de la canción con el momento fuerte y mover la rejilla de beats igual
                momento = a.climax_en if a.climax_en is not None else (max(0.0, total - a.cta_dur - 2.0) if a.cta else total * 0.6)
                off_musica = 0.0 if a.sin_climax else offset_climax(musica, momento)
                if off_musica > 0:
                    # que el arranque caiga en un beat
                    off_musica = min(beats, key=lambda b: abs(b - off_musica))
                    beats = [b - off_musica for b in beats if b >= off_musica]
            else:
                beats = [i * 0.5 for i in range(int(total * 2) + 4)]
            if a.planos_completos:
                planos = planos_completos(clips, beats)
                total = sum(p["d"] for p in planos)
            else:
                planos = planos_montaje(clips, beats, total, P, rnd)

        # ---------- zooms por plano y render en paralelo ----------
        for i, p in enumerate(planos):
            if a.planos_completos and not p["img"]:
                p["z"] = (1.0, 1.0); continue
            if a.modo == "ugc":
                p["z"] = (P["punch"], P["punch"]) if i % 2 else (1.0, 1.0)  # jump cut alterno
            elif p["img"]:
                p["z"] = (1.0, 1.0 + P["push"] * 2.5)  # Ken Burns en fotos
            else:
                p["z"] = rnd.choice([(1.0, 1.0 + P["push"]), (1.0 + P["push"], 1.0), (P["punch"], P["punch"]), (1.0, 1.0)])
        con_audio = a.modo == "ugc" and tiene_audio(a.video)
        # transiciones: solo en montaje (en UGC el audio de la persona no se puede solapar)
        cat = TRANSICIONES.get("cine" if a.cine else a.preset) if (a.modo == "montaje" and a.transiciones != "no") else None
        ultima = None
        for i, p in enumerate(planos):
            p["trans"] = None
            largos = i < len(planos) - 1 and p["d"] >= 0.9 and planos[i + 1]["d"] >= 0.9   # en tomas cortas, corte seco
            if cat and largos and (a.transiciones == "todas" or rnd.random() < cat["prob"]):
                opciones = [t for t in cat["pool"] if t[0] != ultima] or cat["pool"]
                p["trans"] = rnd.choice(opciones); ultima = p["trans"][0]
            elif cat:
                ultima = None

        def hacer(ip):
            i, p = ip
            o = os.path.join(tmp, f"p{i:03d}.mp4")
            render_plano(p["src"], p["ss"], p["d"], o, p["z"][0], p["z"][1], p["img"], con_audio,
                         extra=p["trans"][1] if p.get("trans") else 0.0)
            return o
        with ThreadPoolExecutor(max_workers=hilos()) as ex:
            files = list(ex.map(hacer, enumerate(planos)))
        base = os.path.join(tmp, "base.mp4")
        if any(p.get("trans") for p in planos):
            # cadena: corte seco = concat; transición = xfade que solapa los segundos "extra" del plano anterior
            inp, fc, cur, largo = [], [], "[n0]", 0.0
            for i, f in enumerate(files):
                inp += ["-i", f]
                fc.append(f"[{i}:v]fps={FPS},settb=1/{FPS},format=yuv420p,setsar=1[n{i}]")   # misma base de tiempo

            largo = planos[0]["d"] + (planos[0]["trans"][1] if planos[0].get("trans") else 0)
            for i in range(1, len(files)):
                prev = planos[i - 1]; Li = planos[i]["d"] + (planos[i]["trans"][1] if planos[i].get("trans") else 0)
                if prev.get("trans"):
                    nombre, td, _ = prev["trans"]
                    fc.append(f"{cur}[n{i}]xfade=transition={nombre}:duration={td}:offset={largo - td:.3f},settb=1/{FPS}[x{i}]")
                    largo += Li - td
                else:
                    fc.append(f"{cur}[n{i}]concat=n=2:v=1:a=0,fps={FPS},settb=1/{FPS}[x{i}]")
                    largo += Li
                cur = f"[x{i}]"
            fc.append(f"{cur}format=yuv420p[vout]")
            sh(["ffmpeg", "-v", "error", "-y", *inp, "-f", "lavfi", "-t", f"{largo:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                "-filter_complex", ";".join(fc), "-map", "[vout]", "-map", f"{len(files)}:a", *codificador("intermedio"),
                "-r", str(FPS), "-c:a", "aac", "-t", f"{largo:.3f}", base])
            print(f"transiciones: {sum(1 for p in planos if p.get('trans'))} de {len(planos) - 1} cortes "
                  f"({', '.join(p['trans'][0] for p in planos if p.get('trans'))})")
        else:
            lista = os.path.join(tmp, "lista.txt")
            open(lista, "w").write("".join(f"file '{f}'\n" for f in files))
            sh(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", base])
        D = dur(base)
        cortes, t = [], 0.0
        for p in planos[:-1]:
            t += p["d"]; cortes.append(t)

        # ---------- subtítulos ----------
        if a.modo == "ugc" and not subs:
            a.transcribir = True
        if a.transcribir and not subs:
            src_voz = base if a.modo == "ugc" else voz
            if src_voz:
                j = os.path.join(tmp, "subs.json")
                sh([sys.executable, os.path.join(AQUI, "transcribir.py"), src_voz, j], stdout=subprocess.DEVNULL)
                subs = json.load(open(j))
        def col(h, a="00"): return f"&H{a}{h[4:6]}{h[2:4]}{h[0:2]}".upper()
        ac = a.color_cta
        # Gancho: letra grande blanca sobre caja de color (se lee en 0.5 s, sin sonido)
        # CTA: "botón" de color; Oferta: franja oscura; Nota: textos del plan creativo.
        ext_estilos = (
            f"Style: Gancho,{a.fuente},{int(W*0.088)},&H00FFFFFF,&H00FFFFFF,{col(a.color_gancho,'10')},&H00000000,-1,0,0,0,100,100,0,0,3,{int(W*0.022)},0,5,70,70,0,1\n"
            f"Style: CTA,{a.fuente},{int(W*0.1)},&H00111111,&H00FFFFFF,{col(ac)},&H00000000,-1,0,0,0,100,100,0,0,3,{int(W*0.03)},0,5,60,60,0,1\n"
            f"Style: Oferta,{a.fuente},{int(W*0.056)},&H00FFFFFF,&H00FFFFFF,&H40000000,&H00000000,-1,0,0,0,100,100,0,0,3,{int(W*0.016)},0,5,60,60,0,1\n"
            f"Style: Nota,{a.fuente},{int(W*0.085)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,{int(W*0.008)},3,5,60,60,0,1\n"
            f"Style: NotaCaja,{a.fuente},{int(W*0.082)},&H00111111,&H00FFFFFF,{col(a.resaltado)},&H00000000,-1,0,0,0,100,100,0,0,3,{int(W*0.016)},0,5,60,60,0,1\n"
            f"Style: Precio,Anton,{int(W*0.24)},{col(a.resaltado)},&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,{int(W*0.01)},4,5,60,60,0,1\n")
        pop = r"{\fscx60\fscy60\t(0,110,\fscx112\fscy112)\t(110,200,\fscx100\fscy100)}"
        sacudir = r"{\frz-3\t(0,80,\frz3)\t(80,160,\frz0)}"
        eventos = []
        if a.gancho:
            eventos.append(f"Dialogue: 2,{ts(0)},{ts(min(a.gancho_dur, D))},Gancho,,0,0,0,,{{\\pos({W//2},{int(H*0.2)})}}{pop}{a.gancho.upper()}")
        cta_ini = D - a.cta_dur if a.cta else D
        if a.cta:
            eventos.append(f"Dialogue: 3,{ts(cta_ini)},{ts(D)},CTA,,0,0,0,,{{\\pos({W//2},{int(H*0.44)})}}{pop}{sacudir}{a.cta.upper()}")
            if a.oferta:
                eventos.append(f"Dialogue: 3,{ts(cta_ini + 0.3)},{ts(D)},Oferta,,0,0,0,,{{\\pos({W//2},{int(H*0.55)})}}{pop}{a.oferta.upper()}")
        # plan creativo por escenas: textos/efectos en momentos concretos (ver --plan)
        def anclar(e):
            """'en': texto dicho → segundo en que se dice (usa los subtítulos/tiempos de la voz)."""
            if "t" in e: return float(e["t"])
            buscado = e.get("en", "").lower()
            for sg in subs:
                txt = sg["text"].lower(); k = txt.find(buscado)
                if buscado and k >= 0:
                    return sg["start"] + (sg["end"] - sg["start"]) * k / max(1, len(txt))
            print(f"aviso: no encontré '{e.get('en')}' en la voz; ese elemento del plan se omite"); return None
        for e in plan:
            e["t"] = anclar(e)
        plan[:] = [e for e in plan if e.get("t") is not None]
        ocupados = []
        for e in plan:
            t0 = float(e["t"]); t1 = t0 + float(e.get("dur", 1.5))
            if e.get("texto"):
                pos_e = float(e.get("pos", 0.32))
                while any(not (t1 <= a0 or t0 >= a1) and abs(pos_e - p0) < 0.075 for a0, a1, p0 in ocupados):
                    pos_e += 0.085   # no encimar textos que salen al mismo tiempo
                ocupados.append((t0, t1, pos_e)); e["pos"] = pos_e
                est = {"caja": "NotaCaja", "precio": "Precio", "grande": "Nota"}.get(e.get("estilo", "grande"), "Nota")
                eventos.append(f"Dialogue: 4,{ts(t0)},{ts(min(t1, D))},{est},,0,0,0,,"
                               f"{{\\pos({W//2},{int(H*float(e.get('pos', 0.32)))})}}{pop}{e['texto'].upper() if est != 'NotaCaja' else e['texto']}")
        # los subtítulos se apagan cuando entra el CTA (si no, se pisan)
        subs_ok = [dict(x, end=min(x["end"], cta_ini - 0.05)) for x in subs if x["start"] < cta_ini - 0.3]
        claves = [c.strip() for c in a.claves.split(",") if c.strip()] + [e["en"] for e in plan if e.get("en")]
        estilo_subs = P["estilo"] if P["estilo"] == "dopamina" else ("caja" if a.subs_caja else P["estilo"])
        ass = crear_ass(subs_ok, W, H, os.path.join(tmp, "t.ass"), estilo_subs, a.fuente, "FFFFFF",
                        a.resaltado, a.pos_subs, None, (), ext_estilos, eventos,
                        claves=claves, caja=a.subs_caja, color_clave=a.color_clave)

        # ---------- video final: zoom de cortes ya está; añadir barra, oscurecer CTA, textos ----------
        LOOKS = {"suave": "eq=brightness=0.035:contrast=0.94:saturation=0.9:gamma=1.04,colorbalance=rh=0.02:bh=0.015:rs=0.01,curves=all='0/0.04 0.5/0.53 1/0.98'",
                 "lifestyle": "colorbalance=rs=0.04:gs=0.01:bs=-0.03:rm=0.03:bm=-0.02,eq=contrast=1.04:saturation=1.06:gamma=1.02,vignette=PI/6",
                 "calido": "colorbalance=rs=0.06:bs=-0.05:rm=0.04:bm=-0.03,eq=saturation=1.08",
                 "frio": "colorbalance=bs=0.05:rs=-0.03,eq=saturation=0.95",
                 "contraste": "eq=contrast=1.12:saturation=1.1,unsharp=5:5:0.5"}
        vf = f"[0:v]{LOOKS[a.look] if a.look else 'null'}[vl]"
        if a.cta:
            vf += (f";[vl]boxblur=14:2:enable='gte(t,{cta_ini:.2f})',"
                   f"eq=brightness=-0.22:saturation=0.75:enable='gte(t,{cta_ini:.2f})'[v]")
        else:
            vf += ";[vl]null[v]"
        if not a.sin_barra:
            vf += f";[v]drawbox=x=0:y=0:w='iw*t/{D:.3f}':h=10:color=0x{a.resaltado}@0.95:t=fill[v2]"
        else:
            vf += ";[v]null[v2]"
        vf += f";[v2]ass='{ff_ruta(ass)}':fontsdir='{ff_ruta(FONTS)}'[vout]"

        # ---------- audio: voz/original + música con ducking + SFX ----------
        inputs = ["-i", base]; af = []; mezcla = []
        n_in = 1
        if a.modo == "ugc" and con_audio:
            # limpieza de voz de celular: graves, ruido, presencia, sibilancias, compresión suave
            af.append("[0:a]highpass=f=90,afftdn=nf=-25,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=3300:t=q:w=1:g=3,"
                      "deesser,acompressor=threshold=-24dB:ratio=3:attack=10:release=120,asplit[voz][vozsc]")
            hay_voz = True
        elif voz:
            inputs += ["-i", voz]; af.append(f"[{n_in}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=150:all=1,asplit[voz][vozsc]")
            n_in += 1; hay_voz = True
        else:
            hay_voz = False
        if musica:
            momento = a.climax_en if a.climax_en is not None else (max(0.0, cta_ini - 2.0) if a.cta else D * 0.6)
            off = off_musica if off_musica is not None else (0.0 if a.sin_climax else offset_climax(musica, momento))
            if off > 0: print(f"música: arranca en el segundo {off:.1f} de la canción para que su parte fuerte caiga en el {momento:.1f} del video")
            inputs += ["-stream_loop", "-1", "-ss", f"{off:.2f}", "-i", musica]
            m = f"[{n_in}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D:.3f},afade=t=out:st={max(0, D-1.2):.2f}:d=1.2"
            n_in += 1
            if hay_voz:
                af.append(m + f",volume={P['musica_con_voz']}[mus0]")
                af.append("[mus0][vozsc]sidechaincompress=threshold=0.05:ratio=2:attack=120:release=400[mus]")
            else:
                af.append(m + "[mus]")
            mezcla.append("[mus]")
        if hay_voz: mezcla.insert(0, "[voz]")
        # efectos de sonido
        eventos_sfx = []
        if not a.sin_sfx and os.path.isdir(SFX):
            eventos_sfx.append(("impacto", 0.0, 0.55))
            if a.gancho: eventos_sfx.append(("pop", 0.05, 0.5))
            ocupado = [0.0] + [float(e["t"]) for e in plan if e.get("sfx")]  # no pisar momentos importantes
            for p_i, c in zip(planos[:-1], cortes):
                tr = p_i.get("trans")
                if tr:   # la transición siempre suena (es parte de ella), centrada en el corte
                    if tr[2]: eventos_sfx.append((tr[2], max(0, c - tr[1] / 2 - 0.08), 0.32 if tr[2] != "impacto" else 0.4))
                    ocupado.append(c)
                elif c < cta_ini - 0.6 and rnd.random() < P["whoosh"] * 0.3 and all(abs(c - o) >= P["sfx_gap"] for o in ocupado):
                    eventos_sfx.append(("whoosh_corto", max(0, c - 0.15), 0.22)); ocupado.append(c)
            if a.cta:
                eventos_sfx.append(("riser", max(0, cta_ini - 1.6), 0.35))
                eventos_sfx.append(("cha_ching" if a.oferta else "ding", cta_ini, 0.55))
        for e in plan:
            if e.get("sfx"): eventos_sfx.append((e["sfx"], float(e["t"]), float(e.get("vol_sfx", 0.5))))
        for k, (nombre, t0, vol) in enumerate(eventos_sfx):
            f = os.path.join(SFX, nombre + ".wav")
            if not os.path.exists(f): continue
            inputs += ["-i", f]
            af.append(f"[{n_in}:a]aresample=48000,volume={vol},adelay={int(t0*1000)}:all=1[sfx{k}]"); mezcla.append(f"[sfx{k}]")
            n_in += 1
        if not mezcla:
            inputs += ["-f", "lavfi", "-t", f"{D:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]; mezcla.append(f"[{n_in}:a]")
        af.append("".join(mezcla) + f"amix=inputs={len(mezcla)}:normalize=0:duration=longest,atrim=0:{D:.3f},"
                  f"loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.84:level=false,afade=t=out:st={max(0, D-0.35):.2f}:d=0.35[aout]")
        fc = vf + ";" + ";".join(af)
        os.makedirs(os.path.dirname(os.path.abspath(a.salida)), exist_ok=True)
        sh(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
            *codificador("rapido" if a.rapido else "final"), "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-t", f"{D:.3f}",
            "-map_metadata", "-1", "-map_chapters", "-1", "-metadata:s:v", "encoder=", "-metadata:s:v", "handler_name=",
            "-metadata:s:a", "handler_name=", "-fflags", "+bitexact", "-flags:v", "+bitexact", "-flags:a", "+bitexact",
            "-movflags", "+faststart", a.salida])
        limpiar_metadatos(a.salida)
        print(f"ok: {a.salida}  ({D:.1f}s, {len(planos)} planos, {len(eventos_sfx)} efectos de sonido)")
        json.dump(dict(planos=[{k: v for k, v in p.items()} for p in planos], cortes=cortes, sfx=eventos_sfx,
                       musica=musica, gancho=a.gancho, cta=a.cta), open(os.path.splitext(a.salida)[0] + ".plan.json", "w"),
                  ensure_ascii=False, indent=1)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
