# Robot de despacho para Dropi + Lucid Bot

Confirma solo los pedidos contra entrega que están bien y deja los dudosos con «REVISAR HUMANO».

Cómo instalarlo:
1. En Claude (claude.ai o Claude Code) instala el archivo `confirmar-pedidos-dropi.skill` (botón «Guardar skill» o en Ajustes → Skills).
2. Crea en Dropi un usuario solo para el robot y guarda su correo y clave en las variables del entorno `DU` y `DP`. Ten a mano el token de tu Lucid Bot.
3. Escríbele a Claude: «configura el robot de despacho». Te va a preguntar tus productos, precios, tope de envío y quién recibe los avisos. Los números internos de Dropi y Lucid los busca él.
4. Luego: «confirma los pedidos de hoy».
