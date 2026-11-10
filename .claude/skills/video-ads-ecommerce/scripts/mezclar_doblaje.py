#!/usr/bin/env python3
"""Pone las voces nuevas sobre el video, encima de la música/ambiente original.

- Recorta silencios de cada frase generada.
- Coloca las frases en orden, cada una cerca de su tiempo original, SIN que se monten.
- Si no caben, acelera TODAS por igual lo mínimo necesario (avisa si pasa de 1.25x:
  en ese caso acorta el guion; más rápido suena a robot).
- No recodifica la imagen (queda idéntica) y limpia metadatos.

Uso: python3 mezclar_doblaje.py video.mp4 guion.json carpeta_voces fondo.wav salida.mp4
        [--vol-fondo 0.9] [--adelanto 1.0]
fondo.wav = pista sin voz de separar_voz.sh. Si el video no tenía voz, usa su audio tal cual.
"""
import argparse, json, os, subprocess, tempfile

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)

def main():
    ap = argparse.ArgumentParser()
    for x in ["video", "guion", "voces", "fondo", "salida"]: ap.add_argument(x)
    ap.add_argument("--vol-fondo", type=float, default=0.9)
    ap.add_argument("--adelanto", type=float, default=1.0, help="segundos que una frase puede empezar antes de su tiempo")
    ap.add_argument("--hueco", type=float, default=0.12)
    a = ap.parse_args()
    segs = json.load(open(a.guion)); VD = dur(a.video); tmp = tempfile.mkdtemp()
    ps = []
    for i in range(len(segs)):
        o = os.path.join(tmp, f"{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(a.voces, f"seg_{i:03d}.wav"), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=44100", o], check=True)
        ps.append(o)
    ds = [dur(p) for p in ps]
    tempo = 1.0
    while True:
        t = 0; starts = []
        for i, (s, d) in enumerate(zip(segs, ds)):
            st = max(s["start"] - (a.adelanto if i else 0), t); starts.append(st); t = st + d / tempo + a.hueco
        if t - a.hueco <= VD - 0.15 or tempo >= 1.6: break
        tempo += 0.02
    print(f"velocidad de voz: {tempo:.2f}x, la voz termina en {t - a.hueco:.2f}s de {VD:.2f}s")
    if tempo > 1.25: print("AVISO: más de 1.25x suena acelerado. Acorta el guion y vuelve a generar esas frases.")
    for i, (s, st, d) in enumerate(zip(segs, starts, ds)):
        print(f"  frase {i}: entra {st:5.2f}s (original {s['start']:5.2f}s), dura {d / tempo:4.2f}s")
    inp = ["-i", a.video, "-i", a.fondo]; fl = [f"[1:a]volume={a.vol_fondo}[bg]"]; mix = ["[bg]"]
    for i, (p, st) in enumerate(zip(ps, starts)):
        inp += ["-i", p]
        fl.append(f"[{i+2}:a]atempo={tempo:.3f},aformat=channel_layouts=stereo,adelay={int(st*1000)}:all=1[s{i}]")
        mix.append(f"[s{i}]")
    fl.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    vcodec = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name",
                             "-of", "csv=p=0", a.video], capture_output=True, text=True).stdout.strip()
    bsf = ["-bsf:v", "filter_units=remove_types=6"] if vcodec == "h264" else []
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", ";".join(fl), "-map", "0:v", "-map", "[a]",
                    "-c:v", "copy", *bsf, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", str(VD),
                    "-map_metadata", "-1", "-map_chapters", "-1", "-metadata:s:v", "encoder=",
                    "-metadata:s:v", "handler_name=", "-metadata:s:a", "handler_name=",
                    "-fflags", "+bitexact", "-flags:v", "+bitexact", "-flags:a", "+bitexact",
                    "-movflags", "+faststart", a.salida], check=True)
    print("ok:", a.salida)

if __name__ == "__main__":
    main()
