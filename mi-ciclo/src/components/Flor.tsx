// La flor-luna del brandbook: reemplaza al corazón como reacción.
interface Props {
  activa?: boolean;
  tamano?: number;
  className?: string;
}

export function Flor({ activa = false, tamano = 22, className }: Props) {
  const petalos = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} className={className} aria-hidden="true">
      <g transform="translate(12 12)">
        {petalos.map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-5.6"
            rx="3.7"
            ry="5"
            transform={`rotate(${a})`}
            fill={activa ? "var(--rojo)" : "none"}
            stroke={activa ? "var(--rojo)" : "currentColor"}
            strokeWidth="1.6"
          />
        ))}
        {/* luna creciente al centro */}
        <path
          d="M1.2 -3 A3.2 3.2 0 1 0 3 1.4 A2.5 2.5 0 1 1 1.2 -3 Z"
          fill={activa ? "#fff" : "currentColor"}
        />
      </g>
    </svg>
  );
}
