# Llena el formato de Dropi («FORMATO PARA SOLICITUD DE INFORMACION DE GUIAS.xlsx») con las devoluciones injustificadas.
# Columnas: NÚMERO GUÍA | TRANSPORTADORA | OBSERVACIONES. Redacción de Karen. Uso: python3 -I robot/devol_excel.py → /tmp/dropi/dev_injustificadas.xlsx
import json, openpyxl, os
F = '/tmp/dropi/formato/formato.xlsx'
if not os.path.exists(F): F = '/home/user/vision360-ui-kit/toro-verde/robot-despacho/datos/formato_guias_dropi.xlsx'
r = json.load(open('/tmp/dropi/devol_reclamos.json'))
wb = openpyxl.load_workbook(F); ws = wb['SOLICITUD GUIAS']
for i, x in enumerate(r):
    if x['motivo'].startswith('La novedad fue solucionada'): causal = 'CAUSAL 1: se hizo caso omiso a la solución de la novedad.'
    elif x.get('intentos'): causal = 'CAUSAL 2: un solo intento de entrega, sin novedad reportada, y la devolvieron.'
    else: causal = 'CAUSAL 2: nunca presentó una novedad y la devolvieron.'
    obs = f"Orden {x['id']} ({x['ciudad']}), devuelta el {x['devuelta']}. {causal} {x['motivo']}. Solicitamos la exoneración del costo del flete; la devolución no fue responsabilidad del cliente."
    ws.cell(row=4 + i, column=1, value=str(x['guia'])); ws.cell(row=4 + i, column=2, value=x['dc']); ws.cell(row=4 + i, column=3, value=obs[:500])
wb.save('/tmp/dropi/dev_injustificadas.xlsx'); print('EXCEL', len(r), 'guías')
