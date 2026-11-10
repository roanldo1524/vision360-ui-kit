# Audio: música, efectos de sonido, voces IA y mezcla

## 1. Música

La música marca la emoción y el ritmo de los cortes. Elige por el buyer persona y el ángulo:

| Mood | BPM | Para |
|---|---|---|
| Energético / gym / urgencia | 120-140 | Fitness, suplementos, ofertas, gadgets |
| Trendy / pop TikTok | 100-120 | Moda, belleza, lifestyle |
| Chill / lo-fi | 70-90 | Hogar, bienestar, ASMR, skincare |
| Épico / cinemático | 80-100 con build-up | Revelaciones, tecnología, autos |
| Divertido / quirky | 110-130 | Skits, gadgets curiosos, mascotas |
| Emotivo / piano | 60-80 | Historias, founder, regalos |

- **Corta al ritmo**: los cortes principales caen en el beat (o en múltiplos). Detecta beats con `librosa.beat.beat_track` si hace falta.
- El "drop" o cambio de la canción coincide con la revelación del producto o resultado.
- **Licencias**: para anuncios pagados NO uses música comercial con derechos (canciones de artistas, aunque sean tendencia en TikTok): Meta las silencia o bloquea. Usa la biblioteca de sonidos de Meta/TikTok para anunciantes (Commercial Music Library), bibliotecas con licencia (Artlist, Epidemic, Uppbeat) o música generada por IA con licencia comercial (Suno/Udio en planes pagos, ElevenLabs Music).
- Generar música por API (si el equipo tiene clave): pide "instrumental, [mood], [BPM] bpm, [duración] s, sin voz, para anuncio", 2-3 variantes.

## 2. Efectos de sonido (SFX)

Los SFX hacen que la edición "se sienta" cara. Ubícalos en momentos concretos:

| Momento | SFX |
|---|---|
| Transición / barrido | whoosh / swish |
| Texto que aparece | pop, click, "bubble" |
| Zoom punch / énfasis | impacto (boom, hit), "riser" antes |
| Revelación del producto | shimmer / sparkle, riser + impacto |
| Precio / oferta | caja registradora, "cha-ching", notificación |
| Error / problema | buzzer, record scratch, "wrong" |
| Check / beneficio | ding, "correct" |
| Unboxing / ASMR | sonido real del producto amplificado (+6 dB), sin música |

- Volumen SFX: unos 6-10 dB por debajo de la voz; no deben tapar palabras.
- Fuentes: bibliotecas libres de regalías (Pixabay sound effects, Freesound con licencia CC0, Epidemic/Artlist), o generados con IA (ElevenLabs Sound Effects).
- Añadir un SFX en el segundo 3.2 con ffmpeg:
```bash
ffmpeg -i video.mp4 -i whoosh.wav -filter_complex "[1:a]adelay=3200:all=1,volume=0.6[s];[0:a][s]amix=inputs=2:normalize=0:duration=first[a]" -map 0:v -map "[a]" -c:v copy out.mp4
```

## 3. Voces IA

Elige la voz que coincide con el buyer persona: misma edad aparente, género y acento del
mercado (Colombia/México/Latam neutro/España). Una clienta de 25 años confía en una voz de
25 años que habla como ella.

| Motor | Calidad | Costo | Notas |
|---|---|---|---|
| **Fish Audio** (API) | Muy buena, miles de voces en español | Pago por uso | Necesita **saldo de API**, distinto a los créditos gratis de la web (si no, error 402). `generar_voz.py --buscar-voces es mujer` |
| **ElevenLabs** (API) | Excelente, muy expresiva | Suscripción | `eleven_multilingual_v2`; clon de voz profesional |
| **XTTS-v2** (local) | Buena; clona la voz original | Gratis | Lento en CPU. `setup_xtts.sh` una vez. Ideal para doblar manteniendo la voz de la creadora |
| Web de Fish/ElevenLabs (manual) | — | Usa créditos gratis | El equipo genera los audios en la web y los sube; el script los mezcla |

Buenas prácticas:
- Genera **por frase**, no el guion entero: así regeneras solo la que salió mal y sincronizas mejor.
- Velocidad natural: 1.0-1.15. Más de 1.25 suena robótico → acorta el guion.
- Marcas/anglicismos: escríbelos fonéticamente solo para el audio (`--fonetica "Clean Nutra=Clin Nutra"`).
- Números en letras en el texto de voz.
- Escucha o transcribe siempre el resultado (`verificar.py --guion`): las IA a veces cambian palabras ("creatina" → "creativa").
- Si se clona una voz real, debe ser con permiso de esa persona.

## 4. Mezcla y volumen final

| Elemento | Nivel aproximado |
|---|---|
| Voz | protagonista, -14 LUFS en la mezcla final |
| Música con voz encima | -18 a -24 dB bajo la voz (ducking) |
| Música sin voz | al frente |
| SFX | -6 a -10 dB bajo la voz |

- Ducking automático (baja la música cuando hay voz):
```bash
ffmpeg -i voz.wav -i musica.mp3 -filter_complex "[1:a][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[m];[m][0:a]amix=inputs=2:normalize=0[a]" -map "[a]" mezcla.wav
```
- Normaliza el final a **-14 LUFS, pico -1.5 dB** (`loudnorm=I=-14:TP=-1.5:LRA=11`); `mezclar_doblaje.py` ya lo hace.
- Limpieza de voz grabada con celular: `highpass=f=80,afftdn=nf=-25,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-14`.
- Separar voz de música de un video existente: `separar_voz.sh` (Demucs).
