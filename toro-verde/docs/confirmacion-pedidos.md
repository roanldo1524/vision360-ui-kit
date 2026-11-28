# Confirmación de pedidos (el trabajo de Karen, hecho por Claude)

Pedido de Ronald (2026-11-16): que Claude revise, califique y confirme los pedidos con un método fijo, para despachar solo pedidos buenos.

## Metas (KPI)
| Indicador | Meta |
|---|---|
| Tasa de entrega | 92 % |
| Cancelación | 3 % |
| Devolución | 5 % |

## Regla de oro
**Claude nunca cancela un pedido.** Si un pedido parece para cancelar (el cliente dijo que no lo quiere, está repetido, dirección imposible), se marca «🙋 Atención humana» y una persona decide. Así no se cancela por error un pedido bueno.

## Paso a paso, para cada pedido en «Pendiente confirmación»
1. **Historial del cliente en Dropi** (huella del comprador: % de entregas y % de devoluciones).
2. **Intención de compra en el chat de WhatsApp** (Lucid): que no haya dicho que cancela, que ya no lo quiere, que lo compró en otro lado, o que dé señales de broma. Si dijo «ya cancelé» en pasado, es que pagó (regla 39 del bot), no que anuló.
3. **Dirección**: que un mensajero pueda llegar (calle o carrera con número; manzana y lote con barrio; vereda o finca con municipio; u «oficina Interrapidísimo»). Ciudad y departamento que cuadren.
4. **Repetidos**: mismo teléfono con dos o más pedidos pendientes.

## Decisión
| Situación | Qué se hace | Etiqueta en Lucid |
|---|---|---|
| Devoluciones **más de 50 %** | **No se envía.** Se le pide abono por WhatsApp: $10.000 (1 o 2 litros) o $20.000 (galón o poma), a Bancolombia ahorros terminada en 9202 (la cuenta guardada en Lucid). Se despacha solo cuando una persona verifica la consignación. | «💰 Abono pedido» |
| Dijo que cancela, dudas de intención, dirección dudosa o repetido | No se toca. Lo revisa una persona. | «🙋 Atención humana» |
| Cliente con historial sano o sin historial, intención clara y dirección buena | **Calificado**: se confirma para despacho. | «✅ Confirmado por Claude» |

Clientes sin historial en Dropi no son riesgosos: se califican por intención y dirección.

## Limitación actual
Con la conexión de Dropi disponible, Claude puede **leer** pedidos pero no darles «Confirmar» en Dropi (Ronald no quiere pedir la llave de integración). Por ahora Claude entrega la lista de números de pedido calificados y una persona los confirma en bloque en Dropi.

## Datos
La lista con nombres, teléfonos y direcciones vive solo en la carpeta temporal de la sesión. Aquí y en ESTADO.md solo se anotan números de pedido y cifras.
