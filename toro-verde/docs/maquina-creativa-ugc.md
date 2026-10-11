# Máquina Creativa UGC — Toro Verde

Copia del documento: https://claude.ai/artifact/FyyrfnVF3S2K4Lzov4g2cX

Un sistema de gestión de embajadoras con 11 módulos. Tú pones la meta de la semana (por ejemplo 100 anuncios) y el sistema escoge con qué embajadoras activas grabar según su perfil, escribe los briefs con el ADN de Toro Verde, los envía por WhatsApp o correo, revisa y edita lo grabado, lo deja listo para Meta y analiza por qué vendió o no cada anuncio. Cada embajadora tiene un portal con su link de ventas y sus comisiones, y tú un panel para medirlas. Tú sólo apruebas en dos puntos: antes de grabar y antes de lanzar.
El ciclo completo
Cada módulo alimenta al siguiente y el último reescribe el cerebro, así cada tanda sale mejor que la anterior.
IG, TikTok, Dropkiller] --> C
  B[2. ADN de marcaganadores, voz cliente, reglas] --> C
  C[3. Guionista + 3 críticos4 briefs por creador] --> H1{Apruebas tú}
  H1 --> D[4. EnvíoLucidBot o correo]
  D --> E[5. Recepción y revisióndel material grabado]
  E --> F[6. Edición automáticaapoyo, subtítulos, variantes]
  F --> H2{Apruebas tú}
  H2 --> G[7. Lanzamiento + análisiscada 3 días]
  G --> B]]>
Las dos aprobaciones humanas son obligatorias: es un herbicida, y una promesa falsa o una mención prohibida cuesta la cuenta publicitaria. Todo lo demás corre solo.
Módulo 1 — Radar de tendencias
Una vez por semana el radar trae los formatos que más están rindiendo y los convierte en fichas de formato. No copia videos: extrae la estructura y la adapta a los ángulos de Toro Verde.
Fuente
 | Qué trae
 | Cómo se conecta
 | 
Dropkiller
 | Anuncios de Meta y TikTok con días activos y puntaje de ganador
 | Ya conectado a Claude
 | 
Apify (extractores TikTok e Instagram Reels)
 | Videos virales por hashtag, cuenta o búsqueda: vistas, likes, comentarios, archivo
 | API, pago por uso
 | 
TikTok Creative Center
 | Top de anuncios, sonidos y hashtags en tendencia por país
 | Revisión manual o extractor
 | 
Biblioteca de anuncios de Meta
 | Anuncios activos de competidores del agro
 | API pública
 | 
Cada video viral pasa por un analista de video que devuelve una ficha:
Tipo de gancho y qué se ve en el segundo 1
Estructura por segundos (problema, giro, prueba, cierre)
Ritmo de cortes, encuadre, tipo de texto en pantalla, uso de música o no
Por qué funciona y a qué ángulo de Toro Verde se puede adaptar
Las fichas se guardan en una biblioteca de formatos en Notion. El guionista sólo puede usar formatos de esa biblioteca o de tus ganadores.
Módulo 2 — ADN de marca
El ADN es un solo documento vivo que el guionista lee antes de cada tanda. Sin él, cualquier IA escribe genérico.
Bloque
 | Qué contiene
 | De dónde sale
 | 
Patrones ganadores
 | Lo que comparten los videos que vendieron: gancho, primer plano, estructura, creador
 | Análisis de los 95 videos + Meta
 | 
Lista negra
 | Lo que se repite en los que no vendieron
 | Mismo análisis
 | 
Voz del cliente
 | Frases textuales de dolor, intento fallido, deseo y miedo
 | Encuesta, 115 leads, comentarios de anuncios, chats de LucidBot
 | 
Ficha de las 8 cosas
 | Dolor, intento, deseo, miedo, nivel, lenguaje, contexto, identidad
 | Framework Master Ecom
 | 
Diferencial
 | Limpio arriba, cultivo verde; honestidad sobre el rebrote; suelo, no velocidad
 | Aprendizajes del proyecto
 | 
Objeciones prioritarias
 | Daño al suelo (28%) y cada cuánto reaplicar (27%)
 | Encuesta
 | 
Reglas de cumplimiento
 | Sin ICA, sin precios, sin "orgánico" ni "ecológico", dosis mínima 130 ml por bomba
 | Reglas actuales
 | 
