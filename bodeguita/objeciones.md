# La Bodeguita — Objeciones por producto (chats sin pedido, 2 al 23-nov-2026)

Teléfonos recortados a los 4 últimos dígitos (la lista completa está solo en la sesión, no en el repo).
Nada de esto está pegado en Lucid todavía: espera el visto bueno de Ronald.

# Análisis de chats sin pedido: Afilador de Cadena, Afilador de Brocas y Tensor de Cadena

**Antes de leer los números:** casi todos los chats son del 23-nov y tienen pocas horas. Parte de los que "no respondieron" pueden contestar todavía.

---

## AFILADOR DE CADENA (45 chats)

### 1. Por qué se cayó la venta
| Motivo | # |
|---|---|
| No respondió desde el inicio (solo recibió el flujo) | 18 |
| Se fue tras ver el precio (muchas veces el bot preguntó "¿cuántas unidades?" justo después del precio) | 10 |
| El bot falló | 8 |
| Ciudad sin cobertura o vive en vereda (Mompox, Quibdó, El Encano) | 3 |
| Desconfianza: quería ver el producto antes de pagar o buscaba tienda física | 2 |
| Duda técnica (cuánto duran las limas) | 1 |
| Dejó la toma de datos a medias | 1 |
| Otros (pedido anterior que no llegó; compra para Venezuela) | 2 |

### 2. Lo que más preguntan
- **Precio, y el bot no lo da en texto:** "Buenas acomo" (…5834). "Quiero más información… precio" (…3326).
- **Limas de repuesto:** "Cuántas limas bien y cuánto duran" (…7019). "Al acabarse la lima, ¿qué utilizo?" (…9273).
- **Ver antes de pagar:** "Quiero ver el afilador antes d pagarlo… veo q no d fiar" (…6871).
- **Si de verdad funciona:** "Aún no sé qué tan práctico o eficiente sea" (…7166). "¿El producto es 100% confiable?" (…1323).
- **Precio por 2:** "Si compro los dos, me salen más favorables" (…6818).
- **Tienda física:** "Una dirección donde lo puedo comprar" (…1970).

### 3. Errores del bot
- **Precio distinto a la ficha** (la ficha dice $129.000): "sale por solo $129.900" (…9972). El flujo viejo decía "kit completo $129.900" (…6781).
- **Oferta de testimonios rota:** "Lo sentimos no tenemos testimonios de: PRODUCTO: AFILADOR DE CADENA [VARIABLES:]" (…7166). En ese mismo chat dijo "pagas cuando te llegue, así lo revisas tranquilo", lo contrario de la política de no abrir antes de pagar.
- **No contestó el precio** cuando se lo pidieron en el primer mensaje: …3326, …8489, …5834 ("acomo"), …1262.
- **Pidió datos que ya tenía:** Carmen dio barrio, dirección y teléfono, y el bot siguió pidiendo "Barrio / Dirección exacta" (…9273).
- **Pidió los datos a cuentagotas y uno inventado:** a Napoleón le pidió primero el apellido, después una "manzana" que no existe en su dirección, y al final la forma de pago. Nunca cerró (…0685).
- **Reenvió el flujo completo** a quien ya lo tenía: …0592, …4993.
- **Malinterpretó "ver antes de pagar"** como "aquí tienes imágenes" (…6871).
- **Cliente que quería comprar otra vez:** dijo "cómo puedo adquirirlo". El bot solo pasó el caso a soporte y no le tomó el pedido nuevo (…9337).
- **La ficha se contradice:**
  - La pregunta "¿Qué incluye?" dice solo "el dispositivo", pero la ficha incluye 3 limas.
  - Una respuesta habla de "girar la manivela", y el modo de uso es deslizar la lima.
- **Las reglas generales se contradicen con Chocó:** la regla 38 dice "sin cobertura" y las preguntas frecuentes de Chocó dicen "solo pago anticipado". A Quibdó no se le ofreció el pago anticipado (…7939).

### 4. Arreglos listos para pegar

**Preguntas frecuentes**
- **¿Cuánto cuesta?** → $129.000 pesos colombianos, con envío gratis y pago contra entrega en efectivo. ¿Para qué ciudad o municipio te lo envío?
- **¿Qué incluye?** (reemplaza la actual) → 1 estructura de afilado de precisión, 3 limas de diamante y guía de ángulos integrada.
- **¿Cuántas limas trae y qué hago cuando se gasten?** → Trae 3 limas de diamante. Cuando se gasten, adaptas limas redondas convencionales: las cortas a la medida y las ajustas con un trocito de manguera. FALTA DATO: cuántos afilados dura cada lima.
- **¿Realmente afila en segundos?** (reemplaza la de la "manivela") → Fijas la guía sobre la espada sin desmontar la cadena y deslizas la lima por cada diente. Toma unos segundos por diente y la guía da los dos ángulos.
- **¿Necesita electricidad?** → No. Es manual y portátil, ideal para la finca o el monte sin energía.
- **¿Sirve para mi motosierra?** → Diseño universal para la mayoría de motosierras: Stihl, Husqvarna, Shindaiwa, entre otras. FALTA DATO: paso o calibre de cadena y diámetro de lima compatibles.
- **¿Puedo revisarlo antes de pagar?** → La transportadora no permite abrir el paquete antes de pagar. Verificas que llegue sellado; si al abrirlo tiene defecto de fábrica, te respondemos con garantía.
- **¿Si llevo 2 sale más barato?** → El precio es $129.000 por unidad. Dos unidades suman $258.000, con envío gratis y pago contra entrega.

**Reglas para la ficha**
1. Si el cliente escribe "precio", "cuánto", "a cómo", "acomo", "qué vale" o "cotizar", el bot responde primero el precio en texto ($129.000). Nunca $129.900.
2. La cantidad es 1 por defecto. No preguntar "¿cuántas unidades?".
3. Pedir los datos en un solo mensaje. Usar lo que el cliente ya mandó, también por foto. No pedir "manzana" si el cliente dice que no hay. El pago es contra entrega por defecto: no preguntar la forma de pago.
4. No reenviar el flujo inicial a quien ya lo recibió.
5. No ofrecer testimonios mientras no estén cargados. FALTA DATO: subir videos o testimonios reales a Lucid.
6. Si un cliente reclama un pedido anterior y además quiere comprar, se pasa el caso a soporte **y** se toma el pedido nuevo.
7. Quitar del flujo la frase "si quieres pagar todavía menos, tenemos un beneficio adicional". Anuncia un descuento que el bot no entrega y no distingue entre clientes nuevos y antiguos.

### 5. Ventas recuperables
…0685 (Napoleón, Pitalito, datos completos) · …9273 (Carmen, Tibú, datos completos) · …0307 (Ibagué, 1 unidad) · …6818 (Barrancabermeja, quería 2) · …9337 (quiere volver a comprar) · …7166 (Omar, pidió testimonios) · …1323 (pedirá cuando salga a la ciudad) · …7616 (Maicao) · …1262 (Girón).

---

## AFILADOR DE BROCAS (6 chats)

