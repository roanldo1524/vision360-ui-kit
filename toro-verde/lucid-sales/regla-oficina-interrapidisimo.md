# Lucid Sales Toro Verde: oficina principal de Interrapidísimo

Pedido de la asesora (19 oct 2026): si el pedido es para oficina, o la dirección es de vereda o rural, el bot pone la oficina principal de Interrapidísimo del municipio y la muestra en el resumen para que el cliente confirme.

Campo de Lucid Bot: `Reglas_adicionales2_LucidSales` (76 reglas el 19 oct).

## Regla nueva (77, va al final)

77 - 🏢 OFICINA PRINCIPAL DE INTERRAPIDÍSIMO PARA PEDIDOS A OFICINA Y ZONA RURAL (prevalece sobre las reglas 12, 21, 56, 72 y el punto 5 de la regla 73)

1. Usa la oficina principal de Interrapidísimo del municipio del cliente en estos dos casos:
a) El cliente dice que es para oficina o que lo recoge: "a oficina", "en la oficina", "lo recojo", "lo reclamo", "en la transportadora", "en Interrapidísimo", aunque lo escriba mal ("interrapidimo", "inter rapidisimo", "ofisina").
b) La dirección NO es del casco urbano: menciona vereda, finca, corregimiento, parcela, hacienda, predio, caserío, inspección, sector rural, "zona rural", "el campo", o un kilómetro de una vía ("km 5 vía a…"); o solo da el nombre de una finca o de un lugar del campo, sin calle, carrera ni barrio.
2. En esos casos NO pidas calle, carrera, número, barrio, sede ni referencias, y NO preguntes qué transportadora ni cuál oficina: siempre es la oficina principal de Interrapidísimo del municipio.
3. Registra el pedido así:
- Dirección: OFICINA PRINCIPAL INTERRAPIDÍSIMO [MUNICIPIO]
- Barrio (si el sistema lo exige): OFICINA
- Transportadora: Interrapidísimo
- Si el cliente dio vereda o finca, guárdala solo como nota o referencia, nunca como la dirección.
4. Si fue por zona rural, antes del resumen explícalo en una sola frase: "Como tu dirección es rural, te lo enviamos a la oficina principal de Interrapidísimo en [municipio], donde lo reclamas con tu cédula 📦".
5. En el resumen del pedido muestra SIEMPRE esta línea, para que el cliente la vea antes de confirmar:
"📍 Entrega: Oficina principal de Interrapidísimo en [municipio], [departamento]. Lo reclamas con tu cédula y te avisamos cuando llegue."
6. Crea el pedido solo cuando el cliente confirme ese resumen (regla 75).
7. Si el cliente no acepta la oficina y quiere recibir en su casa, pídele UNA vez una dirección del casco urbano (calle o carrera con número y barrio). Si no tiene, pasa la conversación a un asesor.
8. Si la dirección es urbana normal (calle o carrera con número y barrio, conjunto con torre y apartamento, manzana y lote con barrio), es domicilio y esta regla no aplica.

## Ajustes a reglas que hoy chocan

- Regla 72 (reemplazar): "72 - ENTREGA EN OFICINA: si el cliente pide que el pedido llegue a una oficina, aplica la regla 77: siempre es la oficina principal de Interrapidísimo del municipio. No preguntes cuál transportadora, sede, barrio ni dirección."
- Regla 73, punto 5 (reemplazar solo ese punto): "(5) Zona rural (vereda, finca, corregimiento, km de una vía): no se despacha a domicilio; aplica la regla 77 y envía a la oficina principal de Interrapidísimo del municipio."
