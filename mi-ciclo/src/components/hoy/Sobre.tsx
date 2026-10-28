/** Sobre efervescente Mi Ciclo (ilustración del producto). */
export function Sobre({ tamano = 54 }: { tamano?: number }) {
  return (
    <svg viewBox="0 0 54 54" width={tamano} height={tamano} role="img" aria-label="Sobre de Mi Ciclo">
      <rect width="54" height="54" rx="14" fill="#fde3e9" />
      <g transform="rotate(-8 27 27)">
        <rect x="14" y="8" width="26" height="38" rx="3" fill="#f6a8bb" />
        <path d="M14 12 h26 M14 42 h26" stroke="#e57f99" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
        <text x="27" y="26" textAnchor="middle" fontSize="6.5" fontFamily="var(--f-marca)" fill="#e01e37">Mi</text>
        <text x="27" y="33" textAnchor="middle" fontSize="6.5" fontFamily="var(--f-marca)" fill="#e01e37">Ciclo</text>
      </g>
      {[[42, 12, 2.2], [45, 20, 1.5], [9, 38, 1.8]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity=".9" />
      ))}
    </svg>
  );
}
