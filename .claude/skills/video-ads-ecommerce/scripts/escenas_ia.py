#!/usr/bin/env python3
"""Genera las escenas de un video 100% IA a partir de un storyboard (guion por escenas).

Flujo por escena: (1) imagen clave con IA — partiendo de la FOTO REAL del producto y/o del
personaje para mantener coherencia — y (2) animación de esa imagen (imagen → video).
Salida: tomas/e01.mp4, e02.mp4 ... en orden, listas para
  python editar_auto.py montaje --clips tomas/e01.mp4 tomas/e02.mp4 ... --en-orden --voz ... --subs ...

Proveedores (una sola clave para muchos modelos):
  kie  (por defecto, más barato) — clave en KIE_API_KEY, en ~/.video-ads/credenciales.env
       (línea KIE_API_KEY=...) o inyectada por el entorno. Créditos: 1 crédito ≈ USD 0.005.
  fal  — clave en FAL_KEY.
Sin clave, o con --simular, NO gasta nada: muestra los prompts finales y el costo estimado, y
crea tomas de prueba gratis (foto animada con código) para revisar ritmo y guion antes de pagar.
Antes de generar de verdad, muestra el costo y el saldo; solo genera si cabe en --presupuesto.

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
    {"id": "e03", "dur": 4, "fuente": "foto", "foto": "fotos/producto.png", "texto_precio": "2x1"},  # escena sin IA (gratis)
    {"id": "e04", "dur": 3, "imagen": "...", "usa": ["producto"], "refs": ["fotos/caja_abierta.jpg"]}  # foto propia de esta escena
  ]
}
Uso: python escenas_ia.py storyboard.json carpeta_salida [--simular] [--proveedor kie|fal]
     [--modelo-video seedance|kling3|veo3-fast|hailuo] [--modelo-imagen nano-banana|seedream]
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
# kie.ai (créditos; 1 crédito ≈ USD 0.005). Precios "desde", según kie.ai/pricing (nov 2026): verifícalos.
KIE = {
    "imagen": {
        "nano-banana": dict(model="google/nano-banana-edit", creditos=4, refs=True),
        "seedream": dict(model="seedream/4.5-edit", creditos=6.5, refs=True),
        "flux-kontext": dict(model="flux1-kontext", creditos=5, refs=False),   # texto→imagen sin referencias
    },
    "video": {
        # Seedance 2 a 720p cobró ~40 créditos/s en uso real (nov 2026), no el "desde" de la tabla
        "seedance": dict(model="bytedance/seedance-2", creditos_s=40, dur=(4, 15)),
        "kling3": dict(model="kling-3.0-omni/image-to-video", creditos_s=30, dur=(3, 15)),  # estimado prudente, sin confirmar
        "hailuo": dict(model="hailuo/02-image-to-video-standard", creditos_video=24, dur=(6, 10)),
        "veo3-fast": dict(model="veo-3-1", creditos_video=60, dur=(4, 8)),
    },
}
CACHE = os.path.join(os.path.expanduser("~"), ".video-ads", "cache_ia")


def clave(nombre):
    """Clave de API: variable de entorno o ~/.video-ads/credenciales.env (NOMBRE=valor)."""
    if os.environ.get(nombre): return os.environ[nombre]
    f = os.path.join(os.path.expanduser("~"), ".video-ads", "credenciales.env")
    if os.path.exists(f):
        for ln in open(f, encoding="utf-8"):
            if ln.strip().startswith(nombre + "="): return ln.split("=", 1)[1].strip().strip('"')
    return None


def kie_req(metodo, url, key, body=None):
    h = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers=h, method=metodo)
    r = json.loads(urllib.request.urlopen(req, timeout=120).read())
    if r.get("code") not in (200, None) and not r.get("success"):
        msg = {401: "clave inválida", 402: "sin créditos suficientes", 422: "datos inválidos", 429: "demasiadas solicitudes"}.get(r.get("code"), "")
        raise RuntimeError(f"kie.ai respondió {r.get('code')} {msg}: {r.get('msg')}")
    return r


def kie_saldo(key):
    try: return float(kie_req("GET", "https://api.kie.ai/api/v1/chat/credit", key)["data"])
    except Exception as e: print("aviso: no pude leer el saldo de kie.ai:", e); return None


def kie_subir(path, key):
    """Sube una imagen local a kie.ai (gratis, dura 24 h) y devuelve su URL; se reutiliza ~20 h."""
    h = hashlib.sha1(open(path, "rb").read()).hexdigest()
    idx = os.path.join(CACHE, "subidas_kie.json")
    mem = json.load(open(idx)) if os.path.exists(idx) else {}
    if h in mem and time.time() - mem[h]["t"] < 20 * 3600: return mem[h]["url"]
    r = kie_req("POST", "https://kieai.redpandaai.co/api/file-base64-upload", key,
                {"base64Data": data_uri(path), "uploadPath": "video-ads", "fileName": os.path.basename(path)})
    url = r["data"]["downloadUrl"]; mem[h] = {"url": url, "t": time.time()}
    json.dump(mem, open(idx, "w")); return url


def kie_tarea(model, entrada, key, espera=900):
    """Crea la tarea, espera el resultado y devuelve la primera URL generada."""
    tid = kie_req("POST", "https://api.kie.ai/api/v1/jobs/createTask", key, {"model": model, "input": entrada})["data"]["taskId"]
    t0 = time.time()
    while time.time() - t0 < espera:
        d = kie_req("GET", f"https://api.kie.ai/api/v1/jobs/recordInfo?taskId={tid}", key)["data"]
        if d.get("state") == "success":
            res = d.get("response") or json.loads(d.get("resultJson") or "{}")
            urls = res.get("resultUrls") or res.get("result_urls") or (res.get("data") or {}).get("result_urls") or []
            if not urls: raise RuntimeError(f"kie.ai terminó sin URL de resultado: {str(res)[:300]}")
            return urls[0], d.get("creditsConsumed")
        if d.get("state") == "fail": raise RuntimeError(f"kie.ai falló ({d.get('failCode')}): {d.get('failMsg')}")
        time.sleep(5)
    raise TimeoutError(f"kie.ai tardó demasiado (tarea {tid})")


def kie_entrada_imagen(mi, prompt, ref_urls):
    m = mi["model"]
    if m == "google/nano-banana-edit":
        return {"prompt": prompt, "image_urls": ref_urls, "aspect_ratio": "9:16", "output_format": "png"}
    if m == "seedream/4.5-edit":
        return {"prompt": prompt, "image_urls": ref_urls, "aspect_ratio": "9:16", "quality": "basic"}
    return {"prompt": prompt, "model": "flux-kontext-pro", "aspect_ratio": "9:16", "output_format": "png"}


def kie_entrada_video(mv, prompt, img_url, dur):
    m = mv["model"]; lo, hi = mv["dur"]; d = int(max(lo, min(hi, round(dur))))
    if m == "bytedance/seedance-2":
        return {"prompt": prompt, "first_frame_url": img_url, "resolution": "720p", "aspect_ratio": "9:16",
                "duration": d, "generate_audio": False}
    if m.startswith("kling-3.0-omni"):
        return {"prompt": prompt, "image_urls": [img_url], "duration": d, "resolution": "720p", "audio": False}
    if m.startswith("hailuo"):
        return {"prompt": prompt, "image_url": img_url, "duration": "6" if d <= 6 else "10", "resolution": "768P"}
    if m == "veo-3-1":
        return {"model": "veo3_fast", "prompt": prompt, "image_urls": [img_url], "aspect_ratio": "9:16",
                "duration": min((4, 6, 8), key=lambda x: abs(x - d)), "generation_type": "FIRST_AND_LAST_FRAMES_2_VIDEO"}
    raise ValueError(m)


def kie_creditos(mi, mv, dur):
    lo, hi = mv["dur"]; d = max(lo, min(hi, round(dur)))
    return mi["creditos"] + (mv["creditos_s"] * d if "creditos_s" in mv else mv["creditos_video"])


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
# "cine": look cinematográfico (lente, luz, profundidad de campo) pero con gente del común y lugares reales.
CINE = ("fotograma de película hiperrealista, cámara de cine con lente de 35mm, poca profundidad de campo, luz natural suave "
        "y cálida, color cinematográfico sutil, persona del común con rasgos y cuerpo normales (no modelo), piel real con "
        "textura y pequeñas imperfecciones, gestos naturales, lugar real y cotidiano con detalles de la vida diaria")
EVITAR = ("evitar: modelo, cara perfecta, piel de plástico, maquillaje de revista, dientes perfectos, pose de estudio, "
          "iluminación de estudio, look cinematográfico, render 3D, CGI, ilustración, simetría perfecta, fondo vacío, "
          "manos deformes, dedos de más, texto deformado, logos inventados")


def refs_escena(b, e, ab):
    """Fotos reales de referencia de la escena: las propias ("refs") o las de la biblia según "usa"."""
    if e.get("refs"):
        return [ab(r) for r in e["refs"] if os.path.exists(ab(r))]
    return [ab(b[k]) for k, u in (("ref_producto", "producto"), ("ref_personaje", "personaje"))
            if b.get(k) and u in e.get("usa", []) and os.path.exists(ab(b[k]))]


def prompt_imagen(b, e):
    partes = [e["imagen"]]
    usa = e.get("usa", [])
    if "personaje" in usa and b.get("personaje"): partes.append(f"personaje: {b['personaje']}")
    if "producto" in usa and b.get("producto"):
        partes.append(f"producto exactamente como en la referencia: {b['producto']}. Respeta los colores EXACTOS del "
                      "empaque de la referencia (no los cambies por la luz ni por el color de la escena), la forma, el logo y la tipografía")
    if "personaje" not in usa:
        partes.append("sin personas, sin manos ni partes del cuerpo en la imagen")
    if b.get("lugar"): partes.append(f"lugar: {b['lugar']}")
    partes.append(b.get("estilo", "realista, vertical 9:16, sin texto"))
    if b.get("realismo", "celular") == "cine":
        partes.append(CINE); partes.append(EVITAR)
    elif b.get("realismo", "celular") != "libre":
        partes.append(REALISMO); partes.append(EVITAR)
    partes.append("formato vertical 9:16, sin texto en pantalla, sin marcas de agua, manos y rostros naturales")
    return ". ".join(partes)


def prompt_video(b, e):
    modo = b.get("realismo", "celular")
    real = {"celular": " Cámara en mano de celular con leve movimiento natural, movimientos humanos normales y sin cámara lenta,"
                       " sin efectos ni look cinematográfico.",
            "cine": " Movimiento de cámara cinematográfico suave y estable, movimientos humanos naturales, sin efectos artificiales."}.get(modo, "")
    return (f"{e.get('movimiento', 'movimiento de cámara suave')}. {e['imagen']}. "
            f"{b.get('estilo', '')}.{real} Mantén el producto y la persona idénticos a la imagen, sin texto.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard"); ap.add_argument("salida")
    ap.add_argument("--simular", action="store_true", help="no gasta: muestra prompts y costo, crea tomas de prueba gratis")
    ap.add_argument("--modelo-imagen", default=None); ap.add_argument("--modelo-video", default=None)
    ap.add_argument("--proveedor", default=None, choices=["kie", "fal"])
    ap.add_argument("--solo", default="", help="ids a (re)generar, ej. e02,e05")
    ap.add_argument("--presupuesto", type=float, default=None, help="USD máximos para esta corrida")
    a = ap.parse_args()
    cfg = leer_config(); mods = cfg.get("modelos_ia", {})
    for k in ("imagen", "video"): MODELOS[k].update(mods.get(k, {}))
    prov = a.proveedor or cfg.get("proveedor_ia") or ("fal" if clave("FAL_KEY") and not clave("KIE_API_KEY") else "kie")
    if prov == "kie":
        mi = KIE["imagen"][a.modelo_imagen or cfg.get("modelo_imagen", "nano-banana")]
        mv = KIE["video"][a.modelo_video or cfg.get("modelo_video", "seedance")]
        mi = dict(mi, id=mi["model"]); mv = dict(mv, id=mv["model"])
    else:
        mi = MODELOS["imagen"][a.modelo_imagen or cfg.get("modelo_imagen", "nano-banana")]
        mv = MODELOS["video"][a.modelo_video or cfg.get("modelo_video", "kling")]
    SB = json.load(open(a.storyboard, encoding="utf-8")); base = os.path.dirname(os.path.abspath(a.storyboard))
    ab = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
    b = SB.get("biblia", {}); esc = SB["escenas"]
    solo = [x.strip() for x in a.solo.split(",") if x.strip()]
    dtomas = os.path.join(a.salida, "tomas"); dimg = os.path.join(a.salida, "imagenes"); os.makedirs(dtomas, exist_ok=True); os.makedirs(dimg, exist_ok=True); os.makedirs(CACHE, exist_ok=True)
    key = clave("KIE_API_KEY" if prov == "kie" else "FAL_KEY") or os.environ.get("VIDEO_ADS_CLAVE_PROXY")
    simular = a.simular or not key
    # costo estimado
    costo = 0.0; plan = []
    for e in esc:
        if solo and e["id"] not in solo: continue
        if e.get("fuente") == "foto": plan.append((e, 0.0)); continue
        if prov == "kie":
            c = kie_creditos(mi, mv, e.get("dur", 4)) * 0.005
        else:
            dur_v = int(min(mv["dur"], key=lambda d: abs(int(d) - e.get("dur", 4))))
            c = mi["precio"] + mv["precio"] * dur_v
        costo += c; plan.append((e, c))
    print(f"Proveedor {prov} · escenas: {len(plan)} · imagen {mi['id']} · video {mv['id']} · costo estimado ≈ USD {costo:.2f}"
          + (f" (≈ {costo / 0.005:.0f} créditos)" if prov == "kie" else "") + " (aproximado)")
    if prov == "kie" and key and not a.simular:
        saldo = kie_saldo(key)
        if saldo is not None:
            print(f"Saldo kie.ai: {saldo:.0f} créditos (≈ USD {saldo * 0.005:.2f})")
            if saldo < costo / 0.005: sys.exit("No alcanza el saldo para esta corrida. Recarga en kie.ai o usa --solo con menos escenas.")
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
        if prov == "kie":
            pi = prompt_imagen(b, e); pv = prompt_video(b, e)
            refs = refs_escena(b, e, ab)
            h = hashlib.sha1(("kie" + mi["id"] + pi + "".join(refs)).encode()).hexdigest()
            img = os.path.join(CACHE, h + ".png")
            if not os.path.exists(img):
                if refs and mi.get("refs"):
                    url_img, _ = kie_tarea(mi["id"], kie_entrada_imagen(mi, pi, [kie_subir(r, key) for r in refs]), key)
                else:
                    sin_ref = KIE["imagen"]["flux-kontext"]
                    url_img, _ = kie_tarea(sin_ref["model"], kie_entrada_imagen(sin_ref, pi, []), key)
                bajar(url_img, img)
            shutil.copy(img, os.path.join(dimg, f"{e['id']}.png"))
            hv = hashlib.sha1(("kie" + mv["id"] + pv + h + str(e.get("dur", 4))).encode()).hexdigest()
            vid = os.path.join(CACHE, hv + ".mp4")
            gastado = None
            if not os.path.exists(vid):
                url_vid, gastado = kie_tarea(mv["id"], kie_entrada_video(mv, pv, kie_subir(img, key), e.get("dur", 4)), key)
                bajar(url_vid, vid)
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-t", str(e.get("dur", 4)), "-an",
                            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p",
                            "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", out], check=True)
            resumen.append(dict(id=e["id"], modo="ia-kie", costo=round(c, 3), creditos_video=gastado, prompt_imagen=pi, prompt_video=pv))
            real = f" · video cobró {gastado:.0f} créditos (≈ USD {gastado * 0.005:.2f})" if gastado else ""
            print(f"  {e['id']}: IA lista (estimado ≈ USD {c:.2f}{real}) → {out}")
            continue
        # 1) imagen clave (con referencias reales para coherencia) — fal.ai
        pi = prompt_imagen(b, e)
        refs = refs_escena(b, e, ab)
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