Perfil por creador
 | Cómo habla, qué ángulos le funcionan, qué no puede fingir
 | Roster UGC + resultados por creador
 | 
El módulo 7 actualiza los dos primeros bloques cada 3 días. Los demás cambian sólo cuando tú lo decides.
Módulo 3 — Guionista y críticos
Por cada creador sale una tanda de 4 briefs, cada uno con un ángulo distinto, 5 ganchos y 5 cierres. Ningún brief llega a ti sin pasar los 3 críticos.
Mezcla de cada tanda de 4: 2 variantes de ángulos ganadores con otro formato, 1 formato del radar aplicado a un ángulo ganador y 1 ángulo nuevo para probar.
Qué trae cada brief:
Hipótesis: qué se prueba y por qué ("creemos que X porque Y")
De qué ganador o formato sale, y qué frases reales del cliente usa
Nivel de consciencia y objeción que responde
Tabla Momento / Visual / Audio / Texto en pantalla con segundos
5 ganchos alternativos (sólo los primeros 3 segundos) y 5 cierres
Instrucciones de grabación: dónde, qué tomas de apoyo grabar, qué no hacer
Crítico
 | Qué revisa
 | Si falla
 | 
Anti-genérico
 | Lista de chequeo de 10 puntos; lenguaje del cliente; palabras de marketing prohibidas; que cite ganador y frase real
 | Devuelve con la línea exacta a cambiar
 | 
Cumplimiento
 | ICA, precios, "orgánico", promesas de raíz o permanencia, dosis mínima
 | Bloquea el brief
 | 
Director
 | Se entiende sin audio; una acción por bloque; el creador lo puede decir con naturalidad
 | Devuelve con la escena a simplificar
 | 
Máximo 3 vueltas por brief. Si no pasa, se descarta y se escribe otro. El puntaje de cada crítico queda guardado para comparar después con los resultados reales.
Módulo 4 — Envío al creador
LucidBot sí tiene API pública, documentada en Swagger; falta confirmar con tu API key qué endpoints expone para enviar mensajes o disparar flujos. El correo va como respaldo y como copia formal.
Flujo:
Apruebas la tanda en el panel de administración.
Se genera el PDF de la tanda en tu formato de siempre.
Por API de LucidBot: se busca o crea el contacto del creador, se guardan en campos personalizados el enlace del PDF y el enlace de la carpeta de Drive para subir, y se dispara un flujo o plantilla "Nueva jornada".
El mismo PDF sale por correo con el detalle.
LucidBot pregunta la fecha de grabación y envía recordatorio el día antes.
Regla de WhatsApp: si el creador no ha escrito en las últimas 24 horas, sólo se le puede escribir con una plantilla aprobada por Meta. Hay que crear y aprobar 3 plantillas en LucidBot: "Nueva jornada", "Recordatorio de grabación" y "Falta material".
Módulo 5 — Recepción y revisión del material
El creador sube todo a su carpeta de Drive y el sistema lo revisa solo en minutos. Si falta algo, se lo pide por WhatsApp antes de que tú o José lo vean.
Revisión técnica: formato vertical, duración, audio limpio sin viento ni ruido, luz, que estén las 2 tomas, los 5 ganchos, los 5 cierres y las tomas de apoyo pedidas.
Revisión de contenido: se transcribe cada toma y se compara con el guion. Marca frases omitidas, cambios que alteran el mensaje y menciones prohibidas. Un modelo que entiende video revisa lo visual: que el cultivo verde se vea, que haya una acción por plano, que el primer segundo sea el pedido.
Resultado: cada toma queda etiquetada (gancho 1–5, cuerpo, cierre 1–5, apoyo) y con la mejor toma elegida. Eso es lo que usa el editor automático.
Módulo 6 — Edición automática
La edición no sale genérica si el estilo lo diseña José una vez y la máquina sólo lo aplica. La IA decide qué va en cada segundo; la plantilla decide cómo se ve.
Cómo funciona:
José diseña de 3 a 5 plantillas de estilo en Creatomate, por ejemplo "anuncio feo", "testimonio con apoyo" y "antes y después".
Se arma una biblioteca de tomas de apoyo de Toro Verde etiquetadas: cultivo verde, maleza seca, bomba, guadaña, finca, manos, tierra.
Con la transcripción, la IA arma el plan de edición: dónde entra cada toma de apoyo según lo que se dice, qué frase va en pantalla, dónde se corta.
Subtítulos palabra por palabra con el estilo de la plantilla y las frases clave del brief resaltadas.
Se renderizan las combinaciones: cuerpo × 5 ganchos × cierres. 4 briefs × 5 ganchos = 20 anuncios por creador; con 5 creadores, 100 por semana.
Control de calidad: las primeras 3 semanas José revisa todo y corrige la plantilla o la regla que falló, no el video. Después revisa una muestra. Su trabajo pasa de editar a dirigir el estilo.
Límite honesto: la edición automática es muy buena para ganchos, subtítulos, tomas de apoyo y variantes. Para una pieza narrativa compleja, José sigue siendo mejor, y esas se marcan como "edición manual" desde el brief.
Módulo 7 — Lanzamiento y análisis
Los videos aprobados suben a Meta por API con tu nomenclatura y tu estructura de testeo ABO (1 conjunto = 1 ángulo). El análisis se hace en tres cortes, porque a los 3 días todavía no hay suficientes compras para juzgar el CPA.
Corte
 | Qué se mide
 | Qué se decide
 | 
