import json,sys,re
c=sys.argv[1]; v=json.load(open(f'regalo/{c}.json'))['value']; n=v
open(f'regalo/{c}_respaldo.txt','w').write(v)
# 1) quitar la semilla (obsequio) como producto
n=re.sub(r'[;,]\s*\(\s*\d+\s*x\s*Obsequio[^)]*(\([^)]*\))?[^)]*\)','',n)
# 2) poner la presentación (LITRO / GALON / POMA) si falta
POR_TOTAL={99000:('LITRO',1),169000:('LITRO',2),269000:('GALON',1),538000:('GALON',2),995000:('POMA',1)}
mt=re.search(r'Valor total:\s*\$?\s*([\d.,]+)',n); total=int(re.sub(r'\D','',mt.group(1))) if mt else 0
prods=re.findall(r'\(\s*\d+\s*x\s*Nombre producto:[^()]*(?:\([^)]*\)[^()]*)*\)',n)
def pres(q,txt):
    t=txt.lower()
    if 'presentacion litro' in t or 'presentacion galon' in t or 'presentacion poma' in t: return None
    if len(prods)==1 and total in POR_TOTAL: return POR_TOTAL[total]
    if 'poma' in t or re.search(r'\b20\s*litros',t): return ('POMA', q//20 if q>=20 else q)
    if 'gal' in t or re.search(r'\b4\s*litros',t): return ('GALON', q//4 if q>=4 else q)
    m=re.search(r'\b(\d+)\s*litros?',t)
    if m and q==1: return ('LITRO', int(m.group(1)))
    if q==20: return ('POMA',1)
    if q==4: return ('GALON',1)
    return ('LITRO',q)
for p in prods:
    q=int(re.match(r'\(\s*(\d+)',p).group(1)); r=pres(q,p)
    if r: n=n.replace(p,f'({r[1]} x Nombre producto: Herbicida Regenerativo Toro Verde - Nombre_variable: Presentacion {r[0]})',1)
if total==269000: n=re.sub(r'\(4 x (Nombre producto: [^)]*?Presentacion) LITRO\)',r'(1 x \1 GALON)',n)
if total==995000: n=re.sub(r'\(20 x (Nombre producto: [^)]*?Presentacion) LITRO\)',r'(1 x \1 POMA)',n)
n=n.replace('Nombre producto: Herbicidas Toro Verde','Nombre producto: Herbicida Regenerativo Toro Verde')
n=re.sub(r'(Presentacion (?:LITRO|GALON|POMA)\))\)+',r'\1',n).replace('Toro Verde))','Toro Verde)')
CAP={'BOGOTA':'Cundinamarca','MEDELLIN':'Antioquia','CALI':'Valle del Cauca','BARRANQUILLA':'Atlántico','CARTAGENA':'Bolívar','BUCARAMANGA':'Santander','TUNJA':'Boyacá','PASTO':'Nariño','POPAYAN':'Cauca','NEIVA':'Huila','IBAGUE':'Tolima','VILLAVICENCIO':'Meta','PEREIRA':'Risaralda','MANIZALES':'Caldas','ARMENIA':'Quindío','CUCUTA':'Norte de Santander','MONTERIA':'Córdoba','SINCELEJO':'Sucre','VALLEDUPAR':'Cesar','SANTA MARTA':'Magdalena','RIOHACHA':'La Guajira','YOPAL':'Casanare','FLORENCIA':'Caquetá','MOCOA':'Putumayo','ARAUCA':'Arauca','QUIBDO':'Chocó','SAN JOSE DEL GUAVIARE':'Guaviare'}
import unicodedata
mc=re.search(r'Departamento:\s*(""|)\s*,\s*Ciudad:\s*([^,]+)',n)
if mc:
    ci=unicodedata.normalize('NFD',mc.group(2).strip().upper()); ci=''.join(c for c in ci if unicodedata.category(c)!='Mn')
    if ci in CAP: n=n.replace(mc.group(0),'Departamento: '+CAP[ci]+', Ciudad: '+mc.group(2),1)
if c=='573208460821': n=n.replace('Departamento: ""','Departamento: Norte de Santander')
if c=='573128350452': n=n.replace('Departamento: ""','Departamento: Valle del Cauca').replace('Dirección: ""','Dirección: Recoge en oficina principal Interrapidísimo')

# 4) promo 10 % del 17 nov para clientes del remarketing (rmk/enviados.txt)
import os
try: promo=set(open('rmk/enviados.txt').read().split())|set(open('rmk2/enviados.txt').read().split())
except Exception: promo=set()
if c in promo and total and total%1000==0:
    nuevo=round(total*0.9/100)*100
    n=re.sub(r'Valor total:\s*\$?\s*[\d.,]+','Valor total: %d'%nuevo,n,1)
    open('rmk/promo_aplicada.txt','a').write(f"{c} {total} {nuevo}\n")
n=re.sub(r'(Valor total: \d+)\s+Departamento',r'\1, Departamento',n)
# 5) resumen sin "Documento" y variante mal escrita ("- LITRO - Nombre_variable: LITRO")
n=re.sub(r'Nombre_variable: Presentaci[oó]n (LITRO|GALON|POMA)',r'Nombre_variable: Presentación: \1',n)
if 'Documento:' not in n: n=n.replace(', Productos:',', Documento: "", Productos:',1)
n=re.sub(r'Toro Verde - (LITRO|GALON|GALÓN|POMA[^-]*) - Nombre_variable: \1',lambda m:'Toro Verde - Nombre_variable: Presentación: '+m.group(1),n)
for ciu,dep in [('EL CARMEN DE VIBORAL','Antioquia'),('PAZ DE ARIPORO','Casanare'),('ITAGUI','Antioquia'),('PIENDAMO','Cauca'),('TAURAMENA','Casanare'),('LA CUMBRE','Valle del Cauca'),('CODAZZI','Cesar'),('YOPAL','Casanare'),('POPAYAN','Cauca'),('ITAGÜÍ','Antioquia'),('MEDELLIN','Antioquia'),('ENVIGADO','Antioquia'),('BELLO','Antioquia')]:
    if ciu in n.upper() and re.search(r'Departamento:\s*(?:"")?\s*,',n): n=re.sub(r'Departamento:\s*(?:"")?\s*,','Departamento: %s,'%dep,n,1)
# 6) Ronald 25-11: pedidos sin departamento (municipio pequeño) y de oficina sin dirección → se llenan solos con el portal de Interrapidísimo
#    (solo si el municipio existe en UN solo departamento) y la dirección queda «dirección del punto, RECLAMA EN OFICINA INTERRAPIDÍSIMO».
try:
    sys.path.insert(0, '/tmp/robot/robot'); import oficinas as _o
    mc = re.search(r'Ciudad:\s*([^,]+)', n); ciu = _o.muni(mc.group(1)) if mc else ''
    if ciu and re.search(r'Departamento:\s*(?:"")?\s*,', n):
        deps = {dd for (dd, cc) in _o.of if cc == ciu}
        if len(deps) == 1: n = re.sub(r'Departamento:\s*(?:"")?\s*,', 'Departamento: %s,' % deps.pop().title(), n, count=1)
    md = re.search(r'Departamento:\s*([^,"]+),', n)
    mdir = re.search(r'Direcci[oó]n:\s*([^,]*),', n)
    if ciu and md and mdir and not re.search(r'\d', mdir.group(1)) and re.search(r'oficina|reclam|interr?ap', n, re.I):
        d = _o.dir_oficina(md.group(1), ciu, '')
        if d: n = n.replace(mdir.group(0), 'Dirección: %s,' % d, 1)
except Exception as e: print('OFICINA_ERR', str(e)[:60])
if n==v: print('SIN_CAMBIO'); sys.exit(1)
open(f'regalo/{c}_nuevo.txt','w').write(n); print(c, n[:260])
