# Innovaciones del equipo de tecnología (meta de Ronald: mínimo 3 por semana, probadas y con resultado medido)

## Semana 23 al 29 de noviembre de 2026
| # | Innovación | Problema que resuelve | Prueba | Estado | Resultado |
|---|---|---|---|---|---|
| 1 | Validación automática de más de 4 L (entregas ÷ pedidos ≥ 70 %) | Antes una persona revisaba a mano los pedidos grandes | Probada con los pedidos reales del 25 y 26-11 | Activa | Se mide en la reunión del lunes |
| 2 | Direcciones rurales o sin nomenclatura → oficina de Interrapidísimo, con aviso automático al cliente | Pedidos frenados por direcciones sin número | Probada con los pedidos pendientes | Activa | Se mide en la reunión del lunes |
| 3 | Garantías: se comprueba en Dropi que la persona sí nos compró (pedido ENTREGADO). Si tiene varios pedidos, se le pregunta cuál falló | Reclamos de gente que nunca compró (posible estafa) | Búsqueda en Dropi por celular en 5 tramos de 90 días | Activa | Pendiente: casos sin compra detectados |
| 4 | Pantalla de novedades: resueltas por el bot y por humano, y % entregado de cada grupo | No se sabía si el bot resuelve bien las novedades | — | En cola | — |
| 5 | Recompra del día 30 por código (recompra.py) | Solo 8,1 % vuelve a comprar en 45 días. Causa de raíz: el flujo «RC S4 - Dia 30 otro lote» casi no sale (de 60 clientes con 32-45 días, solo 3 recibieron algo después del día 25) | Modo prueba con datos reales: 1.533 entregados en el día 20-45 sin volver a pedir; 551 en el día 28-35 (sin poma); 80 aptos hoy | Modo prueba: falta que Ronald confirme que RC S4 no lleva descuento | Estimado: si 4 % de los que reciben el mensaje compra, ~70 pedidos y ~$13 millones más al mes |

## Cola de tecnología para Confirma+ (Ronald 27-11: «la gente de tecnología también propone»)
1. **Confirmar en lote**: botón «Confirmar todos los que ya dijeron SÍ» con un solo resumen para revisar.
2. **Plantilla si el chat está cerrado**: cuando «Enviar por Lucid» falla por las 24 h, mandar sola la plantilla «aclarar_dato_pedido_tv» o la de confirmación.
3. **Tiempo de respuesta**: mostrar hace cuánto el cliente no contesta y ordenar primero los más viejos (los que más se enfrían).
4. **Contador del día por persona**: cuántos confirmó cada quien desde la extensión (sale de las notas «✋ … desde el Confirmador»).
5. **Aviso de sonido** cuando entra un pedido nuevo para resolver.

## Análisis 27-11 (Santiago): ¿dónde se pierde más plata?
1. **Recompra** (la más grande): 1.533 clientes entregados en el día 20-45 no han vuelto. Recompra a 45 días: 8,1 % (62 de 762). Ticket promedio $197.687.
2. **Causa de raíz**: los flujos RC S3 (día 25) y RC S4 (día 30) existen en Lucid pero casi no se disparan: 57 de 60 clientes no recibieron ningún mensaje después del día 25.
3. **Arreglo**: recompra.py dispara RC S4 por API una vez al día a quien recibió hace 28-35 días, no volvió a pedir, no tiene queja ni chat en humano, y no compró poma. Precio normal.
