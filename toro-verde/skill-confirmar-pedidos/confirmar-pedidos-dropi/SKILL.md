---
name: confirmar-pedidos-dropi
description: Robot que confirma en Dropi, de forma automática y sin errores, los pedidos contra entrega que llegan por WhatsApp con Lucid Bot (Lucid Sales). Lee el chat de cada cliente, revisa historial de entregas, transportadora, precio, producto, dirección y costo del envío, confirma lo que está bien con la etiqueta CONFIRMADO AGENTE, deja lo dudoso en REVISAR HUMANO con el motivo y avisa al equipo por WhatsApp. Úsala siempre que alguien quiera confirmar pedidos de Dropi, revisar pedidos pendientes de confirmación, montar o correr el «robot de despacho», bajar devoluciones de contra entrega, o conectar Dropi con Lucid Bot, aunque no diga la palabra «robot» ni «skill».
---

# Robot de despacho: confirmar pedidos de Dropi leyendo Lucid Bot

Este robot hace el trabajo de la persona que confirma pedidos: abre cada pedido en «PENDIENTE CONFIRMACION» de Dropi, busca el chat de ese cliente en Lucid Bot y decide si sale o no. Una confirmación mala cuesta plata (envío de ida y vuelta, producto perdido), así que la regla de oro es: **ante la duda, no se confirma; se deja en REVISAR HUMANO con el motivo**. El robot **nunca cancela** pedidos.

Habla con el dueño en español sencillo, sin jerga: casi siempre es un comerciante, no un programador.

## Paso 0 · Primera vez: configurar con las reglas del dueño

Si no existe `config.json` junto a este archivo (o el dueño pide cambiar reglas), hazle la entrevista. Cada tienda vende productos distintos, así que nada de lo de abajo se adivina. Pregunta en bloques cortos y con ejemplos:

1. **Tienda**: ¿cómo se llama? (sale en los mensajes a los clientes).
2. **Productos**: ¿qué presentaciones vendes y cuántas «unidades» es cada una? Ej.: «LITRO = 1, 2 LITROS = 2, GALON = 4». Usa el nombre tal como aparece en la variación de Dropi.
3. **Precios válidos**: todos los totales que pueden ser correctos, incluidos los de promoción (ej. 99.000, 169.000, 89.100). Un pedido de la página con otro total va a revisión.
4. **Tope de envío**: ¿cuánto es lo máximo que aceptas pagar de envío para confirmar solo? General y, si quiere, por presentación o por unidades (ej.: 1 unidad $25.000, 2 unidades $29.000, galón $35.000). Avísale si su tope queda justo por debajo de una tarifa común de la transportadora (pasa mucho: Interrapidísimo cobra montos fijos por zona).
5. **Clientes que devuelven**: ¿desde qué porcentaje de entregas se confía? Por defecto solo se confirma si recibe **más del 50 %** (historial de Dropi, todas las tiendas).
6. **Equipo que recibe el resumen** por WhatsApp: celulares.
7. **Credenciales** (no las pidas en el chat): un usuario de Dropi solo para el robot, guardado en las variables de entorno `DU` (correo) y `DP` (clave), y el token de Lucid Bot (variable `LUCID_TOKEN` o archivo `/tmp/robot/lucidbot.key`). Nunca imprimas sus valores.

Los números internos no se le preguntan al dueño: **búscalos tú**.
- `node /tmp/dropi/descubrir_dropi.js` → número de usuario de Dropi.
- Etiquetas: si no existen, créalas con `node /tmp/dropi/tags.js crear "CONFIRMADO AGENTE" "#1e9e3a"` y `... "REVISAR HUMANO" "#d62828"` y usa el id que devuelve.
- `python3 -I /tmp/robot/robot/descubrir_lucid.py` → embudo de pedidos subidos (el de WhatsApp, p. ej. «Pedidos - WhatsApp»), campos «Resumen del pedido», «Mensaje_lucidsales», «shopify_order_id», «Recuperacion_carrito_lograda» y el flujo de plantilla de administrador con sus campos «Tipo_notificacion», «Titulo notificacion», «Resumen notificacion».

Para correr los descubridores antes de tener config, copia primero los scripts: `mkdir -p /tmp/dropi /tmp/robot/robot && cp scripts/*.js scripts/transportadoras.json /tmp/dropi/ && cp scripts/*.py scripts/*.sh /tmp/robot/robot/`, y entra a Dropi (`cd /tmp/dropi && node entrar.js`).

Escribe `config.json` siguiendo `config.ejemplo.json` (lo que no aplique va en 0) y muéstrale al dueño un resumen en palabras de sus reglas para que lo apruebe.

