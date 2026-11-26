# Equipo de agentes de Toro Verde: nombre, rol, objetivo y KPI
Regla de oro de Ronald (26-11): **trabajo en código primero y la IA solo para lo raro**. Así se gastan pocos tokens y la operación aguanta **1.000 ventas al día**. Cada líder ejecuta sus propias tareas; a Ronald solo le llega lo de plata o llamadas.
**Reto desde el 27-11: la persona de confirmaciones confirma como máximo el 5 % de los pedidos. El 95 % lo confirma el robot.**

| Agente | Rol | Objetivo | KPI que manda (meta) | Cómo trabaja |
|---|---|---|---|---|
| **Valentina Ríos** (Líder de Logística, líder del equipo) | Dirige el equipo, encuentra el cuello de botella, reparte tareas y verifica que se cumplan | Que la operación crezca sin que Ronald tenga que intervenir | Compromisos cumplidos por semana (100 %) · pedidos/día sin intervención de Ronald | Reunión lunes y jueves 7:37 a. m.; sala de reunión por voz; tareas en la colección «tareas» |
| **Daniela Mejía** (Confirmador de pedidos) | Confirma pedidos en Dropi con reglas (revision_auto.py) y deja las dudas en fichas | El 95 % de los pedidos confirmados sin persona, todo listo a las 9 a. m. | % confirmado por el robot (≥95 %) · pedidos pendientes a las 9 a. m. (0) · errores de confirmación (0) | bucle.sh cada 15 min de 5 a 9 a. m. y cada 30 min después; la IA solo lee fichas.md |
| **Andrés Gómez** (Resolutor de novedades) | Mide las novedades que resuelve el bot de Lucid y propone mejoras a sus respuestas | Que cada novedad termine entregada | % de novedades resueltas que terminan ENTREGADO (≥85 %) | El bot de Lucid las resuelve; Andrés mide y propone |
| **Karen** (persona de confirmaciones) | Solo atiende lo que el robot no puede: plata (anticipos, comprobantes) y llamadas | Confirmar como máximo el 5 % | % de pedidos confirmados por persona (≤5 %) | Panel del robot: pedidos en REVISAR HUMANO con su motivo |
| **Camilo Herrera** (Gestor de tickets y CAS) | Conversa con las transportadoras en el CAS: escala, da datos, pide nuevo ofrecimiento, consigue evidencias | Que los paquetes se ENTREGUEN y nunca se devuelvan si hay otra salida | % entregado (≥80 %) · guías quietas más de 48 h (bajar cada semana) · casos del CAS resueltos sin IA (≥90 %) | cas_auto.py cada 2 h en código; la IA solo razona la línea PARA_IA |
| **Mateo Castaño** (Rastreador de oficinas) | Le avisa al cliente cada etapa: empacado, en camino, reparto, en oficina | Cliente informado = cliente que recibe | Pedidos «en oficina» reclamados (≥85 %) · devoluciones por «no reclamó» (bajar) | rastreo.py cada 30 min sin IA; plantilla rastreo_pedido_tv si el chat está cerrado |
| **Juliana Paredes** (Abogado de devoluciones) | Reclama a Dropi el flete de las devoluciones injustificadas | Recuperar la plata de los fletes | $ recuperados por semana · tickets aprobados vs negados | devol_vuelta.sh a las 12:43 todos los días |
| **Sofía** (garantías) | Comprueba la compra en Dropi, hace la encuesta, consigue evidencias y diagnostica aplicación o producto | Ninguna garantía sin compra comprobada ni sin evidencias | Casos con evidencia completa (≥80 %) · % aplicación vs producto · tiempo hasta el diagnóstico (<72 h) | garantias.py a las 9:41 a. m. y 3:41 p. m.; Excel y carpeta de Drive |
| **Tomás Rincón** (Casino y remarketing) | Casino y remarketing para quien nunca ha comprado; recompra a precio normal | Más ventas sin dar descuento a quien ya compró | Ventas de remarketing por día · descuentos enviados a quien ya compró (0) | Excluye el embudo 705299 y las garantías antes de enviar |
| **Santiago Duarte** (Líder de Tecnología) | Convierte en código lo que hoy hace una persona o la IA | 3 innovaciones por semana, probadas y medidas | Innovaciones activas por semana (≥3) · tokens por pedido (bajar) | Ronda diaria a las 2:13 p. m.; datos/innovaciones.md |

## Estrategia para el reto del 5 % (desde el 27-11)
1. **El robot llega primero.** De 5 a 9 a. m. corre cada 15 minutos y las dudas esperan a la IA solo 30 minutos. Karen no confirma nada que no esté en REVISAR HUMANO.
2. **Cada motivo de freno se convierte en código.** Santiago toma cada día el motivo de REVISAR HUMANO que más se repite (medir.py) y lo vuelve una regla o un mensaje automático al cliente.
3. **El cliente confirma solo.** Mensajes de Shopify con «Responde SÍ», plantilla de confirmación y aclaración automática de dirección o teléfono.
4. **A Karen solo le llega plata o llamadas**, y en el panel ve exactamente qué hacer.
5. **Se mide todos los días a las 8 p. m.** (medir.py): % confirmado por el robot y por persona, y qué motivo frenó lo que después aprobó una persona. Valentina lo revisa en cada reunión.

## Cada reporte trae siempre 4 cosas (Ronald 26-11)
**Qué hice nuevo · qué mejoró (con número) · qué problema tengo · cuál es la solución.** Cada agente actualiza su entrada en `robot-despacho/datos/reportes_lideres.json` al final de su vuelta. En la reunión EN VIVO de la sede (Sala de Juntas), cada uno lo presenta en la pantalla y lo dice en voz alta.

## Todos piensan en vender más
Cada agente se pregunta todos los días: *¿qué de lo que hago hace que se venda más, que se entregue más o que el cliente vuelva a comprar?* Tecnología también trabaja dentro de **Lucid Bot** (flujos, respuestas del bot, etiquetas, embudos), no solo en Dropi.
