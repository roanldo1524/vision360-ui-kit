# Remarketing fuerte — 27-11-2026

Ronald: «vamos para ello… ajusta los mensajes… remarketing con un excelente precio».

Reglas que se cumplen:
- Descuento máximo 10 %, y solo para quien **nunca ha comprado**.
- A clientes que ya compraron: precio normal.
- Nadie con pedido en los últimos 15 días, en posventa o en garantía, ni quien dijo NO.

## Por qué hacen falta 2 plantillas
Por la API de Lucid solo se le puede escribir texto libre a quien escribió en las últimas 24 horas. A los demás contactos (Lucid tiene unos 48.000) solo les llega una **plantilla aprobada por Meta**. Esas las crea Ronald en Lucid, porque la API no deja crearlas. Cuando estén aprobadas y tengan su flujo, el envío por listas lo hago yo (en tandas de 500 cada 30 min, para cuidar el número).

## Plantilla 1 — `promo_dia_toroverde` (Marketing) · leads que nunca compraron
Variable {{1}}: nombre.

```
Hola {{1}} 👋 Hoy tiene el mejor precio de Toro Verde: 10 % menos en todas las presentaciones, solo hasta la medianoche.

✅ Paga cuando lo reciba, en su casa o en la oficina de Interrapidísimo de su pueblo
🌽 Semilla de maíz criollo de regalo
💪 El galón es el que más rinde para su finca

¿Se lo despachamos hoy?

Si no quiere recibir promociones, responda NO.
```
Botones (respuesta rápida): `Quiero el galón` · `Quiero 1 litro` · `No, gracias`

Flujo al tocar un botón:
- «Quiero el galón» / «Quiero 1 litro» → etiqueta «💸 PROMO 10% _ CAMBIAR PRECIO EN DROPI» (218934) y pasa al bot de venta, que pregunta el municipio.
- «No, gracias» → etiqueta de no enviar.

## Plantilla 2 — `segunda_aplicacion_toroverde` (Marketing) · clientes que compraron hace 2 meses o más (precio normal)
```
Hola {{1}} 🌱 Ya pasaron más de 2 meses desde su Toro Verde: es el momento de la segunda aplicación, antes de que la maleza vuelva a coger fuerza.

¿Le despachamos hoy? Paga cuando lo reciba 📦

Recuerde: agite el envase y use mínimo 130 ml por bomba de 20 litros.

Si no quiere recibir mensajes, responda NO.
```
Botones: `Sí, el galón` · `Sí, 1 litro` · `Ahora no`

## Lo que queda listo de mi lado
- Listas: clientes con último pedido hace 60 días o más (~1.440) y la lista de exclusión (pedido en 15 días, garantía, NO).
- Regla del bot con los precios de la promo solo para quien llega por la plantilla 1: 1 L $89.100, 2 L $152.100, galón $242.100, poma $895.500.
- Etiqueta PROMO 10 % para corregir el precio en Dropi (Dropi no toma el precio que manda Lucid).
