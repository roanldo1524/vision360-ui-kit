#!/usr/bin/env python3
"""Música original con IA (Suno, vía kie.ai): instrumental a la medida del video.

Cada pedido devuelve varias versiones (normalmente 2); se guardan todas para elegir.
Costo bajo (céntimos por pedido; verifica en kie.ai/pricing). Clave: KIE_API_KEY (o
~/.video-ads/credenciales.env; en la nube con secreto guardado: KIE_API_KEY=proxy-injected).

Derechos: kie.ai no publica una declaración clara de uso comercial de la música generada. Para
pauta pagada prefiere música con licencia comercial explícita; para orgánico en Instagram,
también puedes publicar el video sin música y elegir un audio de la biblioteca de Instagram.

Uso: python musica_ia.py salida_dir --estilo "lifestyle, chill house, acoustic guitar, warm, uplifting" \
        [--titulo "Mi Ciclo mañana"] [--dur 25] [--modelo V6] [--simular]
Salida: salida_dir/musica_1.mp3, musica_2.mp3 ... (+ musica.json con los datos)
"""
import argparse, json, os, shutil, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from escenas_ia import clave, kie_req, kie_saldo  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("salida"); ap.add_argument("--estilo", required=True)
    ap.add_argument("--titulo", default="Musica anuncio"); ap.add_argument("--dur", type=int, default=30)
    ap.add_argument("--modelo", default="V6", choices=["V6", "V6_MINI", "V6_WILD"])
    ap.add_argument("--evitar", default="vocals, singing, voice, lyrics, spoken words")
    ap.add_argument("--simular", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.salida, exist_ok=True)
    entrada = {"custom_mode": True, "instrumental": True, "model": a.modelo, "title": a.titulo[:80],
               "style": a.estilo[:1000], "negative_tags": a.evitar, "duration": max(10, min(360, a.dur + 5))}
    print("pedido Suno:", json.dumps(entrada, ensure_ascii=False))
    key = clave("KIE_API_KEY")
    if a.simular or not key:
        print("simulación: no se generó nada" + ("" if key else " (no hay KIE_API_KEY)")); return
    saldo = kie_saldo(key)
    if saldo is not None: print(f"saldo kie.ai: {saldo:.0f} créditos")
    tid = kie_req("POST", "https://api.kie.ai/api/v1/jobs/createTask", key,
                  {"model": "ai-music-api/generate", "input": entrada})["data"]["taskId"]
    t0, espera = time.time(), 3
    while time.time() - t0 < 600:
        d = kie_req("GET", f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={tid}", key)["data"]
        if d.get("state") == "success":
            res = d.get("response") or json.loads(d.get("resultJson") or "{}")
            pistas = res.get("data") or res.get("sunoData") or []
            out = []
            for i, p in enumerate(pistas, 1):
                url = p.get("audio_url") or p.get("audioUrl")
                if not url: continue
                f = os.path.join(a.salida, f"musica_{i}.mp3")
                with urllib.request.urlopen(url, timeout=300) as r, open(f, "wb") as fh: shutil.copyfileobj(r, fh)
                out.append(dict(archivo=f, duracion=p.get("duration"), id=p.get("id")))
                print(f"ok: {f} ({p.get('duration')} s)")
            json.dump(dict(pedido=entrada, pistas=out, creditos=d.get("creditsConsumed")),
                      open(os.path.join(a.salida, "musica.json"), "w"), ensure_ascii=False, indent=1)
            if not out: sys.exit(f"Suno terminó sin audio: {str(res)[:300]}")
            return
        if d.get("state") == "fail": sys.exit(f"Suno falló ({d.get('failCode')}): {d.get('failMsg')}")
        time.sleep(espera); espera = min(10, espera + 1)
    sys.exit(f"Suno tardó demasiado (tarea {tid})")


if __name__ == "__main__":
    main()
