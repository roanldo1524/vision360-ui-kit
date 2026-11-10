"""Funciones comunes: detectar el equipo (NVIDIA / Mac / solo CPU), codificador de video,
rutas para filtros de ffmpeg en Windows, limpieza de metadatos y configuración del equipo.
Funciona igual en Windows, Mac y Linux.
"""
import json, os, platform, re, shutil, subprocess, sys
from functools import lru_cache

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, ".."))
FONTS = os.path.join(RAIZ, "assets", "fonts")
SFX = os.path.join(RAIZ, "assets", "sfx")
CONFIG = os.path.join(os.path.expanduser("~"), ".video-ads", "config.json")
ES_WIN = platform.system() == "Windows"
ES_MAC = platform.system() == "Darwin"


def leer_config():
    try:
        return json.load(open(CONFIG, encoding="utf-8"))
    except Exception:
        return {}


def guardar_config(c):
    os.makedirs(os.path.dirname(CONFIG), exist_ok=True)
    json.dump(c, open(CONFIG, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def ff_ruta(p):
    """Ruta segura dentro de un filtro de ffmpeg (ass=, fontsdir=, fontfile=). En Windows
    'C:\\x' rompe el filtro: se usa 'C\\:/x'."""
    p = os.path.abspath(p).replace("\\", "/")
    return p.replace(":", r"\:").replace("'", r"\'")


def python_venv(venv):
    """Ejecutable de Python de un entorno virtual (Windows usa Scripts\\python.exe)."""
    return os.path.join(venv, "Scripts", "python.exe") if ES_WIN else os.path.join(venv, "bin", "python")


@lru_cache(None)
def _encoders():
    try:
        return subprocess.run(["ffmpeg", "-hide_banner", "-encoders"], capture_output=True, text=True).stdout
    except FileNotFoundError:
        return ""


@lru_cache(None)
def _prueba_encoder(enc):
    """El encoder aparece en la lista aunque no haya tarjeta: se prueba codificando 1 cuadro."""
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=black:s=256x256:d=0.1",
                        "-frames:v", "1", "-c:v", enc, "-f", "null", "-"], capture_output=True, text=True)
    return r.returncode == 0


@lru_cache(None)
def equipo():
    """'nvidia', 'mac' o 'cpu'. Se puede forzar con la variable VIDEO_ADS_EQUIPO."""
    f = os.environ.get("VIDEO_ADS_EQUIPO", "").lower()
    if f in ("nvidia", "mac", "cpu"):
        return f
    enc = _encoders()
    if "h264_nvenc" in enc and _prueba_encoder("h264_nvenc"):
        return "nvidia"
    if ES_MAC and "h264_videotoolbox" in enc and _prueba_encoder("h264_videotoolbox"):
        return "mac"
    return "cpu"


def codificador(modo="final"):
    """Argumentos de video para ffmpeg según el equipo.
    modo: 'final' (calidad de entrega), 'rapido' (lotes), 'intermedio' (piezas temporales)."""
    e = equipo()
    if modo == "intermedio":
        if e == "nvidia": return ["-c:v", "h264_nvenc", "-preset", "p1", "-cq", "16", "-pix_fmt", "yuv420p"]
        return ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "14", "-pix_fmt", "yuv420p"]
    if e == "nvidia":
        return ["-c:v", "h264_nvenc", "-preset", "p4" if modo == "rapido" else "p6", "-rc", "vbr", "-cq", "21",
                "-b:v", "0", "-pix_fmt", "yuv420p"]
    if e == "mac":
        return ["-c:v", "h264_videotoolbox", "-b:v", "10M", "-maxrate", "14M", "-pix_fmt", "yuv420p"]
    return ["-c:v", "libx264", "-preset", "veryfast" if modo == "rapido" else "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-x264-params", "no-info=1"]


def whisper_opciones():
    """(device, compute_type, modelo) para faster-whisper según el equipo."""
    modelo = os.environ.get("VIDEO_ADS_WHISPER")
    try:
        import ctranslate2
        if ctranslate2.get_cuda_device_count() > 0:
            return "cuda", "float16", modelo or "medium"
    except Exception:
        pass
    return "cpu", "int8", modelo or "small"


def hilos():
    return max(1, min(4, (os.cpu_count() or 2) // 2))


PATRONES_RASTRO = [rb"x264 - core", rb"Lavf\d", rb"Lavc\d", rb"h264_fbv", rb"com\.apple\.quicktime",
                   rb"com\.android", rb"CapCut", rb"capcut", rb"Premiere", rb"DaVinci", rb"InShot"]


def rastros(path, max_bytes=None):
    """Busca firmas de editores/encoders dentro del archivo (sin depender del comando 'strings')."""
    encontrados = set()
    with open(path, "rb") as f:
        resto = b""
        while True:
            bloque = f.read(4 << 20)
            if not bloque: break
            datos = resto + bloque
            for p in PATRONES_RASTRO:
                m = re.search(p, datos)
                if m: encontrados.add(m.group(0).decode(errors="ignore"))
            resto = datos[-64:]
    return sorted(encontrados)


def limpiar_metadatos(entrada, salida=None):
    """Quita metadatos sin recodificar: etiquetas, capítulos, nombre del encoder y la info SEI
    que x264 esconde dentro del video. Devuelve la lista de rastros que queden."""
    salida = salida or entrada
    tmp = os.path.join(os.path.dirname(os.path.abspath(salida)), f".tmp_{os.getpid()}_{os.path.basename(salida)}")
    codec = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name",
                            "-of", "csv=p=0", entrada], capture_output=True, text=True).stdout.strip()
    bsf = {"h264": ["-bsf:v", "filter_units=remove_types=6"], "hevc": ["-bsf:v", "filter_units=remove_types=39|40"]}.get(codec, [])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", entrada, "-map", "0:v?", "-map", "0:a?", "-c", "copy", *bsf,
                    "-map_metadata", "-1", "-map_chapters", "-1", "-metadata:s:v", "encoder=", "-metadata:s:v", "handler_name=",
                    "-metadata:s:a", "handler_name=", "-fflags", "+bitexact", "-flags:v", "+bitexact", "-flags:a", "+bitexact",
                    "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, salida)
    return rastros(salida)


def fuente_texto():
    """Fuente para textos de control (hojas de contacto)."""
    return os.path.join(FONTS, "Montserrat-Variable.ttf")


def dur(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                       capture_output=True, text=True).stdout.strip()
    try: return float(o)
    except ValueError: return 0.0