Día 3
 | Tasa de gancho, retención, CTR, costo por clic
 | Qué gancho gana; apagar los que no enganchan
 | 
Día 7
 | CPA sobre pedidos entregados, CTR único
 | Ganador o perdedor; pasar ganadores a escalado
 | 
Día 21
 | Resultado final por video
 | Bono del creador; cerrar el aprendizaje
 | 
En cada corte el analista:
Cruza cada anuncio con su brief: hipótesis, ángulo, gancho, formato, creador y puntaje de los críticos.
Escribe qué funcionó y qué no, con la razón probable según la métrica donde murió.
Actualiza patrones ganadores y lista negra en el ADN.
Revisa si los críticos aciertan: si aprueban guiones que luego pierden, se ajustan sus reglas.
Te manda un resumen por WhatsApp o correo y deja lista la siguiente tanda para aprobar.
La meta del proyecto (CTR único mayor a 5% y CPA menor a $10.000 COP) define qué cuenta como ganador.
Módulo 8 — Perfil de cada embajadora
Cada embajadora tiene una ficha que el guionista lee antes de escribirle. El brief se escribe para ella: a quién le habla, cómo habla y qué puede decir sin sonar falsa.
Bloque
 | Campos
 | 
Datos básicos
 | Nombre, edad, ciudad o vereda, rural o urbana, WhatsApp, correo, redes
 | 
Contexto real
 | Tiene finca o no, cultivo (café, cacao, plátano, potrero), rol (dueña, hija, mayordomo, vecina)
 | 
Avatar al que le habla
 | Edad y perfil del público que le cree; nivel de consciencia que mejor maneja
 | 
Estilo
 | Tono (serio, humor, técnico, tímido), vocabulario propio, muletillas, fortalezas y límites frente a cámara
 | 
Logística
 | Equipo (celular, luz, micrófono), locaciones disponibles, días disponibles, capacidad por semana, tarifa
 | 
Estado
 | Activa, en pausa o retirada; fecha de ingreso
 | 
Historial automático
 | Briefs grabados, anuncios lanzados, ganadores, ángulos donde gana, métricas promedio
 | 
La embajadora llena los primeros bloques en un formulario de registro. El historial lo llena el sistema solo. En el registro se incluye la autorización de tratamiento de datos personales que exige la ley colombiana (Ley 1581 de 2012).
Módulo 9 — Planificador semanal
Tú pones la meta de la semana y el sistema calcula cuántos briefs escribir, con quién grabar y qué ángulo le toca a cada una.
La cuenta: cada brief rinde 5 anuncios (1 cuerpo × 5 ganchos). Cada embajadora graba hasta 4 briefs por jornada.
Meta de anuncios
 | Briefs
 | Embajadoras activas necesarias
 | 
50
 | 10
 | 3 (4 + 3 + 3 briefs)
 | 
100
 | 20
 | 5 (4 briefs cada una)
 | 
200
 | 40
 | 10
 | 
