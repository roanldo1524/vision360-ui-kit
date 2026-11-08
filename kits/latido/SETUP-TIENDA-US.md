# Latido: tienda nueva (1642qf-0h.myshopify.com, USD, EE. UU.)

## Ya hecho por Claude
- Producto "Latido - Sorpresa de cumpleaños con tu voz": 15.00 USD, sin envío, sin inventario, publicado en Tienda online, plantilla `latido`.
- Variante conectada al botón: 68126580441275.
- Páginas: /pages/latido, /pages/latido-gracias, /pages/politica-de-reembolsos, /pages/politica-de-privacidad, /pages/terminos-del-servicio.
- Mercado "Latinoamérica": CO, MX, AR, CL, PE, EC, BO, PY, UY, CR, PA, GT, SV, HN, NI, DO, US, ES.
- Tema "Latido" (sin publicar) con las plantillas product.latido, page.latido y page.latido-gracias, y las 6 fotos en Archivos.

## Lo que hace el dueño (Shopify no deja hacerlo por API)
1. Configuración > Detalles de la tienda: nombre "Latido", correo, dirección de la LLC (7901 4th St N #35006, St. Petersburg, FL 33702).
2. Configuración > Pagos: activar Shopify Payments (EIN, cuenta bancaria de la LLC, datos del dueño).
3. Configuración > Políticas: pegar los textos de las 3 páginas de política (o usar "Crear con plantilla").
4. Configuración > Checkout: pedir teléfono (obligatorio) y activar "Autocompletar".
5. Configuración > Notificaciones > Confirmación de pedido: añadir el botón de WhatsApp (ver abajo).
6. Temas: publicar el tema "Latido".
7. Dominio propio (Configuración > Dominios) y píxel de Meta (Canales > Facebook e Instagram).
8. Menú/pie: enlazar las 3 políticas.

## Botón para el correo de confirmación de pedido
Pegar cerca del inicio del cuerpo:

    <p><strong>Un paso más:</strong> envíanos tu audio por WhatsApp para armar tu sorpresa.</p>
    <p><a href="https://wa.me/573217493251?text=Hola%2C%20ya%20pagu%C3%A9%20mi%20sorpresa%20Latido.%20Pedido%20{{ order.name }}.%20Aqu%C3%AD%20va%20mi%20audio%3A" style="background:#FF5C93;color:#2A0A1B;padding:14px 22px;border-radius:99px;text-decoration:none;font-weight:700">Enviar mi audio por WhatsApp</a></p>
