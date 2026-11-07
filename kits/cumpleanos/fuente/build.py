import json,base64
T=open('tpl2.html').read()
b64=lambda f:'data:audio/mpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode()
LEIDY=[(0,'Hola, ¡feliz cumpleaños! Te lo queremos desear de parte de todo el equipo.'),
 (6.4,'Quería aprovechar esta fecha tan especial para decirte lo mucho que te admiramos.'),
 (13.3,'Porque eres una gran mujer, porque tienes un corazón enorme y una energía hermosísima.'),
 (19.9,'Tienes una capacidad única de dejar huella en la vida de todos los que te rodeamos.'),
 (26.0,'De verdad, sin darte cuenta, muchas veces nos has dejado una huellita en el corazón.'),
 (33.6,'Te deseo un año lleno de alegría, de paz y de metas cumplidas.'),
 (37.6,'Ten la absoluta certeza de que Dios tiene cosas muy bonitas preparadas para ti.'),
 (41.8,'Porque te esfuerzas, porque eres una gran persona y te mereces lo mejor.'),
 (48.2,'Que este nuevo año de vida te traiga bendiciones y muchos motivos para sonreír.'),
 (53.4,'Mejor dicho: pásala increíble el día de hoy. ¡Feliz cumpleaños!')]
RONALDO=[(0,'Hola, señorita. Hoy quiero dedicarte unas palabras muy especiales.'),
 (5.6,'Primero que todo, feliz cumpleaños de corazón. Deseo que Dios te bendiga muchísimo.'),
 (10.9,'Que te regale mucha salud, tranquilidad y muchas oportunidades para cumplir los sueños que llevas en tu corazón.'),
 (16.1,'Quiero aprovechar este día para agradecerte por ser parte de este equipo y de todo lo que estamos construyendo.'),
 (25.3,'A veces, entre la responsabilidad y tantas cosas del día a día, se nos olvida reconocerlo:'),
 (30.5,'tenemos a nuestro alrededor personas increíbles como ustedes, de las que aprendemos cada día.'),
 (36.0,'Gracias por aportar tu granito de arena.'),
 (39.5,'Te mando un abrazo. Disfruta muchísimo este día, y que Dios te bendiga.')]
LEIDY_C=[(0,'Hola, mi cariño. Queríamos desearte un feliz, feliz cumpleaños de parte de todo el equipo.'),
 (6.1,'Queríamos aprovechar este día para decirte que te admiramos mucho, con tu energía.'),
 (13.7,'Siempre nos contagias de esa alegría tan bonita. Gracias por hacerlo.'),
 (20.1,'Gracias por la dedicación y el empeño que siempre le pones a todas las cosas.'),
 (25.5,'Te deseamos un año lleno de éxitos y de momentos muy felices.'),
 (29.6,'No me cabe duda de que Dios tiene cosas hermosas preparadas para ti,'),
 (33.0,'porque eres una mujer muy dedicada, muy entregada,'),
 (38.0,'y sé que vas a impactar la vida de muchas personas.'),
 (44.5,'Disfruta muchísimo este día. ¡Feliz, feliz cumpleaños!')]
RON={'who':'Ronaldo','src':b64('real/ronaldo.mp3'),'caps':[{'t':t,'x':x} for t,x in RONALDO]}
TRK={'s':json.dumps([{'who':'Leidy','src':b64('real/leidy.mp3'),'caps':[{'t':t,'x':x} for t,x in LEIDY]},RON],ensure_ascii=False),
     'c':json.dumps([{'who':'Leidy','src':b64('real/leidy-carolina.mp3'),'caps':[{'t':t,'x':x} for t,x in LEIDY_C]},RON],ensure_ascii=False)}
STOPS=lambda n:[
 {'e':'Sorpresa','h':'Primera parada: la sorpresa','t':f'Hoy no es un día cualquiera, {n}. Hoy celebramos a alguien que llegó a este mundo a brillar.'},
 {'e':'Gratitud','h':'Segunda parada: gracias','t':'Gracias por cada mañana que llegas con ganas y por cada tarea que sacas adelante, aunque el día esté pesado.'},
 {'e':'Orgullo','h':'Tercera parada: orgullo','t':'Eres joven y ya demuestras de qué estás hecha. Lo que haces hoy está construyendo a la mujer que vas a ser.'},
 {'e':'Cariño','h':'Cuarta parada: cariño','t':'Tienes un corazón enorme y una energía que se contagia. Donde llegas, el día se pone más bonito.'},
 {'e':'Fiesta','h':'Última parada: ¡a celebrar!','t':'Así que hoy toca celebrarte a ti. Agárrate, que todavía falta lo mejor.'}]
