---
name: confirmar-pedidos-dropi
description: Robot que confirma en Dropi, de forma automática y sin errores, los pedidos contra entrega que llegan por WhatsApp con Lucid Bot (Lucid Sales). Lee el chat de cada cliente, revisa historial de entregas, transportadora, precio, producto, cantidad, dirección y costo del envío, confirma lo que está bien con la etiqueta CONFIRMADO AGENTE, deja lo dudoso en REVISAR HUMANO con el motivo y avisa al equipo por WhatsApp. Tiene una «vuelta liviana» que confirma lo seguro solo con reglas, sin gastar IA. Úsala siempre que alguien quiera confirmar pedidos de Dropi, revisar pedidos pendientes de confirmación, montar o correr el «robot de despacho», dejarlo trabajando solo, pedir abono a clientes que devuelven, o conectar Dropi con Lucid Bot, aunque no diga la palabra «robot» ni «skill».
---

# Robot de despacho: confirmar pedidos de Dropi leyendo Lucid Bot

Este robot hace el trabajo de la persona que confirma pedidos: abre cada pedido en «PENDIENTE CONFIRMACION» de Dropi, busca el chat de ese cliente en Lucid Bot y decide si sale o no. Una confirmación mala cuesta plata (envío de ida y vuelta, producto perdido), así que la regla de oro es: **ante la duda, no se confirma; se deja en REVISAR HUMANO con el motivo**. El robot **nunca cancela** pedidos.

Habla con el dueño en español sencillo, sin jerga: casi siempre es un comerciante, no un programador.

## Paso 0 · Primera vez: configurar con las reglas del dueño

Si no existe `config.json` junto a este archivo (o el dueño pide cambiar reglas), hazle la entrevista. Cada tienda vende productos distintos, así que nada de lo de abajo se adivina. Pregunta en bloques cortos y con ejemplos:

1. **Tienda**: ¿cómo se llama? (sale en los mensajes a los clientes).
2. **Productos**: ¿qué presentaciones vendes y cuántas «unidades» es cada una? Ej.: «UNIDAD = 1, KIT X2 = 2, CAJA X6 = 6». Usa el nombre tal como aparece en la variación de Dropi.
3. **Precios válidos**: todos los totales que pueden ser correctos, incluidos los de promoción (ej. 59.900, 99.900, 53.900). Un pedido de la página con otro total va a revisión.
4. **Precios con descuento** (`precios_descuento`): ¿cuáles de esos precios son descuento? Los descuentos son **solo para clientes que nunca han comprado**: si alguien que ya compró llega con precio de descuento, va a revisión y decide una persona.
5. **Precio según cantidad** (`precios_por_unidades`, opcional): ¿cuánto vale 1 unidad, 2 unidades…? Ej.: `{"1": [59900, 53900], "2": [99900]}`. Con esto el robot puede corregir solo la cantidad cuando Dropi dice 1 y el cliente aceptó 2 en el chat **por el precio exacto de 2**. Si se deja vacío, esos casos van a revisión.
6. **Tope de envío**: ¿cuánto es lo máximo que aceptas pagar de envío para confirmar solo? General y, si quiere, por presentación o por unidades (ej.: 1 unidad $25.000, 2 unidades $29.000, caja $35.000). Y la **tolerancia** (`tolerancia_flete`, por defecto 0.15 = 15 % por encima del tope): con tope $25.000 y 15 %, acepta hasta $28.750. Avísale si su tope queda justo por debajo de una tarifa común de la transportadora (pasa mucho: Interrapidísimo cobra montos fijos por zona).
7. **Clientes que devuelven** (`max_devolucion`, por defecto 0.5): si el cliente devolvió **más del 50 %** de sus pedidos (devoluciones ÷ (entregados + devoluciones), historial de Dropi en todas las tiendas), no se confirma: se le pide un **abono** y una persona valida la plata. Sin historial = se confía.
8. **Pedidos grandes** (`pedido_grande`, opcional): ¿quieres exigir más a pedidos grandes? Ej.: `{"unidades": 4, "min_entrega": 0.7}` = más de 4 unidades solo si el cliente recibe al menos el 70 % de todos sus pedidos. `"unidades": 0` = apagado.
9. **Equipo que recibe los avisos** por WhatsApp: celulares. ¿Quiere el resumen de cada vuelta (`avisos.cada_vuelta: true`) o solo los avisos de plata, como comprobantes de abono (`false`)?
10. **Abono a clientes que devuelven** (opcional): si tiene en Lucid un flujo que pide el abono (audio o texto con los datos para consignar), su número va en `lucid.flujo_anticipo`. Si no tiene, va en 0 y esos pedidos solo quedan en REVISAR HUMANO.
11. **Tiempo de espera de la IA** (`espera_ia_min`, por defecto 120): si un pedido dudoso no lo revisa nadie en ese tiempo, pasa solo a REVISAR HUMANO.
12. **Confirmar en modo humano** (`confirmar_en_humano`, por defecto `false`): si el dueño lo activa, un chat que está atendiendo una persona se confirma igual cuando el cliente aceptó el resumen y todo cuadra. El robot no le escribe a ese cliente para no pisar al equipo.
12. **Credenciales** (no las pidas en el chat): un usuario de Dropi solo para el robot, guardado en las variables de entorno `DU` (correo) y `DP` (clave), y el token de Lucid Bot (variable `LUCID_TOKEN` o archivo `/tmp/robot/lucidbot.key`). Nunca imprimas sus valores.

