# Activar la recompra del día 30 (27-11, Santiago de tecnología)

**Qué encontramos:** el flujo «RC S4 - Dia 30 otro lote» (1791407991298) existe en Lucid, pero casi no sale. De 60 clientes que recibieron hace 32 a 45 días, solo 3 recibieron algún mensaje después del día 25. Hoy hay 551 clientes en el día 28 a 35 que no han vuelto a comprar.

**Qué hace el robot:** `robot-despacho/recompra.py` dispara ese flujo una vez al día, hasta 80 clientes. Solo les llega a quienes:
- recibieron hace 28 a 35 días;
- no han vuelto a pedir;
- no tienen queja ni chat en modo humano;
- no compraron poma.

Está en **modo prueba**: no envía nada.

**Lo que Ronald revisa en Lucid (2 minutos):**
1. Automatización → Flujos → abre «RC S4 - Dia 30 otro lote».
2. Que el primer paso sea una **plantilla aprobada por Meta**. Después de 30 días el chat está cerrado y un texto normal no llega.
3. Que **no tenga descuento ni precio especial**: son clientes que ya compraron y pagan precio normal.
4. Que diga «agite el envase» y «mínimo 130 ml por bomba de 20 litros», y que no use «orgánico», «natural» ni las otras palabras prohibidas.
5. Si todo está bien, escríbele al robot: **«activa la recompra»**. Se cambia `ACTIVO = True` y queda corriendo una vez al día.
