#!/usr/bin/env python3
"""Genera las escenas de un video 100% IA a partir de un storyboard (guion por escenas).

Flujo por escena: (1) imagen clave con IA — partiendo de la FOTO REAL del producto y/o del
personaje para mantener coherencia — y (2) animación de esa imagen (imagen → video).
Salida: tomas/e01.mp4, e02.mp4 ... en orden, listas para
  python editar_auto.py montaje --clips tomas/e01.mp4 tomas/e02.mp4 ... --en-orden --voz ... --subs ...

Proveedor: fal.ai (una sola clave para muchos modelos de imagen y video). La clave se toma de la
variable FAL_KEY (o la inyecta el entorno). Sin clave, o con --simular, NO gasta nada: muestra
los prompts finales y el costo estimado, y crea tomas de prueba gratis (foto animada con código)
para revisar ritmo y guion antes de pagar.

Storyboard (storyboard.json):
{
  "biblia": {                                # lo que se repite en TODAS las escenas (coherencia)
    "estilo": "video vertical de celular, hiperrealista, sin texto ni logos",
    "realismo": "celular",                    # por defecto: personas del común, lugares comunes (ver REALISMO)
    "personaje": "mujer colombiana de 32 años, contextura normal, cabello castaño recogido con moña, camiseta gris de algodón",
    "lugar": "cocina pequeña de un apartamento de conjunto en Bogotá, baldosa blanca, nevera con imanes, platos en el escurridor",
    "producto": "frasco blanco con etiqueta rosada de creatina para mujeres",
    "ref_producto": "fotos/producto.png",      # foto real (muy recomendado)
    "ref_personaje": "fotos/personaje.png"     # opcional: misma cara en todas las escenas
  },
  "escenas": [
    {"id": "e01", "dur": 3, "imagen": "primer plano de la mujer frustrada mirando un gabinete lleno de frascos",
     "movimiento": "slow push-in, ella suspira", "usa": ["personaje"]},
    {"id": "e02", "dur": 3, "imagen": "mano tomando el frasco del producto en la encimera", "movimiento": "handheld, gira el frasco hacia cámara",
     "usa": ["producto"]},
    {"id": "e03", "dur": 4, "fuente": "foto", "foto": "fotos/producto.png", "texto_precio": "2x1"}   # escena sin IA (gratis)
  ]
}
Uso: python escenas_ia.py storyboard.json carpeta_salida [--simular] [--modelo-video kling] [--modelo-imagen nano-banana]
     [--solo e02,e05] [--presupuesto 5]   (USD máximos; si el estimado lo supera, no genera)
"""
import argparse, base64, hashlib, json, mimetypes, os, shutil, subprocess, sys, time, urllib.request, urllib.error

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from comun import leer_config  # noqa: E402

# Modelos de fal.ai (los IDs y precios cambian: revisa fal.ai/models y actualiza aquí o en
# ~/.video-ads/config.json → "modelos_ia"). Precio = USD aproximado por imagen o por segundo de video.
MODELOS = {
    "imagen": {
        "nano-banana": dict(id="fal-ai/nano-banana/edit", precio=0.04, refs="image_urls"),
        "flux-kontext": dict(id="fal-ai/flux-pro/kontext", precio=0.04, refs="image_url"),
        "flux": dict(id="fal-ai/flux/dev", precio=0.025, refs=None),
    },
    "video": {
        "kling": dict(id="fal-ai/kling-video/v2.1/standard/image-to-video", precio=0.05, dur=["5", "10"]),
        "seedance": dict(id="fal-ai/bytedance/seedance/v1/lite/image-to-video", precio=0.04, dur=["5", "10"]),
        "hailuo": dict(id="fal-ai/minimax/hailuo-02/standard/image-to-video", precio=0.045, dur=["6", "10"]),
        "veo3": dict(id="fal-ai/veo3/fast/image-to-video", precio=0.25, dur=["8"]),
    },
}
CACHE = os.path.join(os.path.expanduser("~"), ".video-ads", "cache_ia")


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "image/png"
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()


