#!/usr/bin/env python3
"""Genera pistas instrumentales con código (sin derechos de autor, sin créditos, en segundos).

Sirven como base rítmica para anuncios cuando no hay música con licencia a mano, o para
llenar la biblioteca por estilo/temporada. Calidad "beat de fondo": para piezas premium
usa música con licencia (ver references/audio.md).

Estilos:
  dembow     reguetón (95 bpm) — moda, belleza, fiesta, jóvenes
  electro    house/pop electrónico (124 bpm) — tecnología, gadgets, ofertas, fitness
  trap       (140 bpm, medio tiempo) — urbano, autos, streetwear
  lofi       (80 bpm) — hogar, skincare, bienestar, ASMR
  festivo    navidad/aguinaldo con campanas (112 bpm) — temporada decembrina
  tropical   ritmo caribeño/champeta ligero (105 bpm) — verano, vacaciones, Costa
  epico      build-up cinemático (90 bpm) — revelaciones, lanzamientos

Uso: python3 generar_musica.py estilo salida.wav [--dur 30] [--bpm N] [--tono 0..11] [--semilla N]
     python3 generar_musica.py todo carpeta/    (una pista de cada estilo, 40 s)
"""
import argparse, os, wave
import numpy as np

SR = 44100

def adsr(n, a=0.005, d=0.1, s=0.6, r=0.1):
    e = np.ones(n) * s; A, D, R = int(a * SR), int(d * SR), int(r * SR)
    A = min(A, n); e[:A] = np.linspace(0, 1, A)
    D2 = min(D, n - A); e[A:A + D2] = np.linspace(1, s, D2)
    if R and n > R: e[-R:] *= np.linspace(1, 0, R)
    return e

def osc(f, n, tipo="sin", fase0=0.0):
    t = np.arange(n) / SR; ph = 2 * np.pi * f * t + fase0
    if tipo == "sin": return np.sin(ph)
    if tipo == "saw": return 2 * ((f * t) % 1) - 1
    if tipo == "sq": return np.sign(np.sin(ph))
    if tipo == "tri": return 2 * np.abs(2 * ((f * t) % 1) - 1) - 1

def lp(x, a):  # filtro pasabajos de 1 polo (a: 0..1, menor = más oscuro)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y

