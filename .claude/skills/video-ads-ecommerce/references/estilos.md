# Estilos de edición, reglas finas y revisión (aprendido de ediciones que ya vendieron)

## Estilo de edición a partir de un video de referencia
Cuando el usuario diga "edita como este video" o suba referentes: se copia la **forma**
(ritmo, gancho, subtítulos, música, efectos), nunca el contenido (frases, datos, marca).

1. Mide: `python3 scripts/inventario_tomas.py trabajo/ref ref.mp4 --sin-texto` (cortes y duración de cada plano) + `python3 scripts/transcribir.py ref.mp4 ref.json` + volumen con `verificar.py`.
2. Mira: `python3 scripts/hoja_contactos.py ref.mp4 hoja.png 0.5 10`.
3. Escribe la ficha del estilo en `estilos/<nombre>.md` (repositorio del equipo), con:
   - Gancho (0-3 s): qué se ve, qué se dice, texto en pantalla, sonido.
   - Estructura (bloques y tiempos).
   - Ritmo: duración media de plano, cortes por minuto, zooms/punch, cambios de encuadre.
   - Subtítulos: fuente (o la gratuita más parecida), tamaño, posición, color, palabra resaltada, animación.
   - Colores (hex) y gráficos/tarjetas.
   - Transiciones y efectos de sonido (cuáles y cuándo).
   - Música: género, nivel bajo la voz, cuándo cambia.
   - Cierre/CTA.
   - Cómo replicarlo con esta skill: `--preset`, colores, `--plan` típico, música (mood).
   - Lo que no se puede igualar.
   Regla: cada punto debe verse en al menos 2 de los videos de referencia (si hay varios) y los tiempos/colores deben ser medidos, no inventados.
4. Para referentes en internet, el usuario puede subirlos al chat (o con yt-dlp si está instalado); úsalos solo para estudiar.

## Reglas finas que suben la calidad
- **Segundo 0 = conflicto o resultado**, nunca saludo ni logo. Siempre con texto en pantalla. Fórmula: pregunta que duele, paradoja o comparación + número concreto o "tú/usted".
- **Nunca cortar la voz a mitad de palabra**: los cortes van en huecos entre palabras (`editar_auto.py ugc` ya lo hace con tiempos por palabra). Para quitar algo del medio, se quita la frase entera.
- **Pausas muertas** ≥0.30 s → 0.12 s. Excepción: pausa después de "mira/mire/fíjate/aquí" (la persona está mostrando algo): se deja.
- **Gráficos en la palabra que los nombra**: el texto/precio/dato aparece justo cuando se dice (`--plan` con el tiempo de esa palabra, sacado del json de la voz/subtítulos).
- **Movimiento rápido**: entradas y salidas ≤0.16 s; transiciones ~0.2 s, máximo una por corte y nunca dentro de una frase. Punch-in 100↔112% en pausas, separados ≥3-4 s si es UGC.
- **Duración**: 24-32 s rinde bien para la mayoría; 15 s para retargeting; 45-90 s solo si hay mecanismo que explicar.
- **Subtítulos**: 3 palabras por grupo o corte en la puntuación; una sola palabra clave resaltada por pantalla; nunca sobre la boca ni la cara (tarjetas/burbujas arriba de la cabeza).
- **Música**: unos 18 dB por debajo de la voz (a 11-14 dB "se come la voz"); ducking suave (solo baja ≤3 dB cuando hay voz). Una canción completa recortada suena mejor que pedazos pegados. La parte fuerte de la canción cae en el momento fuerte (revelación/oferta): `editar_auto.py` lo hace solo (`--climax-en` para fijarlo).
- **Efectos de sonido**: uno por momento con significado, no uno por corte, separados ≥1.2 s. Gancho = impacto (el único fuerte); número/precio = pop o cha-ching; aparece algo = click; oferta = riser que remata en la palabra. "Más efectos" suele sentirse forzado: en duda, menos.
- **Volumen**: -14 LUFS integrado y picos ≤ -1 dBTP (limitador al final; `loudnorm` solo puede pasarse de picos).
- **Cierre**: tarjeta con CTA + facilidad de pago + oferta confirmada (si no hay fecha confirmada: "por tiempo limitado").

## Revisión antes de entregar (hoja de cuadros)
Claude no oye: lo que se puede verificar se verifica con números e imágenes, y lo que no, se dice.
- `verificar.py` (volumen, picos, metadatos, voz vs guion).
- Hoja de fotogramas del video final (`hoja_contactos.py final.mp4 hoja.png 0.5 10`): textos dentro de zona segura, nada sobre la cara, sin restos de texto viejo, gancho legible en el fotograma 0, CTA completo al final.
- Al entregar, di qué no pudiste comprobar: si la música va con el ánimo, si un SFX suena bien, palabras dudosas en subtítulos, fechas/ofertas.

## Muestrarios (para que el humano elija rápido)
Cuando hay que escoger música, voz o gancho, entrega opciones numeradas cortas en vez de preguntar en abstracto:
- Voz: `generar_voz.py` con 3 voces distintas para la misma frase de gancho → `voz_1.wav`, `voz_2.wav`, `voz_3.wav`.
- Música: el mismo video corto renderizado con 3 canciones (`editar_auto.py ... --musica X -o opcion_1.mp4`).
- Gancho: `lote.py --solo 0 1 2`.
El usuario responde "la 2" y se sigue.
