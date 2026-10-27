# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Hogares en Colombia: personas de 25 a 55 años con casa, patio, finca, terraza o balcón. Llegan desde anuncios de Meta y TikTok, casi siempre por celular (92,7% son visitas nuevas y el tiempo activo es de unos 28 s, según Clarity en la página del imán). Su tarea es entender en segundos qué es el producto, confiar en él y pedirlo **sin pagar por adelantado**.

## Product Purpose
alcomprar.shop (tienda Shopify "Yunabi") vende productos para el hogar y el aire libre con **pago contra entrega** (formulario EasySell) y envío gratis a toda Colombia.
- **Éxito:** pedidos confirmados que sí se entregan y se pagan, no solo visitas.
- **Meta actual:** vender 5.000 unidades de las lámparas solares antes de diciembre de 2026.

## Positioning
- **Cada producto tiene su propia marca dentro de la tienda,** con nombre, colores y sello propios. Ejemplos: **AURA** para la lámpara solar mandala, **Cazatesoros** para el imán de pesca.
- **El respaldo es "alcomprar · Tienda oficial":** contra entrega, envío gratis y confirmación por WhatsApp antes de despachar.

## Operating Context
- **Recorrido del cliente:** ve el anuncio, entra a la página de producto en el celular, abre el formulario EasySell, el pedido se confirma por WhatsApp (LucidBot o el equipo) y paga al transportador.
- **Ofertas:**
  - se venden en combos (kits);
  - hay una ruleta de descuento con códigos reales de Shopify y un contador de Black Friday con fecha real (30 de noviembre).
- **Las páginas viven en el tema de Shopify:**
  - Shopify no deja escribir por la API en el tema publicado, así que se trabaja en una copia y el dueño la publica;
  - cada producto tiene su propia plantilla (`templateSuffix`).

## Capabilities and Constraints
- **AURA (lámpara solar mandala):**
  - **Producto:** "Luz de decoración solar", handle `luz-de-decoracion-solar`.
  - **Uso principal:** se fija en la pared con la base contra la pared y el panel solar mirando al frente, y proyecta un mandala de colores alrededor. También se usa en cercas, senderos, el piso o una mesa.
  - **Precios del kit:** 1 kit (3 lámparas) $129.900; 2 kits (6 lámparas) $232.500; 3 kits (9 lámparas) $295.700.
  - **Medidas:** 9,6 × 8,4 cm.
  - **Regalo:** la guía digital de decoración va gratis en los kits de 2 y 3.
- **Cazatesoros (imán de pesca):**
  - **Producto:** fuerza de 140 kg (tirón recto), 60 mm.
  - **Precios:** 1 imán $109.000, 2 imanes $172.900, 3 imanes $229.200.
  - **Regalos:** cuerda de 10 m y la guía "Entierros y Oro".
- **Pendiente (no inventar hasta confirmar):**
  - horas de luz de AURA;
  - resistencia al agua (IP);
  - si trae tornillo o adhesivo;
  - si tiene modos de color;
  - garantía;
  - si el precio de antes de $220.000 por kit es real;
  - la fecha límite de pedidos para Navidad.
- **Problema abierto:** las ofertas de EasySell de AURA están configuradas con cantidades 3, 6 y 9 en vez de 1, 2 y 3, así que el formulario cobra de más hasta que el dueño lo corrija.

## Brand Commitments
- **Idioma y tono:**
  - español de Colombia, cercano y directo;
  - **sin** jerga de marketing de IA ("revoluciona", "potencia", "lleva al siguiente nivel"…).
- **Botones:** dicen el siguiente paso ("Pedir mi kit de 6"). Debajo va una línea pequeña que quita el miedo ("Pagas al recibir · Envío gratis").
- **Referencias obligatorias:**
  - la página de producto de AURA replica la estructura y la tipografía de lummia.com.co/products/lummiair (Montserrat y Hanken Grotesk);
  - el estándar de diseño está en `CLAUDE.md`.

## Evidence on Hand
- **Hay:**
  - **videos reales** del producto (el dueño los tiene y debe compartirlos);
  - fotos de proveedor de la lámpara;
  - fotos generadas con IA que muestran el producto real en contextos colombianos (`au-*` en Shopify → Archivos).
- **No hay todavía:**
  - reseñas reales de clientes de AURA;
  - capturas de WhatsApp;
  - influencer;
  - número público de pedidos.
- **Nunca inventar:** reseñas, cifras de clientes ("+12.400 colombianos"), sellos de entidades ("Vigilados por Superfinanciera"), "en vivo" falsos ni contadores que se reinician.

## Product Principles
1. **La confianza vende más que la urgencia.** Contra entrega, envío gratis y confirmación por WhatsApp siempre visibles.
2. **Mostrar el producto como se usa de verdad,** en hogares colombianos reales.
3. **El precio y la oferta se ven sin tener que bajar mucho,** porque la gente lee poco (31,8% de profundidad de scroll).
4. **Toda emoción o urgencia debe ser verdadera:** códigos reales, fechas reales y probabilidades publicadas.
5. **Celular primero y rápido:** cada segundo de carga cuesta ventas.
