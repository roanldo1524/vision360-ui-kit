# Limpia la dirección: quita el barrio repetido y le pone «BARRIO» si no dice qué es.
import re
ETIQ = r'\b(barrio|br|b/|bario|conjunto|conj|urbanizaci[oó]n|urb|vereda|vda|edificio|ed|torre|apto|apartamento|manzana|mz|sector|corregimiento|finca|casa)\b'
def limpiar(dir_dropi, colonia=''):
    d = re.sub(r'\s+', ' ', (dir_dropi or '')).strip(' ,')
    if re.search(r'oficina|reclama', d, re.I):
        # Oficina: solo «RECLAMA EN OFICINA INTERRAPIDÍSIMO», sin «No aplica» ni repetidos
        if re.search(r'reclama\w* en (la )?oficina\s+interrap', d, re.I) and re.search(r'no aplica|\bn/a\b|ninguno|,\s*$', d, re.I):
            return 'RECLAMA EN OFICINA INTERRAPIDÍSIMO' if d.upper() != 'RECLAMA EN OFICINA INTERRAPIDÍSIMO' else None
        return None
    # barrio repetido al final: «… SAN ROQUE SAN ROQUE» o «… X, X»
    m = re.search(r'^(.*?)[ ,]+((?:[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]+ ?){1,5}?)[ ,]+\2$', d, re.I)
    base, barrio = (m.group(1), m.group(2)) if m else (d, '')
    col = re.sub(r'\s+', ' ', colonia or '').strip(' ,')
    if not barrio and col and col.lower() in d.lower():
        base = re.sub(re.escape(col), '', d, flags=re.I).strip(' ,'); barrio = col
    if not barrio: return None
    tipo = 'BARRIO'
    if re.search(r'\b(ub|urb)\.?\s+' + re.escape(barrio), base, re.I): tipo = 'URBANIZACIÓN'; base = re.sub(r'\b(ub|urb)\.?\s+' + re.escape(barrio), '', base, flags=re.I)
    base = re.sub(r'\s+', ' ', re.sub(re.escape(barrio), '', base, flags=re.I)).strip(' ,')
    if re.search(ETIQ, barrio, re.I): nuevo = f'{base}, {barrio.upper()}'
    else: nuevo = f'{base}, {tipo} {barrio.upper()}'
    nuevo = re.sub(r'\s+', ' ', nuevo).strip(' ,')
    w = re.findall(r'[A-ZÁÉÍÓÚÑ0-9]+', nuevo.upper()); big = [' '.join(w[i:i+2]) for i in range(len(w)-1) if not w[i].isdigit()]
    if len(big) != len(set(big)): return None  # aún queda algo repetido: mejor no tocar
    return nuevo if nuevo.upper() != d.upper() else None
if __name__ == '__main__':
    for x, c in [('CL 7 # 6 - 07 SAN ROQUE SAN ROQUE', 'San Roque'), ('CL 67 SUR # 17 F - 18 LUCERO BAJO CIUDAD BOLIVAR LUCERO BAJO LUCERO BAJO', 'Lucero Bajo'),
                 ('KR 81 J # 56 SUR - 11 PQ BG, LAS VEGAS DE SANTA ANA', ''), ('RECLAMA EN OFICINA INTERRAPIDÍSIMO', ''), ('UB TERRAZAS DEL TEJAR MZ 14 CS 3 TERRAZAS DEL TEJAR TERRAZAS DEL TEJAR', 'Terrazas del Tejar')]:
        print(repr(x), '->', limpiar(x, c))
