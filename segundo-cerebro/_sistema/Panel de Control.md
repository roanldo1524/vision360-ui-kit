---
tipo: sistema
tags: [sistema]
---
# 🎛️ Panel de Control

↑ [[🧠 Cerebro Central]] · [[Cómo funciona este cerebro]] · [[Sinapsis sugeridas]]

> Requiere el plugin **Dataview**.

## 📥 Bandeja por procesar
```dataview
LIST FROM "00-Bandeja" SORT file.ctime ASC
```

## 🌱 Neuronas por estado
```dataview
TABLE WITHOUT ID estado AS "Estado", length(rows) AS "Neuronas"
FROM "01-Neuronas" GROUP BY estado
```

## 🔌 Neuronas más conectadas (hubs)
```dataview
TABLE length(file.inlinks) AS "Entrantes", length(file.outlinks) AS "Salientes"
FROM "01-Neuronas"
SORT length(file.inlinks) + length(file.outlinks) DESC
LIMIT 10
```

## ⚠️ Neuronas débiles (menos de 2 conexiones)
```dataview
LIST FROM "01-Neuronas"
WHERE length(file.inlinks) + length(file.outlinks) < 2
```

## 🚀 Proyectos activos
```dataview
TABLE inicio, estado FROM "03-Proyectos" WHERE estado = "activo"
```

## 🕒 Actividad reciente
```dataview
LIST FROM "" WHERE file.mtime >= date(today) - dur(7 days)
AND !contains(file.path, "99-Plantillas")
SORT file.mtime DESC LIMIT 15
```