Los números internos no se le preguntan al dueño: **búscalos tú**.
- `node /tmp/dropi/descubrir_dropi.js` → número de usuario de Dropi.
- Etiquetas: si no existen, créalas con `node /tmp/dropi/tags.js crear "CONFIRMADO AGENTE" "#1e9e3a"` y `... "REVISAR HUMANO" "#d62828"` y usa el id que devuelve.
- `python3 -I /tmp/robot/robot/descubrir_lucid.py` → embudo de pedidos subidos (el de WhatsApp, p. ej. «Pedidos - WhatsApp»; si hay otro de la página, va en `embudos_extra`), campos «Resumen del pedido», «Mensaje_lucidsales», «Id_lucidsales», «shopify_order_id», «Recuperacion_carrito_lograda», el flujo de plantilla de administrador con sus campos «Tipo_notificacion», «Titulo notificacion», «Resumen notificacion», y si existen, el flujo de abono y las plantillas para recordar confirmar con la ventana cerrada.
- `titulo_resumen`: abre un chat y mira cómo empieza el resumen del pedido que manda el bot (por defecto «Resumen de tu pedido»).

Para correr los descubridores antes de tener config, copia primero los scripts: `mkdir -p /tmp/dropi /tmp/robot/robot && cp scripts/*.js scripts/*.json /tmp/dropi/ && cp scripts/*.py scripts/*.sh /tmp/robot/robot/`, y entra a Dropi (`cd /tmp/dropi && node entrar.js`).

Escribe `config.json` siguiendo `config.ejemplo.json` (lo que no aplique va en 0 o vacío) y muéstrale al dueño un resumen en palabras de sus reglas para que lo apruebe.

## Paso 1 · Instalar y entrar

```bash
python3 scripts/instalar.py config.json      # copia el robot a /tmp/dropi y /tmp/robot con las reglas del dueño
cd /tmp/dropi && (npm ls playwright >/dev/null 2>&1 || node -e "require('playwright')" || npm i playwright)
node entrar.js                                # debe decir SESION_OK
```
Si `instalar.py` dice «AVISO … sin valor para», falta algo en `config.json`: complétalo y vuelve a instalar. Si el entorno ya trae Chromium (p. ej. en /opt/pw-browsers), no lo reinstales.

## Paso 2 · Cerebro izquierdo: las reglas (vuelta liviana, sin IA)

```bash
cd /tmp/robot && ROBOT_PAUSA=1 bash robot/robot.sh
```
Con muchos pedidos tarda más de 10 minutos: córrelo en segundo plano con un tiempo límite largo. Solo corre una vuelta a la vez (si otra sigue, dice ROBOT_OCUPADO). Hace, en orden:
- `detalle.js` lee los pendientes de Dropi con el historial del cliente (si la sesión venció, vuelve a entrar solo).
- `telefonos.py`: si el teléfono del pedido no tiene chat en Lucid, busca el WhatsApp desde el que compró (por el número de pedido de Lucid Sales o, si no, por nombre + ciudad) y lo pone en Dropi, con el número original en las notas.
- `decidir.py` lee el chat de cada cliente en Lucid (¿confirmó?, ¿se arrepintió?, ¿pago anticipado?, ¿repetido?, ¿modo humano?).
- `razonar.py` aplica las reglas (`references/reglas.md`) y decide CONFIRMAR, EDITAR_Y_CONFIRMAR (cambiar transportadora, precio o cantidad al del chat) o REVISAR.
- Edita en Dropi lo necesario (Dropi crea un ID nuevo) y repite una vuelta.
- Pone la dirección de la oficina de Interrapidísimo del municipio en pedidos de oficina y en direcciones rurales o sin nomenclatura (`oficinas.py`).
- Pide aclaraciones de dirección, recordatorios de confirmar y el abono a quien devuelve mucho, por Lucid (solo con la ventana de 24 h abierta, o con plantilla aprobada si la hay).
- `revision_auto.py` lee el chat completo de cada pedido que pasaría y **confirma de una lo SEGURO** sin usar IA: el cliente aceptó el último resumen hace menos de 48 h y ciudad, valor, casa/oficina, números de la dirección y cantidad cuadran con Dropi, sin pedir cambios después. A las direcciones rurales les avisa que el pedido va a la oficina.
- Lo que tiene **dudas** queda en `/tmp/dropi/fichas.md` (cada ficha dice la duda). Si nadie lo revisa en `espera_ia_min`, pasa solo a REVISAR HUMANO.

