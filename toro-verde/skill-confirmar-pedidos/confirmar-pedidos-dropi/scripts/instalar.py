# Instala el robot con la configuración del dueño: copia los scripts a /tmp/dropi y /tmp/robot
# y reemplaza cada __MARCADOR__ con su valor de config.json. Uso: python3 instalar.py <ruta/config.json>
import json, os, re, shutil, sys, glob

AQUI = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '..', 'config.json')))

def py(v): return repr(v)
MAX_DEV = float(C['max_devolucion']) if 'max_devolucion' in C else round(1 - float(C.get('min_entrega', 0.5)), 4)
VAL = {
    '__DROPI_USER_ID__': str(C['dropi_user_id']),
    '__TAG_CONFIRMADO__': str(C['etiquetas']['confirmado']),
    '__TAG_REVISAR__': str(C['etiquetas']['revisar']),
    '__TAG_CARRITO__': str(C['etiquetas'].get('carrito_recuperado') or 0),
    '__EMBUDO_LUCID__': str(C['lucid']['embudo_pedidos']),
    '__CAMPO_RESUMEN_PEDIDO__': str(C['lucid']['campo_resumen_pedido']),
    '__CAMPO_MENSAJE_LUCIDSALES__': str(C['lucid'].get('campo_mensaje_lucidsales') or 0),
    '__CAMPO_SHOPIFY_ORDER__': str(C['lucid'].get('campo_shopify_order') or 0),
    '__CAMPO_CARRITO_RECUPERADO__': str(C['lucid'].get('campo_carrito_recuperado') or 0),
    '__FLUJO_PLANTILLA_ADMIN__': str(C['avisos'].get('flujo_plantilla') or 0),
    '__CAMPO_TIPO_NOTIF__': str(C['avisos'].get('campo_tipo') or 0),
    '__CAMPO_TITULO_NOTIF__': str(C['avisos'].get('campo_titulo') or 0),
    '__CAMPO_RESUMEN_NOTIF__': str(C['avisos'].get('campo_resumen') or 0),
    '__EQUIPO__': py(['57' + re.sub(r'\D', '', t)[-10:] for t in C['avisos'].get('equipo', [])]),
    '__NOMBRE_TIENDA__': C['tienda'].replace("'", '’').replace('"', ''),
    '__PRECIOS_VALIDOS__': py(set(int(p) for p in C['precios_validos'])),
    '__PRESENTACIONES__': py({k.upper(): v for k, v in C['presentaciones'].items()}),
    '__TOPE_ENVIO_GENERAL__': str(int(C['tope_envio_general'])),
    '__TOPES_ENVIO__': py(C.get('topes_envio') or {}),
    # Devoluciones: si el cliente devuelve MÁS de max_devolucion (0.5 = 50 %) se le pide abono. Configs viejas traían min_entrega.
    '__MAX_DEVOLUCION__': str(MAX_DEV),
    '__MIN_ENTREGA__': str(round(1 - MAX_DEV, 4)),
    '__TOLERANCIA_FLETE__': str(float(C.get('tolerancia_flete', 0))),
    '__PEDIDO_GRANDE__': py({'unidades': int((C.get('pedido_grande') or {}).get('unidades') or 0), 'min_entrega': float((C.get('pedido_grande') or {}).get('min_entrega', 0.7))}),
    '__PRECIOS_DESCUENTO__': py(set(int(p) for p in C.get('precios_descuento') or [])),
    '__PRECIOS_POR_UNIDADES__': py({str(k): [int(x) for x in v] for k, v in (C.get('precios_por_unidades') or {}).items()}),
    '__ESPERA_IA_MIN__': str(int(C.get('espera_ia_min', 120))),
    '__CONFIRMAR_EN_HUMANO__': 'True' if C.get('confirmar_en_humano', False) else 'False',
    '__AVISO_CADA_VUELTA__': py(bool(C['avisos'].get('cada_vuelta', True))),
    '__TITULO_RESUMEN__': str(C['lucid'].get('titulo_resumen') or 'Resumen de tu pedido').replace("'", ''),
    '__FRASES_CONFIRMACION__': py([str(x) for x in C['lucid'].get('frases_confirmacion') or []]),
    '__EMBUDOS_EXTRA__': py([str(x) for x in C['lucid'].get('embudos_extra') or [] if x]),
    '__CAMPO_ID_LUCIDSALES__': str(C['lucid'].get('campo_id_lucidsales') or 0),
    '__FLUJO_ANTICIPO__': py(str(C['lucid'].get('flujo_anticipo') or '') or 0),
    '__FLUJO_RECORDAR__': py(str(C['lucid'].get('flujo_recordar_confirmar') or '') or 0),
    '__CAMPO_RESUMEN_RECORDAR__': py(str(C['lucid'].get('campo_resumen_recordar') or '') or 0),
    '__FLUJO_RECORDAR_SHOPIFY__': py(str(C['lucid'].get('flujo_recordar_shopify') or '') or 0),
}

def copiar(patrones, destino):
    os.makedirs(destino, exist_ok=True)
    for pat in patrones:
        for f in glob.glob(os.path.join(AQUI, pat)):
            if os.path.basename(f) == 'instalar.py': continue
            s = open(f, encoding='utf-8').read()
            for k, v in VAL.items(): s = s.replace(k, v)
            falta = set(re.findall(r'__[A-Z_]{4,}__', s)) - {'__name__', '__file__'}
            if falta: print('AVISO', os.path.basename(f), 'sin valor para', falta)
            open(os.path.join(destino, os.path.basename(f)), 'w', encoding='utf-8').write(s)

BASE = os.environ.get('ROBOT_BASE', '/tmp')  # solo para pruebas
copiar(['*.js', 'transportadoras.json', 'oficinas_inter.json'], BASE + '/dropi')
copiar(['*.py', '*.sh'], BASE + '/robot/robot')
json.dump(C, open(BASE + '/robot/config.json', 'w'), ensure_ascii=False, indent=1)
if not os.path.exists(BASE + '/robot/lucidbot.key'):
    open(BASE + '/robot/lucidbot.key', 'w').write(os.environ.get('LUCID_TOKEN', 'x'))
print('INSTALADO', BASE + '/dropi y', BASE + '/robot para', C['tienda'])
