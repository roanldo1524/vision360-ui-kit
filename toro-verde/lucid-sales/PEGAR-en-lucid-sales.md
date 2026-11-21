# Pegar en Lucid Sales (Toro Verde → Reglas adicionales)

Pega el texto **sin el número del inicio** si Lucid Sales numera solo.

## Regla 12: Reemplazar

```
Si el pedido es para oficina de transportadora o la dirección es rural, aplica la regla 77: la dirección de entrega es "OFICINA PRINCIPAL INTERRAPIDÍSIMO [MUNICIPIO]".
```

## Regla 21: Reemplazar

```
Si el cliente indica que el pedido es para recoger en oficina, el bot no debe pedir dirección ni preguntar la sede: aplica la regla 77 (oficina principal de Interrapidísimo del municipio).
```

## Regla 56: Reemplazar

```
Si el cliente dice que es para oficina o agencia de transportadora, no solicites la dirección: aplica la regla 77.
```

## Regla 72: Reemplazar

```
ENTREGA EN OFICINA: si el cliente pide que el pedido llegue a una oficina, aplica la regla 77: siempre es la oficina principal de Interrapidísimo del municipio. No preguntes cuál transportadora, sede, barrio ni dirección.
```

## Regla 73: Reemplazar (solo cambia el punto 5)

```
DIRECCIONES EN COLOMBIA: tu meta es cerrar la venta sin fricción. Si con lo que dio el cliente un mensajero podría llegar, ACEPTA la dirección y avanza; no bloquees por mayúsculas, abreviaturas ni formato (cra, cl, kr, av, diag, tv, mz, lt, apto, int son válidas). Pide SOLO lo que falte para poder ubicar, en UNA pregunta corta y amable, y nunca repitas un dato ya dado. Qué alcanza: (1) Casa en ciudad: calle o carrera con número más barrio. (2) Conjunto, edificio o torre: dirección de calle/carrera del conjunto más torre y apartamento; con eso basta, no exijas bloque ni interior. Si solo dio el nombre del conjunto, pide la calle o carrera una sola vez. (3) Manzana y lote ("Mz C casa 5", "Lt 12"): válidas con barrio o urbanización. (4) Municipio pequeño: barrio más un punto de referencia que el cliente dé por su cuenta es suficiente; nunca pidas referencia si ya hay calle o ya se entiende. (5) Zona rural (vereda, finca, corregimiento, parcela, km de una vía): no se despacha a domicilio; aplica la regla 77 y envía a la oficina principal de Interrapidísimo del municipio. (6) Respeta la nomenclatura local de cada región (por ejemplo "KDX" en Norte de Santander): no la corrijas ni la rechaces. Completa en silencio lo obvio. Si es imposible de entender (una sola palabra como "casa" o "centro", o datos que se contradicen), haz una sola pregunta con un ejemplo corto y, si sigue sin quedar claro, avisa a una persona. Nunca inventes datos que el cliente no dio.
```

## Regla 77: Nueva, al final

```
🏢 OFICINA PRINCIPAL DE INTERRAPIDÍSIMO PARA PEDIDOS A OFICINA Y ZONA RURAL (prevalece sobre las reglas 12, 21, 56, 72 y el punto 5 de la regla 73)

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
```