Cómo reparte:
Toma sólo a las embajadoras activas con disponibilidad esa semana.
Asigna ángulos según el historial: a cada una le da primero los ángulos y avatares donde ya ganó.
Respeta la mezcla: 70% variantes de ganadores y 30% ángulos nuevos.
Cubre avatares distintos: no pone a dos embajadoras iguales a grabar el mismo ángulo.
Si no alcanzan las activas para la meta, te avisa cuántas faltan y qué perfil convendría reclutar.
Apruebas el plan de la semana y de ahí sale todo lo demás: briefs, envíos y recordatorios.
Módulo 10 — Portal de embajadoras
Cada embajadora entra con su usuario, ve sus briefs, sube su material, comparte su link y ve cuántas ventas ha generado. El portal no maneja dinero: sólo cuenta las ventas y calcula la comisión (ventas entregadas × valor fijo por venta). El pago lo hace la empresa por fuera, y en el panel se marca como pagado. Cuenta sólo lo entregado, porque en contra entrega un pedido creado no es una venta.
Qué ve la embajadora:
Briefs asignados, fecha de grabación y botón para subir material
Su link personal (toroverde.co/?ref=nombre) y su código de descuento
Sus ventas: creadas, confirmadas, entregadas y devueltas, por semana y por mes
Comisión calculada del periodo (entregadas × valor por venta) y si ya se le pagó
Bonos por anuncios suyos que ganaron en Meta
Cómo se atribuye la venta:
El link guarda el código de la embajadora en el navegador del cliente.
Al comprar, el código queda en el pedido de Shopify. El código de descuento sirve de respaldo si el formulario contra entrega no pasa el dato; hay que probarlo con EasySell.
Un webhook de Shopify registra el pedido en el sistema a nombre de la embajadora.
Cuando Dropi marca el pedido como entregado, la comisión pasa a aprobada. Si se devuelve, se anula.
Dos fuentes de ingreso para la embajadora: comisión por ventas de su link y bono por anuncios suyos que ganen en Meta (el bono de 21 días actual).
Existen apps de afiliados para Shopify (Shopify Collabs, UpPromote, GoAffPro), pero ninguna sabe si Dropi entregó el pedido. Por eso conviene que la atribución y las comisiones vivan en el sistema propio.
Módulo 11 — Panel de administración
Un tablero donde ves a todo el ejército ordenado por lo que aporta en ventas, no por cuánto graba.
Grupo
 | Métricas por embajadora
 | 
Cumplimiento
 | Briefs asignados vs entregados, entregas a tiempo, % de material aprobado por la revisión automática
 | 
Rendimiento en Meta
 | Anuncios lanzados, ganadores, tasa de acierto, tasa de gancho y retención promedio, CTR, CPA, gasto
 | 
Ventas por link
 | Clics, pedidos, pedidos entregados, % de devolución, ingresos en Shopify
 | 
Dinero
 | Comisión calculada por ventas entregadas, marcada como pagada cuando se liquida por fuera; bonos; costo total vs ventas que generó
 | 
Aprendizaje
 | Ángulos y avatares donde gana, dónde pierde, por qué vendió o no cada anuncio
 | 
Vistas clave: ranking semanal, embajadoras en riesgo (entregas tarde o sin ganadores en 4 semanas), perfiles que faltan para la meta y pagos por liquidar.
Roles: administrador (tú), equipo (José y Santiago, sin ver pagos si así lo decides) y embajadora (sólo lo suyo).
Arquitectura técnica
Con login, conteo de ventas por embajadora y muchas integraciones, esto ya no es una automatización: es una aplicación propia. La recomendación es construirla con Claude Code, sobre una base de datos propia, con los agentes corriendo como tareas de fondo.
 DB
  A[Panel admin] --> DB
  DB[(Supabasedatos, login, archivos)]
  J[Tareas de fondoagentes con Claude] --> DB
  J --> X[Meta Ads API]
  J --> L[LucidBot + Gmail]
  J --> C[Creatomate + Drive]
  J --> R[Apify + Dropkiller]
  S[Shopify webhooks] --> DB
  D[Estados de Dropi] --> DB]]>
Las dos pantallas (portal y panel) leen la misma base de datos. Los agentes corren en segundo plano, hablan con cada servicio y escriben los resultados ahí.
Pieza
 | Herramienta
 | Costo aprox. (USD/mes)
 | 