### 1. Por qué se cayó la venta
| Motivo | # |
|---|---|
| No respondió | 3 |
| Precio o sin dinero ("Esta muy caro"; "esperando que me paguen") | 2 |
| El bot falló (no entendió enlaces de TikTok) | 1 |

### 2. Lo que más preguntan
- **Precio caro:** "Muy caribe… Esta muy caro" (…5951).
- **Precio:** "Que precio tienen" (…5951), "Cuanto cuesta" (…8983).
- **Sin dinero ahora:** "Estoi esperando qe me paguen" (…8983).

### 3. Errores del bot
- **Promesa falsa en cada chat:** "en unos minutos te pondré en contacto con una de nuestras asesoras". Nadie aparece.
- **Repite el flujo completo** cada vez que el cliente escribe: …4887, …7988, …5951.
- **No entiende enlaces o videos:** respondió con el flujo de nuevo (…8830).
- **Descuento de $5.000 el mismo día de la queja** (…5951). Va contra la regla general 96, que dice no ofrecerlo el mismo día. Las reglas 24 y 96 de descuentos se contradicen entre sí.
- **Respuesta tardía:** al "Que precio tienen" contestó 13 horas después y solo con una imagen (…5951).
- **La ficha no tiene ninguna pregunta frecuente.**

### 4. Arreglos listos para pegar

**Preguntas frecuentes**
- **¿Cuánto cuesta?** → $79.900 pesos colombianos, envío gratis y pago contra entrega en efectivo. ¿Para qué ciudad te lo envío?
- **¿Qué brocas afila?** → Brocas de 2 mm a 16 mm. También tiene ranuras para cuchillos, tijeras y herramientas pequeñas. FALTA DATO: si sirve para brocas de concreto o widia.
- **¿Trae motor?** → No. Se acopla al mandril de tu taladro, con cable o inalámbrico, y el taladro lo mueve.
- **¿Qué incluye?** → 1 afilador multifunción, disco diamantado instalado y manual de ángulos de afilado.
- **¿Cuánto se demora?** → Menos de 30 segundos por broca, con el taladro a velocidad moderada.
- **¿De qué está hecho?** → Cuerpo en ABS de alta densidad y disco de esmeril con recubrimiento de diamante. FALTA DATO: si venden disco de repuesto.

**Reglas para la ficha**
1. Quitar el saludo de "una asesora te contactará en minutos".
2. No reenviar el flujo a quien ya lo recibió. Contestar directo lo que pregunta.
3. Si el cliente manda un enlace o video: "¿Te interesa el afilador de brocas? Vale $79.900 con envío gratis y pagas al recibir".

### 5. Ventas recuperables
…8983 (preguntó dos veces; esperaba su pago) · …5951 (Álvaro, objeción de precio; precio normal, sin descuento nuevo).

---

## TENSOR DE CADENA (45 chats)

### 1. Por qué se cayó la venta
| Motivo | # |
|---|---|
| No respondió desde el inicio | 25 |
| El bot falló | 6 |
| Se fue tras ver el precio o sin dinero | 5 |
| Zona con pago anticipado obligatorio (Leticia, El Bordo, San Ángel) | 3 |
| Se enfrió mientras el bot preguntaba color o unidades | 3 |
| Desconfianza de la calidad | 1 |
| Otros (quería rojo; ya compró en otro lado) | 2 |

### 2. Lo que más preguntan
- **Si le sirve a su moto:** "¿cómo lo puedo conseguir para mi XR?" (…1595). "Es para una XR 190 y para una cbf 150" (1116731197936396). "le sirve para la CB-125" (…8804).
- **Precio:** "Cuanto" (4580727935473597). "Precio / ????" (…7351).
- **Color rojo:** "lo tiene Rojo" (…8786, …8804).
- **Pago contra entrega en zona de pago anticipado:** "nos han robado a más de uno… apenas llegue… pago" (…8804).
- **Calidad:** "Eso no sirve para nada, se desbarata, es desechable" (…2374).
- **No ve las imágenes:** "No puedo ver estos archivos… Aparecen bloqueados" (…2461).

### 3. Errores del bot
- **Error principal:** el flujo de la moto (🏍️) sale con el **renglón del precio vacío** y termina en "Y si quieres pagar menos tenemos un beneficio adicional 👀". Pasa en todos los chats desde el 22-nov (por ejemplo 2170955873500408, …3082). El 12-nov sí decía "🔥 Hoy el Tensor de Cadena está en $75.900" (…9447).
- **Datos completos y no creó el pedido:**
  - Javier mandó todo el 12-nov, el bot pidió "apto o interior" y el pedido nunca se creó. El 23-nov el cliente escribió "Ya había hecho un pedido y no llegó" (…9447).
  - Sabas pidió 2 tensores con datos completos y quedó en lo mismo (…6475).
- **Ofreció rojo, que no existe:** "ROJO, NEGRO o GRIS" (…9447); "negro, rojo y gris" (…8804).
- **Puso el color antes de la ciudad:** "Leticia suena a ciudad, pero primero necesito saber el color" (…8804).
- **Se contradijo con la cobertura:** a El Bordo le dijo "sí tenemos cobertura" y, después de color y cantidad, "no tenemos pago contra entrega" (…3350).
- **Volvió a pedir la ciudad** después de que el cliente dijo "Girón" (…7351).
- **No respondió en 5 días** a un cliente interesado (1116731197936396).
- **Compatibilidad dicha de dos formas:** "universal, la mayoría de motos" (…1595) contra "de 125cc hasta 250cc" (…2461). La ficha misma dice las dos cosas.
- **Problemas de la ficha:**
  - Una variante vacía, "color: ", con precio $0.
  - Dice "Envío gratis a toda Colombia", aunque hay zonas que solo aceptan pago anticipado.
  - Está escrita con "vos" ("Levantá", "Escuchás"), que no es como se habla en Colombia.

### 4. Arreglos listos para pegar

**Preguntas frecuentes**
- **¿Cuánto vale?** → 1 unidad $75.900; 2 unidades $99.900. Envío gratis y pago contra entrega en efectivo. ¿Para qué ciudad o municipio?
- **¿Le sirve a mi moto?** → Está hecho para motos de 125cc hasta 250cc y se instala en el brazo oscilante. FALTA DATO: medidas exactas y lista de modelos probados.
- **¿Qué colores hay?** → Negro y gris. Por ahora no manejamos rojo.
- **¿Es de plástico? ¿Se desbarata?** → Es de acero reforzado con acabado negro mate, rodillo de nailon de alta resistencia y tornillos de acero inoxidable. Resiste alta temperatura y vibración.
- **¿Cómo se instala?** → Levantas la rueda trasera con caballete, lo ubicas en el brazo oscilante, ajustas los tornillos con llave Allen y dejas el rodillo centrado sobre la cadena. FALTA DATO: si incluye la llave.
- **¿Necesita conexión eléctrica?** → No. Funciona solo mecánicamente.

