#!/usr/bin/env python3
"""Producción en lote: muchos anuncios de un solo pedido (meta: 30+ videos/día).

Un pedido (JSON) describe el producto, el material y las variantes. Por cada gancho sale
un video distinto (otro gancho hablado + otro texto + otro orden de clips + otra semilla),
con el mismo cuerpo y la misma oferta. La voz del cuerpo y del CTA se genera UNA vez y se
reutiliza desde la caché: solo se paga/genera el gancho de cada variante.

Pedido de ejemplo (pedido.json):
{
  "producto": "fajaLipo", "angulo": "posparto", "idioma": "es",
  "salida": "Resultados/fajaLipo",
  "modo": "montaje",                       # montaje (clips + voz) | ugc (videos crudos)
  "clips": ["Material crudo/faja"],         # carpetas o archivos (montaje)
  "crudos": ["Material crudo/ugc1.mp4"],    # (ugc) un video por archivo
  "musica": {"biblioteca": "Musica", "mood": "energetico", "temporada": "madres"},   # o "archivo": "x.mp3"
  "voz": {"motor": "auto", "voz": "ID_FISH_O_ELEVEN", "referencia": "voces/colombiana.wav",
          "velocidad": 1.1, "fonetica": "Lipo=Lipo"},
  "ganchos": [ {"voz": "¿Ya probaste de todo y la barriguita no se va?", "texto": "¿LA BARRIGUITA NO SE VA?"},
               {"voz": "Mamás, esto es lo que nadie les cuenta después del parto.", "texto": "MAMÁS, ESTO NADIE LO CUENTA"} ],
  "cuerpo": ["Esta faja moldea cintura y abdomen desde el primer día.", "Se ve invisible debajo de la ropa."],
  "cta_voz": "Pídela hoy y pagas cuando te llegue.",
  "cta": "PÍDELA HOY", "oferta": "PAGO CONTRAENTREGA · ENVÍO GRATIS",
  "plan": [{"t": 6, "dur": 1.5, "texto": "Invisible bajo la ropa", "estilo": "caja", "sfx": "pop"}],
  "preset": "dopamina", "colores": {"gancho": "E6007E", "cta": "FFD400", "resaltado": "FFD400"},
  "formatos": ["9x16"]                      # además puede sacar "4x5", "1x1"
}
Uso: python3 lote.py pedido.json [--paralelo 2] [--rapido]
Resultado: un video por gancho (y formato) + resumen.csv con nombres, duración y gancho.
"""
import argparse, csv, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable
sys.path.insert(0, AQUI)
from reformatear import reformatear  # noqa: E402

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"falló: {' '.join(cmd[:3])}...\n{r.stderr[-1500:]}{r.stdout[-800:]}")
    return r.stdout

