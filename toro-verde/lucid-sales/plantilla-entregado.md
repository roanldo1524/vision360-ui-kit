# Plantilla única de ENTREGADO (26-11-2026)

Idea tomada del ejemplo de Titanturk que mandó Ronald: un solo mensaje que confirma la entrega, pide la foto de la guía y abre la puerta a reclamos, con 3 botones.

Cambios frente al ejemplo:
- **Sin código de descuento.** Quien recibe este mensaje ya compró, y la regla de la marca dice que a esos clientes se les vende a precio normal. Además, si lleva un descuento, Meta la cobra como plantilla de marketing en vez de utilidad, que es más cara.
- Lleva la dosis, como todo mensaje de uso: «agite el envase» y «mínimo 130 ml por bomba de 20 litros».
- El botón «Ver mi regalo» pasa a ser «Cómo aplicarlo».

## Plantilla en Meta
- Nombre: `entregado_toroverde`
- Categoría: **Utilidad**. Idioma: español.
- Variable {{1}}: nombre del cliente.

**Texto:**

```
Hola {{1}}, nos confirman que ya le entregaron su pedido de Toro Verde ✅

Un favor que le sirve a usted: tómele una foto a la guía del paquete, donde se vea el número. Con eso, cualquier reclamo se resuelve en minutos.

Antes de aplicar: agite el envase y use mínimo 130 ml por bomba de 20 litros. Con menos dosis la maleza vuelve a salir.

Si algo llegó mal o le falta algo, escríbanos por aquí mismo y lo solucionamos.
```

**Botones:**
1. Respuesta rápida: `Todo llegó bien`
2. Respuesta rápida: `Tengo un problema`
3. Enlace: `Cómo aplicarlo` → video de aplicación (pegar el enlace del video que ya se manda hoy)

## Qué hace el flujo en Lucid con cada botón

**Todo llegó bien:**
```
¡Qué bueno, {{nombre}}! 🌱 Para que le rinda y funcione:
1. Agite el envase antes de medir.
2. Mínimo 130 ml por bomba de 20 litros.
3. Aplique directo a la maleza, con el día seco.
¿Para qué cultivo lo va a usar?
```
- Etiqueta: `entregado_ok`. La respuesta del cultivo se guarda en el campo cultivo.
- Sigue el plan de recompra (días 3, 7, 14…).

**Tengo un problema:**
```
Lo sentimos, {{nombre}}. Cuéntenos qué pasó y, si puede, mándenos la foto de la guía y del producto. Una persona del equipo le responde ya mismo.
```
- Etiqueta: `reclamo_entrega`. Se pausa el bot y se asigna a Karen.
- Regla de oro: con reclamo abierto, no se le envía ninguna oferta.

**No responde:** no se le manda nada más ese día. Sigue el plan de recompra.

## Qué reemplaza
Los mensajes que hoy salen en ENTREGADO (gracias + guía + reclame + entregado) pasan a ser **esta sola plantilla**. Se apagan los otros para que no le lleguen dos mensajes al cliente.