**Reglas para la ficha**
1. Arreglar el mensaje del flujo: volver a poner "🔥 Hoy el Tensor de Cadena está en $75.900". Quitar la frase del "beneficio adicional".
2. Borrar la variante vacía de $0. No ofrecer rojo nunca.
3. Orden del pedido: ciudad → avisar de inmediato si esa zona exige pago anticipado → color → resumen con total.
4. Con nombre, barrio, dirección y teléfono, crear el pedido. Preguntar "apto o interior" una sola vez; si es casa o no contesta, seguir.
5. Si la imagen no carga, describir el producto en texto y dar el precio.
6. Unificar la compatibilidad: "motos de 125cc a 250cc".

### 5. Ventas recuperables
…9447 (Javier, Galapa: crearle el pedido ya) · …6475 (Sabas, Yondó, 2 unidades, datos completos) · …1352 (Caldas, quería 2 negros) · 1116731197936396 (XR 190 y CBF 150) · …1595 (Los Patios) · …8551 (Pueblo Bello) · …6123 (cuando tenga el dinero) · …8804 (Leticia, solo si acepta pagar antes).

---

Archivos de trabajo (copias compactas de los chats, solo lectura):
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/work/AFILADOR_DE_CADENA.txt
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/work/AFILADOR_DE_BROCAS.txt
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/work/TENSOR_DE_CADENA.txt

---

# Análisis de chats sin pedido: DETECTOR DE METALES e IMÁN (90 chats leídos)

Nota: "[Complex Message]" es una imagen o un video, así que no sé si llevaba el precio. Cuando digo "el bot no dio el precio", quiero decir que no lo escribió en texto.

---

## DETECTOR DE METALES (45 chats)

### 1. Por qué se cayó la venta
| Motivo | Chats |
|---|---|
| No respondió después del flujo inicial | 17 |
| Se fue después de ver el precio | 9 |
| El bot falló o no cerró (el cliente quería comprar) | 5 |
| Duda técnica (profundidad, si sirve en agua, pila recargable) | 4 |
| Dijo "después lo pido" (pago, quincena) | 3 |
| Desconfianza o garantía | 2 |
| Cobertura (Quibdó; La Belleza con abono) | 2 |
| Se cayó cuando le pidieron los datos | 2 |
| Tiempo de envío (lo necesitaba para una fecha) | 1 |

### 2. Lo que más preguntan
- **Profundidad:** "Que tanta prifundidad" (…1368); "Haste que profundidad puede llegar" (…6274).
- **¿Detecta solo oro?:** "Quiero uno que muestre sólo oro" (…4067); "Detecta solo oro?" (…2359).
- **Pila o carga:** "¿carga con corriente o con batería?" (…7000); "Y como lo recargo" (…3140).
- **¿Es estafa? ¿Funciona?:** "no es una estaf" (…7495); "pero es algo efectivo, efectivo" (…7000).
- **Dónde están y si se puede recoger:** "¿Sería posible ir uno por él?" (…3658); "Dónde están ubicados.en Bogotá" (…6274).
- **¿Se puede mojar?:** "Es sumergible al agua?" (…6274).

### 3. Errores del bot
- **El precio cambia:** la ficha dice 109.000, el flujo dice $109.900, la regla 1 habla de "$119.000" y el flujo de octubre decía $119.900. En un mismo chat dijo "Cada uno está en $109.000" y luego "1 por solo $109.900" (…1736).
- **Testimonios:** ofreció mostrarlos y luego escribió "Lo sentimos no tenemos testimonios de: DETECTOR DE METALES" (…7495).
- **Revisar antes de pagar:** dijo "así lo revisas primero", pero la FAQ dice que no se puede revisar antes de pagar (…7000).
- **Pila inventada:** dijo "No es recargable… pilas normales", y la regla prohíbe inventar eso (…3140).
- **No cerró ventas con todos los datos:**
  - María Elvia (…1641) dio dirección, nombre y teléfono. El bot le preguntó "¿Contra entrega o pago anticipado?" y ella no volvió a contestar.
  - A Milciades (…3658) le preguntó "¿la principal o alguna sede?" y nunca cerró.
  - A Carlos (…1736) le pidió "tu número de celular… 10 dígitos" cuando ya le estaba escribiendo desde ese número.
- **Se contradijo:** primero dijo "no podemos hacer el envío ni entrega en oficina" para La Unión y después aceptó Pasto. Luego dijo "oficina de Interrapidísimo" y en el mensaje siguiente "directo a la dirección" (…1736).
- **Se confundió:** el cliente pegó un texto de testimonio y el bot le respondió "¡qué felicidad leerte!" como si ya fuera cliente (…9982).
- **Quibdó:** dijo "no tenemos cobertura", pero Quibdó no aparece en ninguna lista de las reglas (…6642).
- **Abono de La Belleza:** cuando el cliente preguntó "Cuánto", el bot no tenía el valor y el cliente dijo "No" (…6558).
- **Repite el flujo completo** a clientes que vuelven a escribir (…3658, …1641, 2316396212440663, …9057).
- **Producto equivocado:** en octubre mostró el detector DISCO, a $119.000, con "beneficio adicional" (…1763).

### 4. Arreglos listos para pegar
**Nuevas FAQ:**
- *¿Detecta solo oro?* → No, detecta metales en general: oro, plata, monedas, joyas y otros objetos metálicos. Avisa con una señal cuando encuentra metal.
- *¿Funciona con corriente o se recarga?* → Viene con su batería (pila) incluida 🔋, no tienes que comprar nada aparte. Una asesora te confirma la referencia exacta.
- *¿Es sumergible?* → FALTA DATO: resistencia al agua. Hasta tenerlo, responder: "Está pensado para playa, campo y jardín; una asesora te confirma el uso en agua."
- *¿Es confiable?* → Pagas en efectivo cuando el detector llega a tus manos y tienes garantía por defectos de fábrica, 4 días para reportar.
- *¿Puedo recogerlo en persona?* → Somos tienda virtual, no tenemos local. Te lo enviamos a tu casa o a una oficina de Interrapidísimo, con pago contra entrega.

**Reglas para la ficha:**
1. El precio único es $109.900. Corregir "1_unidad_subtotal", la regla 1 ("$119.000") y cualquier texto que diga 109.000.
2. Si el cliente ya dio nombre, dirección y teléfono, el pedido se toma contra entrega. No preguntar la forma de pago.
3. Si pide oficina de Interrapidísimo y no dice cuál, usar la oficina principal sin preguntar.
4. El teléfono es el número del WhatsApp. No pedirlo de nuevo.
5. No ofrecer testimonios. Si no hay, no decir que los hay.
6. Nunca decir "lo revisas antes de pagar".
7. Si el cliente ya está en conversación, no reenviar el flujo inicial.
8. FALTA DATO: valor del abono para municipios con abono (La Belleza y otros).
9. FALTA DATO: si Quibdó tiene cobertura o no.

