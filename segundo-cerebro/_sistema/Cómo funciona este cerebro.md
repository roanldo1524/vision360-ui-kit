---
tipo: sistema
tags: [sistema]
---
# 🧬 Cómo funciona este cerebro

↑ [[🧠 Cerebro Central]]

## La metáfora neuronal
| Cerebro | Obsidian | Carpeta |
|---|---|---|
| **Impulso** (estímulo sin procesar) | Captura rápida | `00-Bandeja` |
| **Neurona** (una idea) | Nota atómica | `01-Neuronas` |
| **Sinapsis** (conexión) | `[[enlace]]` + el *porqué* | dentro de cada nota |
| **Lóbulo** (región temática) | Mapa de contenido (MOC) | `02-Lobulos` |
| **Acción motora** | Proyecto con fecha de fin | `03-Proyectos` |
| **Memoria a largo plazo** | Áreas, recursos, archivo | `04` · `05` · `06` |
| **Ciclo de sueño** (consolidación) | Diario + revisión semanal | `07-Diario` |

## Reglas de oro
1. **Una neurona = una idea**, con título que sea una afirmación ([[Las notas atómicas tienen una sola idea]]).
2. **Ninguna neurona huérfana**: mínimo 1 lóbulo + 1 sinapsis.
3. **Explica cada sinapsis**: “se conecta con X *porque*…”. Un enlace sin porqué es una sinapsis débil.
4. **Captura rápido, procesa lento** ([[Captura rápida, procesamiento lento]]).
5. **Estados de madurez**: `semilla` → `brote` → `maduro`.

## Las redes neuronales reales (IA)
- **Smart Connections**: crea *embeddings* (vectores generados por una red neuronal) de cada nota y muestra en un panel las notas semánticamente cercanas. Permite chatear con tu vault.
- **Copilot**: chat con IA sobre tus notas (Claude, GPT, o modelos locales con Ollama).
- **`_sistema/sinapsis.py`**: alternativa local sin IA (TF-IDF). Genera [[Sinapsis sugeridas]] y detecta huérfanas.

Ver [[Los embeddings encuentran conexiones que yo no veo]].

## Ver la red
Abre la **Vista de grafo** (`Ctrl/Cmd + G`). Ya viene configurada con colores por lóbulo:
🔴 lóbulos · 🟡 negocio · 🩷 marketing · 🟢 aprendizaje · 🔵 tecnología · 🟣 vida · ⚪ proyectos.

## Ritual
- **Diario** (2 min): captura impulsos.
- **Semanal** (30 min): [[Revisión semanal del cerebro]].