Portal y panel
 | Next.js en Vercel
 | 0–20
 | 
Base de datos, login y archivos
 | Supabase
 | 25
 | 
Tareas de fondo y programación (día 3, 7, 21)
 | Trigger.dev o cron de Supabase
 | 0–50
 | 
Agentes
 | API de Claude
 | 50–200 según volumen
 | 
Transcripción y revisión de video
 | Whisper + modelo que entiende video (por ejemplo Gemini)
 | 30–90
 | 
Edición
 | Creatomate
 | 50–150
 | 
Tendencias
 | Apify + Dropkiller
 | 30–100
 | 
Ventas y entregas
 | Shopify webhooks + integración de estados de Dropi (la misma que hoy dispara LucidBot)
 | 0
 | 
Envíos
 | LucidBot API + Gmail
 | Ya lo tienes
 | 
Lanzamiento y métricas
 | Meta Marketing API
 | 0
 | 
Total aproximado: 250 a 700 USD al mes, sin contar anuncios ni comisiones. Precios por verificar con cada proveedor.
Con qué construirlo
Opción
 | Para qué sirve
 | Veredicto para este sistema
 | 
Claude Code
 | Escribe código real en un repositorio que es tuyo: base de datos, login, webhooks, integraciones, pagos
 | Recomendado. Ya desplegaste CREATIVE OS con él
 | 
Manus
 | Agente autónomo para investigar y hacer tareas sueltas
 | No es para construir y mantener un sistema con comisiones y muchas integraciones
 | 
Base44
 | Paneles y apps rápidas sin código
 | Sirve para un prototipo del panel; se queda corto con tareas de fondo, webhooks y comisiones
 | 
Claude Code construye la aplicación y la API de Claude pone a pensar a los agentes dentro de ella. Lo que sí hace falta es una persona que despliegue y mantenga el sistema, o que tú lo hagas con Claude Code como con CREATIVE OS.
Plan de construcción
Se construye primero el cerebro y después la fábrica: si los guiones no son buenos, automatizar el resto sólo produce perdedores más rápido.
Fase
 | Qué queda funcionando
 | Semanas
 | 
1. Cerebro
 | Análisis de los 95 videos, ADN de marca, guionista + 3 críticos, tanda en PDF
 | 1–2
 | 
2. Base y embajadoras
 | Base de datos, registro y perfil de embajadoras, planificador semanal, panel admin básico
 | 2
 | 
3. Envío y recepción
 | Envío por LucidBot y correo, subida de material, revisión automática
 | 1–2
 | 
4. Edición
 | Plantillas de José, biblioteca de apoyo, render de combinaciones
 | 2
 | 
5. Lanzamiento y ciclo
 | Subida a Meta, análisis día 3 / 7 / 21, por qué vendió o no, actualización del ADN, bonos
 | 1–2
 | 
6. Portal y comisiones
 | Login de embajadoras, link de afiliada, atribución en Shopify, comisión al entregar en Dropi
 | 2–3
 | 
7. Radar
 | Tendencias de Instagram y TikTok en la biblioteca de formatos
 | 1
 | 
Para arrancar la fase 1 hace falta:
Reconectar Meta Ads y Notion en la configuración de conectores de Claude (están instalados pero desconectados)
Carpeta de Drive con los 95 videos, nombrados igual que en Meta
Export de Meta si el conector no funciona: nombre del anuncio, gasto, impresiones, reproducciones de 3 segundos, ThruPlays, CTR de enlace, compras
Por decidir:
Pedir a LucidBot la API key y confirmar el endpoint para disparar un flujo o una plantilla a un contacto
Quién despliega y mantiene la aplicación (tú con Claude Code o un desarrollador)
Quién aprueba las tandas cuando tú no estés
Fuentes
Documentación de la API de Lucid Bot
Lucid Bot: Solicitudes externas / contenido dinámico
Lucid Bot: crear plantillas de WhatsApp
Apify: TikTok Trends Scraper
Apify: Instagram Reels Search Scraper
Creatomate: subtítulos automáticos por API
Creatomate: crear un video desde plantilla
Ley 1581 de 2012 — protección de datos personales (Función Pública)