### 5. Ventas que se pueden recuperar
- **Con datos completos o casi completos:** …1641 (María Elvia, Marmato), …1736 (Carlos, oficina en Pasto), …3658 (Milciades, oficina en Cali), …2748 (oficina Interrapidísimo de Bucaramanga, dijo "agamos el pedido").
- **Pidieron 1 unidad pero no mandaron datos:** …9057 (Medellín), …0222 (Támesis).
- **Dijeron "después":** …2614 (8 de diciembre), …7748, …7000 (Arauca).

---

## IMÁN (45 chats)

### 1. Por qué se cayó la venta
| Motivo | Chats |
|---|---|
| No respondió después del flujo inicial | 16 |
| El bot no dio el precio en texto aunque lo preguntaron (a veces 2 veces) | 9 |
| El bot falló de otra forma (reinició el flujo, no entendió, pidió datos de más, insistió con el combo) | 5 |
| Se fue después de ver el precio | 4 |
| Cobertura, solo pago anticipado (Melgar, Necoclí, Puerto Carreño, La Estrella) | 4 |
| Se cayó cuando le pidieron los datos | 3 |
| Dijo "después lo pido" (el 30, viaje) | 2 |
| Duda técnica (tamaño) | 1 |
| Solo curiosidad | 1 |

### 2. Lo que más preguntan
- **Precio:** "Cuanto vale...!" y luego "Precio por favor" (…8752); "Precio / Por / Precio" (…4893).
- **Tamaño, grande o pequeño:** "¿el pequeño o el grande? … a un amigo le salió chiquitico" (…5992); "Precio del imán grande" (…8598).
- **Contra entrega en su zona:** "M interesa si es contraentrega" (1147247217965753); "No contra entrega" (…9925).
- **¿Coge oro?:** "Todo sega, hata el oro?" (…3658).
- **Tiempo de entrega:** "Y en cuantos.dias llegaria" (…1430); "me llegaría… el martes 30" (…2403).
- **Cuánto levanta:** "Cuantos kilos alza" (…5548).

### 3. Errores del bot
- **La ficha tiene el precio desordenado:**
  - Dice 99.000, pero el bot usa $99.900 o $99.000 según el chat.
  - La regla 2 dice "$99.900 (ciento nueve mil pesos)" y "$189.000 (ciento noventa y nueve mil)". Las palabras no coinciden con los números.
  - "2_unidades_subtotal: 94500" está mal: ese es el precio por unidad, no el subtotal.
  - En octubre cobraba $109.000 / $199.000 (…3846, 1147247217965753).
- **Dato inventado:** "Imán de Neodimio 247KG". La ficha dice 180 kg (…4318).
- **La cuerda se contradice:** la FAQ y el flujo dicen "10 metros", pero la regla 2 dice "no inventes el largo".
- **El precio no sale en texto:** el flujo de entrada ignora "cuánto vale" (…8752, …0028, …2595, …2808, …0485, …9363, …0628, …4893, 1166194549177028).
- **"Yo quiero uno":** el cliente lo escribió y el bot reinició el flujo y le preguntó la ciudad (…5560).
- **Pidió datos de más:** en Cúcuta le pidió "Departamento" y "Barrio" 5 veces a un cliente que ya había dado puesto, galpón, teléfono y "Contra entrega" (…3846).
- **Insistió con el combo de 2:** el cliente respondió "Que ustedes quieren es que uno les lleve todo el almacén" (…8598).
- **Entendió al revés:** leyó "No contra entrega" como un rechazo y le ofreció Addi, además de volver a pedir la ciudad que ya le había dado (…9925).
- **Datos antes que cobertura:** pidió los datos completos antes de revisar si había contra entrega. Cuando el cliente los mandó, le dijo que no había contra entrega en La Estrella (…4318).
- **Tardó:** respondió con una imagen 1,5 horas después de que el cliente dijera "Uno" y no le pidió los datos (…7685).
- **Descuento a todos:** el flujo de entrada ofrece "5% de descuento por pago anticipado" a todo el mundo. Esto se debe revisar contra la política de descuentos.

### 4. Arreglos listos para pegar
**Nuevas FAQ:**
- *¿Cuánto vale?* → 1 imán $99.900; 2 imanes $189.000. Envío gratis y pago contra entrega. Incluye perno de argolla y cuerda 🪢. (Confirmar si el precio es 99.000 o 99.900.)
- *¿Es grande?* → Mide 6 cm de diámetro: es compacto, cabe en la mano, y tiene hasta 180 kg de fuerza de tracción.
- *¿Coge oro o plata?* → No. Atrae hierro y acero; el oro y la plata no son magnéticos.
- *¿Cuántos kilos levanta?* → Hasta 180 kg de tracción en contacto directo con acero plano y grueso.
- *¿Cuánto mide la cuerda?* → FALTA DATO: largo confirmado. Elegir entre "10 metros" y "una asesora te confirma".

**Reglas para la ficha:**
1. Un solo precio en todos los campos. Escribirlo bien en palabras para los audios: "noventa y nueve mil novecientos" y "ciento ochenta y nueve mil". Corregir "2_unidades_subtotal" a 189000.
2. Si el cliente pregunta el precio, decirlo en texto en el primer mensaje, aunque esté corriendo el flujo.
3. Si el cliente dice "quiero uno", "envíe uno" o "1", no reiniciar el flujo. Pedir la ciudad y los datos.
4. Si pide 1, no insistir con el combo. Ofrecerlo solo una vez.
5. El departamento se deduce de la ciudad. Si la entrega es en oficina, no pedir barrio.
6. Validar la cobertura con la ciudad antes de pedir los datos.
7. Nunca decir otra fuerza que no sea 180 kg.

### 5. Ventas que se pueden recuperar
- **Pidieron 1 unidad:** …3846 (German, Cúcuta, Cenabastos), …7685 (Cereté), 2264820431082391 (Icononzo), …5548 (Ebéjico), …3772 (falta la ciudad), …5560 ("yo quiero uno"), …8598 (Bucaramanga, 1 grande).
- **Dijeron "después":** …1430 (Cali, "el 30"), 1147247217965753 (Bogotá, "martes"), …2403 (Quindío, cuando vuelva de viaje en unos 20 días).
- **Fuera de contra entrega:** …4318 (La Estrella). Dio todos sus datos, pero solo se le puede ofrecer pago anticipado.

Archivos de trabajo (resumen compacto de los chats): `/tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/det.txt` y `/tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/iman.txt`

---

# Análisis de chats sin pedido: Duo pelador, SH Cubre Canas y YUNABI

Leí los 106 chats: 45 del Duo, 45 del SH y 16 de YUNABI. Comparé cada respuesta del bot con su ficha y con las reglas generales. No modifiqué nada.

**Problema común en los 3 productos:** el cliente pide el precio y el bot manda 4 a 6 mensajes de presentación y pregunta "¿Para qué ciudad?" antes de dar el precio. Además, cuando el cliente vuelve a dar clic al anuncio, el bot empieza la conversación desde cero en vez de seguirla.

---

## 1. DUO PELADOR RASPADOR DE VERDURAS (45 chats)

