# En pedidos para reclamar en oficina, la dirección en Dropi lleva la dirección de la oficina de Interrapidísimo del municipio
# y luego «RECLAMA EN OFICINA INTERRAPIDÍSIMO» (ej.: «KR 4 9 37, RECLAMA EN OFICINA INTERRAPIDÍSIMO»).
# Las oficinas salen del portal de cobertura de Interrapidísimo (oficinas_inter.js → oficinas_inter.json; una por municipio, la principal en ciudades grandes).
# Solo pedidos que el robot va a confirmar. Si el municipio no aparece, no toca la dirección. Imprime «id<TAB>dirección» para editar.js.
import json, os, re, unicodedata
F = '/tmp/dropi/oficinas_inter.json' if os.path.exists('/tmp/dropi/oficinas_inter.json') else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'oficinas_inter.json')
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
GRANDES = {'BOGOTA', 'MEDELLIN', 'CALI', 'BARRANQUILLA', 'CARTAGENA', 'BUCARAMANGA', 'PEREIRA', 'MANIZALES', 'IBAGUE', 'VILLAVICENCIO', 'PASTO', 'NEIVA',
           'CUCUTA', 'SANTA MARTA', 'MONTERIA', 'ARMENIA', 'POPAYAN', 'VALLEDUPAR', 'SINCELEJO', 'TUNJA', 'BELLO', 'ITAGUI', 'ENVIGADO', 'SOACHA', 'PALMIRA', 'DOSQUEBRADAS'}
SUF = 'RECLAMA EN OFICINA INTERRAPIDÍSIMO'
def es_oficina(dirx): return bool(re.search(r'oficina|reclam|interr?ap|inter rap', dirx or '', re.I))
def dir_oficina(estado, ciudad, dirx):
    """siempre «dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO». En pueblos (una sola oficina) se usa la del portal.
    En ciudades grandes (varias oficinas) se respeta la dirección de oficina que dio el cliente si trae número; si no, la principal. None = no se sabe."""
    base = re.split(r'reclam|,?\s*\boficina|interr?ap|inter rap', dirx or '', flags=re.I)[0].strip(' ,.-')
    c = muni(ciudad)
    if any(c.startswith(g) for g in GRANDES) and re.search(r'\d', base): return f'{base}, {SUF}'
    o = busca(estado, ciudad)
    if not o: return None
    o = re.sub(r'^(OF\.?\s*PRINC\.?|OFICINA\s+PRINCIPAL)\s*', '', o).strip(' ,')
    return f'{o}, {SUF}'
if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    det = {d['id']: d for d in json.load(open('/tmp/dropi/detalle.json'))}
    for a in json.load(open('/tmp/dropi/acciones.json')):
        if a['accion'] not in ('CONFIRMAR', 'EDITAR_Y_CONFIRMAR'): continue
        d = det.get(a['id']) or {}; dirx = re.sub(r'\s+', ' ', (d.get('dir') or '')).strip(' ,')
        if not es_oficina(dirx):
            # vereda/finca o sin nomenclatura → oficina del municipio (lo decidió razonar.py en rural.json)
            ru = (json.load(open('/tmp/dropi/rural.json')) if os.path.exists('/tmp/dropi/rural.json') else {}).get(str(a['id']))
            if ru: print(f"{a['id']}\t{ru['dir']}")
            continue
        nueva = dir_oficina(d.get('state'), d.get('city'), dirx)
        if nueva and n(nueva) != n(dirx): print(f"{a['id']}\t{nueva}")
