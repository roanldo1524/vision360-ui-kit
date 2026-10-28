// Jardín de marca: doce espacios que florecen con las formas del brandbook.
// Cada 30 pétalos ganados un espacio avanza: semilla → círculo → flor ondulada → flor-luna.
import { Circulo, FlorLuna, FlorOndulada } from "@/components/FormasMarca";
import estilos from "./jardin.module.css";

const ESPACIOS = 12;
const PETALOS_POR_ETAPA = 30;

export function Jardin({ ganados }: { ganados: number }) {
  const etapas = Math.floor(ganados / PETALOS_POR_ETAPA);
  const plantas = Array.from({ length: ESPACIOS }, (_, i) =>
    Math.min(3, Math.floor(etapas / ESPACIOS) + (i < etapas % ESPACIOS ? 1 : 0)),
  );
  const flores = plantas.filter((e) => e === 3).length;
  const siguiente = PETALOS_POR_ETAPA - (ganados % PETALOS_POR_ETAPA);

  return (
    <div className={estilos.jardin}>
      <ol className={estilos.parcelas} aria-label={`Tu jardín tiene ${flores} ${flores === 1 ? "flor abierta" : "flores abiertas"}`}>
        {plantas.map((etapa, i) => (
          <li key={i} className={estilos.parcela} style={{ animationDelay: `${i * 40}ms` }} aria-hidden="true">
            {etapa === 0 && <span className={estilos.semilla} />}
            {etapa === 1 && <Circulo color="#ffdced" tamano={14} />}
            {etapa === 2 && <FlorOndulada color="#ffdced" fondo="var(--rojo)" tamano={26} />}
            {etapa === 3 && <FlorLuna color="#ffffff" fondo="var(--rojo)" tamano={32} />}
          </li>
        ))}
      </ol>
      <p className={estilos.jardinPie}>
        {flores === 0 ? "Tu primera flor está por abrir" : `${flores} ${flores === 1 ? "flor abierta" : "flores abiertas"}`}
        <span aria-hidden="true"> · </span>
        faltan <b className="num">{siguiente}</b> pétalos para que algo crezca
      </p>
    </div>
  );
}
