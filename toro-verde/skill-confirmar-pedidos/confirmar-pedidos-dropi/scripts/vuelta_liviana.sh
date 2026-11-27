#!/bin/bash
# Vuelta liviana del robot (SIN IA): corre robot.sh en modo pausa. Las reglas (revision_auto.py) confirman solas lo SEGURO;
# lo dudoso queda en /tmp/dropi/fichas.md para que la IA lo lea, y si nadie lo revisa en espera_ia_min pasa solo a REVISAR HUMANO.
# Solo de 5 a. m. a 9 p. m. (hora de Colombia). Uso: bash robot/vuelta_liviana.sh
S="$(cd "$(dirname "$0")/.." && pwd)"
H=$(TZ=America/Bogota date +%H); { [ "$H" -lt 5 ] || [ "$H" -ge 21 ]; } && { echo FUERA_DE_HORARIO; exit 0; }
cd "$S" && ROBOT_PAUSA=1 timeout 1500 bash robot/robot.sh 2>&1 | grep -v -i deprecat | grep -v "hora =" | tail -8
grep "^## " /tmp/dropi/fichas.md 2>/dev/null; exit 0
