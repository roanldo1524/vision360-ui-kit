# Página de ventas: imán de pesca (traído del chat anterior)

## Tienda
- Tienda Shopify "Yunabi", dominio alcomprar.shop (Colombia, COP, plan Basic).
- Producto: "Iman de pesca", gid://shopify/Product/9434116686037, plantilla `product.iman-de-pesca`.
- Link de los anuncios: https://alcomprar.shop/products/iman-de-pesca
- WhatsApp: 323 308 0393 (573233080393).
- Meta: vender 5.000 unidades en 2 meses (unas 83 al día).

## Producto y oferta
- Imán de neodimio de 60 mm, 140 kg de fuerza (probado con máquina hidráulica, halando derecho hacia arriba).
- Regalos: cuerda roja de 10 m con mosquetón, y la guía digital "Entierros y Oro" (24 páginas, se muestra con valor $39.900).
- Precios en EasySell: 1 imán $109.000 · 2 imanes $172.900 · 3 imanes $229.200. Envío gratis, pago contra entrega.
- Precio de antes: $150.000. Por eso el descuento real es 27%, no 30%.
- Temporizador Black Friday hasta el 30 de noviembre a las 11:59 p. m.

## Guía de regalo
- Página de descarga: https://alcomprar.shop/pages/guia-entierros-y-oro
- PDF: https://cdn.shopify.com/s/files/1/0811/4595/4517/files/Entierros-y-Oro.pdf
- Queda pendiente que se entregue sola: redirección de EasySell a la página de descarga, o un botón en el correo de confirmación.

## Ruleta de descuento (en vivo desde el 27/10, v12; reemplazó al juego de pesca porque no funcionó)
- **Cuándo se abre:**
  - a los 8 s si la persona ya bajó un poco;
  - a los 6 s de ver las ofertas;
  - de inmediato si intenta irse (sube rápido o vuelve de otra pestaña).
- **Primer giro (de práctica, así lo dice la letra pequeña):** frena despacio sobre $10.000 y cae en "¡Casi!".
- **Segundo giro:** 70% $5.000 (GIRA5), 30% $10.000 (GIRA10). GIRA20 está desactivado.
- **Se aplica solo:** el descuento queda puesto en EasySell.
- **Si cierra el formulario sin pedir:** aparece "🎁 ¡No pierdas tus $X! · Pedir", que se sacude.
- **Si cierra la ruleta sin girar:** queda la burbuja "Tienes 1 giro gratis".
- **Botón flotante de WhatsApp:** quitado para medir conversión.

## Página (tema en vivo: "v12 LISTA PARA PUBLICAR - ruleta", id 187361427669)
- Sección `sections/iman-pesca-landing.liquid` (unos 100 KB, Shadow DOM) y `sections/ct-easysell.liquid` (formulario de EasySell con la marca, regalos y aviso de contra entrega).
- Marca: sello "alcomprar · Tienda oficial", colores azul marino y dorado, tipografías Fugaz One y Barlow.
- Contiene:
  - carrusel de fotos centrado con miniaturas;
  - "Tu pedido incluye";
  - sección de 140 kg con el "Truco de cazador";
  - 3 ofertas con sellos ×1, ×2 y ×3;
  - bloque "2 REGALOS GRATIS";
  - "Antes de pedir, confirma 3 cosas" (para evitar devoluciones);
  - videos con sonido;
  - comparativo "Más hallazgos, menos plata";
  - preguntas frecuentes (incluye la de la puerta y la de los niños);
  - reseñas: la sección está oculta mientras no haya reseñas reales.
- Imágenes en Shopify Files con prefijo `ct-`.
- Claude no puede escribir en el tema publicado ni publicar temas: los cambios se hacen en una copia y el usuario le da Publicar.

## Datos de Clarity (3 días)
- 3.693 sesiones, 92,7% nuevas, 28 segundos de tiempo activo.
- **La gente baja en promedio solo el 31,8% de la página.** Las ofertas están al 35–40%, así que cerca de la mitad nunca ve los precios.
- **Cambio recomendado (pendiente): subir las ofertas justo debajo de las fotos.**

## Velocidad (PageSpeed, celular)
- Puntaje 52–56. Imagen principal visible a los ~9 s. Peso total 3,3 MB.
- Lo que más pesa:
  - el agente de IA "Brand Agents" de Clarity (313 KB), **sigue prendido el 27/10**;
  - el píxel de Facebook;
  - las imágenes dentro del formulario de EasySell.
- Releasit COD Form ya fue desinstalado.

## Pendientes del usuario
1. Apagar "Microsoft Clarity – Brand Agents": Temas → Personalizar → Insertar aplicaciones → Guardar.
2. Cambios en EasySell:
   - quitar las imágenes ("Vigilados por Superfinanciera", capturas y fotos de WhatsApp);
   - cambiar "Ahorra 50%" por "Ahorra 30%";
   - quitar el contador que se reinicia;
   - quitar "+12.400 colombianos" si no es real.
3. LucidBot debe cobrar el TOTAL del pedido, no precio × cantidad.
4. Conseguir reseñas reales con el mensaje de WhatsApp. Claude no inventa reseñas.

## Reglas acordadas
- Hablar solo en español, sencillo.
- No inventar reseñas, ni lives falsos, ni premios que nunca salen, ni contadores que se reinician.
- No enseñar a buscar guacas.
- Publicar solo el tema que diga "LISTA PARA PUBLICAR".
