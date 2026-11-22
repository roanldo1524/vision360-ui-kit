# Arrancar el robot de despacho en una sesión nueva

Necesita el entorno con DU y DP (usuario y clave del robot en Dropi). La llave de Lucid la pone el entorno sola (no hace falta archivo real).

```bash
S=/tmp/robot && mkdir -p $S/robot /tmp/dropi
cp toro-verde/robot-despacho/*.js toro-verde/robot-despacho/transportadoras.json /tmp/dropi/
cp toro-verde/robot-despacho/*.py toro-verde/robot-despacho/*.sh $S/robot/
echo x > $S/lucidbot.key           # el proxy del entorno pone la llave real de Lucid
cd /tmp/dropi && npm ls playwright >/dev/null 2>&1 || true
node entrar.js                      # debe decir SESION_OK
cd $S && ROBOT_PAUSA=1 bash robot/robot.sh   # luego leer /tmp/dropi/fichas.md y: bash robot/confirmar_aprobados.sh
```
Reglas completas: robot/razonar.py, robot/decidir.py y toro-verde/ESTADO.md.
