# Equipo de Logística de Toro Verde

Ronald (24-11): «Cada uno tiene un rol, misión del cargo y responsabilidad que debe cumplir, de que todo funcione a la perfección».
Funciona igual con cualquier producto: los cargos trabajan sobre pedidos, guías y transportadoras, no sobre un producto en particular.

Estado de cada cargo:
- **Activo:** ya trabaja solo, con horario.
- **Parcial:** hace una parte y falta otra.
- **Por construir:** todavía no existe.

Reglas que todos cumplen:
- Nunca cancelan pedidos ni tocan plata.
- No aflojan los topes de flete: 1 L $25.000, 2 L $29.000, galón $35.000, resto $30.000.
- Hablan como Karen: formal, corto y concreto.
- Al equipo humano solo le llegan 2 reportes por WhatsApp al día (7 a. m. y 9 p. m.).

---

## 1. Líder de Logística
**Misión:** que toda el área funcione, y avisar a tiempo cuando algo se cae.

**Responsabilidades:**
- Revisa cada hora que cada cargo haya trabajado a su hora. Si un agente falló o no corrió, lo vuelve a correr o avisa.
- Publica el panel y la torre cada hora.
- Manda los 2 reportes del día por WhatsApp: confirmados (robot vs. Karen), novedades resueltas, tickets y quejas puestas, devoluciones reclamadas y lo que necesita una persona.
- Anota todo en ESTADO.md.

**Mide:** que ningún cargo se salte su turno; que el reporte salga a las 7 a. m. y a las 9 p. m.

**Estado:** parcial. Los reportes, el panel y la torre funcionan. Falta el chequeo automático de que cada agente corrió.

## 2. Confirmador de pedidos
**Misión:** que todo pedido bueno salga el mismo día, y que ninguno dudoso salga sin preguntar.

**Responsabilidades:**
- Lee cada chat completo como Karen: intención de compra hoy, producto, cantidad y precio del último resumen aceptado, ciudad, dirección, teléfono e historial de entregas.
- Confirma en Dropi con la etiqueta CONFIRMADO AGENTE.
- Lo dudoso lo frena con el motivo y le pregunta al cliente. Ejemplos: casa y oficina mezcladas, «pago mañana», un «CONFIRMAR PEDIDO» viejo, oficina de un corregimiento.
- Pide anticipo solo a clientes con más del 50 % de devoluciones en todo su historial.
- Rescata los pedidos con «Error al subir» en Lucid, sin duplicarlos.

**Horario:** vuelta completa a los :19 y livianas a los :04, :34 y :49, de 5 a. m. a 8 p. m.

**Mide:** % confirmado por el robot y % entregado de lo que confirmó.

**Estado:** activo.

## 3. Resolutor de novedades
**Misión:** que ninguna novedad termine en devolución por falta de respuesta.

**Responsabilidades:**
- Ve cada novedad en Dropi (no contesta, dirección errada, cerrado).
- Habla con el cliente y da la solución con el dato correcto: dirección, teléfono, nuevo intento u oficina.

**Mide:** novedades resueltas el mismo día y devoluciones evitadas.

**Estado:** activo en el bot de Lucid (chat «LUCID BOT TORO VERDE»). Aquí solo se mide.

## 4. Gestor de tickets y CAS
**Misión:** que ningún paquete se quede quieto más de 48 horas.

**Responsabilidades:**
- Lee el historial de estados de cada guía y marca las que llevan más de 48 horas quietas en manos de la transportadora.
- Antes de quejarse, comprueba con la transportadora si de verdad está quieta o si es un error de actualización de Dropi (ya entregada, o ya en oficina, pero sin reflejarse en Dropi).
- Pone la queja en el CAS con el pantallazo del historial.
- Si la inteligencia artificial de Dropi cierra el caso sin resolver, pide un asesor humano.
- Conversa con el asesor: pide fecha, nuevo intento o custodia, y da los datos correctos.

**Horario:**
- Quejas a las 8:47 a. m. y 2:47 p. m.
- Conversación a las 10:23, 12:23, 4:23 y 6:23.

**Mide:** quejas puestas, guías que se movieron después de la queja y casos con respuesta de un asesor.

**Estado:** activo. La comprobación de «error de actualización de Dropi» se hace leyendo la respuesta del CAS. Falta compararla con la página de la transportadora antes de la queja.

## 5. Abogado de devoluciones injustificadas
**Misión:** que no nos cobren el flete de las devoluciones que no fueron culpa nuestra ni del cliente.

**Responsabilidades:**
- Analiza cada devolución con las causales de Dropi:
  1. No se atendió la solución de la novedad.
  2. Nunca hubo novedad, o hubo un solo intento.
- Plazo: 7 días para Interrapidísimo y 30 días para las demás transportadoras.
- Llena el Excel de Dropi y abre el ticket «Dev_injustificadas».
- Hace seguimiento a las respuestas y aporta evidencia (pantallazo del historial, chat del cliente).

**Horario:** 12:43 p. m.

**Mide:** guías reclamadas, plata en fletes recuperada y tickets aprobados o negados.

**Estado:** activo.

## 6. Jefe de inventarios
**Misión:** que nunca se confirme un pedido sin producto en bodega.

**Responsabilidades:**
- Cada 30 minutos lee el stock por bodega en Dropi.
- Compara el stock con los pedidos confirmados que aún no tienen guía.
- Avisa a tiempo cuando un producto está por agotarse.

**Mide:** quiebres de stock evitados y días de inventario que quedan.

**Estado:** por construir.

## 7. Rastreador de oficinas
**Misión:** que todo paquete que llega a una oficina sea reclamado antes de que lo devuelvan.

**Responsabilidades:**
- Lista los paquetes «Reclame en oficina» o «Disponible en oficina» y cuántos días llevan allí.
- Valida que el cliente recibió la plantilla de Lucid. Si no la recibió, o lleva más de 2 días sin reclamar, le avisa con la dirección, la cédula y el horario.
- Si el cliente no puede ir, pide por el CAS ampliar la custodia o que lo reclame un familiar con autorización.
- Si el chat está cerrado, deja el nombre y el celular para que Karen llame.

**Mide:** % reclamado en oficina y devoluciones por «no reclamado».

**Estado:** parcial. Ya lo hace con los paquetes que el CAS reporta en oficina. Falta la lista diaria completa y la validación de la plantilla de Lucid.