### Por qué se cayó la venta
| Motivo | Nº |
|---|---|
| No respondió desde el inicio (recibió la presentación y no escribió) | 19 |
| Se fue después de ver el precio ($85.900) | 18 |
| El bot falló (no dio el precio que pidieron, ofreció otro producto, o hay un pedido confirmado que no aparece) | 3 |
| No tienen pago contra entrega en su pueblo (Mondomo, Cauca) | 1 |
| Dijo que confirmaba después | 1 |
| Otros (dijo "No gracias" sin ver el precio, pregunta fuera de tema, mala experiencia con una compra anterior) | 3 |

### Lo que más preguntan
1. **Precio, casi siempre en el primer mensaje.** "buenos días me podría indicar el precio por favor" (…3325). "Precio… Precio… Precio" (…5768).
2. **Pago contra entrega.** "tienes pago contra entrega" (…6696). "Ustedes despachos de pagos contra entrega?" (1977756026537241).
3. **Cuántas piezas trae.** "Son.3peladores" (…9726).
4. **Si trae algo más.** "no viene la afiladora" (…8941).
5. **Calidad.** "me mandaron unos pedazos que no sirven para nada" (…2951).

### Errores del bot
- **…9726: pedido confirmado que no aparece.** La clienta escribió "Datos.confirmados" (2 combos, $171.800, Bogotá, contra entrega) y el bot respondió "Procederemos a gestionar y subir tu pedido". En el archivo de pedidos no hay ningún pedido de este teléfono. Puede ser que se confirmó después de bajar los datos; hay que revisarlo en Lucid.
- **No dio el precio que le pidieron.**
  - …2633 escribió "precio gracias" y nunca le dieron el precio.
  - …3325 y …8306 tuvieron que dar la ciudad o pedirlo dos veces.
  - …5768 escribió "Precio" 5 veces y recibió 3 respuestas seguidas, casi iguales.
- **Se contradice en qué trae el combo.** A veces dice "2 peladores", otras "un pelador y un raspador" y otras "2 peladores raspadores". La regla de la ficha dice 2 peladores, pero el contenido del paquete dice pelador + raspador.
- **Dice cosas que no están en la ficha:**
  - "Mango tipo madera" y "Función destapador" (en la presentación del producto).
  - "sin riesgo" y "sin miedo a cortes" (en respuestas sueltas).
- **Ofreció otro producto sin que se lo pidieran** (…8941): ofreció el afilador de $79.900 y no cerró el pelador.
- **Repite la presentación completa** cada vez que el cliente vuelve a dar clic al anuncio (…6516 la recibió 4 veces; también …4387).

### Arreglos listos para pegar
**Preguntas frecuentes**
- *¿Cuánto vale?* → "El combo trae 2 piezas y vale $85.900 con envío gratis. Pagas al recibir donde hay contra entrega. ¿A qué ciudad te lo envío?"
- *¿Puedo pedir uno solo o 3?* → "Se vende solo por combo de 2 piezas: 1 combo $85.900, 2 combos (4 piezas) $171.800."
- *¿Trae afilador u otra cosa?* → "No, el combo trae solo las 2 piezas para pelar y raspar."
- *¿Cuánto tarda?* → "De 3 a 7 días hábiles, según tu municipio. El envío es gratis."
- *¿Puedo revisarlo antes de pagar?* → "Por política de la transportadora no se puede abrir antes de pagar. Puedes verificar que el paquete llegue sellado."
- *"Me llegaron malos"* → "Lamento eso. Si compraste con nosotros, envíame foto y tu nombre o número de pedido y lo revisamos."

**Reglas para la ficha**
1. Si el cliente pide precio, en cualquier mensaje, darlo en la primera respuesta, antes de pedir la ciudad.
2. Un solo mensaje por respuesta. Nunca mandar 2 o 3 respuestas seguidas casi iguales.
3. Si el cliente vuelve a dar clic al anuncio y ya había hablado, no repetir la presentación: seguir donde quedó.
4. No ofrecer otros productos a menos que el cliente los pida.
5. **FALTA DATO:** ¿son 2 peladores iguales o 1 pelador + 1 raspador? Corregir la regla 1 o el contenido del paquete para que digan lo mismo.
6. **FALTA DATO:** confirmar si el mango es tipo madera y si tiene destapador. Si no es cierto, quitarlo de la presentación.

### Ventas que se pueden recuperar (a precio normal)
…9726 (revisar ya el pedido confirmado), …6696 ("si me interesa pero yo le confirmo"), …3325 (Nemocón), …9039 (Bogotá), …3803 (Bogotá), …8941.

---

## 2. SH CUBRE CANAS + OBSEQUIO (45 chats)

### Por qué se cayó la venta
| Motivo | Nº |
|---|---|
| No respondió desde el inicio | 23 |
| El bot falló (ver detalle abajo) | 7 |
| Se fue después de ver el precio | 5 |
| Desconfianza o mala experiencia (garantía, tienda física, "en el anuncio muestran otro") | 3 |
| Duda sin resolver (color rojizo, si cubre bien la cana) | 2 |
| Creyó que era gratis ("regalado") | 2 |
| Cobertura: Leticia sin contra entrega; La Chaparrera (Yopal), donde el bot no aceptó la oficina local de Interrapidísimo | 2 |
| Otros | 1 |

Detalle de las 7 caídas por el bot:
- No dio el precio que pidieron: 3 chats (…4382, …7768, …0770).
- No entendió la foto del color: 1 chat (…6930).
- La clienta eligió tono y el bot no avanzó a pedir los datos: 3 chats (…7697, …7030, …1705).

### Lo que más preguntan
1. **Precio.** "Yo solo deseo el precio más no tanto publicidad" (…1705). "$$$$$ x favor Neiva Huila" (…4367).
2. **Colores.** "Solo tienen negro" (…7030). "Pensé que había de otros colores, no tiene" (…7697). "¿Tiene rojizo?" (…8403).
3. **¿Es gratis?** "dicen que es gratis y lo gratis no se paga" (…9894). "dejen de publicar q es regalado son unos mentirosos" (…4043).
4. **¿Sirve de verdad? ¿Tiene garantía?** "uno compra productos aquí por el Facebook y no salen buenos… con garantía, ¿no?" (…5849).
5. **El anuncio muestra otro producto.** "en la propaganda muestran uno y aquí muestran otro… eso es malísimo" (…0670).
6. **Pago y envío / tienda física.** "Y como es pago… cuánto cuesta el envío" (…7768). "¿Dónde lo puedo localizar en Bogotá?" (…6364).

