#!/usr/bin/env python3
"""Genera una voz por cada segmento de guion (un .wav por frase).

Entrada: JSON de segmentos [{"start": s, "end": s, "text": "frase en el idioma destino"}].
Salida:  <carpeta>/seg_000.wav, seg_001.wav ...  (lo que espera mezclar_doblaje.py)

Motores (--motor):
  fish        Fish Audio API. Necesita FISH_API_KEY (o el proxy del entorno la inyecta)
              y SALDO DE API: los créditos del plan gratis de la web NO sirven para la API.
              --voz = ID de un modelo de voz de Fish (búscalo con --buscar-voces).
  elevenlabs  ElevenLabs API. Necesita ELEVENLABS_API_KEY. --voz = voice_id.
  xtts        Local y gratis (Coqui XTTS-v2). Clona la voz de --referencia (6-15 s de voz
              limpia, ej. voz.wav de separar_voz.sh). Lento en CPU (~1-2x tiempo real).
              Instálalo una vez con setup_xtts.sh.
  auto        fish si hay clave con saldo, si no xtts.

Uso: python3 generar_voz.py guion.json carpeta_salida --motor auto --idioma es
        [--voz ID] [--referencia voz.wav] [--velocidad 1.1] [--fonetica "Clean Nutra=Clin Nutra"]
     python3 generar_voz.py --buscar-voces es mujer      (lista voces de Fish)
     --unir voz.wav  además une todas las frases (sin silencios, con pausas cortas) en un solo
                     audio y escribe voz.json con los tiempos reales de cada frase, listo para
                     editar_auto.py (--voz voz.wav --subs voz.json). Útil para videos nuevos.

Ahorro de créditos: cada frase se guarda en caché (~/.cache/video-ads/voces) según
motor+voz+texto; si otro video usa la misma frase (CTA, oferta, ganchos repetidos) no se
vuelve a pagar ni a generar.

--fonetica reemplaza palabras SOLO en el audio (no en subtítulos). Úsalo para marcas en
inglés que el motor pronuncia mal: "Clean Nutra=Clin Nutra;BCAA=be ce a a".
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, urllib.request, urllib.error

CACHE = os.path.expanduser(os.environ.get("VIDEO_ADS_CACHE", "~/.cache/video-ads/voces"))

def clave_cache(motor, voz, idioma, vel, texto, ref):
    h = hashlib.sha1()
    for x in (motor, voz or "", idioma, f"{vel:.2f}", texto):
        h.update(str(x).encode()); h.update(b"|")
    if ref and os.path.exists(ref):
        h.update(hashlib.sha1(open(ref, "rb").read()).digest())
    return os.path.join(CACHE, h.hexdigest() + ".wav")

def unir(segs, carpeta, salida, hueco=0.15, tempo=1.0):
    """Une seg_###.wav en un audio y devuelve la línea de tiempo real de cada frase."""
    import tempfile
    tmp = tempfile.mkdtemp(); partes = []; t = 0.0; tiempos = []
    sil = os.path.join(tmp, "sil.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=mono", "-t", str(hueco), sil], check=True)
    for i, s in enumerate(segs):
        o = os.path.join(tmp, f"{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(carpeta, f"seg_{i:03d}.wav"), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:"
                        f"start_threshold=-45dB,areverse,atempo={tempo},aresample=48000", "-ac", "1", o], check=True)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", o],
                                 capture_output=True, text=True).stdout)
        tiempos.append({"start": round(t, 2), "end": round(t + d, 2), "text": s["text"]})
        partes += [o, sil]; t += d + hueco
    lista = os.path.join(tmp, "l.txt"); open(lista, "w").write("".join(f"file '{p}'\n" for p in partes[:-1]))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-ar", "48000", salida], check=True)
    json.dump(tiempos, open(os.path.splitext(salida)[0] + ".json", "w"), ensure_ascii=False, indent=1)
    shutil.rmtree(tmp)
    print(f"voz unida: {salida} ({t - hueco:.1f}s) + tiempos en {os.path.splitext(salida)[0]}.json")

FISH = "https://api.fish.audio"

def fish_req(path, body=None, key=None, extra=None):
    h = {"Authorization": f"Bearer {key or os.environ.get('FISH_API_KEY','proxy')}"}
    if body is not None: h["Content-Type"] = "application/json"
    h.update(extra or {})
    req = urllib.request.Request(FISH + path, data=json.dumps(body).encode() if body is not None else None, headers=h)
    return urllib.request.urlopen(req, timeout=180).read()

def fish_saldo():
    try:
        d = json.loads(fish_req("/wallet/self/api-credit"))
        return float(d.get("credit", 0))
    except Exception:
        return None

def buscar_voces(idioma, texto):
    q = f"/model?page_size=15&language={idioma}&sort_by=score" + (f"&title={urllib.request.quote(texto)}" if texto else "")
    d = json.loads(fish_req(q))
    for m in d.get("items", []):
        print(m["_id"], "|", m["title"][:40], "|", m.get("languages"), "| usos:", m.get("task_count"))

def tts_fish(texto, path, voz, modelo):
    body = {"text": texto, "format": "wav", "normalize": True, "latency": "normal"}
    if voz: body["reference_id"] = voz
    data = fish_req("/v1/tts", body, extra={"model": modelo})
    open(path, "wb").write(data)  # se escribe solo si la llamada salió bien

