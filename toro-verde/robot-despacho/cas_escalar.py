# Manda el mensaje de escalamiento (asesor humano) a cada caso de /tmp/dropi/cas_escalar.json (lista [{id, msg}]). 3 a la vez.
import json, subprocess, concurrent.futures as cf, sys
L = json.load(open(sys.argv[1] if len(sys.argv) > 1 else '/tmp/dropi/cas_escalar.json'))
def una(x):
    try: r = subprocess.run(['node', 'reabrir_cas.js', str(x['id']), x['msg'], 'seguir'], cwd='/tmp/dropi', capture_output=True, text=True, timeout=240).stdout.strip().splitlines()
    except Exception as e: r = ['ERROR ' + str(e)[:60]]
    return x['id'], (r[-1] if r else 'sin salida')
with cf.ThreadPoolExecutor(3) as ex:
    for i, r in ex.map(una, L): print(i, r, flush=True)
print('FIN_ESCALAR')
