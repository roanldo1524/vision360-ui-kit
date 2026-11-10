#!/usr/bin/env python3
"""Genera con código un paquete de efectos de sonido para anuncios (cero créditos, sin
derechos de autor: son sintetizados aquí mismo).

Crea en la carpeta destino: whoosh, whoosh_corto, swoosh_reverso, pop, click, ding,
exito, impacto, boom, riser, cha_ching, notificacion, error, sparkle, glitch, tick, camara.
Uso: python3 generar_sfx.py [carpeta]   (por defecto ../assets/sfx)
"""
import os, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.2, curva=3.0):
    t = np.linspace(0, 1, n); A = max(1, int(a * SR))
    e = np.ones(n); e[:A] = np.linspace(0, 1, A)
    return e * (1 - t) ** curva if r else e

def ruido_filtrado(n, f0, f1, q=0.15):
    """Ruido blanco pasado por un pasabanda que barre de f0 a f1 (efecto viento/whoosh)."""
    x = rng.standard_normal(n); out = np.zeros(n); y1 = y2 = 0.0
    fs = np.geomspace(f0, f1, n)
    for i in range(n):  # resonador simple de 2 polos
        w = 2 * np.pi * fs[i] / SR; r = 1 - q * w
        y = x[i] * (1 - r) + 2 * r * np.cos(w) * y1 - r * r * y2
        out[i] = y; y2, y1 = y1, y
    return out / (np.abs(out).max() + 1e-9)

def tono(f, d, tipo="sin"):
    t = np.arange(int(d * SR)) / SR
    f = np.broadcast_to(f, t.shape) if np.ndim(f) else np.full(t.shape, f)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(fase) if tipo == "sin" else np.sign(np.sin(fase)) * 0.5

def guardar(nombre, x, carpeta, stereo_w=0.0):
    x = np.asarray(x, float); x = x / (np.abs(x).max() + 1e-9) * 0.89
    if stereo_w:  # paneo de izquierda a derecha (movimiento)
        p = np.linspace(-stereo_w, stereo_w, len(x))
        L, R = x * np.sqrt((1 - p) / 2), x * np.sqrt((1 + p) / 2)
    else:
        L = R = x
    pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
    with wave.open(os.path.join(carpeta, nombre + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def main():
    c = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sfx")
    os.makedirs(c, exist_ok=True)
    n = lambda d: int(d * SR)
    # whoosh: ruido que barre de grave a agudo y vuelve, con forma de campana
    d = 0.55; x = ruido_filtrado(n(d), 250, 4000) * np.hanning(n(d)) ** 1.5
    guardar("whoosh", x, c, 0.9)
    d = 0.28; guardar("whoosh_corto", ruido_filtrado(n(d), 400, 6000) * np.hanning(n(d)) ** 1.2, c, 0.8)
    d = 0.6; x = ruido_filtrado(n(d), 5000, 300) * np.linspace(0, 1, n(d)) ** 2.5
    x[-n(0.03):] *= np.linspace(1, 0, n(0.03)); guardar("swoosh_reverso", x, c)
    # pop: barrido rápido de tono hacia arriba, muy corto
    d = 0.09; guardar("pop", tono(np.geomspace(300, 1200, n(d)), d) * env(n(d), 0.002, 1, 2), c)
    d = 0.03; guardar("click", (rng.standard_normal(n(d)) * 0.4 + tono(2500, d)) * env(n(d), 0.001, 1, 6), c)
    d = 0.9; x = sum(a * tono(f, d) for f, a in [(1318, 1), (2637, .35), (3951, .15)]) * env(n(d), 0.002, 1, 4)
    guardar("ding", x, c)
    d = 0.5; x = np.concatenate([tono(880, .12) * env(n(.12), .002, 1, 2), tono(1318, .38) * env(n(.38), .002, 1, 3)])
    guardar("exito", x, c)
    # impacto: golpe grave (kick) + ruido inicial
    d = 0.7; t = np.arange(n(d)) / SR
    k = np.sin(2 * np.pi * np.cumsum(40 + 110 * np.exp(-t * 25)) / SR) * np.exp(-t * 6)
    k[:n(.02)] += rng.standard_normal(n(.02)) * np.linspace(1, 0, n(.02)) * 0.6
    guardar("impacto", k, c)
    d = 1.6; t = np.arange(n(d)) / SR
    b = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 2.2)
    b += ruido_filtrado(n(d), 200, 60) * np.exp(-t * 4) * 0.4; guardar("boom", b, c)
    # riser: tensión que sube (ruido + tono ascendente) antes de una revelación
    d = 1.8; x = ruido_filtrado(n(d), 300, 8000, .1) * 0.6 + tono(np.geomspace(150, 1200, n(d)), d) * 0.4
    x *= np.linspace(0, 1, n(d)) ** 2; guardar("riser", x, c)
    # caja registradora
    d = 0.9; x = np.zeros(n(d)); cl = rng.standard_normal(n(.04)) * env(n(.04), .001, 1, 4)
    x[:len(cl)] += cl; x[n(.06):n(.06) + len(cl)] += cl * .7
    bell = sum(a * tono(f, .8) for f, a in [(2093, 1), (2637, .6), (4186, .3)]) * env(n(.8), .002, 1, 3)
    x[n(.1):n(.1) + len(bell)] += bell[:n(d) - n(.1)]; guardar("cha_ching", x, c)
    d = 0.45; x = np.concatenate([tono(1046, .15) * env(n(.15), .003, 1, 2), np.zeros(n(.05)), tono(1568, .25) * env(n(.25), .003, 1, 2)])
    guardar("notificacion", x, c)
    d = 0.5; guardar("error", tono(np.linspace(220, 180, n(d)), d, "sq") * env(n(d), .005, 1, 1.5), c)
    d = 1.0; x = np.zeros(n(d))
    for _ in range(14):
        s = rng.integers(0, n(.7)); f = rng.uniform(3000, 7000); g = tono(f, .25) * env(n(.25), .001, 1, 5)
        x[s:s + len(g)] += g * rng.uniform(.3, 1)
    guardar("sparkle", x, c, 0.6)
    d = 0.35; x = np.zeros(n(d))
    for i in range(0, n(d), n(.035)):
        seg = n(.025); x[i:i + seg] = (tono(rng.uniform(200, 2000), .025, "sq") + rng.standard_normal(seg) * .5)[:len(x[i:i + seg])]
    guardar("glitch", x, c)
    d = 0.05; guardar("tick", tono(1800, d) * env(n(d), .001, 1, 8), c)
    d = 0.35; x = rng.standard_normal(n(d)) * (env(n(d), .001, 1, 10) + np.roll(env(n(d), .001, 1, 10), n(.12)) * .8)
    guardar("camara", x, c)
    print("ok:", sorted(os.listdir(c)))

if __name__ == "__main__":
    main()
