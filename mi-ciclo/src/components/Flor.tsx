// La flor-luna del brandbook: cinco pétalos redondos, un anillo y una luna creciente.
// Reemplaza al corazón como reacción.
interface Props {
  activa?: boolean;
  tamano?: number;
  className?: string;
}

const PETALOS = [0, 72, 144, 216, 288];

export function Flor({ activa = false, tamano = 22, className }: Props) {
  if (activa) {
    return (
      <svg viewBox="0 0 24 24" width={tamano} height={tamano} className={className} aria-hidden="true">
        <g transform="translate(12 12.4)" fill="var(--rojo)">
          {PETALOS.map((a) => (
            <circle key={a} cx="0" cy="-6.3" r="4.6" transform={`rotate(${a})`} />
          ))}
          <circle r="6.2" />
        </g>
        <circle cx="12" cy="12.4" r="4.4" fill="none" stroke="#fff" strokeWidth="1.5" />
        <path d="M13.2 9.7 a3 3 0 1 0 1.9 4.6 a2.4 2.4 0 1 1 -1.9 -4.6z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} className={className} aria-hidden="true">
      <path
        d="M12 2.6c2.2 0 3.7 1.9 3.5 3.9 1.8-.9 4.1-.2 4.8 1.9.7 2.1-.6 4-2.4 4.5 1.3 1.5 1.3 3.9-.5 5.2-1.8 1.3-4 .7-5-.9-1 1.6-3.2 2.2-5 .9-1.8-1.3-1.8-3.7-.5-5.2-1.8-.5-3.1-2.4-2.4-4.5.7-2.1 3-2.8 4.8-1.9C8.3 4.5 9.8 2.6 12 2.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12.9 10 a2.7 2.7 0 1 0 1.7 4.1 a2.1 2.1 0 1 1 -1.7 -4.1z" fill="currentColor" />
    </svg>
  );
}
