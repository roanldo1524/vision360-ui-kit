import os,sys,math,qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from PIL import Image,ImageDraw,ImageFont
url,name,bg,rose,gold,ink,out=sys.argv[1:8]
D=os.path.dirname(__file__)
W,H=1600,2150
img=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(img)
def hx(c):c=c.lstrip('#');return tuple(int(c[i:i+2],16) for i in(0,2,4))
# corazon suave de fondo
cx,cy,s=W/2,760,41
pts=[(cx+s*16*math.sin(t)**3, cy-s*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))) for t in [i/420*2*math.pi for i in range(420)]]
d.polygon(pts,fill=rose)
# QR redondeado, tinta oscura sobre panel claro
q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,box_size=20,border=2)
q.add_data(url);q.make(fit=True)
panel=hx('#FFF2F7')
qi=q.make_image(image_factory=StyledPilImage,module_drawer=RoundedModuleDrawer(),
  color_mask=SolidFillColorMask(front_color=hx(ink),back_color=panel)).convert('RGB')
QS=660;qi=qi.resize((QS,QS),Image.LANCZOS)
# panel con esquinas redondeadas y leve sombra del color del corazon
pad=34;ps=QS+pad*2
card=Image.new('RGB',(ps,ps),panel);m=Image.new('L',(ps,ps),0)
ImageDraw.Draw(m).rounded_rectangle((0,0,ps-1,ps-1),60,fill=255)
card.paste(qi,(pad,pad))
px,py=int(cx-ps/2),int(cy-ps/2+10)
img.paste(card,(px,py),m)
# corazoncito en el centro del QR (pequeño, el QR H lo tolera)
hc=Image.new('RGBA',(150,150),(0,0,0,0));hd=ImageDraw.Draw(hc)
hs=4.4
hpts=[(75+hs*16*math.sin(t)**3, 70-hs*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))) for t in [i/180*2*math.pi for i in range(180)]]
# circulo blanco detras del corazon para que resalte y no rompa lectura
cxx,cyy=px+ps//2,py+ps//2
d.ellipse((cxx-62,cyy-62,cxx+62,cyy+62),fill=panel)
hd.polygon(hpts,fill=hx(rose));img.paste(hc,(cxx-75,cyy-70),hc)
# brillo/puntos sutiles alrededor
for i in range(60):
  import random
  a=random.random()*2*math.pi;r=520+random.random()*260
  x,y=cx+math.cos(a)*r,cy+math.sin(a)*r*.8
  rr=random.choice([2,3,4]);col=random.choice([hx(gold),hx(rose),panel])
  d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=col)
# textos
fs=ImageFont.truetype(os.path.join(D,'Pinyon.ttf'),170)
fx=ImageFont.truetype(os.path.join(D,'Fraunces.ttf'),54)
def ct(y,t,f,c):
  w=d.textlength(t,font=f);d.text(((W-w)/2,y),t,font=f,fill=c)
ct(1560,'Para '+name,fs,hx(gold))
ct(1830,'Escanéame con la cámara del celular',fx,hx('#FFF4EC'))
ct(1910,'Comercializadora CDR',fx,hx(rose))
img.save(out,quality=95);print(out)
