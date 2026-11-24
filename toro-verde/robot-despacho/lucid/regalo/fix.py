import json,sys,re
c=sys.argv[1]; v=json.load(open(f'regalo/{c}.json'))['value']
open(f'regalo/{c}_respaldo.txt','w').write(v)
n=re.sub(r'[;,]\s*\(\s*\d+\s*x\s*Obsequio[^)]*\)','',v)
if n==v: print('SIN_CAMBIO'); sys.exit(1)
open(f'regalo/{c}_nuevo.txt','w').write(n); print('ok')