PH=['Eres joven, tienes talento y tienes ganas. Esa combinación no la frena nadie.','Tus sueños no tienen fecha de vencimiento. Ve por ellos con todo.','Lo que siembras con disciplina, un día florece sin pedir permiso.']
def letter(n):
    ps=[f'<p class="hi">{n}:</p>',
     '<p>Hoy queríamos frenar un momento la rutina para decirte algo que casi nunca decimos en voz alta: gracias.</p>',
     '<p>Gracias por tu entrega, por tu buena energía y por la forma en que sacas adelante lo que te toca, incluso en los días más difíciles. Eso se nota, y hace que este equipo sea mejor.</p>',
     '<p>Estás empezando a escribir una historia muy bonita. Nunca dejes de creer en ti, ni de soñar en grande: tienes todo para llegar tan lejos como te lo propongas.</p>',
     '<p>Le pedimos a Dios que este nuevo año te llene de salud, de paz y de muchas razones para sonreír, y que cada sueño que llevas en el corazón encuentre su camino.</p>',
     '<p>Te mereces todo lo bonito que está por venir.</p>','<p>¡Feliz cumpleaños!</p>']
    return '\n'.join('        '+p for p in ps)
P={
 's':dict(NAME='Samantha',BG='#3A0A3F',BG2='#6A1460',ROSE='#FF4F8B',BLUSH='#FFC2D9',GOLD='#FFD25E',LEAF='#38B27A',SOFTT='#F4CDE2',SIG='#D62A6B',
   AMOUNT='$500.000',AMTCLS='',rose=['#FF4F8B','#B3125A','#FFD3E2'],pet=['#FF6FA0','#FF4F8B','#FFC2D9','#FF9F7A'],conf=['#FFD25E','#FF4F8B','#7FE3C0','#FFFFFF','#FF9F7A'],leafs=['#2E9E6A','#38B27A','#24845A'],foil=['#E6B53C','#FFE599','#D89F28','#FFD873']),
 'c':dict(NAME='Carolina',BG='#0D2A44',BG2='#14507A',ROSE='#FF7A5C',BLUSH='#FFD1C2',GOLD='#FFDF6E',LEAF='#33B587',SOFTT='#CFE3F2',SIG='#E2533A',
   AMOUNT='$200.000',AMTCLS='',rose=['#FF7A5C','#C73A27','#FFE0D3'],pet=['#FF9478','#FF7A5C','#FFD1C2','#FFB86B'],conf=['#FFDF6E','#FF7A5C','#6EE7D8','#FFFFFF','#B79CFF'],leafs=['#2A9C72','#33B587','#22825F'],foil=['#E6B53C','#FFE599','#D89F28','#FFD873'])}

REASONS=[{'s':'Tu sonrisa','l':'Tu sonrisa contagia a todos'},{'s':'Tu fuerza','l':'Nunca te rindes'},{'s':'Tu corazón','l':'Tienes un corazón enorme'},
 {'s':'Tu energía','l':'Eres pura buena energía'},{'s':'Tu talento','l':'Aprendes rapidísimo'},{'s':'Tu lealtad','l':'Contigo se puede contar'},
 {'s':'Tu luz','l':'Iluminas la oficina'},{'s':'Tu empeño','l':'Haces todo con amor'}]
ENVS=[{'w':'dudes de ti','m':'Mira todo lo que ya lograste. La misma mujer que llegó hasta aquí es capaz de llegar mucho más lejos.'},
 {'w':'tengas un mal día','m':'Los días grises también pasan. Respira, tómate un tinto y recuerda que aquí tienes un equipo que te quiere.'},
 {'w':'cumplas una meta','m':'¡Te lo dijimos! Celébralo en grande, que te lo ganaste. Estamos orgullosos de ti.'},
 {'w':'necesites sonreír','m':'Piensa en todas las veces que nos hiciste reír. Hoy nos toca devolverte un poquito de esa alegría.'}]
for k,p in P.items():
    h=T
    conf={'rose':p['rose'],'pet':p['pet'],'conf':p['conf'],'leaf':p['LEAF'],'leafs':p['leafs'],'foil':p['foil'],'wheel':[p['ROSE'],p['GOLD'],p['BLUSH'],'#FFF4EC']}
    rep={**{kk:v for kk,v in p.items() if kk.isupper()},'CONF':json.dumps(conf),'STOPS':json.dumps(STOPS(p['NAME']),ensure_ascii=False),'PHRASES':json.dumps(PH,ensure_ascii=False),
         'TRACKS':TRK[k],'REASONS':json.dumps(REASONS,ensure_ascii=False),'ENVS':json.dumps(ENVS,ensure_ascii=False),'LETTER':letter(p['NAME'])}
    for kk,v in rep.items(): h=h.replace('__'+kk+'__',v)
    left=[x for x in h.split('__')[1::2] if x.isupper() and len(x)<12]
    assert not left,left
    open(f'cumple-{p["NAME"].lower()}.html','w').write(h)
    print(k,len(h))
