# La Bodeguita — Casino (copia del de Toro Verde)

Base: `toro-verde/casino/` (ver `COMO-COPIARLO.md`). Misma máquina, misma secuencia y misma medición;
solo cambian marca, bot de Lucid y tienda de Shopify.

## Dónde vamos (2026-11-23)
- [x] Leída la guía y los archivos del casino de Toro Verde.
- [x] Revisado: la tienda de Shopify conectada hoy es **Toro Verde**, no La Bodeguita.
- [x] Revisado: no hay clave del bot de Lucid de La Bodeguita.
- [ ] **Esperando a Ronald** (lista pedida):
  1. Clave API del bot de Lucid de La Bodeguita, en `lucidbot.key` o como secreto del entorno (nunca en el chat ni en el repo).
  2. Número de WhatsApp de ese bot.
  3. Los 3 productos con su precio normal.
  4. El regalo.
  5. Palabras prohibidas de la marca.
  6. Conectar la tienda de Shopify de La Bodeguita en los conectores de claude.ai.

## Lo que sigue (cuando llegue lo anterior)
2. Buscar en Lucid el embudo de pedidos y el campo del anuncio de La Bodeguita.
3. Página `/pages/premios` en la tienda de La Bodeguita + subir foto y sonidos.
4. Imagen de WhatsApp con el premio en plata («gana hasta $X»).
5. Código de descuento del 10 % (Shopify y bot).
6. Prueba con Playwright.
7. Mensaje de prueba a Ronald → **esperar su visto bueno** antes de enviar a clientes.
8. Programar envíos 10 a. m. y 4 p. m. + recordatorio 9 p. m.
9. Revisar que el bot tome los pedidos con «gané en el casino».

## Reglas fijas
- Descuento máximo 10 %, solo para quien nunca ha comprado (revisar el historial completo del embudo).
- Nunca enviar a quien escribió hace menos de 6 h.
- Nada de rifas (Coljuegos).
- Las claves nunca se imprimen ni se suben al repo.
