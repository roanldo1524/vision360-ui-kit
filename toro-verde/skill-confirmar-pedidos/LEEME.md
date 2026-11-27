# Robot de despacho para Dropi + Lucid Bot

Confirma solo los pedidos contra entrega que están bien y deja los dudosos con «REVISAR HUMANO». Nunca cancela pedidos.

## Cómo instalarlo
1. En Claude (claude.ai o Claude Code) instala el archivo `confirmar-pedidos-dropi.skill` (botón «Guardar skill» o en Ajustes → Skills). Si te pide un .zip, usa `robot-despacho-dropi.zip` (es el mismo).
2. Crea en Dropi un usuario solo para el robot y guarda su correo y clave en las variables del entorno `DU` y `DP`. Ten a mano el token de tu Lucid Bot.
3. Escríbele a Claude: «configura el robot de despacho». Te va a preguntar tus productos, precios, cuáles son de descuento, tope de envío y quién recibe los avisos. Los números internos de Dropi y Lucid los busca él.
4. Luego: «confirma los pedidos de hoy».
5. Si quieres que trabaje solo sin gastar IA: «deja el robot trabajando solo».

## Qué hay de nuevo
- **Vuelta liviana sin IA**: las reglas confirman solas los pedidos seguros (cliente aceptó el resumen y todo cuadra). La IA solo lee los dudosos, y si nadie los revisa a tiempo pasan solos a REVISAR HUMANO.
- **Se puede dejar trabajando solo**: repite la vuelta cada 30 minutos, de 5 a. m. a 9 p. m.
- **Tolerancia en el envío**: acepta un poco más que el tope (por defecto 15 %), para no frenar pedidos por unos pesos.
- **Clientes que devuelven**: solo se frena si devolvió más de la mitad de sus pedidos; a ellos se les pide un abono y una persona valida la plata.
- **Direcciones rurales** (vereda, finca, sin número): el pedido va a la oficina de Interrapidísimo del municipio y se le avisa al cliente. Si no se conoce la oficina, va a revisión.
- **Oficinas**: la dirección queda con el punto real de Interrapidísimo más «RECLAMA EN OFICINA INTERRAPIDÍSIMO».
- **Cantidad corregida**: si en el chat aceptó 2 y Dropi dice 1, se corrige solo cuando el precio del chat es justo el de 2.
- **Teléfono distinto**: si el cliente compró desde otro WhatsApp, el robot lo encuentra y lo pone en Dropi (el original queda en las notas).
- **Pedidos grandes** (opcional): más unidades solo a clientes que reciben bien.
- **Descuentos solo para clientes nuevos**: si alguien que ya compró llega con precio de descuento, decide una persona.
- Ya no frena a clientes con apellidos iguales («López López»).
- Una sola vuelta a la vez, para que no se pisen.
