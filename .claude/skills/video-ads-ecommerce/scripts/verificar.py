#!/usr/bin/env python3
"""Revisión final antes de entregar un video (lo que el equipo debe mirar siempre).

Revisa: que se reproduce completo, resolución/duración/formato, volumen (LUFS),
metadatos y rastros del editor, y opcionalmente que la voz diga el guion
(transcribe con Whisper y compara frase por frase).

Uso: python3 verificar.py video.mp4 [--guion guion.json --idioma es]
"""
import argparse, difflib, json, os, re, subprocess, sys, unicodedata

def run(c): return subprocess.run(c, capture_output=True, text=True)

def norm(t):
    t = unicodedata.normalize("NFKD", t.lower()); t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", t).split()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video")
    ap.add_argument("--guion"); ap.add_argument("--idioma", default="es")
    a = ap.parse_args(); ok = True
    p = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", a.video]).stdout)
    v = next(s for s in p["streams"] if s["codec_type"] == "video")
    au = [s for s in p["streams"] if s["codec_type"] == "audio"]
    W, H, D = v["width"], v["height"], float(p["format"]["duration"])
    print(f"formato: {W}x{H} ({W/H:.3f}), {D:.1f}s, video {v['codec_name']}, audio {'sí' if au else 'NO'}")
    if W < 720: print("  aviso: menos de 720 px de ancho; Meta/TikTok recomiendan 1080 px")
    if run(["ffmpeg", "-v", "error", "-i", a.video, "-f", "null", "-"]).stderr.strip():
        print("  ERROR: el video tiene errores de decodificación"); ok = False
    else: print("reproducción: completa sin errores")
    if au:
        ln = run(["ffmpeg", "-i", a.video, "-af", "ebur128", "-f", "null", "-"]).stderr
        m = re.findall(r"I:\s+(-?[\d.]+) LUFS", ln)
        if m:
            lufs = float(m[-1]); print(f"volumen: {lufs:.1f} LUFS (ideal para redes: -14 ±2)")
            if abs(lufs + 14) > 3: print("  aviso: volumen fuera de rango; normaliza con loudnorm=I=-14")
    tags = {**p["format"].get("tags", {})}
    for s in p["streams"]: tags.update({f"{s['codec_type']}.{k}": x for k, x in s.get("tags", {}).items()})
    raros = {k: x for k, x in tags.items() if not re.search(r"major_brand|minor_version|compatible_brands|language|handler_name|vendor_id", k)}
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from comun import rastros as buscar_rastros
    rastros = ", ".join(buscar_rastros(a.video))
    if raros or rastros:
        print("metadatos: QUEDAN RASTROS ->", raros, rastros[:120]); ok = False
    else: print("metadatos: limpios")
    if a.guion:
        from transcribir import cargar_audio
        from comun import whisper_opciones
        from faster_whisper import WhisperModel
        dev, ct, mod = whisper_opciones()
        segs, _ = WhisperModel(mod, device=dev, compute_type=ct).transcribe(cargar_audio(a.video), language=a.idioma)
        oido = " ".join(s.text for s in segs)
        esperado = " ".join(s["text"] for s in json.load(open(a.guion)))
        r = difflib.SequenceMatcher(None, norm(esperado), norm(oido)).ratio()
        print(f"voz vs guion: {r*100:.0f}% de coincidencia")
        print("  se escucha:", oido.strip()[:400])
        if r < 0.8: print("  aviso: revisa palabras mal pronunciadas y regenera esas frases (generar_voz.py --rehacer)"); ok = False
    print("RESULTADO:", "LISTO PARA ENTREGAR" if ok else "REVISAR ANTES DE ENTREGAR")

if __name__ == "__main__":
    main()
