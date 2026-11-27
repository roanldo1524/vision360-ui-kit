# Reglas del robot (qué revisa y por qué)

Todas se ajustan en `config.json`; las que no tienen número son fijas porque cuidan plata.

| # | Regla | Si no se cumple |
|---|---|---|
| 1 | **Devoluciones**: se cuenta devoluciones ÷ (entregados + devoluciones) en el historial de Dropi (todas las tiendas). Si pasa de `max_devolucion` (0.5 = 50 %), no se confirma: se le pide un **abono** (si hay `lucid.flujo_anticipo`) y una persona valida la plata. Con 50 % o menos, se confirma. Sin historial = se confía. También frena si Dropi lo marca «Riesgosa» o «Crítica». | REVISAR HUMANO + pedir abono |
| 2 | **Transportadora**: si el cliente pidió una (Envía o Interrapidísimo) va por esa; si es para oficina, Interrapidísimo; si no, la que más le ha entregado a ese cliente; si recibe muy bien con las dos, la más barata. El robot la cambia con «Editar» de Dropi (crea un ID nuevo) y lo confirma en la vuelta siguiente. | Si pidió otra (Servientrega, Coordinadora…), REVISAR |
| 3 | **Precio**: el del último resumen que el cliente aceptó en el chat. Si Dropi tiene otro y es un precio válido (`precios_validos`), lo corrige. | Si no es válido, REVISAR |
| 4 | **Descuento solo para nuevos**: un precio de `precios_descuento` solo vale para quien **nunca** ha comprado. El robot nunca pone un descuento por su cuenta. | Si ya compró, REVISAR (decide el dueño) |
| 5 | **Intención**: el cliente tocó «CONFIRMAR PEDIDO» o dijo sí **después** del resumen. Sin «no / anule / ya no lo quiero». Sin Addi, cuotas, transferencia, Nequi o Daviplata. Chat en modo humano en Lucid = no se toca. | REVISAR (y si solo falta el sí, el robot le escribe una vez para que confirme) |
| 6 | **Producto y cantidad** iguales al último resumen del chat (se comparan las «unidades» de `presentaciones`). Si Dropi tiene otra cantidad de la misma presentación de 1 unidad y el valor del chat es justo el precio de esa cantidad (`precios_por_unidades`), el robot corrige cantidad y precio. | Si cambia la presentación o el valor no cuadra, REVISAR |
| 7 | **Pedido grande** (opcional, `pedido_grande`): más de N unidades solo si el cliente recibe al menos `min_entrega` (p. ej. 70 %) de todos sus pedidos. | REVISAR |
| 8 | **Envío (flete)** dentro del tope + tolerancia: tope de `topes_envio.presentaciones`, luego `topes_envio.unidades`, si no `tope_envio_general`; se acepta `tolerancia_flete` por encima (0.15 = 15 %: tope $25.000 → hasta $28.750). | REVISAR |
| 9 | **Dirección clara**: a domicilio con vía y número. Oficina = «dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO» (el robot pone la dirección de la oficina del municipio). Vereda, finca, km o sin nomenclatura = va a la oficina de Interrapidísimo del municipio y se le avisa al cliente. Ninguna dirección que nombre otra transportadora. | Si no se conoce la oficina del municipio, REVISAR (y el robot le pide la dirección por Lucid) |
| 10 | **Nombre normal**. Un apellido repetido («López López») es normal y **no** frena. Solo frena un nombre vacío, muy corto o pegado a sí mismo («juanjuan»). | REVISAR (y el robot le pide el nombre) |
| 11 | No hay otro pedido abierto del mismo teléfono ni pedido repetido en Lucid. Si una persona ya le puso otra etiqueta en Dropi, no se toca. | REVISAR |
| — | **Vuelta liviana (sin IA)**: `revision_auto.py` confirma solo lo SEGURO (aceptó el último resumen hace menos de 48 h, y ciudad, valor, casa/oficina, números de la dirección y cantidad cuadran). Lo demás va a fichas para la IA; si nadie lo revisa en `espera_ia_min`, pasa a REVISAR HUMANO. | — |
| — | Nunca cancela. Lo confirmado lleva CONFIRMADO AGENTE; lo dudoso, REVISAR HUMANO con el motivo. Plata (abonos, Addi, comprobantes) siempre la valida una persona. | — |

## Errores reales que la lectura humana atrapó (para tenerlos presentes)
- «CONFIRMAR PEDIDO» de un pedido de hace un mes tomado como confirmación del de hoy.
- Pedido de la página donde el cliente solo preguntaba cómo usar el producto y escribió «correcto…» respondiendo a otra cosa.
- Zona con anticipo de envío que el cliente dijo pagar «mañana».
- Cliente que ya había comprado y recibió un descuento pensado solo para clientes nuevos.
- Dirección que mezclaba casa con número y «reclama en oficina».
- Tope de envío para 2 unidades en $28.000 cuando la tarifa más común era $28.645: frenaba casi todos (por eso existe la tolerancia).
- Cliente que aceptó 2 unidades en el chat pero el pedido subió a Dropi con 1: ahora se corrige solo si el precio del chat es el de 2 unidades.
- Clientes frenados por «nombre raro» solo por tener los dos apellidos iguales.
