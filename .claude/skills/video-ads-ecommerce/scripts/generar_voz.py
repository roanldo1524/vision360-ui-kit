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

--fonetica reemplaza palabras SOLO en el audio (no en subtítulos). Úsalo para marcas en
inglés que el motor pronuncia mal: "Clean Nutra=Clin Nutra;BCAA=be ce a a".
"""
import argparse, json, os, subprocess, sys, urllib.request, urllib.error

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
    pend = []
    for i, s in enumerate(segs):
        p = os.path.join(a.salida, f"seg_{i:03d}.wav")
        if os.path.exists(p) and os.path.getsize(p) > 0: continue
        t = s["text"]
        for x, y in reemplazos: t = t.replace(x, y)
        pend.append((t, p))
    if not pend: return print("nada que generar (ya existen)")
    if motor == "xtts":
        if not a.referencia: sys.exit("xtts necesita --referencia voz.wav (6-15 s de voz limpia)")
        ref = os.path.join(a.salida, "_ref.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.referencia, "-t", "15", "-ac", "1", "-ar", "22050", ref], check=True)
        return correr_xtts(pend, a.idioma, ref, a.velocidad)
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

if __name__ == "__main__":
    main()