### Errores del bot
- **Promete una asesora que nunca llega.** La bienvenida dice "en unos minutos te pondré en contacto con una de nuestras asesoras" (aparece en unos 20 chats).
- **La primera versión de la presentación no tiene precio.** …7768 preguntó pago y envío y nunca supo el precio.
- **La otra versión confunde con el color.** Dice "pigmento negro", y por eso las clientas creen que solo hay negro.
- **Promete un descuento que nunca explica.** "Y todavía puedes obtener un descuento adicional..." aparece en la presentación y ese descuento no está en la ficha.
- **Afirmación de salud en la presentación:** "Los shampoo quimicos causan mas daño para nuestra salud…" (además tiene errores de escritura).
- **Contradice la regla de la transportadora.** A …5849 le dijo "pagas solo al recibir… así lo ves primero", pero la regla dice que no se puede abrir antes de pagar.
- **No precisó el tono.** A …7697 le dijo "lo dejo en Castaño" sin aclarar si oscuro o claro, y nunca cerró.
- **No entendió la foto.** …6930 mandó foto del color: "me gustaría este color… quiero ese tono". El bot solo repitió la lista de tonos y la clienta se fue.
- **Siguió vendiendo en medio de una queja.** A …0670, justo después de responder a la queja, el bot repitió dos veces "¿qué tono te gustaría?".
- **No aceptó la oficina del pueblo.** A …2310 (quería 1 negro) le insistió en la oficina de Yopal aunque el cliente dijo que en La Chaparrera hay oficina de Interrapidísimo.
- **Respuesta rara:** "Yo soy Sofia y estoy aquí con mi tintico… 😤" (…7697).

### Arreglos listos para pegar
**Preguntas frecuentes**
- *¿Precio?* → "1 unidad $69.900, 2 por $99.900, 3 por $129.900. Envío gratis y pagas al recibir. ¿Qué tono quieres?"
- *¿Es gratis / regalado?* → "El shampoo tiene costo desde $69.900. Lo que va de regalo es el colágeno capilar de 120 ml al comprarlo."
- *¿Solo viene en negro?* → "No, hay 4 tonos: negro, castaño oscuro, castaño claro y rubio."
- *¿Tienen rojizo o cobrizo?* → "Ese tono se nos agotó. Tenemos negro, castaño oscuro, castaño claro y rubio."
- *¿Tienen tienda física?* → "Somos tienda virtual. Enviamos gratis a tu casa o a la oficina de la transportadora y pagas al recibir."
- *¿Tiene garantía?* → "Si te llega con algún problema, escríbenos con foto y lo revisamos. Por política de la transportadora no se abre antes de pagar."

**Reglas para la ficha**
1. Si piden precio, darlo primero, en un solo mensaje y sin presentación antes.
2. Quitar de la bienvenida "te pondré en contacto con una asesora".
3. Cambiar "pigmento negro" por "disponible en 4 tonos" en la presentación.
4. Quitar "descuento adicional" de la presentación (no hay dato en la ficha).
5. Quitar la frase "causan más daño para nuestra salud".
6. Si el cliente dice "castaño", preguntar siempre "¿oscuro o claro?".
7. Si mandan foto de su cabello, preguntar: "¿Tu tono se parece más a negro, castaño oscuro, castaño claro o rubio?"
8. Cuando el cliente elige tono y cantidad, pedir los datos de envío en ese mismo mensaje.
9. Si el cliente se queja, no volver a ofrecer el producto en esa respuesta.
10. **FALTA DATO:** si se puede enviar a oficinas de Interrapidísimo en corregimientos. Si no hay certeza, pasar a una persona del equipo.
11. **FALTA DATO:** cuántas lavadas se necesitan para ver el color y si cubre cana 100 % blanca.
12. Revisar la ficha: dice "100% Orgánica", y eso es una promesa arriesgada.

### Ventas que se pueden recuperar
…2310 (1 negro, Yopal), …7030 (castaño claro), …7697 (castaño), …1705 (1 unidad), …6930 (eligió tono por foto), …2620 (castaño claro), …7768.

---

## 3. YUNABI (16 chats)

Casi todos estos clientes volvieron a dar clic al anuncio varias veces. Clasifiqué cada chat por la conversación más reciente.

### Por qué se cayó la venta
| Motivo | Nº |
|---|---|
| No respondió desde el inicio | 6 |
| El bot falló (no dio el precio o ignoró la pregunta) | 5 |
| Pregunta de salud: buscaban un remedio, y Yunabi no es tratamiento | 2 |
| Se fue después de ver el precio ($89.900) | 1 |
| Falta de plata ("después del 15") | 1 |
| Dijo que vuelve a escribir | 1 |

### Lo que más preguntan
1. **Precio.** "hola que precio tiene el yunabi" (…4909). "Cuanrto" (…5878).
2. **Cómo se da y cuánto trae.** "eso cómo se le da, ¿por pepa?" (…4972). "Cuántas unidades trae el tarro" (…4909).
3. **Si sirve para un problema de salud.** "se rascan mucho los oídos… sale sangre" (…9273). "mi perrito está rascando mucho… no toma agua" (…3926).

### Errores del bot
- **La presentación nueva no tiene precio.** Solo habla de "descuento por pago anticipado", que no está en la ficha.
  - …5878 y …4909 pidieron el precio y no lo recibieron.
  - …6049 dio ciudad (Aguadas, Caldas) y el bot le preguntó cuántas unidades sin decirle nunca el precio.
- **Dio consejos de veterinario.** A …3926 le explicó "1–2 ml con jeringa, revisa las encías…".
- **Prometió beneficios que no están en la ficha:**
  - "mejora la digestión y deja el pelaje más brillante".
  - "puede hacer la diferencia en su salud" (…7415).
- **No respondió la pregunta del cliente.** …8653 preguntó "¿a cómo…?" y el bot no contestó.
- **Recontacto vacío.** Con …4972 el bot agendó recontacto para el 16, pero ese día solo mandó una imagen, sin texto.

### Arreglos listos para pegar
**Preguntas frecuentes**
- *¿Precio?* → "El frasco de 200 g vale $89.900 con envío gratis. Pagas al recibir. ¿Es para perro o gato?"
- *¿Cómo se da?* → "Se da como premio o snack, siguiendo la porción del empaque." **FALTA DATO:** porción diaria según el peso.
- *¿Cuántos bocaditos trae?* → "Trae 200 g de bocaditos." **FALTA DATO:** número de piezas.
- *¿Sirve para rasquiña, alergia o si no come?* → "Yunabi es un snack complementario, no un tratamiento. Si tu mascota tiene síntomas, llévala al veterinario."
- *¿Sirve para gatos?* → "Sí, es para perros y gatos."

**Reglas para la ficha**
1. Agregar el precio a la presentación nueva y darlo primero si lo piden.
2. **FALTA DATO:** el monto del "descuento por pago anticipado". Si no existe, quitar la frase.
3. Prohibido dar indicaciones médicas o de dosis. Ante síntomas, responder solo: "consulta al veterinario".
4. No prometer que mejora la digestión o el pelaje: usar solo las palabras de la ficha ("complementa la rutina").
5. Si el cliente ya había dado ciudad o cantidad, seguir desde ahí y no repetir la presentación.
6. El recontacto agendado debe llevar texto con el precio y una pregunta de cierre.

### Ventas que se pueden recuperar
…4972 (1 unidad, Bucaramanga, esperaba la plata del 15), …6049 (Aguadas, Caldas), …4909, …5878, …9353, …7415.

---

