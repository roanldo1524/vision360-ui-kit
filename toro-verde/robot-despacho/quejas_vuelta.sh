#!/bin/bash
# Vuelta de QUEJAS A LA TRANSPORTADORA por el CAS (Ronald 23-11: «presionar más a las transportadoras… que se entreguen los paquetes»).
# 1) Trae los pedidos de los últimos 20 días; 2) lee el Historial de estados (lupa) de los que están en camino;
# 3) arma la cola (más de 48 h quietos en un estado de la transportadora, sin devoluciones);
# 4) pone cada queja por los audífonos con el pantallazo del historial; si la IA de Dropi la cierra sin gestión, la reabre pidiendo asesor humano;
#    si la guía sigue quieta 48 h después, reabre el caso con un seguimiento. Nunca cancela ni toca pedidos.
R=/home/user/vision360-ui-kit; D=$R/toro-verde/robot-despacho
exec 9>/tmp/quejas.lock; flock -n 9 || { echo QUEJAS_OCUPADO; exit 0; }
cd "$R" && git pull -q --no-rebase origin claude/elegant-volta-3mvkiw 2>/dev/null
mkdir -p /tmp/dropi /tmp/robot/robot
cp "$D"/entrar.js "$D"/quietas.js "$D"/quejar_cas.js "$D"/reabrir_cas.js "$D"/ver_caso.js "$D"/panel/hoy.js /tmp/dropi/
cp "$D"/quejas_cas.py "$D"/quejas_enviar.py /tmp/robot/robot/
# el registro de quejas vive también en el repo, para no repetir quejas si la máquina se reinicia
[ -f /tmp/dropi/quejas_reg.json ] || cp "$D"/datos/quejas_reg.json /tmp/dropi/ 2>/dev/null
cd /tmp/dropi
node entrar.js 2>&1 | tail -1 | grep -q SESION_OK || { echo SESION_DROPI_CAIDA; exit 1; }
DIAS=20 SALIDA=/tmp/dropi/hoy.json timeout 900 node hoy.js 2>&1 | tail -1
timeout 1800 node quietas.js 2>&1 | tail -2
cd /tmp/robot && python3 -I robot/quejas_cas.py | head -1
timeout 6000 python3 -I robot/quejas_enviar.py 2>&1 | tail -45
mkdir -p "$D"/datos && cp /tmp/dropi/quejas_reg.json "$D"/datos/ 2>/dev/null
