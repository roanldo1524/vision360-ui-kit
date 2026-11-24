# Revisión de «Error al subir» en Lucid (revisar.sh)
Va en la carpeta de trabajo S, junto a `lucidbot.key` (nunca en el repo). Se corre: `bash $S/revisar.sh`.
- Lee el embudo 705299 y toma los pedidos en «Error al subir» de las últimas 26 h.
- `ya_subidos.txt`: contactos que ya se resubieron una vez (no se resuben para no duplicar).
- `no_subir.txt`: contactos que nunca se resuben.
- Si imprime OJO_CANTIDAD, no se toca: avisar a Ronald con nombre y celular.
- Al final corre `promo_tag.sh` y `promo_tag2.sh`.
Copiar los 5 archivos a S antes de correrlo.
