#!/usr/bin/env python3
"""Toma de apoyo animada a partir de UNA foto del producto, hecha con código (cero créditos).

El producto entra con rebote, flota, gira un poco y le pasa un brillo, sobre un fondo de
degradado animado con los colores de la marca (con luz que se mueve y partículas). Opcional:
título arriba y precio/oferta abajo. Sirve como plano de "revelación", de oferta o de cierre.

Mejor resultado con PNG sin fondo (transparente). Si la foto tiene fondo:
  --quitar-fondo  usa rembg si está instalado (pip install rembg onnxruntime)
  si no, la pone como tarjeta con esquinas redondeadas y sombra.

Uso: python3 animar_producto.py foto.png salida.mp4 [--dur 3.5] [--colores 0B1F3A,E6007E]
        [--titulo "NUEVA FAJA LIPO"] [--precio "2x1 HOY"] [--estilo flotar|girar|zoom] [--formato 9x16|4x5|1x1]
"""
import argparse, math, os, subprocess
import numpy as np
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import codificador  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(AQUI, "..", "assets", "fonts", "Anton-Regular.ttf")
FPS = 30

def hexrgb(h): h = h.strip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def quitar_fondo(img):
    try:
        from rembg import remove
        return remove(img)
    except Exception:
        return None

def tarjeta(img, r=40):
    img = img.convert("RGBA"); m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], r, fill=255)
    img.putalpha(m); return img

