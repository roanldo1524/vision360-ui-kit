# Ronald 25-11: baja las fotos que el cliente mandó por WhatsApp (Lucid) para usarlas como evidencia en el CAS.
# Uso: python3 -I evidencia_cliente.py <telefono 10 dígitos> [cuantas=5] → guarda en /tmp/dropi/evidencias/<telefono>/ e imprime las rutas.
import json, os, re, sys, urllib.request
tel = re.sub(r'\D', '', sys.argv[1])[-10:]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
K = open('/tmp/robot/lucidbot.key').read().strip()
req = urllib.request.Request(f'https://panel.lucidbot.co/api/contacts/57{tel}/messages?limit=60', headers={'X-ACCESS-TOKEN': K})
t = urllib.request.urlopen(req, timeout=40).read().decode()
t = json.loads(t); t = t.get('data', t) if isinstance(t, dict) else t; t = t if isinstance(t, str) else json.dumps(t, ensure_ascii=False)
# solo lo que mandó el cliente: líneas «Usuario (...): [Image] url»
urls = re.findall(r'Usuario \([^)]*\): \[(?:Image|Imagen|Document|Video)\] (https?://\S+?)(?=\s|\\n|$)', t)
d = f'/tmp/dropi/evidencias/{tel}'; os.makedirs(d, exist_ok=True)
for u in urls[-n:]:
    nombre = os.path.join(d, re.sub(r'[^\w.]', '_', u.split('/')[-1])[-60:])
    try:
        with urllib.request.urlopen(u, timeout=60) as r, open(nombre, 'wb') as f: f.write(r.read())
        print('EVIDENCIA', nombre)
    except Exception as e: print('NO_BAJO', u, str(e)[:80])
if not urls: print('SIN_FOTOS del cliente en el chat')
