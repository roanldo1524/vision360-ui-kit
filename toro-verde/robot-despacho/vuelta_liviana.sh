#!/bin/bash
# Vuelta liviana del robot (:04, :34 y :49): solo robot.sh. Lo pesado (revisar.sh, confirmados, aclaraciones, panel) va en la de los :19.
S="$(cd "$(dirname "$0")/.." && pwd)"
H=$(TZ=America/Bogota date +%H); [ "$H" -lt 5 ] || [ "$H" -ge 21 ] && { echo FUERA_DE_HORARIO; exit 0; }
cd "$S" && ROBOT_PAUSA=1 timeout 1500 bash robot/robot.sh 2>&1 | grep -v -i deprecat | grep -v "hora =" | tail -8
grep "^## " /tmp/dropi/fichas.md 2>/dev/null