def ease_out_back(x, s=1.7):
    x = min(max(x, 0), 1) - 1; return 1 + (s + 1) * x ** 3 + s * x ** 2

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("foto"); ap.add_argument("salida")
    ap.add_argument("--dur", type=float, default=3.5)
    ap.add_argument("--colores", default="0B1F3A,E6007E")
    ap.add_argument("--titulo", default=""); ap.add_argument("--precio", default="")
    ap.add_argument("--estilo", default="flotar", choices=["flotar", "girar", "zoom"])
    ap.add_argument("--formato", default="9x16", choices=["9x16", "4x5", "1x1"])
    ap.add_argument("--quitar-fondo", action="store_true")
    a = ap.parse_args()
    W, H = {"9x16": (1080, 1920), "4x5": (1080, 1350), "1x1": (1080, 1080)}[a.formato]
    c1, c2 = [np.array(hexrgb(c), float) for c in a.colores.split(",")[:2]]
    prod = Image.open(a.foto)
    if prod.mode != "RGBA" or prod.getchannel("A").getextrema()[0] == 255:
        sinf = quitar_fondo(prod.convert("RGB")) if a.quitar_fondo else None
        prod = sinf if sinf is not None else tarjeta(prod.convert("RGB"))
    else:
        bbox = prod.getchannel("A").getbbox(); prod = prod.crop(bbox) if bbox else prod
    esc = min(W * 0.72 / prod.width, H * 0.5 / prod.height); prod = prod.resize((int(prod.width * esc), int(prod.height * esc)), Image.LANCZOS)
    sombra = Image.new("RGBA", prod.size, (0, 0, 0, 0)); sombra.putalpha(prod.getchannel("A").point(lambda v: int(v * 0.55)))
    sombra = sombra.filter(ImageFilter.GaussianBlur(28))
    q = 4  # el fondo es suave: se calcula a 1/4 de resolución y se amplía (mucho más rápido)
    yy, xx = (np.mgrid[0:H // q, 0:W // q].astype(np.float32) * q)
    g = ((xx / W) * 0.4 + (yy / H) * 0.6)[..., None]
    base_bg = c1 * (1 - g) + c2 * g * 0.85
    rng = np.random.default_rng(3); parts = rng.uniform(0, 1, (40, 4))
    def f_tit(sz): return ImageFont.truetype(FUENTE, sz)
    n = int(a.dur * FPS)
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           *codificador("final"), "-fflags", "+bitexact", "-flags:v", "+bitexact", "-movflags", "+faststart", a.salida]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(n):
        t = k / FPS; u = k / max(1, n - 1)
        # fondo: degradado diagonal + luz que se mueve
        lx, ly = W * (0.3 + 0.4 * math.sin(t * 0.9)), H * (0.35 + 0.1 * math.cos(t * 0.7))
        luz = np.exp(-(((xx - lx) ** 2 + (yy - ly) ** 2) / (2 * (W * 0.35) ** 2)))[..., None]
        bg = np.clip(base_bg + luz * 70, 0, 255)
        frame = Image.fromarray(bg.astype(np.uint8), "RGB").resize((W, H), Image.BILINEAR).convert("RGBA")
        d = ImageDraw.Draw(frame)
        for (px, py, ps, pv) in parts:  # partículas que suben
            x = px * W; y = (py * H - t * (60 + 120 * pv)) % H; r = 2 + ps * 5
            d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, int(60 + 120 * pv)))
        # producto
        ent = ease_out_back(t / 0.55)
        if a.estilo == "zoom": s = 0.75 + 0.3 * ent + 0.06 * u
        else: s = 0.6 + 0.4 * ent
        ang = (math.sin(t * 2.2) * 4) if a.estilo == "flotar" else (math.sin(t * 1.6) * 12 if a.estilo == "girar" else 0)
        dy = math.sin(t * 2.6) * 18 if a.estilo != "zoom" else 0
        pi = prod.resize((max(1, int(prod.width * s)), max(1, int(prod.height * s))), Image.BICUBIC).rotate(ang, Image.BICUBIC, expand=True)
        cx, cy = W // 2, int(H * 0.5 + dy)
        sh = sombra.resize(pi.size).rotate(0)
        frame.alpha_composite(sh, (cx - pi.width // 2 + 18, cy - pi.height // 2 + 40))
        frame.alpha_composite(pi, (cx - pi.width // 2, cy - pi.height // 2))
        # brillo que cruza el producto (una vez, a mitad)
        bt = (t - a.dur * 0.45) / 0.5
        if 0 <= bt <= 1:
            band = Image.new("L", pi.size, 0); bd = ImageDraw.Draw(band)
            x0 = int(-pi.width * 0.3 + bt * pi.width * 1.6)
            bd.polygon([(x0, 0), (x0 + 60, 0), (x0 + 60 - pi.height // 3, pi.height), (x0 - pi.height // 3, pi.height)], fill=120)
            band = Image.fromarray(np.minimum(np.array(band), np.array(pi.getchannel("A"))))
            blanco = Image.new("RGBA", pi.size, (255, 255, 255, 0)); blanco.putalpha(band.filter(ImageFilter.GaussianBlur(8)))
            frame.alpha_composite(blanco, (cx - pi.width // 2, cy - pi.height // 2))
        # textos
        if a.titulo and t > 0.25:
            f = f_tit(int(W * 0.1)); al = min(1, (t - 0.25) / 0.25)
            tw = d.textlength(a.titulo.upper(), font=f); y0 = int(H * 0.12 - 40 * (1 - al))
            d = ImageDraw.Draw(frame)
            d.text(((W - tw) / 2, y0), a.titulo.upper(), font=f, fill=(255, 255, 255, int(255 * al)), stroke_width=4, stroke_fill=(0, 0, 0, int(160 * al)))
        if a.precio and t > 0.7:
            f = f_tit(int(W * 0.13)); sp = ease_out_back((t - 0.7) / 0.4)
            txt = a.precio.upper(); tw = d.textlength(txt, font=f)
            caja = [W / 2 - tw / 2 - 40, H * 0.8 - 20, W / 2 + tw / 2 + 40, H * 0.8 + f.size + 30]
            cxp, cyp = (caja[0] + caja[2]) / 2, (caja[1] + caja[3]) / 2
            caja = [cxp + (caja[0] - cxp) * sp, cyp + (caja[1] - cyp) * sp, cxp + (caja[2] - cxp) * sp, cyp + (caja[3] - cyp) * sp]
            d = ImageDraw.Draw(frame); d.rounded_rectangle(caja, 30, fill=(255, 212, 0, 255))
            if sp > 0.8: d.text((W / 2 - tw / 2, H * 0.8), txt, font=f, fill=(17, 17, 17, 255))
        p.stdin.write(frame.convert("RGB").tobytes())
    p.stdin.close(); p.wait()
    from comun import limpiar_metadatos
    limpiar_metadatos(a.salida)
    print(f"ok: {a.salida} ({a.dur}s, {W}x{H})")

if __name__ == "__main__":
    main()