def lp_rapido(x, corte):
    """Pasabajos por FFT (rápido para señales largas)."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / corte) ** 4); return np.fft.irfft(X, len(x))

rng = np.random.default_rng(0)

def kick(): n = int(.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(45 + 120 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
def snare(): n = int(.25 * SR); t = np.arange(n) / SR; return (rng.standard_normal(n) * .7 + np.sin(2 * np.pi * 190 * t) * .5) * np.exp(-t * 18)
def clap():
    n = int(.25 * SR); x = np.zeros(n)
    for o in (0, .01, .02): s = int(o * SR); x[s:] += rng.standard_normal(n - s) * np.exp(-np.arange(n - s) / SR * 25)
    return lp_rapido(x, 3000) * 1.5
def hat(abierto=False): n = int((.18 if abierto else .05) * SR); x = rng.standard_normal(n); x = x - lp_rapido(x, 7000); return x * np.exp(-np.arange(n) / SR * (12 if abierto else 60))
def campana(f, d=.8): n = int(d * SR); t = np.arange(n) / SR; return sum(a * np.sin(2 * np.pi * f * m * t) for m, a in [(1, 1), (2.76, .5), (5.4, .25)]) * np.exp(-t * 4)
def conga(f=220): n = int(.2 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * np.cumsum(f + 80 * np.exp(-t * 40)) / SR) * np.exp(-t * 14)

ESCALA_MENOR = [0, 2, 3, 5, 7, 8, 10]; ESCALA_MAYOR = [0, 2, 4, 5, 7, 9, 11]
def nota(semi, base=48): return 440 * 2 ** ((base + semi - 69) / 12)

ESTILOS = {
    # bpm, escala, progresión (grados), patrón kick/snare/hat en 16avos por compás, instrumentos
    "dembow":   dict(bpm=95, esc=ESCALA_MENOR, prog=[0, 5, 2, 6], kick=[0, 4, 8, 12], snare=[3, 6, 11, 14], hat=list(range(0, 16, 2)), bajo="saw", pad="saw", lead="sq", clap=True),
    "electro":  dict(bpm=124, esc=ESCALA_MENOR, prog=[0, 5, 3, 4], kick=[0, 4, 8, 12], snare=[4, 12], hat=[2, 6, 10, 14], bajo="saw", pad="saw", lead="saw", abierto=True),
    "trap":     dict(bpm=140, esc=ESCALA_MENOR, prog=[0, 0, 5, 4], kick=[0, 7, 10], snare=[8], hat=list(range(16)), bajo="sin808", pad="tri", lead="tri"),
    "lofi":     dict(bpm=80, esc=ESCALA_MAYOR, prog=[1, 4, 0, 5], kick=[0, 7, 10], snare=[4, 12], hat=list(range(0, 16, 2)), bajo="sin", pad="tri", lead="sin", lofi=True),
    "festivo":  dict(bpm=112, esc=ESCALA_MAYOR, prog=[0, 3, 4, 0], kick=[0, 8], snare=[4, 12], hat=list(range(0, 16, 2)), bajo="tri", pad="tri", lead="campana", cascabel=True),
    "tropical": dict(bpm=105, esc=ESCALA_MAYOR, prog=[0, 4, 5, 3], kick=[0, 6, 8, 14], snare=[4, 12], hat=[2, 6, 10, 14], bajo="sin", pad="tri", lead="sq", congas=True),
    "epico":    dict(bpm=90, esc=ESCALA_MENOR, prog=[0, 5, 2, 6], kick=[0, 8], snare=[12], hat=[], bajo="saw", pad="saw", lead="tri", epico=True),
}

def generar(estilo, dur=30, bpm=None, tono=0, semilla=None):
    global rng
    rng = np.random.default_rng(semilla if semilla is not None else 0)
    E = ESTILOS[estilo]; bpm = bpm or E["bpm"]
    s16 = 60 / bpm / 4; comp = 16 * s16
    ncomp = int(np.ceil(dur / comp)); N = int(ncomp * comp * SR) + SR
    pistas = {k: np.zeros(N) for k in ("dr", "bajo", "pad", "lead")}
    def poner(dst, x, t, g=1.0):
        i = int(t * SR); j = min(N, i + len(x)); dst[i:j] += x[:j - i] * g
    K, S, Cl, Hh, Ho = kick(), snare(), clap(), hat(), hat(True)
    esc = E["esc"]
    def grado(g, oct=0): return nota(esc[g % 7] + 12 * (g // 7) + tono + 12 * oct)
    for c in range(ncomp):
        t0 = c * comp; g = E["prog"][c % len(E["prog"])]
        intro = c == 0 and estilo != "epico"
        intensidad = 1.0 if not E.get("epico") else min(1.0, 0.3 + c / max(1, ncomp - 1))
        for st in range(16):
            t = t0 + st * s16
            if st in E["kick"] and not (intro and st > 0 and estilo == "trap"): poner(pistas["dr"], K, t, 1.0 * intensidad)
            if st in E["snare"] and not intro: poner(pistas["dr"], Cl if E.get("clap") or estilo == "trap" else S, t, .55)
            if st in E["hat"]:
                rep = 2 if estilo == "trap" and rng.random() < .15 else 1
                for r in range(rep): poner(pistas["dr"], Hh, t + r * s16 / 2, .18 + .06 * (st % 4 == 2))
            if E.get("abierto") and st in (2, 6, 10, 14): poner(pistas["dr"], Ho, t, .12)
            if E.get("congas") and st in (3, 7, 11, 13, 15): poner(pistas["dr"], conga(250 if st % 4 == 3 else 180), t, .4)
            if E.get("cascabel") and st % 2 == 1: poner(pistas["dr"], hat() * 1.2, t, .15)
        # bajo
        f = grado(g, -1)
        if E["bajo"] == "sin808":
            n = int(comp * SR * .9); t_ = np.arange(n) / SR
            poner(pistas["bajo"], np.tanh(2 * np.sin(2 * np.pi * f * t_)) * np.exp(-t_ * 1.2), t0, .7)
        else:
            golpes = E["kick"] if estilo in ("dembow", "tropical") else [0, 3, 6, 8, 11, 14] if estilo == "electro" else [0, 8]
            for st in golpes:
                n = int(s16 * SR * (3 if estilo != "electro" else 1.6))
                x = osc(f, n, E["bajo"]) * adsr(n, .005, .05, .7, .03)
                poner(pistas["bajo"], lp_rapido(x, 500) if E["bajo"] == "saw" else x, t0 + st * s16, .5)
        # acordes (pad)
        if not intro or estilo in ("lofi", "epico"):
            n = int(comp * SR)
            acorde = sum(osc(grado(g + k, 0) * (1 + d), n, E["pad"]) for k in (0, 2, 4) for d in (-0.003, 0.003))
            x = lp_rapido(acorde, 1400 if not E.get("lofi") else 900) * adsr(n, .08, .2, .8, .15)
            poner(pistas["pad"], x, t0, .10 * intensidad)
        # melodía (arpegio) desde el compás 2
        if c >= 1 or estilo == "festivo":
            patron = [0, 2, 4, 7, 4, 2, 4, 7] if estilo != "trap" else [0, 4, 7, 9, 7, 4, 2, 4]
            for k, step in enumerate(range(0, 16, 2)):
                if rng.random() < (.25 if estilo in ("lofi", "epico") else .12): continue
                fr = grado(g + patron[k], 1); n = int(s16 * SR * 1.8)
                x = campana(fr, n / SR) if E["lead"] == "campana" else osc(fr, n, E["lead"]) * adsr(n, .005, .08, .3, .05)
                if E["lead"] in ("sq", "saw"): x = lp_rapido(x, 2500)
                poner(pistas["lead"], x, t0 + step * s16, .09 if E["lead"] != "campana" else .2)
    mez = pistas["dr"] * .9 + pistas["bajo"] + pistas["pad"] + pistas["lead"]
    if E.get("lofi"):  # textura de vinilo y menos agudos
        mez = lp_rapido(mez, 5000) + rng.standard_normal(N) * .004
    # eco simple en la melodía y estéreo
    d = int(s16 * 3 * SR); eco = np.zeros(N); eco[d:] = pistas["lead"][:-d] * .35
    L = mez + eco * .8; R = mez + np.roll(eco, int(.012 * SR))
    st = np.stack([L, R], 1)[: int(dur * SR)]
    f = int(1.5 * SR); st[-f:] *= np.linspace(1, 0, f)[:, None]
    st = np.tanh(st / (np.abs(st).max() + 1e-9) * 1.4) * .9  # pegamento/limitador suave
    return st, bpm

def guardar(st, path):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("estilo", choices=list(ESTILOS) + ["todo"]); ap.add_argument("salida")
    ap.add_argument("--dur", type=float, default=30); ap.add_argument("--bpm", type=float)
    ap.add_argument("--tono", type=int, default=0); ap.add_argument("--semilla", type=int)
    a = ap.parse_args()
    if a.estilo == "todo":
        os.makedirs(a.salida, exist_ok=True)
        for e in ESTILOS:
            st, bpm = generar(e, max(a.dur, 40), None, a.tono, a.semilla)
            p = os.path.join(a.salida, f"{e}_{int(bpm)}bpm_codigo.wav"); guardar(st, p); print("ok", p)
    else:
        st, bpm = generar(a.estilo, a.dur, a.bpm, a.tono, a.semilla); guardar(st, a.salida)
        print(f"ok: {a.salida} ({a.estilo}, {bpm:.0f} bpm, {a.dur:.0f} s)")

if __name__ == "__main__":
    main()
