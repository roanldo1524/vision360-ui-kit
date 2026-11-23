# Reglas del robot (qué revisa y por qué)

Todas se ajustan en `config.json`; las que no tienen número son fijas porque cuidan plata.

| # | Regla | Si no se cumple |
|---|---|---|
| 1 | El cliente recibe **más** de `min_entrega` (0.5 = 50 %) de sus pedidos, según el historial de Dropi en todas las tiendas. Sin historial = se confía. También frena si Dropi lo marca «Riesgosa» o «Crítica». | REVISAR HUMANO |
| 2 | Transportadora: si el cliente pidió una (Envía o Interrapidísimo) va por esa; si es para oficina, Interrapidísimo; si no, la que más le ha entregado a ese cliente; si recibe muy bien con las dos, la más barata. El robot la cambia con «Editar» de Dropi (crea un ID nuevo) y lo confirma en la vuelta siguiente. | Si pidió otra (Servientrega, Coordinadora…), REVISAR |
| 3 | Precio: el del último resumen que el cliente aceptó en el chat. Si Dropi tiene otro y es un precio válido (`precios_validos`), lo corrige. | Si no es válido, REVISAR |
| 4 | Intención: el cliente tocó «CONFIRMAR PEDIDO» o dijo sí **después** del resumen. Sin «no / anule / ya no lo quiero». Sin Addi, cuotas, transferencia, Nequi o Daviplata. Chat en modo humano en Lucid = no se toca. | REVISAR (y si solo falta el sí, el robot le escribe una vez para que confirme) |
| 5 | Producto y cantidad iguales al chat (se comparan las «unidades» de `presentaciones`). | REVISAR |
| 6 | Envío (flete) dentro del tope: primero `topes_envio.presentaciones`, luego `topes_envio.unidades`, si no `tope_envio_general`. | REVISAR |
| 7 | Dirección clara: a domicilio con vía y número (o vereda, finca, km…); oficina = «RECLAMA EN OFICINA INTERRAPIDÍSIMO». Ninguna dirección que nombre otra transportadora. Nombre normal. | REVISAR (y el robot le pide la dirección por Lucid) |
| 8 | No hay otro pedido abierto del mismo teléfono ni pedido repetido en Lucid. Si una persona ya le puso otra etiqueta en Dropi, no se toca. | REVISAR |
| — | Nunca cancela. Lo confirmado lleva CONFIRMADO AGENTE; lo dudoso, REVISAR HUMANO con el motivo. | — |

## Errores reales que la lectura humana atrapó (para tenerlos presentes)
- «CONFIRMAR PEDIDO» de un pedido de hace un mes tomado como confirmación del de hoy.
- Pedido de la página donde el cliente solo preguntaba cómo usar el producto y escribió «correcto…» respondiendo a otra cosa.
- Zona con anticipo de envío que el cliente dijo pagar «mañana».
- Cliente que ya había comprado y recibió un descuento pensado solo para clientes nuevos.
- Dirección que mezclaba casa con número y «reclama en oficina».
- Tope de envío para 2 unidades en $28.000 cuando la tarifa más común era $28.645: frenaba casi todos.