Los chats en versión resumida que usé para revisar están en:
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/duo.txt
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/sh.txt
- /tmp/claude-0/-home-user-vision360-ui-kit/40215387-c828-577f-82b5-c3d3e4739b34/scratchpad/yu.txt

---

# Análisis de chats perdidos – La Bodeguita (7 productos, 96 chats)

**Problemas que se repiten en todos los productos:**
- **El bot repite todo el guion cada vez.** Si el cliente vuelve a tocar el anuncio, saluda, manda solo la ciudad o pega un enlace de Facebook, el bot envía otra vez los 8 a 10 mensajes del principio. Pasó con …2105, …0322, …9144, …8597, …7390 y …8579.
- **Se activa el guion del producto equivocado.** Un mensaje que no dice el producto ("¡Hola! Quiero más información.") abre el guion del Chaleco. "Iman Super Fuerte" abre el del Localizador. "Afilador de cadena" y "duo pelador" abren el del Ventilador. Hay que revisar los disparadores de los guiones en Lucid.
- **Mucha gente no responde nunca:** 59 de 96 chats. Los clientes de bicicleta tocan 2 o 3 anuncios seguidos (luz trasera, taloneras, chaleco) y reciben 3 guiones completos sin que nadie les responda en persona.

---

## LUCES MANDALA SOLAR (45 chats)

**1. Por qué se cayó la venta**
- No respondió desde el inicio: 17
- Se fue tras ver el precio: 13
- Falló el bot: 10
  - Pidieron el precio y el bot no lo dio en texto: …4659, …0314, …4740, …3132, …9110 y …8334.
  - Reinició el guion o no cerró: …8597, …5805, 1514807730548409 y …5003.
- Duda técnica sin resolver (pared o lluvia): 4
- Otros: 1

**2. Objeciones que más se repiten**
- **"¿Cuánto vale?"** (14 chats). Desde el 21-nov el guion ya no trae el mensaje de precios (solo pregunta "¿Cuál pack…?") y el bot no responde cuando preguntan el precio en el primer mensaje. Ejemplos: "Que bonitas que costo tienen" (…9110) y "hola y que. Vale uno" (…0314).
- **"¿Se pegan a la pared?"** Ejemplos: "necesito algo para colocar en la pared así como lo muestra su video de propaganda" (…4512), "Necesito adherirlas a la pared" (1642344520698574) y "No no puedo romper" (…9509).
- **¿Aguantan la lluvia?** Ejemplos: "O sea aguantan lluvia, son con electricidad o recargables" (…4218) y "Deben ser de batería solar y resistir la intemperie" (…4512).
- **"Costosas"** Ejemplos: "Costosas gracias" (1642344520698574) y "Gracias muy costosa" (…0735).
- **Quieren menos de 3 lámparas.** Ejemplos: "Solo quiero dos" (…8597) y "De 2" (…9509).
- **Durabilidad.** Ejemplo: "lo que yo quiero que me garanticen algo que valga la pena que aguanten" (…5805).

**3. Errores del bot**
- **Precio cambiante:** dice $109.000 (…5066, …4075, …1303, 1514807730548409) o $109.900 en otros chats. En octubre dijo $129.900, $232.500 y $295.700 (…5805). La ficha tampoco ayuda: la regla dice $109.000, los precios dicen $109.900, y "1 unidad" aparece en $109.900.
- **Se contradice sobre la pared.** En 1642344520698574 y …4512 dijo "no están diseñadas para adherirse a la pared". En …5805 dijo "Sí, claro que sí — se pueden instalar en la pared". En …9509 propuso "ganchos adhesivos".
- **Inventó datos:** "eliges uno de los 8 modos con el control integrado" y "Se despliega la cortina" (…5805), y "se encienden solitas al anochecer" (…9509).
- **Contradijo la política de entrega:** "revisas que todo esté en orden antes de soltar tu dinero" (…9509), cuando no se puede abrir el paquete antes de pagar.
- **Ofreció un descuento que no existe:** "¡te tengo un descuentico de $5.000!" (…2638).
- **No cerró cuando el cliente ya había elegido:** el cliente dijo "Las de 3 unidades. Porfa" y el bot respondió "¿Cuántos packs de 3 unidades quieres llevar?" y no siguió (1514807730548409). En …5003 el cliente dijo "Neiva, 3 luces" y el bot volvió a preguntar la ciudad.
- **Usó un correo como nombre:** "Gracias por tu tiempo, glvivirmejor@gmail.com" (…4512).

**4. Arreglos para pegar en Lucid**
- **Regla:** "Precios únicos: 3 lámparas $109.900, 6 lámparas $199.900, 9 lámparas $259.900. Nunca decir otra cifra. No se vende por menos de 3 unidades." Además, corregir la regla_1 de la ficha ($109.000 → $109.900) y borrar el precio de "1 unidad".
- **Regla:** "Si el cliente pregunta el precio en cualquier mensaje, dar los 3 precios en texto de inmediato." Y volver a poner el mensaje de precios dentro del guion.
- **Regla:** "No inventar el sistema de fijación, el encendido automático, los modos ni el control. No ofrecer descuentos."
- **Pregunta frecuente – ¿Se pegan a la pared?**
  "Se ubican sobre una superficie estable (piso, mesa, repisa) y proyectan el diseño sobre la pared." FALTA DATO: confirmar si traen gancho o base para colgar.
- **Pregunta frecuente – ¿Aguantan lluvia?**
  FALTA DATO: resistencia al agua. Mientras se confirma: "Recomendamos ubicarlas en un lugar cubierto."
- **Pregunta frecuente – ¿Son solares?**
  FALTA DATO: la ficha dice "si se confirma que el modelo es solar". Hay que confirmarlo y añadir cómo se cargan.
- **Pregunta frecuente – ¿Venden 1 o 2?**
  "Solo manejamos packs desde 3 lámparas: 3 por $109.900, 6 por $199.900 o 9 por $259.900. ¿Cuál te dejo?"
- **Pregunta frecuente – ¿Qué tamaño tienen?**
  FALTA DATO: medidas.

**5. Ventas recuperables**
- …9509: Medellín, pack de 3, contra entrega.
- 1514807730548409: Itagüí, pack de 3.
- …5003: Neiva, 3 luces, "este fin de semana".
- …5805: San Gil, vereda, envío a oficina.
- …8597: "Para conprar".

---

## Luz Led Trasera Para Bicicleta (18 chats)

**1. Por qué se cayó la venta**
- No respondió desde el inicio: 14
- Falló el bot (repitió el guion cuando el cliente escribió la ciudad o mandó un enlace): 2 (…2105, …0322)
- Duda técnica sin resolver: 1 (…2099, "Que duración tiene")
- Otros (sin dinero hasta la quincena): 1 (…3297, "Pagan hasta el 20")

**2. Objeciones que más se repiten**
- **Duración de la batería:** "Que duración tiene" (…2099). El bot respondió "no la tengo especificada".
- **Precio:** "Que precio en bogota" (1806624177689640) y "Cuánto cuesta" (…3297).