## Paso 1 · Instalar y entrar

```bash
python3 scripts/instalar.py config.json      # copia el robot a /tmp/dropi y /tmp/robot con las reglas del dueño
cd /tmp/dropi && (npm ls playwright >/dev/null 2>&1 || node -e "require('playwright')" || npm i playwright)
node entrar.js                                # debe decir SESION_OK
```
Si el entorno ya trae Chromium (p. ej. en /opt/pw-browsers), no lo reinstales.

## Paso 2 · Cerebro izquierdo: las reglas

```bash
cd /tmp/robot && ROBOT_PAUSA=1 bash robot/robot.sh
```
Con muchos pedidos tarda más de 10 minutos: córrelo en segundo plano con un tiempo límite largo. Hace, en orden:
- `detalle.js` lee los pendientes de Dropi con el historial del cliente (si la sesión venció, vuelve a entrar solo).
- `decidir.py` lee el chat de cada cliente en Lucid (¿confirmó?, ¿se arrepintió?, ¿pago anticipado?, ¿repetido?, ¿modo humano?).
- `razonar.py` aplica las reglas (`references/reglas.md`) y decide CONFIRMAR, EDITAR_Y_CONFIRMAR (cambiar transportadora o precio al del chat) o REVISAR.
- Edita en Dropi lo necesario (Dropi crea un ID nuevo) y repite una vuelta.
- Pide aclaraciones de dirección y recordatorios de confirmar por Lucid (solo con la ventana de 24 h abierta).
- Se detiene y deja `/tmp/dropi/fichas.md`: una ficha por pedido que pasaría.

## Paso 3 · Cerebro derecho: lee cada ficha como una persona

Las reglas fallan en casos que una persona ve al instante. Lee **todas** las fichas y pregúntate, en cada una:
- ¿De verdad quiere comprar **este** pedido? La confirmación debe ser posterior al último resumen (o el botón «CONFIRMAR PEDIDO»). Ojo con: un «CONFIRMAR PEDIDO» de un pedido **viejo** (otro mes), un «correcto» que responde a otra pregunta, preguntas de uso sin ningún «sí».
- ¿Producto, cantidad y precio son los que aceptó en el último resumen?
- ¿Ciudad correcta? ¿Dirección con número, barrio o referencia del chat, o «reclama en oficina»? Si mezcla casa y oficina, no se confirma.
- ¿Pidió otra transportadora, otra forma de pago (Addi, cuotas, transferencia) o le falta pagar un anticipo? No se confirma.
- ¿Le dieron un descuento que no le correspondía (p. ej. a un cliente que ya compró)? Que decida el dueño.

Lo dudoso: `python3 -I robot/vetar.py <id> "<motivo corto y claro>"`. El veto se recuerda en las próximas vueltas (`/tmp/dropi/vetos.json`), mientras viva la máquina; si el contenedor se reinicia y el pedido vuelve a salir, vétalo otra vez.

## Paso 4 · Confirmar y avisar

```bash
cd /tmp/robot && bash robot/confirmar_aprobados.sh
```
Confirma lo aprobado (vuelve a revisar el estado y el historial justo antes), le pone **CONFIRMADO AGENTE**, etiqueta lo demás **REVISAR HUMANO** y manda el resumen al equipo por Lucid. Si el chat de alguien del equipo está cerrado (más de 24 h sin escribir), va por la plantilla de administrador con el resumen adentro, y se le pide responder con un punto para seguir recibiendo avisos.

Si un pedido confirmado tenía «REVISAR HUMANO» de antes, quítasela: `node /tmp/dropi/quitar_tag.js <id> <id_etiqueta_revisar>`.

Verifica en `/tmp/dropi/resultado.json` que cada confirmado quedó en estado PENDIENTE.

## Paso 5 · Contarle al dueño

Respuesta corta: cuántos confirmaste (con nombres y ciudad), cuántos quedaron en REVISAR HUMANO y por qué, agrupados por motivo con cifras (envío, no confirmó, devuelve, dirección, repetido, pago previo). Si un solo motivo frena muchos pedidos (p. ej. un tope de envío $600 por debajo de la tarifa más común), dilo y propón el ajuste; el dueño decide.

## Cosas que nunca se hacen
- Cancelar pedidos o confirmar algo con pago anticipado sin que una persona valide que la plata llegó.
- Imprimir o guardar en archivos compartidos las claves de Dropi o el token de Lucid.
- Cambiar las reglas del dueño por tu cuenta: propón y espera su respuesta.
- Correr dos robots a la vez sobre la misma tienda (se pisan las ediciones y los avisos salen repetidos).
