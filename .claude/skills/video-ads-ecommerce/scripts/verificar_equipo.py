#!/usr/bin/env python3
"""Revisa si este computador puede usar la skill y dice EXACTAMENTE qué instalar si falta algo.
Uso: python verificar_equipo.py        (Windows)      python3 verificar_equipo.py   (Mac)
"""
import importlib, os, platform, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
SO = platform.system()
OK, NO, AV = "✔", "✘", "!"
faltas = []

def cmd_instalar(que):
    tabla = {
        "python": {"Windows": "winget install Python.Python.3.12", "Darwin": "brew install python@3.12", "Linux": "sudo apt install python3 python3-pip"},
        "ffmpeg": {"Windows": "winget install Gyan.FFmpeg   (cierre y abra PowerShell después)", "Darwin": "brew install ffmpeg",
                   "Linux": "sudo apt install ffmpeg"},
        "libs": {"Windows": f'python -m pip install -r "{os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "requirements.txt")}"',
                 "Darwin": f'python3 -m pip install -r "{os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "requirements.txt")}"',
                 "Linux": f'python3 -m pip install -r "{os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "requirements.txt")}"'},
    }
    return tabla[que].get(SO, tabla[que]["Linux"])

def linea(estado, texto, arreglo=None):
    print(f"  {estado} {texto}")
    if estado == NO and arreglo: faltas.append(arreglo)

def main():
    print(f"Equipo: {SO} {platform.release()} · Python {platform.python_version()} · {os.cpu_count()} núcleos\n")
    print("1. Programas")
    linea(OK if sys.version_info >= (3, 10) else NO, f"Python {platform.python_version()} (mínimo 3.10)", cmd_instalar("python"))
    ff = shutil.which("ffmpeg") and shutil.which("ffprobe")
    linea(OK if ff else NO, "ffmpeg y ffprobe", cmd_instalar("ffmpeg"))
    if ff:
        filtros = subprocess.run(["ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True).stdout
        necesarios = ["ass", "drawtext", "loudnorm", "sidechaincompress", "zoompan", "xfade", "delogo", "alimiter",
                      "silenceremove", "ebur128", "boxblur", "afftdn", "deesser"]
        sin = [f for f in necesarios if f" {f} " not in filtros]
        linea(OK if not sin else NO, "ffmpeg completo (subtítulos, volumen, zoom, efectos)" + (f" — faltan: {', '.join(sin)}" if sin else ""),
              "Instale la versión COMPLETA de ffmpeg: " + ("winget install Gyan.FFmpeg" if SO == "Windows" else
              "brew reinstall ffmpeg" if SO == "Darwin" else "sudo apt install ffmpeg"))
        from comun import equipo
        e = equipo()
        print(f"  {OK} Aceleración de video: " + {"nvidia": "tarjeta NVIDIA (rápido)", "mac": "chip de Mac (rápido)",
                                                 "cpu": "solo procesador (funciona; algo más lento)"}[e])
    print("\n2. Librerías de Python")
    for mod, nombre in [("numpy", "numpy"), ("PIL", "pillow"), ("scipy", "scipy"), ("librosa", "librosa (ritmo de la música)"),
                        ("faster_whisper", "faster-whisper (transcribir)"), ("demucs", "demucs (separar voz y música)")]:
        try:
            importlib.import_module(mod); linea(OK, nombre)
        except Exception:
            linea(NO, nombre, cmd_instalar("libs"))
    try:
        import ctranslate2
        n = ctranslate2.get_cuda_device_count()
        print(f"  {OK if n else AV} Transcripción con tarjeta gráfica: {'sí' if n else 'no (usa el procesador, modelo small)'}")
    except Exception:
        pass
    print("\n3. Voz IA local (opcional)")
    from comun import leer_config, python_venv
    py = os.environ.get("XTTS_PYTHON") or leer_config().get("xtts_python") or python_venv(os.path.join(os.path.expanduser("~"), ".xtts-venv"))
    if os.path.exists(py):
        print(f"  {OK} XTTS instalado ({py})")
    else:
        print(f"  {AV} XTTS no instalado (solo hace falta para voces gratis): python {os.path.join(os.path.dirname(os.path.abspath(__file__)), 'setup_xtts.py')}")
    print("\n4. Recursos de la skill")
    raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    fuentes = os.path.isfile(os.path.join(raiz, "assets", "fonts", "Montserrat-Variable.ttf"))
    sfx = len([f for f in os.listdir(os.path.join(raiz, "assets", "sfx"))]) if os.path.isdir(os.path.join(raiz, "assets", "sfx")) else 0
    linea(OK if fuentes else NO, "fuentes (Montserrat, Anton)", "Vuelva a copiar la carpeta completa de la skill")
    linea(OK if sfx >= 10 else NO, f"efectos de sonido ({sfx})", "python " + os.path.join(os.path.dirname(os.path.abspath(__file__)), "generar_sfx.py"))
    print("\n5. Disco y carpeta de trabajo")
    c = leer_config()
    destino = c.get("carpeta_trabajo") or os.path.expanduser("~")
    libre = shutil.disk_usage(destino if os.path.exists(destino) else os.path.expanduser("~")).free / 1e9
    linea(OK if libre > 10 else NO, f"espacio libre: {libre:.0f} GB (recomendado 15 GB o más)", "Libere espacio en disco")
    print(f"  {OK if c.get('carpeta_trabajo') else AV} carpeta de trabajo: {c.get('carpeta_trabajo') or 'sin configurar → python configurar.py'}")
    print()
    if faltas:
        print("FALTA INSTALAR (copie y pegue cada línea, en orden):")
        for f in dict.fromkeys(faltas): print("  " + f)
        print("Después vuelva a correr este revisor.")
        sys.exit(1)
    print("LISTO: el equipo puede editar.")

if __name__ == "__main__":
    main()