def fal(model_id, body, key, espera=600):
    """Llama un modelo de fal.ai por su cola (submit → status → result)."""
    h = {"Authorization": f"Key {key}", "Content-Type": "application/json"}
    req = urllib.request.Request(f"https://queue.fal.run/{model_id}", data=json.dumps(body).encode(), headers=h)
    r = json.loads(urllib.request.urlopen(req, timeout=120).read())
    status_url, resp_url = r["status_url"], r["response_url"]
    t0 = time.time()
    while time.time() - t0 < espera:
        st = json.loads(urllib.request.urlopen(urllib.request.Request(status_url, headers=h), timeout=60).read())
        if st.get("status") == "COMPLETED": break
        if st.get("status") in ("FAILED", "ERROR"): raise RuntimeError(f"fal.ai falló: {st}")
        time.sleep(4)
    else:
        raise TimeoutError("fal.ai tardó demasiado")
    return json.loads(urllib.request.urlopen(urllib.request.Request(resp_url, headers=h), timeout=120).read())


def bajar(url, path):
    with urllib.request.urlopen(url, timeout=300) as r, open(path, "wb") as f: shutil.copyfileobj(r, f)


# Kit de realismo: personas comunes en lugares comunes, como grabado con un celular.
# Se aplica a todas las escenas salvo que la biblia diga "realismo": "libre".
REALISMO = ("foto/video casero tomado con un celular por una persona común, luz natural del lugar, "
            "persona del común con rasgos y cuerpo normales (no modelo), piel real con textura, poros y pequeñas imperfecciones, "
            "cabello natural un poco desordenado, ropa cotidiana, gestos naturales, "
            "lugar real y cotidiano con objetos del día a día y algo de desorden normal, "
            "encuadre imperfecto, leve grano, colores naturales sin filtros")
EVITAR = ("evitar: modelo, cara perfecta, piel de plástico, maquillaje de revista, dientes perfectos, pose de estudio, "
          "iluminación de estudio, look cinematográfico, render 3D, CGI, ilustración, simetría perfecta, fondo vacío, "
          "manos deformes, dedos de más, texto deformado, logos inventados")


def prompt_imagen(b, e):
    partes = [e["imagen"]]
    usa = e.get("usa", [])
    if "personaje" in usa and b.get("personaje"): partes.append(f"personaje: {b['personaje']}")
    if "producto" in usa and b.get("producto"): partes.append(f"producto exactamente como en la referencia: {b['producto']}")
    if b.get("lugar"): partes.append(f"lugar: {b['lugar']}")
    partes.append(b.get("estilo", "realista, vertical 9:16, sin texto"))
    if b.get("realismo", "celular") != "libre":
        partes.append(REALISMO); partes.append(EVITAR)
    partes.append("formato vertical 9:16, sin texto en pantalla, sin marcas de agua, manos y rostros naturales")
    return ". ".join(partes)