def tts_eleven(texto, path, voz, idioma):
    key = os.environ.get("ELEVENLABS_API_KEY", "proxy")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=pcm_44100",
        data=json.dumps({"text": texto, "model_id": "eleven_multilingual_v2", "language_code": idioma}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"})
    pcm = urllib.request.urlopen(req, timeout=180).read()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "44100", "-ac", "1", "-i", "-", path],
                   input=pcm, check=True)

def correr_xtts(items, idioma, ref, velocidad):
    """XTTS vive en su propio entorno de Python (torch/torchaudio con versiones fijas)."""
    py = os.environ.get("XTTS_PYTHON", os.path.expanduser("~/.xtts-venv/bin/python"))
    if not os.path.exists(py):
        sys.exit(f"No encuentro XTTS en {py}. Corre primero: bash {os.path.dirname(__file__)}/setup_xtts.sh")
    code = r'''
import json,sys,os
from TTS.api import TTS
items,idioma,ref,vel=json.loads(sys.argv[1]),sys.argv[2],sys.argv[3],float(sys.argv[4])
t=TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")
for texto,path in items:
    if os.path.exists(path) and os.path.getsize(path)>0: continue
    t.tts_to_file(text=texto,speaker_wav=ref,language=idioma,file_path=path,speed=vel)
    print("ok",os.path.basename(path),flush=True)
'''
    env = dict(os.environ, COQUI_TOS_AGREED="1")
    subprocess.run([py, "-c", code, json.dumps(items), idioma, ref, str(velocidad)], env=env, check=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("guion", nargs="?"); ap.add_argument("salida", nargs="?")
    ap.add_argument("--motor", default="auto", choices=["auto", "fish", "elevenlabs", "xtts"])
    ap.add_argument("--idioma", default="es")
    ap.add_argument("--voz"); ap.add_argument("--referencia")
    ap.add_argument("--modelo-fish", default="s1")
    ap.add_argument("--velocidad", type=float, default=1.1)
    ap.add_argument("--fonetica", default="")
    ap.add_argument("--rehacer", default="", help="índices a regenerar, ej: 0,4,7")
    ap.add_argument("--buscar-voces", nargs="*")
    ap.add_argument("--unir", default=None, help="une las frases en un solo audio + json de tiempos")
    ap.add_argument("--sin-cache", action="store_true")
    a = ap.parse_args()
    if a.buscar_voces is not None:
        return buscar_voces(a.buscar_voces[0] if a.buscar_voces else "es", " ".join(a.buscar_voces[1:]))
    segs = json.load(open(a.guion)); os.makedirs(a.salida, exist_ok=True)
    reemplazos = [p.split("=", 1) for p in a.fonetica.split(";") if "=" in p]
    for i in [int(x) for x in a.rehacer.split(",") if x.strip()]:
        p = os.path.join(a.salida, f"seg_{i:03d}.wav")
        if os.path.exists(p): os.remove(p)
    motor = a.motor
    if motor == "auto":
        saldo = fish_saldo()
        motor = "fish" if saldo and saldo > 0 else "xtts"
        print(f"motor elegido: {motor} (saldo API Fish: {saldo})")
    pend = []; cache_de = {}
    os.makedirs(CACHE, exist_ok=True)
    for i, s in enumerate(segs):
        p = os.path.join(a.salida, f"seg_{i:03d}.wav")
        if os.path.exists(p) and os.path.getsize(p) > 0: continue
        t = s["text"]
        for x, y in reemplazos: t = t.replace(x, y)
        k = clave_cache(motor, a.voz, a.idioma, a.velocidad, t, a.referencia if motor == "xtts" else None)
        if not a.sin_cache and os.path.exists(k):
            shutil.copy(k, p); print("caché", os.path.basename(p)); continue
        cache_de[p] = k; pend.append((t, p))
    def guardar_cache():
        for p, k in cache_de.items():
            if os.path.exists(p) and os.path.getsize(p) > 0: shutil.copy(p, k)
    if not pend:
        print("nada que generar (todo en caché o ya existe)")
        if a.unir: unir(segs, a.salida, a.unir)
        return
    if motor == "xtts":
        if not a.referencia: sys.exit("xtts necesita --referencia voz.wav (6-15 s de voz limpia)")
        ref = os.path.join(a.salida, "_ref.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.referencia, "-t", "15", "-ac", "1", "-ar", "22050", ref], check=True)
        correr_xtts(pend, a.idioma, ref, a.velocidad); guardar_cache()
        if a.unir: unir(segs, a.salida, a.unir)
        return
    for t, p in pend:
        try:
            if motor == "fish": tts_fish(t, p, a.voz, a.modelo_fish)
            else: tts_eleven(t, p, a.voz, a.idioma)
            print("ok", os.path.basename(p), flush=True)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="ignore")[:300]
            if e.code == 402:
                sys.exit("Fish dice SIN SALDO DE API (402). Los créditos gratis de la web no sirven para la API: "
                         "recarga en fish.audio/app/developers o usa --motor xtts.")
            sys.exit(f"Error {e.code} del motor {motor}: {msg}")
    guardar_cache()
    if a.unir: unir(segs, a.salida, a.unir)

if __name__ == "__main__":
    main()
