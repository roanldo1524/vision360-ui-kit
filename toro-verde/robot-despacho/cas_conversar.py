# Ronald 24-11: «revisa el tema del CAS, que realmente sea efectivo y puedas hablar con la transportadora; eres un agente humano…
# metido dentro de Dropi con razonamiento para hablar con transportadoras; redacta buenos mensajes coherentes para que nos apoyen».
# Lee la bandeja del CAS (cas_bandeja.json, de cas_bandeja.js) y arma dos listas para que el agente las razone y responda:
#  - RESPONDER: casos donde el último mensaje es de un ASESOR HUMANO (no la IA de Dropi, no nosotros) y no le hemos contestado.
#  - ESCALAR: casos abiertos (active/queues) cuyo último mensaje es de la IA y nadie humano los ha tomado → pedir asesor.
# Uso: node cas_bandeja.js && python3 -I cas_conversar.py → /tmp/dropi/cas_pendientes.json (y lo imprime)
import json, datetime
d = json.load(open('/tmp/dropi/cas_bandeja.json'))
NOSOTROS = ('CONFIRMADO', 'Ronaldo', 'Karen', 'SMANTA')
IA = 'Tes Soporte TI'
lim = (datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=10)).isoformat()
responder, escalar = [], []
for x in d:
    if (x.get('creado') or '') < lim: continue
    ult = x.get('ult') or ''
    quien = x.get('asesor') or ''
    if x['estado'] in ('active', 'queues', 'postponed'):
        if ult.startswith('¡Hola! Te escribe el agente de IA') or 'Dame un momento mientras reviso' in ult:
            escalar.append(x)
        elif quien and quien != IA and not any(n in quien for n in NOSOTROS):
            responder.append(x)
    elif x['estado'] == 'close' and quien and quien != IA and (x.get('ult_fecha') or '') > lim:
        responder.append(x)   # cerrado por un asesor: leer qué dijo (p. ej. «disponible en oficina») y actuar
json.dump({'responder': responder, 'escalar': escalar}, open('/tmp/dropi/cas_pendientes.json', 'w'), ensure_ascii=False, indent=1)
print('RESPONDER', len(responder), '· ESCALAR', len(escalar))
for x in responder: print(' R', x['pedido'], x['dc'], x['estado'], (x.get('asesor') or '')[:20], '|', (x.get('ult') or '').replace('\n', ' ')[:160])
for x in escalar[:40]: print(' E', x['pedido'], x['dc'], x['estado'])

# Guía de razonamiento que el agente lee en cada ronda (Ronald 24-11: «tú eres un experto en logística, hacer mejor las cosas que Karen,
# buscar alternativas para evitar que lo devuelvan, siempre»).
print('''
GUÍA (experto en logística: que se ENTREGUE y NUNCA se devuelva si hay otra salida):
 · Antes de responder, lee la conversación del CAS (cas_hilo.js) Y el chat del cliente en Lucid (viaje, otra dirección, horario, otro teléfono).
 · Disponible en oficina → avisa al cliente (dirección, cédula original, horario, pago contra entrega). Si no puede ir: pide a la
   transportadora ampliar la custodia, permitir que lo reclame un familiar con carta de autorización y copia de la cédula, o pasarlo a domicilio.
 · Novedad / va a devolución → antes de aceptarlo, pide un NUEVO OFRECIMIENTO con el teléfono y la dirección correctos del chat.
 · En reparto / programado → agradece y pide fecha; si a las 24 h sigue igual, seguimiento.
 · Solo repite el estado → responde con respeto que no ha cambiado en X horas y pide gestión concreta y fecha.
 · Pide datos → dáselos (Dropi o chat). Si el chat del cliente está cerrado, anota para Karen el dato exacto a pedirle.
 · Tono Karen: formal, corto, concreto, agradece. Un mensaje pensado por caso, nunca copiar y pegar.''')
