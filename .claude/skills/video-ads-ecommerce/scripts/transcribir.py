#!/usr/bin/env python3
"""Transcribe la voz de un video con Whisper (local, gratis) y detecta el idioma.

Salida: un JSON de segmentos [{"start": s, "end": s, "text": "..."}] que es el
formato común que usan subtitulos.py, generar_voz.py y mezclar_doblaje.py.
Si pasas --srt también escribe un .srt.

Uso: python3 transcribir.py video.mp4 salida.json [--modelo small] [--idioma en] [--srt salida.srt]
Requiere: pip install faster-whisper   (modelo 'small' ~500 MB la primera vez)
"""
import argparse, json, subprocess, sys
import numpy as np

def cargar_audio(path):
    # Se decodifica con ffmpeg para no depender de la versión de PyAV.
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def ts_srt(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada"); ap.add_argument("salida")
    ap.add_argument("--modelo", default=None, help="small (CPU) / medium (NVIDIA). Por defecto según el equipo")
    ap.add_argument("--idioma", default=None, help="forzar idioma (en, es...). Por defecto lo detecta")
    ap.add_argument("--srt")
    a = ap.parse_args()
    from faster_whisper import WhisperModel
    sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
    from comun import whisper_opciones
    dev, ct, mod = whisper_opciones()
    m = WhisperModel(a.modelo or mod, device=dev, compute_type=ct)
    segs, info = m.transcribe(cargar_audio(a.entrada), language=a.idioma, vad_filter=True)
    out = [{"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in segs]
    json.dump(out, open(a.salida, "w"), ensure_ascii=False, indent=1)
    print(f"idioma={info.language} (confianza {info.language_probability:.2f}), {len(out)} segmentos")
    if info.language_probability < 0.85 or len(out) <= 2:
        print("AVISO: poca voz o confianza baja; puede ser solo música/canción. Escúchalo antes de doblar.")
    for s in out: print(f"  [{s['start']:6.2f}-{s['end']:6.2f}] {s['text']}")
    if a.srt:
        with open(a.srt, "w") as f:
            for i, s in enumerate(out, 1):
                f.write(f"{i}\n{ts_srt(s['start'])} --> {ts_srt(s['end'])}\n{s['text']}\n\n")

if __name__ == "__main__":
    sys.exit(main())
