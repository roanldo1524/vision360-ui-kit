// Contenido editorial: consejos por fase, por ánimo y para el modo vínculo.
// Voz Mi Ciclo: cercana, serena y sin juicio. Nada de diagnósticos.
import type { Animo, Fase, RolVinculo } from "./tipos";

export const CATEGORIAS = ["Comer", "Moverte", "Descansar", "Sentir"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const CONSEJOS_FASE: Record<Fase, Record<Categoria, string[]>> = {
  menstrual: {
    Comer: [
      "Suma alimentos con hierro: lentejas, espinaca y fríjoles, acompañados de algo con vitamina C.",
      "Una sopa caliente o una infusión de jengibre pueden sentarte muy bien hoy.",
    ],
    Moverte: [
      "Estiramientos suaves o una caminata corta. Moverte poco también cuenta.",
      "Prueba la postura del niño 3 minutos: relaja la espalda baja.",
    ],
    Descansar: [
      "Si puedes, acuéstate 30 minutos antes. Tu cuerpo está haciendo mucho.",
      "Calor en el abdomen: bolsa caliente o una ducha tibia.",
    ],
    Sentir: [
      "Está bien decir que no a planes hoy. Bajar el ritmo también es avanzar.",
      "Escribe tres cosas que tu cuerpo hizo bien esta semana.",
    ],
  },
  folicular: {
    Comer: [
      "Buen momento para probar recetas nuevas con verduras frescas y proteína.",
      "Semillas de linaza o calabaza en tu desayuno: un detalle fácil.",
    ],
    Moverte: [
      "Tu energía sube: ideal para un entrenamiento que te rete un poquito más.",
      "Baila una canción completa antes de empezar el día.",
    ],
    Descansar: [
      "Aprovecha la energía, pero respeta tu hora de dormir.",
    ],
    Sentir: [
      "Escribe esa idea que llevas días pensando. Es buen momento para empezar.",
      "Planea la semana: tu mente está más clara.",
    ],
  },
  ovulacion: {
    Comer: [
      "Hidrátate más de lo normal y suma frutas con agua como sandía o pepino.",
      "Fibra y verduras de hoja verde te ayudan a sentirte ligera.",
    ],
    Moverte: [
      "Tienes más fuerza estos días: un plan activo con amigas puede ser perfecto.",
    ],
    Descansar: [
      "Aunque tengas energía, deja un rato del día sin pantallas.",
    ],
    Sentir: [
      "Te sientes más sociable: buen día para esa conversación pendiente.",
      "Comparte algo en la comunidad. Tu palabra puede acompañar a otra.",
    ],
  },
  lutea: {
    Comer: [
      "Los antojos existen: chocolate oscuro, banano o nueces son buenos aliados.",
      "Menos sal y más agua puede ayudar con la hinchazón.",
    ],
    Moverte: [
      "Yoga, pilates o caminar. Algo que se sienta amable con tu cuerpo.",
    ],
    Descansar: [
      "Magnesio en la cena (aguacate, almendras) y una rutina de noche tranquila.",
      "Menos exigencia esta semana. Lo urgente puede esperar un poco.",
    ],
    Sentir: [
      "Si estás más sensible, no es exageración: tu cuerpo te está hablando.",
      "Escribe lo que sientes antes de dormir. Ordena la cabeza.",
    ],
  },
};

export const ANIMOS: { id: Animo; nombre: string; color: string }[] = [
  { id: "feliz", nombre: "Feliz", color: "var(--rosa)" },
  { id: "tranquila", nombre: "Tranquila", color: "var(--lila)" },
  { id: "normal", nombre: "Normal", color: "var(--menta)" },
  { id: "sensible", nombre: "Sensible", color: "var(--durazno)" },
  { id: "irritable", nombre: "Irritable", color: "var(--mantequilla)" },
  { id: "cansada", nombre: "Cansada", color: "var(--rosa)" },
];

export const SINTOMAS = [
  "Cólicos", "Dolor de cabeza", "Hinchazón", "Antojos", "Acné", "Sensibilidad en senos",
  "Cansancio", "Insomnio", "Ansiedad", "Dolor de espalda", "Náuseas", "Flujo",
];

export function consejoAnimo(animo: Animo, fase: Fase): string {
  const base: Record<Animo, string> = {
    feliz: "Qué bonito. Guarda este momento: escribe una línea en tu diario sobre qué lo hizo especial.",
    tranquila: "Aprovecha la calma para algo que te nutra: leer, caminar o una infusión sin afán.",
    normal: "Un día normal también es un buen día. Toma tu sobre y regálate cinco minutos para ti.",
    sensible: "Ser sensible no es un problema. Baja el volumen del día y rodéate de lo que te hace bien.",
    irritable: "Respira 4 segundos, sostén 4, suelta 6. Repite tres veces antes de responder.",
    cansada: "Tu cuerpo pide pausa. Si puedes, recuéstate 20 minutos o acuéstate más temprano hoy.",
  };
  const extra: Record<Fase, string> = {
    menstrual: " En fase menstrual el calor y el descanso ayudan mucho.",
    folicular: " En fase folicular tu energía va subiendo, sin prisa.",
    ovulacion: " En ovulación, hidrátate un poco más.",
    lutea: " En fase lútea, menos exigencia y más cuidado.",
  };
  return base[animo] + extra[fase];
}

export const MOTIVOS = [
  "Entender mi cuerpo",
  "Aliviar cólicos y molestias",
  "Crear un hábito de bienestar",
  "Sentirme acompañada",
  "Planear mi semana según mi fase",
];

export const ROLES: Record<RolVinculo, { nombre: string; descripcion: string }> = {
  pareja: { nombre: "Pareja", descripcion: "Consejos para acompañarla con cariño y detalles." },
  mama: { nombre: "Mamá", descripcion: "Consejos para cuidarla y escucharla sin juicio." },
  papa: { nombre: "Papá", descripcion: "Consejos para estar presente con respeto." },
  amiga: { nombre: "Amiga", descripcion: "Planes y mensajes que la hagan sentir acompañada." },
};

/** Consejo diario para quien acompaña, según su rol y la fase de ella. */
export const CONSEJO_VINCULO: Record<RolVinculo, Record<Fase, string>> = {
  pareja: {
    menstrual: "Hoy puede tener poca energía. Un té caliente, una manta y cero presión por salir valen oro.",
    folicular: "Su energía viene subiendo. Proponle un plan nuevo: una receta juntos o una caminata.",
    ovulacion: "Está más sociable. Buen día para una salida o una conversación larga.",
    lutea: "Puede estar más sensible. Escucha sin intentar arreglar todo y ten a mano su antojo favorito.",
  },
  mama: {
    menstrual: "Pregúntale cómo se siente y ofrécele algo caliente. Estar cerca ya ayuda.",
    folicular: "Anímala con sus proyectos. Estos días está con más ganas de empezar cosas.",
    ovulacion: "Es buen momento para compartir un plan entre las dos.",
    lutea: "Menos preguntas sobre pendientes y más paciencia. Un abrazo dice mucho.",
  },
  papa: {
    menstrual: "Respeta su espacio y su descanso. Un detalle sencillo, como llevarle agua o un té, se nota.",
    folicular: "Pregúntale por sus planes. Tiene energía para empezar cosas nuevas.",
    ovulacion: "Buen día para compartir un rato juntos: un almuerzo o una caminata.",
    lutea: "Si la notas más callada, no lo tomes personal. Paciencia y presencia.",
  },
  amiga: {
    menstrual: "Mándale un mensaje bonito y propón un plan de sofá en vez de salir.",
    folicular: "Invítala a probar algo nuevo: una clase, un café en un lugar distinto.",
    ovulacion: "Está para planes. Organiza algo con el grupo.",
    lutea: "Recuérdale lo mucho que vale. Un audio de dos minutos le puede cambiar el día.",
  },
};

export const CONSEJO_DIARIO_NOTIF: Record<Fase, string> = {
  menstrual: "Hoy toca calor y descanso. ¿Ya tomaste tu sobre?",
  folicular: "Tu energía sube. Buen día para empezar algo nuevo.",
  ovulacion: "Día de conectar. Hidrátate un poco más.",
  lutea: "Menos exigencia, más cuidado. Tu cuerpo te habla.",
};
