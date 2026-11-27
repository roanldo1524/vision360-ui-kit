# Confirma+ para Dropi (v3.0)

Dropi con esteroides para confirmar pedidos, **sin IA y sin salir de Dropi**.

## Qué hace
- Botón **⚡ Confirma+** abajo a la derecha en Dropi. Abre un panel con TODOS los pedidos pendientes de confirmar.
- Arriba: cuántos hay por confirmar, cuántos necesitan acción y cuántos está revisando el robot.
- Filtros por tipo de acción (Llamar, Pago, Precio, Dirección, Chat abierto…) y buscador.
- Cada pedido trae:
  - **Qué hacer, paso por paso** y quién lo hace.
  - **Mensaje listo para el cliente** (tono de Karen): botón «Enviar mensaje» abre WhatsApp con el texto ya escrito, o «Copiar mensaje».
  - Historial del cliente (recibe X de Y) y por qué lo frenó el robot.
  - Botones: **✅ Confirmar pedido**, **💲 Precio a $X** (cuando el chat dice otro precio, también Black Friday y ruleta), **💬 Chat Lucid**.
- Cada acción queda anotada en las notas del pedido («✋ … desde el Confirmador»). Nunca cancela.
- Debajo de cada pedido de la lista de Dropi aparece también el recuadro naranja con qué hacer.

## Instalar (una sola vez)
1. Descomprime `extension-dropi.zip`.
2. Chrome → `chrome://extensions` → prende **Modo de desarrollador**.
3. **Cargar descomprimida** → elige la carpeta. (Si ya estaba, toca 🔄 «Actualizar» en la extensión.)
4. Abre Dropi → Mis Pedidos → toca **⚡ Confirma+**.
5. La primera vez que toques «Chat Lucid», pega la dirección de cualquier chat abierto en Lucid.

## Versión 3.0
- Universal: sirve para cualquier tienda de Dropi. Si hay un robot que deja notas («🤖 ROBOT …»), las usa; si no, la extensión revisa sola historial, dirección y repetidos.
- Filtro «Para ti»: solo lo que necesita una persona. Íconos y colores propios.

## Versión 4.0: configurable y con Lucid
- Toca el ícono de la extensión (arriba en Chrome) para abrir la **Configuración**:
  - **Clave de la API de Lucid** (opcional; se guarda solo en ese Chrome y nunca pasa a la página de Dropi).
  - **Enlace de un chat de Lucid**, **nombre de quien atiende**, **nombre de la tienda** y **código del país**.
  - Botón **Probar conexión con Lucid**.
- Con la clave de Lucid, cada pedido trae **Ver chat** (los últimos mensajes del cliente dentro de Dropi) y **Enviar por Lucid** (manda el mensaje listo; si el chat lleva más de 24 h cerrado, avisa que uses WhatsApp).
- Sirve para cualquier tienda: cada una pone su clave y sus datos.

## Versión 4.1
- **Ver y escribir chat**: el chat del cliente dentro de Dropi, con caja para escribirle y enviar por Lucid.
- **Análisis real del chat** (con la clave de Lucid): dice si el cliente ya dijo SÍ, si no ha respondido o si dijo que no.
- **Solo pedidos de Lucid Bot** en el panel.
- **Abrir chat y acciones** desde el recuadro naranja de cada pedido en la lista de Dropi, aunque el panel esté cerrado.
- Ventana grande y clara para conectar el botón «Abrir en Lucid».

## Versión 4.2
- El pedido con novedad se **resalta en la lista de Dropi**: fila naranja, etiqueta «⚠ POR RESOLVER» junto al número y recuadro con el número de pedido, qué hacer y botones.
- **Aviso de voz**: cuando entra un pedido nuevo para resolver suena un timbre y una voz dice «Nuevo pedido por confirmar» (revisa cada 3 minutos aunque el panel esté cerrado). Chrome solo deja sonar después de que hayas hecho clic una vez en la página.

## Versión 4.3
- **«Abrir chat»** abre el chat ahí mismo, dentro de Dropi (ya no lleva a Lucid). Busca el chat EXACTO del pedido por su número de pedido de Lucid; si no lo encuentra con certeza, no abre ninguno (para no escribirle a otra persona). Arriba del chat dice de quién es: nombre, teléfono y pedido.
- Cada pedido dice primero **el problema** en una frase sencilla (en rojo) y después **«Haz esto»** paso a paso. El detalle técnico del robot queda escondido en «Ver detalle del robot».
- La voz de aviso dice el nombre de quien atiende: «Karen, nuevo pedido por confirmar» (se pone en Configuración).
