# Herramientas externas opcionales

Esta skill funciona sola (ffmpeg + Python + Whisper + Demucs + XTTS). Estas herramientas
suman capacidades; instálalas solo si el equipo las necesita y el entorno lo permite.

| Herramienta | Qué suma | Licencia / costo | Instalación | Ojo |
|---|---|---|---|---|
| **reels-montage (IT Reelsmaker)** github.com/itpartypattaya/reels-montage | corte de silencios y retomas por voz, subtítulos por palabra, cámara virtual con detección de cara, plantillas Remotion de gancho/CTA | MIT; offline. El add-on "online" usa APIs pagas (fal.ai, OpenAI, Pexels…) con aprobación previa | plugin de Claude Code: marketplace `itparty` → `it-reelsmaker@itparty` | dependencias pesadas (OpenCV, rembg, Node + Remotion) |
| **HyperFrames (HeyGen)** github.com/heygen-com/hyperframes | ~450 bloques de motion graphics en HTML (textos cinéticos, transiciones, gráficos, overlays), texto detrás de la persona (recorte), skill `media-use` de música/SFX | Apache-2.0; muchas funciones offline; catálogo de música/voces de HeyGen con créditos | `npx skills add heygen-com/hyperframes` o plugin `hyperframes@hyperframes`; requiere Node 22+ y Chrome | **telemetría activada por defecto**: desactivar con `HYPERFRAMES_NO_TELEMETRY=1` o `DO_NOT_TRACK=1`; empuja a iniciar sesión en HeyGen (créditos) |
| **Remotion** remotion.dev | plantillas animadas con código (React) para muchas variantes | gratis para individuos y empresas de hasta 3 personas; **más de 3 personas requiere licencia de empresa** | `npx create-video@latest` | Node + Chromium |
| **yt-dlp** | descargar referentes de TikTok/IG/YouTube para estudiar estilo | libre | `pip install yt-dlp` | solo para estudiar; no republicar contenido ajeno |
| **rembg** | quitar fondo de fotos de producto (`animar_producto.py --quitar-fondo`) | MIT | `pip install rembg onnxruntime` | descarga modelo ~170 MB |
| **Silero VAD / alineación forzada (torchaudio MMS)** | tiempos por palabra más precisos que Whisper (~170 ms de error medio de Whisper) | MIT / BSD | `pip install silero-vad` | útil si los subtítulos se ven corridos |
| **MediaPipe** | detectar cara (no tapar la cara, encuadre), recortar persona | Apache-2.0 | `pip install mediapipe` (Python ≤3.12) | |

APIs de pago (solo con clave del equipo, guardada como secreto del entorno):
Fish Audio (voz), ElevenLabs (voz, efectos, música), fal.ai / Kling / Veo / Runway (video IA),
Suno/Udio (música con licencia comercial en planes pagos). Antes de gastar, di el costo
aproximado y usa la alternativa gratis para pruebas.

Lección de la skill de Toro Verde (un amigo del equipo): traía 8 canciones comerciales
(carranga, llanera, popular) sin voz para pauta. Quitarle la voz a una canción **no quita
los derechos**: no lo repliques. Usa música con licencia o generada.