def prompt_video(b, e):
    real = (" Cámara en mano de celular con leve movimiento natural, movimientos humanos normales y sin cámara lenta,"
            " sin efectos ni look cinematográfico." if b.get("realismo", "celular") != "libre" else "")
    return (f"{e.get('movimiento', 'movimiento de cámara suave')}. {e['imagen']}. "
            f"{b.get('estilo', '')}.{real} Mantén el producto y la persona idénticos a la imagen, sin texto.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard"); ap.add_argument("salida")
    ap.add_argument("--simular", action="store_true", help="no gasta: muestra prompts y costo, crea tomas de prueba gratis")
    ap.add_argument("--modelo-imagen", default=None); ap.add_argument("--modelo-video", default=None)
    ap.add_argument("--solo", default="", help="ids a (re)generar, ej. e02,e05")
    ap.add_argument("--presupuesto", type=float, default=None, help="USD máximos para esta corrida")
    a = ap.parse_args()
    cfg = leer_config(); mods = cfg.get("modelos_ia", {})
    for k in ("imagen", "video"): MODELOS[k].update(mods.get(k, {}))
    mi = MODELOS["imagen"][a.modelo_imagen or cfg.get("modelo_imagen", "nano-banana")]
    mv = MODELOS["video"][a.modelo_video or cfg.get("modelo_video", "kling")]
    SB = json.load(open(a.storyboard, encoding="utf-8")); base = os.path.dirname(os.path.abspath(a.storyboard))
    ab = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    b = SB.get("biblia", {}); esc = SB["escenas"]
    solo = [x.strip() for x in a.solo.split(",") if x.strip()]
    dtomas = os.path.join(a.salida, "tomas"); dimg = os.path.join(a.salida, "imagenes"); os.makedirs(dtomas, exist_ok=True); os.makedirs(dimg, exist_ok=True); os.makedirs(CACHE, exist_ok=True)
    key = os.environ.get("FAL_KEY")
    simular = a.simular or not key
    # costo estimado
    costo = 0.0; plan = []
    for e in esc:
        if solo and e["id"] not in solo: continue
        if e.get("fuente") == "foto": plan.append((e, 0.0)); continue
        dur_v = int(min(mv["dur"], key=lambda d: abs(int(d) - e.get("dur", 4))))
        c = mi["precio"] + mv["precio"] * dur_v; costo += c; plan.append((e, c))
    print(f"Escenas: {len(plan)} · modelo imagen {mi['id']} · video {mv['id']} · costo estimado ≈ USD {costo:.2f} (aproximado)")
    if a.presupuesto is not None and costo > a.presupuesto and not simular:
        sys.exit(f"El costo estimado (USD {costo:.2f}) supera el presupuesto (USD {a.presupuesto}). Usa --solo o menos escenas.")
    if simular and not a.simular:
        print("No hay FAL_KEY: modo simulación (gratis). Para generar de verdad, guarda la clave de fal.ai como secreto del entorno.")
    resumen = []
    for e, c in plan:
        out = os.path.join(dtomas, f"{e['id']}.mp4")
        if e.get("fuente") == "foto" or simular:
            foto = ab(e.get("foto") or b.get("ref_producto") or "")
            if not os.path.exists(foto):
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=0x333333:s=1080x1920:d={e.get('dur', 3)}",
                                "-vf", "format=yuv420p", out], check=True)
            else:
                subprocess.run([sys.executable, os.path.join(AQUI, "animar_producto.py"), foto, out, "--dur", str(e.get("dur", 3)),
                                "--estilo", "zoom"] + (["--precio", e["texto_precio"]] if e.get("texto_precio") else []),
                               check=True, stdout=subprocess.DEVNULL)
            pi = prompt_imagen(b, e) if e.get("fuente") != "foto" else "(foto real animada con código)"
            resumen.append(dict(id=e["id"], modo="foto/simulación", costo=0, prompt_imagen=pi,
                                prompt_video=prompt_video(b, e) if e.get("fuente") != "foto" else ""))
            print(f"  {e['id']}: {'simulada' if simular and e.get('fuente') != 'foto' else 'foto animada'} → {out}")
            continue
        # 1) imagen clave (con referencias reales para coherencia)
        pi = prompt_imagen(b, e)
        refs = [ab(b[k]) for k, u in (("ref_producto", "producto"), ("ref_personaje", "personaje"))
                if b.get(k) and u in e.get("usa", []) and os.path.exists(ab(b[k]))]
        h = hashlib.sha1((mi["id"] + pi + "".join(refs)).encode()).hexdigest()
        img = os.path.join(CACHE, h + ".png")
        if not os.path.exists(img):
            body = {"prompt": pi}
            if refs and mi.get("refs") == "image_urls": body["image_urls"] = [data_uri(r) for r in refs]
            elif refs and mi.get("refs") == "image_url": body["image_url"] = data_uri(refs[0])
            if "flux/dev" in mi["id"]: body["image_size"] = "portrait_16_9"
            r = fal(mi["id"], body, key); bajar(r["images"][0]["url"], img)
        shutil.copy(img, os.path.join(dimg, f"{e['id']}.png"))
        # 2) animación imagen → video
        dur_v = min(mv["dur"], key=lambda d: abs(int(d) - e.get("dur", 4)))
        pv = prompt_video(b, e)
        hv = hashlib.sha1((mv["id"] + pv + h + dur_v).encode()).hexdigest()
        vid = os.path.join(CACHE, hv + ".mp4")
        if not os.path.exists(vid):
            body = {"prompt": pv, "image_url": data_uri(img), "duration": dur_v}
            if "veo3" in mv["id"]: body.update({"aspect_ratio": "9:16", "generate_audio": False}); body.pop("duration", None)
            r = fal(mv["id"], body, key); bajar(r["video"]["url"], vid)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-t", str(e.get("dur", 4)), "-an",
                        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
                        "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", out], check=True)
        resumen.append(dict(id=e["id"], modo="ia", costo=round(c, 3), prompt_imagen=pi, prompt_video=pv))
        print(f"  {e['id']}: IA lista (≈ USD {c:.2f}) → {out}")
    json.dump(resumen, open(os.path.join(a.salida, "escenas.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"ok: {len(resumen)} escenas en {dtomas} · detalle y prompts en {os.path.join(a.salida, 'escenas.json')}")
    print("Revisa las imágenes/tomas (manos, rostro, producto, texto deformado) antes de armar el video.")


if __name__ == "__main__":
    main()
