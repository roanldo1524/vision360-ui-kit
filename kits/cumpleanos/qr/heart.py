import os,sys,math,qrcode
from PIL import Image,ImageDraw,ImageFont
url,name,bg,rose,gold,out=sys.argv[1:7]
W=1600;img=Image.new('RGB',(W,2150),bg);d=ImageDraw.Draw(img)
# corazón
cx,cy,s=W/2,780,40
pts=[(cx+s*16*math.sin(t)**3, cy-s*(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))) for t in [i/400*2*math.pi for i in range(400)]]
d.polygon(pts,fill=rose)
# QR blanco dentro del corazón
q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H,box_size=20,border=2);q.add_data(url);q.make(fit=True)
qi=q.make_image(fill_color='#2A0E17',back_color='white').convert('RGB');qi=qi.resize((620,620),Image.NEAREST)
card=Image.new('RGB',(680,680),'white');m=Image.new('L',(680,680),0);ImageDraw.Draw(m).rounded_rectangle((0,0,679,679),48,fill=255)
card.paste(qi,(30,30));img.paste(card,(int(cx-340),int(cy-300)),m)
fs=ImageFont.truetype(os.path.join(os.path.dirname(__file__),'Pinyon.ttf'),170);fx=ImageFont.truetype(os.path.join(os.path.dirname(__file__),'Fraunces.ttf'),54)
def ct(y,t,f,c):
    w=d.textlength(t,font=f);d.text(((W-w)/2,y),t,font=f,fill=c)
ct(1560,'Para '+name,fs,gold)
ct(1830,'Escanéame con la cámara del celular',fx,'#FFF4EC')
ct(1910,'Comercializadora CDR',fx,rose)
img.save(out,quality=95);print(out)
