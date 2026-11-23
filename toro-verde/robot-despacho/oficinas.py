# Ronald 23-11: en pedidos para reclamar en oficina, la dirección en Dropi lleva la dirección de la oficina de Interrapidísimo del municipio
# y luego «RECLAMA EN OFICINA INTERRAPIDÍSIMO» (ej.: «KR 4 9 37, RECLAMA EN OFICINA INTERRAPIDÍSIMO»).
# Las oficinas salen del portal de cobertura de Interrapidísimo (oficinas_inter.js → oficinas_inter.json; una por municipio, la principal en ciudades grandes).
# Solo pedidos que el robot va a confirmar. Si el municipio no aparece, no toca la dirección. Imprime «id<TAB>dirección» para editar.js.
import json, os, re, unicodedata
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
F = '/tmp/dropi/oficinas_inter.json' if os.path.exists('/tmp/dropi/oficinas_inter.json') else 'robot/oficinas_inter.json'
DEP = {'NARINO': 'NARINO', 'VALLE': 'VALLE DEL CAUCA', 'GUAJIRA': 'LA GUAJIRA', 'SAN ANDRES': 'ARCHIPIELAGO DE SAN ANDRES , PROVIDENCIA Y SANTA CATALINA', 'BOGOTA D.C.': 'CUNDINAMARCA', 'BOGOTA': 'CUNDINAMARCA'}
def n(s): return re.sub(r'\s+', ' ', unicodedata.normalize('NFKD', (s or '').upper()).encode('ascii', 'ignore').decode()).strip()
def muni(s): return n(re.sub(r'\(.*', '', (s or '').replace('_', ' ').split('/')[0]))
of = {}
for x in json.load(open(F)):
    dd, cc = n(x['dep']), muni(x['ciudad'].split('\\')[0])
    of.setdefault((dd, cc), x['dir'])
    for suf in {dd, dd.split()[-1], 'VALLE', 'META', 'CAUCA'}:  # «GUAMAL MAGDALENA», «EL TAMBO CAUCA»: el portal agrega el departamento
        if cc.endswith(' ' + suf): of.setdefault((dd, cc[:-len(suf) - 1].strip()), x['dir'])
def busca(estado, ciudad):
    dep = n(estado); dep = DEP.get(dep, dep); c = muni(ciudad)
    if dep == 'CUNDINAMARCA' and c.startswith('BOGOTA'): return of.get(('CUNDINAMARCA', 'BOGOTA'))
    for suf in (dep, dep.split()[-1]):
        if c.endswith(' ' + suf): c = c[:-len(suf) - 1].strip()
    if (dep, c) in of: return of[(dep, c)]
    m = [v for (dd, cc), v in of.items() if dd == dep and (cc.startswith(c + ' ') or c.startswith(cc + ' ') or cc.endswith(' ' + c) or c.endswith(' ' + cc))]
    return m[0] if len(set(m)) == 1 else None  # si hay varias posibles, no adivina
det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
for a in json.load(open('/tmp/dropi/acciones.json')):
    if a['accion'] not in ('CONFIRMAR', 'EDITAR_Y_CONFIRMAR'): continue
    d = det.get(a['id']) or {}; dirx = (d.get('dir') or '').strip()
    if not re.search(r'reclama\w* en (la )?oficina', dirx, re.I): continue
    if re.search(r'\d', dirx.upper().split('RECLAMA')[0]): continue  # ya tiene la dirección de la oficina
    o = busca(d.get('state'), d.get('city'))
    if not o: continue
    o = re.sub(r'^OF\.?\s*PRINC\.?\s*', '', o).strip(' ,')
    print(f"{a['id']}\t{o}, RECLAMA EN OFICINA INTERRAPIDÍSIMO")
