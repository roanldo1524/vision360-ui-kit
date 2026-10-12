---
tipo: lobulo
tags: [lobulo, lobulo/vida]
---
# 🌱 Lóbulo Vida

Salud, energía, hábitos, relaciones y metas personales.

↑ [[🧠 Cerebro Central]]

## Neuronas del lóbulo
```dataview
LIST FROM #lobulo/vida AND "01-Neuronas"
SORT file.mtime DESC
```

## Proyectos relacionados
```dataview
LIST FROM "03-Proyectos" WHERE contains(file.outlinks, this.file.link)
```
