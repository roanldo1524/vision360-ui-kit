# Estado del proyecto Toro Verde

Última actualización: 11 de octubre de 2026.

## Dónde está cada cosa
- Plan de la Máquina Creativa: `docs/maquina-creativa-ugc.md` (original en https://claude.ai/artifact/FyyrfnVF3S2K4Lzov4g2cX).
- Plan de recompra en Lucid Bot: `docs/recompra-lucid-bot.md` (original en https://claude.ai/artifact/4Qu5RYU6hEe26RRBdJvZ7R).
- Código hecho antes en el computador (no está en este repositorio todavía):
  - Carpeta `TORO VERDE-MARKETING/lucidbot-recompra/`: 11 plantillas desde el día 3, la máquina de estados y el brief para Lucid Bot, además de `imagenes_plantillas.json`, `guia_visual_recompra.md` y `segmentos_recompra_toroverde.csv`.
  - CREATIVE OS: app desplegada antes con Claude Code.
  - Para traerlos aquí: subir esas carpetas a este repositorio en GitHub (botón "Add file → Upload files").

## PRIORIDAD: recuperar el código de la plataforma
- La plataforma está publicada en https://maquina-creativa.vercel.app/crm (Vercel, equipo "Mi ciclo", plan Hobby) y usa Supabase.
- El proyecto de Vercel NO tiene repositorio de Git conectado: se publicó desde una carpeta con la CLI de Vercel. El código fuente está guardado en el último deployment.
- Plan de recuperación:
  1. Con la variable `VERCEL_TOKEN` y la red abierta a `api.vercel.com`, listar los deployments del proyecto `maquina-creativa` y descargar todos los archivos fuente del último (API `GET /v6/deployments/{id}/files` y `GET /v7/deployments/{id}/files/{fileId}`).
  2. Guardar el código en un repositorio de GitHub propio (por ejemplo `roanldo1524/maquina-creativa`).
  3. Conectar ese repositorio al proyecto de Vercel (Settings → Git) para que cada cambio quede guardado y se publique solo.
  4. Las variables de Supabase se copian desde Vercel (Settings → Environment Variables), nunca se suben al repositorio.
- No construir una plataforma nueva: se sigue editando la que ya existe.

## Máquina Creativa: qué sigue
Fase 1, el cerebro: análisis de los 95 videos, ADN de marca, guionista con 3 críticos y la tanda en PDF.
Falta para arrancar:
- [ ] Reconectar Meta Ads y Notion en los conectores de Claude.
- [ ] Carpeta de Drive con los 95 videos, nombrados igual que en Meta (o el export de Meta).
- [ ] API key de Lucid Bot y el endpoint para disparar un flujo o una plantilla.
- [ ] Decidir quién despliega la app y quién aprueba las tandas cuando el dueño no está.

## Recompra Lucid Bot: plan por semanas
- Semana 1 (7–13 oct): validar margen del galón a $249.900, cotizar el medidor de 130 ml, subir plantillas a Meta, importar segmentos, reactivar el segmento 2.
- Semana 2 (14–20 oct): ajustar ENTREGADO, activar días 3 y 7, audios de Jaime, reactivar segmentos 3 y 4.
- Semana 3 (21–27 oct): activar días 14, 21, 28 y 35.
- Semana 4 (28 oct – 3 nov): activar días 50, 65 y 90, referidos y primer corte de métricas.
- Pregunta abierta: ¿Lucid Bot crea el pedido en Dropi directo desde el botón "Sí, mándemelo"?
