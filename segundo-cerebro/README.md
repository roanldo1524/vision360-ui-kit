# 🧠 Segundo Cerebro — Red Neuronal en Obsidian

Vault de Obsidian listo para usar, organizado como una red neuronal:
**neuronas** (notas atómicas) unidas por **sinapsis** (enlaces) y agrupadas en **lóbulos** (mapas temáticos).

## Instalación (5 minutos)
1. Descarga esta carpeta `segundo-cerebro/`.
2. Obsidian → **Abrir carpeta como vault** → selecciona `segundo-cerebro`.
3. Ajustes → **Plugins de la comunidad** → activa e instala:
   - **Dataview** (obligatorio para el Panel de Control)
   - **Templater** (plantillas avanzadas, opcional)
   - **Smart Connections** (red neuronal de embeddings: notas relacionadas + chat con tu vault)
   - **Copilot** (chat IA; admite Claude, GPT u Ollama local)
   - **Excalidraw** (dibujar mapas mentales, opcional)
4. Abre `02-Lobulos/🧠 Cerebro Central` y pulsa `Ctrl/Cmd + G` para ver la red.

## Estructura
```
00-Bandeja      impulsos sin procesar
01-Neuronas     notas atómicas (una idea cada una)
02-Lobulos      mapas de contenido por tema
03-Proyectos    acciones con fecha de fin
04-Areas        responsabilidades continuas
05-Recursos     libros, cursos, videos, adjuntos
06-Archivo      lo terminado
07-Diario       notas diarias
99-Plantillas   Neurona, Lóbulo, Diario, Proyecto, Recurso
_sistema        Panel de Control, guía y motor de sinapsis
```

## Motor de sinapsis (sin IA externa)
```bash
python3 _sistema/sinapsis.py --umbral 0.10 --max 3
```
Analiza todas las notas (TF-IDF + similitud coseno) y genera `_sistema/Sinapsis sugeridas.md`
con conexiones que aún no existen y neuronas huérfanas.

Lee `_sistema/Cómo funciona este cerebro.md` para la metodología completa.