**3. Errores del bot**
- **Precio distinto a la ficha ($99.900):** el guion dijo "$89.900" hasta el 13-nov, y el bot también dijo "89.900" en 1806624177689640. En …3297 el guion mostró $89.900 y luego el bot dijo "$99.900".
- **El cliente dio la ciudad y el bot repitió todo el guion:** el cliente escribió "Villavicencio" (…2105).
- **Lenguaje fuera de lugar:** "esta luz trasera es una chimba... no, mentiras" (…7227).

**4. Arreglos para pegar en Lucid**
- **Regla:** "Precio único $99.900. Si el cliente responde con una ciudad, validar cobertura y pedir datos; nunca reiniciar el guion. Nunca usar groserías ni jerga vulgar."
- **Pregunta frecuente – ¿Cuánto dura la batería?**
  FALTA DATO: autonomía y forma de carga (la ficha dice "pendiente de confirmación").
- **Pregunta frecuente – ¿Es resistente al agua?**
  FALTA DATO.
- **Pregunta frecuente – ¿Qué trae?**
  "1 luz LED trasera con efecto alas de ángel." FALTA DATO: si trae soporte y cable de carga.

**5. Ventas recuperables**
- …2105: Villavicencio.
- …3297: pidió que le escribieran después del 20.

---

## Luces Led Deportivas Taloneras X2 (10 chats)

**1. Por qué se cayó la venta**
- No respondió: 10. Todos venían de tocar antes el anuncio de la luz trasera o del chaleco.
- En …8579 el cliente escribió "H" y el bot repitió todo el guion. En …7192 el guion se cortó tras una imagen.

**2. Objeciones:** ninguna escrita sobre las taloneras.

**3. Errores del bot:** reinició el guion (…8579).

**4. Arreglos para pegar en Lucid**
- **Regla:** "Si el cliente ya recibió el guion de otra luz de bicicleta, no enviar el guion completo; presentar brevemente las taloneras ($79.900, par, azul/verde/rosa) y preguntar color y ciudad."
- **Pregunta frecuente – ¿Qué baterías usa?**
  "Usa 2 baterías CR2016, ya vienen instaladas. Tiene luz fija y parpadeante."
- **Pregunta frecuente – ¿Se mojan?**
  "Resisten salpicaduras, pero no se pueden sumergir."
- **Pregunta frecuente – ¿Cuántas vienen?**
  "Vienen 2 taloneras por $79.900, en azul, verde o rosa."

**5. Ventas recuperables:** ninguna.

---

## Chaleco Con Luces Led Y Control (7 chats)

**1. Por qué se cayó la venta**
- No respondió: 7. Todos venían del guion de la luz trasera o de otro producto.

**3. Errores del bot**
- El guion termina con "🎁 ¡Y hay un beneficio adicional!" y nunca dice cuál es.
- Lo dispara cualquier "¡Hola! Quiero más información." aunque el cliente venga de otro anuncio (1120391074144623 preguntó "Que valor ???").

**4. Arreglos para pegar en Lucid**
- **Regla:** completar o borrar la frase del beneficio. Revisar el disparador genérico.
- **A la ficha le faltan especificaciones, contenido del paquete y modo de uso.**
  FALTA DATO: batería y carga, autonomía, tallas, resistencia al agua, pilas del control.

**5. Ventas recuperables:** ninguna.

---

## PARAGUAS INTEGRAL 360 (11 chats)

**1. Por qué se cayó la venta**
- No respondió: 8
- Se fue tras ver el precio: 3 (…3338, …9589, …9786)

**2. Objeción principal**
- **Precio o falta de dinero:** "No me da porque para la otra quincena… Yo era para preguntar" (…9786).

**3. Errores del bot**
- **Ofreció un descuento por iniciativa propia, sin decir que era por pago anticipado:** "hoy te lo puedo dejar en $134.900 🎯 Para que no se te escape la promoción" (…9786).

**4. Arreglos para pegar en Lucid**
- **Regla:** "No ofrecer rebajas por iniciativa propia; el 5% por pago anticipado solo se menciona como forma de pago, nunca como rebaja para retener."
- **Pregunta frecuente – ¿Qué tan largo es?**
  "La pantalla transparente mide 160 cm y baja casi hasta el suelo. Talla única."
- **Pregunta frecuente – ¿Cómo se abre?**
  "Apertura automática con botón. Es plegable y trae funda de transporte."
- **Pregunta frecuente – ¿Sirve con viento fuerte?**
  "No se recomienda usarlo durante tormentas eléctricas ni ráfagas fuertes."

**5. Ventas recuperables:** ninguna clara.

---

## VENTILADOR SOLAR (4 chats)

**1. Por qué se cayó la venta**
- Falló el bot: 3
  - Repitió el guion (…9144).
  - Mandó el guion del ventilador a quien preguntó por el pelador y mandó fotos (…1243).
  - No le hizo seguimiento a una venta agendada (…7390).
- No respondió: 1 (…5017; después recibió el guion del ventilador cuando preguntó por el afilador).

**2. Objeciones**
- **Tamaño y precio:** "Que tamaño", "Cuánto vale" (…7390).
- **Envío a vereda:** "En una vereda de viota cundinamarca" (…7390).

**3. Errores graves en el guion**
- El guion dice **"🎛️ Control"** dentro de lo que incluye. La regla de la ficha prohíbe decirlo: el ventilador NO trae control.
- El guion dice **"2 velocidades… batería recargable… luz LED y puerto USB… solo 6 pulgadas"**. Nada de eso está en la ficha, y la medida real es 20×10×24 cm.
- Se contradice en el mismo chat: "6 pulgadas" y luego "20 × 10 × 24 cm" (…7390).

**4. Arreglos para pegar en Lucid**
- **Corregir el guion:** quitar "Control", "2 velocidades", "luz LED", "USB" y "6 pulgadas".
- **Pregunta frecuente – ¿Qué incluye?**
  "1 ventilador, 1 panel solar y 1 cable de carga. No trae control remoto; se maneja desde sus botones."
- **Pregunta frecuente – ¿Medidas?**
  "Ventilador de 20×10×24 cm, 1 kg. Panel solar de unos 27×18 cm. El ángulo se ajusta a mano hasta 90°."
- **Pregunta frecuente – ¿Cuánto dura?**
  "Carga con el sol durante el día; dura de 6 a 8 horas." Este dato viene de una pregunta frecuente de la ficha y hay que confirmarlo.

**5. Ventas recuperables**
- …7390: Viotá, Cundinamarca, envío a oficina. Dijo "quedamos pendientes para el sábado".

---

## Localizador De Taladro Angulo Ajustable (1 chat)

**1. Por qué se cayó la venta**
- Falló el bot: 1 (…3776). El cliente preguntó por "Iman Super Fuerte" y luego por "afilador de cadena", y las dos veces recibió el guion del Localizador.

**4. Arreglo**
- Corregir los disparadores en Lucid.
- **Pregunta frecuente – ¿Perfora?**
  "No perfora. Es una guía de aluminio que mantiene el taladro en el punto y ángulo correctos sobre madera."

**5. Ventas recuperables:** ninguna.