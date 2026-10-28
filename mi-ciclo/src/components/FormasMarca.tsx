// Recursos gráficos oficiales del brandbook Mi Ciclo 2026:
// luna, círculo, estrella de cuatro pétalos y flor-luna. Formas planas, sin degradados.
interface Props {
  color?: string;
  tamano?: number;
  className?: string;
  /** color del hueco interior (anillo y luna de la flor) */
  fondo?: string;
}

export function Luna({ color = "var(--rojo)", tamano = 40, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} className={className} aria-hidden="true">
      <path d="M62 6c-4 8-6 17-6 26 0 26 18 46 42 50C89 93 73 98 56 98 28 98 6 76 6 50S28 2 56 2c2 0 4 2 6 4z" fill={color} />
    </svg>
  );
}

export function Circulo({ color = "var(--rojo)", tamano = 40, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} className={className} aria-hidden="true">
      <path d="M50 4c27 0 46 19 46 46 0 26-20 46-46 46S4 76 4 50C4 23 24 4 50 4z" fill={color} />
    </svg>
  );
}

/** Estrella de cuatro pétalos redondeados en diagonal (símbolo del sobre y del logo). */
export function Estrella({ color = "var(--rojo)", tamano = 40, className }: Props) {
  // pétalo simétrico: nace en el centro y termina redondeado; se reparte en diagonal
  const petalo = "M50 50 C41 40 35 28 38 17 C41 7 59 7 62 17 C65 28 59 40 50 50 Z";
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} className={className} aria-hidden="true">
      {[45, 135, 225, 315].map((a) => (
        <path key={a} d={petalo} fill={color} transform={`rotate(${a} 50 50)`} />
      ))}
    </svg>
  );
}

/** Flor-luna: cinco pétalos redondos, anillo y luna creciente. */
export function FlorLuna({ color = "var(--rojo)", fondo = "#fff", tamano = 40, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} className={className} aria-hidden="true">
      <g transform="translate(50 52)" fill={color}>
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx="0" cy="-27" r="20" transform={`rotate(${a})`} />
        ))}
        <circle r="27" />
      </g>
      <circle cx="50" cy="52" r="19" fill="none" stroke={fondo} strokeWidth="5" />
      <path d="M55 39 a13 13 0 1 0 8 20 a10 10 0 1 1 -8 -20z" fill={fondo} />
    </svg>
  );
}

/** Flor ondulada de ocho pétalos con luna (variante del brandbook). */
export function FlorOndulada({ color = "var(--rojo)", fondo = "#fff", tamano = 40, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={tamano} height={tamano} className={className} aria-hidden="true">
      <g transform="translate(50 50)" fill={color}>
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx="0" cy="-33" r="13" transform={`rotate(${i * 45})`} />
        ))}
        <circle r="35" />
      </g>
      <path d="M56 28 a22 22 0 1 0 14 34 a17 17 0 1 1 -14 -34z" fill={fondo} />
    </svg>
  );
}
