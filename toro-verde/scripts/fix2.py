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
if n==v: print('SIN_CAMBIO'); sys.exit(1)
open(f'regalo/{c}_nuevo.txt','w').write(n); print(c, n[:260])
