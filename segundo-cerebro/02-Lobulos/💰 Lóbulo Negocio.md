---
tipo: lobulo
tags: [lobulo, lobulo/negocio]
---
# 💰 Lóbulo Negocio

Todo lo que hace crecer el negocio: producto, operaciones, finanzas, logística.

↑ [[🧠 Cerebro Central]]

## Neuronas del lóbulo
```dataview
LIST FROM #lobulo/negocio AND "01-Neuronas"
SORT file.mtime DESC
```

## Proyectos relacionados
```dataview
LIST FROM "03-Proyectos" WHERE contains(file.outlinks, this.file.link)
```