**Dejarlo trabajando solo** (sin IA): `setsid nohup bash /tmp/robot/robot/bucle.sh >/dev/null 2>&1 &` repite la vuelta liviana cada 30 minutos de 5 a. m. a 9 p. m. (cambia el tiempo con `BUCLE_MIN=15`). Para detenerlo: `kill $(cat /tmp/robot/bucle.pid)`. Una sola vuelta: `bash /tmp/robot/robot/vuelta_liviana.sh`.

## Paso 3 · Cerebro derecho: lee solo las fichas con duda, como una persona

Las reglas fallan en casos que una persona ve al instante. Lee **todas** las fichas de `/tmp/dropi/fichas.md` (son solo las dudosas) y pregúntate, en cada una:
- ¿De verdad quiere comprar **este** pedido? La confirmación debe ser posterior al último resumen (o el botón «CONFIRMAR PEDIDO»). Ojo con: un «CONFIRMAR PEDIDO» de un pedido **viejo** (otro mes), un «correcto» que responde a otra pregunta, preguntas de uso sin ningún «sí».
- ¿Producto, cantidad y precio son los que aceptó en el último resumen?
- ¿Ciudad correcta? ¿Dirección con número, barrio o referencia del chat, o «reclama en oficina»? Si mezcla casa y oficina, no se confirma.
- ¿Pidió otra transportadora, otra forma de pago (Addi, cuotas, transferencia) o le falta pagar un abono? No se confirma.
- ¿Le dieron un descuento que no le correspondía (p. ej. a un cliente que ya compró)? Que decida el dueño.

Lo dudoso: `python3 -I robot/vetar.py <id> "<motivo corto y claro>"`. El veto se recuerda en las próximas vueltas (`/tmp/dropi/vetos.json`), mientras viva la máquina; si el contenedor se reinicia y el pedido vuelve a salir, vétalo otra vez.

## Paso 4 · Confirmar y avisar

```bash
cd /tmp/robot && bash robot/confirmar_aprobados.sh
```
Confirma lo aprobado (vuelve a revisar el estado y el historial justo antes), le pone **CONFIRMADO AGENTE**, etiqueta lo demás **REVISAR HUMANO** y avisa al equipo por Lucid. Si el chat de alguien del equipo está cerrado (más de 24 h sin escribir), va por la plantilla de administrador con el resumen adentro, y se le pide responder «REVISADO» para seguir recibiendo avisos.

Si un pedido confirmado tenía «REVISAR HUMANO» de antes, quítasela: `node /tmp/dropi/quitar_tag.js <id> <id_etiqueta_revisar>`.

Verifica en `/tmp/dropi/resultado.json` que cada confirmado quedó en estado PENDIENTE.

## Paso 5 · Contarle al dueño

Respuesta corta: cuántos confirmaron las reglas solas y cuántos tú (con nombres y ciudad), cuántos quedaron en REVISAR HUMANO y por qué, agrupados por motivo con cifras (envío, no confirmó, devuelve/abono, dirección, repetido, pago previo). Si un solo motivo frena muchos pedidos (p. ej. un tope de envío $600 por debajo de la tarifa más común), dilo y propón el ajuste; el dueño decide.

## Cosas que nunca se hacen
- Cancelar pedidos. Lo que no sale queda en REVISAR HUMANO con el motivo.
- Confirmar algo con pago anticipado, abono o Addi sin que una persona valide que la plata llegó.
- Dar o dejar pasar un descuento a un cliente que ya compró: los descuentos son solo para quien nunca ha comprado.
- Aflojar las reglas de plata (precios, topes, devoluciones) por tu cuenta: propón y espera la respuesta del dueño.
- Imprimir o guardar en archivos compartidos las claves de Dropi o el token de Lucid.
- Correr dos robots a la vez sobre la misma tienda (se pisan las ediciones y los avisos salen repetidos).