def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout or 0)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pedido"); ap.add_argument("--paralelo", type=int, default=2)
    ap.add_argument("--rapido", action="store_true", help="codificación veloz (recomendado en lotes)")
    ap.add_argument("--solo", type=int, nargs="*", help="solo estas variantes (índices)")
    a = ap.parse_args()
    P = json.load(open(a.pedido)); base = os.path.dirname(os.path.abspath(a.pedido))
    ab = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    out = ab(P.get("salida", "Resultados")); os.makedirs(out, exist_ok=True)
    trabajo = os.path.join(out, "_trabajo"); os.makedirs(trabajo, exist_ok=True)
    prod, ang, idioma = P.get("producto", "producto"), P.get("angulo", "general"), P.get("idioma", "es")
    modo = P.get("modo", "montaje"); M = P.get("musica", {}); V = P.get("voz", {})
    from comun import leer_config
    cfg = leer_config(); C = {**cfg.get("colores", {}), **P.get("colores", {})}
    ganchos = P.get("ganchos") or [{"voz": "", "texto": ""}]
    idx = a.solo if a.solo is not None else range(len(ganchos))
    if modo == "ugc":
        crudos = [ab(c) for c in P.get("crudos", [])]
        trabajos = [(i, crudos[i % len(crudos)]) for i in idx] if crudos else []
    else:
        trabajos = [(i, None) for i in idx]
    plan = None
    if P.get("plan"):
        plan = os.path.join(trabajo, "plan.json"); json.dump(P["plan"], open(plan, "w"), ensure_ascii=False)
    t_ini = time.time()

    def args_voz():
        c = ["--motor", V.get("motor", "auto"), "--idioma", idioma, "--velocidad", str(V.get("velocidad", 1.1))]
        if V.get("voz"): c += ["--voz", V["voz"]]
        if V.get("referencia"): c += ["--referencia", ab(V["referencia"])]
        if V.get("fonetica"): c += ["--fonetica", V["fonetica"]]
        return c

    # 1) Todas las frases distintas del pedido se generan en UNA sola llamada (una carga del
    #    modelo / una ronda de API). Quedan en caché y cada variante solo las copia.
    if modo != "ugc":
        unicas = []
        for i in idx:
            g = ganchos[i]
            for f in ([g["voz"]] if g.get("voz") else []) + P.get("cuerpo", []) + ([P["cta_voz"]] if P.get("cta_voz") else []):
                if f not in unicas: unicas.append(f)
        if unicas:
            gj = os.path.join(trabajo, "todas_las_frases.json")
            json.dump([{"start": 0, "end": 0, "text": f} for f in unicas], open(gj, "w"), ensure_ascii=False)
            print(f"generando {len(unicas)} frases únicas de voz (una sola vez)...", flush=True)
            run([PY, os.path.join(AQUI, "generar_voz.py"), gj, os.path.join(trabajo, "voz_todas"), *args_voz()])

    def hacer(tr):
        i, crudo = tr
        g = ganchos[i]; nombre = f"{prod}_{ang}_{modo}_h{i+1:02d}"
        comun = ["--preset", P.get("preset", "dopamina"), "--semilla", str(i + 1),
                 "--gancho", g.get("texto", ""), "--cta", P.get("cta", ""), "--oferta", P.get("oferta", ""),
                 "--color-gancho", C.get("gancho", "E6007E"), "--color-cta", C.get("cta", "FFD400"),
                 "--resaltado", C.get("resaltado", "FFD400")]
        if plan: comun += ["--plan", plan]
        if M.get("archivo"): comun += ["--musica", ab(M["archivo"])]
        elif M.get("biblioteca"):
            comun += ["--biblioteca", ab(M["biblioteca"])]
            if M.get("mood"): comun += ["--mood", M["mood"]]
            if M.get("temporada"): comun += ["--temporada", M["temporada"]]
        if a.rapido: comun += ["--rapido"]
        tmp_out = os.path.join(trabajo, nombre + ".mp4")
        if modo == "ugc":
            run([PY, os.path.join(AQUI, "editar_auto.py"), "ugc", "--video", crudo, *comun, "-o", tmp_out])
        else:
            frases = ([g["voz"]] if g.get("voz") else []) + P.get("cuerpo", []) + ([P["cta_voz"]] if P.get("cta_voz") else [])
            voz_args = []
            if frases:
                gj = os.path.join(trabajo, f"guion_h{i+1:02d}.json")
                json.dump([{"start": 0, "end": 0, "text": f} for f in frases], open(gj, "w"), ensure_ascii=False)
                vdir = os.path.join(trabajo, f"voz_h{i+1:02d}"); vwav = os.path.join(vdir, "voz.wav")
                run([PY, os.path.join(AQUI, "generar_voz.py"), gj, vdir, *args_voz(), "--unir", vwav])
                voz_args = ["--voz", vwav, "--subs", os.path.splitext(vwav)[0] + ".json"]
            else:
                voz_args = ["--duracion", str(P.get("duracion", 20))]
            clips = [ab(c) for c in P.get("clips", [])]
            run([PY, os.path.join(AQUI, "editar_auto.py"), "montaje", "--clips", *clips, *voz_args, *comun, "-o", tmp_out])
        D = dur(tmp_out); finales = []
        for fmt in P.get("formatos", ["9x16"]):
            f = os.path.join(out, f"{nombre}_{int(round(D))}s_{fmt}_{idioma}.mp4")
            if fmt == "9x16":
                os.replace(tmp_out, f)
            else:
                reformatear(tmp_out if os.path.exists(tmp_out) else finales[0], f, fmt, "rapido" if a.rapido else "final")
            finales.append(f)
        print(f"[{time.time() - t_ini:5.0f}s] ok h{i+1:02d}: {os.path.basename(finales[0])}", flush=True)
        return dict(variante=i + 1, gancho=g.get("texto") or g.get("voz"), duracion=round(D, 1), archivos=" | ".join(map(os.path.basename, finales)))

    filas, errores = [], []
    with ThreadPoolExecutor(max_workers=max(1, a.paralelo)) as ex:
        for tr, fut in [(tr, ex.submit(hacer, tr)) for tr in trabajos]:
            try: filas.append(fut.result())
            except Exception as e: errores.append((tr[0] + 1, str(e))); print(f"ERROR variante {tr[0]+1}: {e}", flush=True)
    with open(os.path.join(out, "resumen.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["variante", "gancho", "duracion", "archivos"]); w.writeheader(); w.writerows(filas)
    print(f"\nlisto: {len(filas)} videos en {time.time() - t_ini:.0f}s → {out}  (errores: {len(errores)})")
    for v, e in errores: print(f"  variante {v}: {e.splitlines()[0]}")

if __name__ == "__main__":
    main()
