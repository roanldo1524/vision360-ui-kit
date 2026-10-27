import * as React from "react";

/**
 * PremiumPricing
 * Sección de precios asimétrica: el plan recomendado es más grande, oscuro y flota.
 * Reglas aplicadas (ver CLAUDE.md):
 *  - Taste: bordes semitransparentes y etiquetas editoriales (10px, mayúsculas, tracking .15em).
 *  - Impeccable: sombras en capas y radios proporcionales (tarjeta 24px → botón 16px).
 *  - Emil Kowalski: escala sutil al pasar el mouse (solo en dispositivos con hover) y al presionar,
 *    200ms con curva de salida fuerte; sin animación si el usuario pide movimiento reducido.
 * Requiere Tailwind CSS (v3.3+ o v4). Sin dependencias extra.
 */

export type Plan = {
  id: string;
  /** Etiqueta editorial pequeña, p. ej. "PARA EMPEZAR" */
  eyebrow: string;
  name: string;
  price: number;
  /** Precio de antes, para tacharlo (opcional) */
  compareAt?: number;
  /** Texto bajo el precio, p. ej. "$125.350 c/u" */
  unitNote?: string;
  features: string[];
  cta: string;
  recommended?: boolean;
  /** Insignia sobre el plan recomendado, p. ej. "MÁS ELEGIDO" */
  badge?: string;
};

type Props = {
  title?: React.ReactNode;
  subtitle?: string;
  plans?: Plan[];
  currency?: string;
  locale?: string;
  onSelect?: (plan: Plan) => void;
};

const DEFAULT_PLANS: Plan[] = [
  {
    id: "kit-3",
    eyebrow: "Para empezar",
    name: "Kit 3 lámparas",
    price: 389700,
    unitNote: "$129.900 c/u",
    features: ["Carga solar, sin cables", "Proyección mandala multicolor", "Envío gratis"],
    cta: "Pedir kit de 3",
  },
  {
    id: "kit-6",
    eyebrow: "Patio completo",
    name: "Kit 6 lámparas",
    price: 752100,
    compareAt: 779400,
    unitNote: "$125.350 c/u · ahorras $27.300",
    features: [
      "Todo lo del kit de 3",
      "Guía de decoración con luz gratis",
      "Ideal para patio, balcón o jardín",
      "Envío gratis · pagas al recibir",
    ],
    cta: "Pedir kit de 6",
    recommended: true,
    badge: "Más elegido",
  },
  {
    id: "kit-9",
    eyebrow: "Mejor precio",
    name: "Kit 9 lámparas",
    price: 1075100,
    compareAt: 1169100,
    unitNote: "$119.455 c/u · ahorras $94.000",
    features: ["Todo lo del kit de 6", "Para caminos y fachadas", "Envío gratis"],
    cta: "Pedir kit de 9",
  },
];

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

// Sombras en capas (Impeccable)
const SHADOW_SUBTLE =
  "shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_2px_8px_-1px_rgba(0,0,0,0.02)]";
// En el plan oscuro la sombra necesita un poco más de opacidad para leerse sobre fondo claro
const SHADOW_FLOAT_DARK =
  "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35),0_18px_36px_-12px_rgba(0,0,0,0.2)]";

// Escala de Emil: hover solo donde existe hover real; press siempre
const PRESS =
  `transition-[transform,box-shadow] duration-200 ${EASE} [@media(hover:hover)]:hover:scale-[1.01] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100`;

function formatMoney(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function Check({ className = "" }: { className?: string }) {
  // Ícono desnudo y monocromo: sin círculo detrás
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`mt-[3px] h-4 w-4 flex-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

function PlanCard({
  plan,
  currency,
  locale,
  onSelect,
}: {
  plan: Plan;
  currency: string;
  locale: string;
  onSelect?: (plan: Plan) => void;
}) {
  const rec = !!plan.recommended;

  return (
    <article
      aria-label={plan.name}
      className={[
        "group relative flex flex-col rounded-3xl",
        PRESS,
        rec
          ? // Masivo y flotando: superficie sólida profunda, sin gradientes
            `order-first p-8 md:order-none md:col-span-6 md:-translate-y-6 md:p-10 bg-[#0c0d10] text-neutral-50 border border-white/5 ${SHADOW_FLOAT_DARK}`
          : // Planes laterales: vidrio claro, más bajos para que el central domine
            // (la clase de hover se escribe completa para que Tailwind la detecte)
            `p-6 md:col-span-3 md:mt-10 md:p-7 bg-white/40 backdrop-blur-md border border-neutral-500/10 ${SHADOW_SUBTLE} [@media(hover:hover)]:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),0_15px_30px_-10px_rgba(0,0,0,0.05)]`,
      ].join(" ")}
    >
      {rec && plan.badge && (
        <span
          className={`absolute -top-3 left-8 md:left-10 rounded-full bg-[#F6B826] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0c0d10] ${SHADOW_SUBTLE}`}
        >
          {plan.badge}
        </span>
      )}

      {/* Metadatos juntos (proximidad) */}
      <header className="space-y-1.5">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
            rec ? "text-neutral-400" : "text-neutral-500"
          }`}
        >
          {plan.eyebrow}
        </p>
        <h3
          className={`font-bold tracking-tighter ${
            rec ? "text-3xl md:text-4xl" : "text-xl"
          }`}
        >
          {plan.name}
        </h3>
      </header>

      <div className={rec ? "mt-8" : "mt-6"}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={`font-black tracking-tighter tabular-nums ${
              rec ? "text-5xl md:text-6xl" : "text-3xl"
            }`}
          >
            {formatMoney(plan.price, currency, locale)}
          </span>
          {plan.compareAt && (
            <s
              className={`text-sm tabular-nums ${
                rec ? "text-neutral-500" : "text-neutral-400"
              }`}
            >
              {formatMoney(plan.compareAt, currency, locale)}
            </s>
          )}
        </div>
        {plan.unitNote && (
          <p
            className={`mt-1 text-sm leading-relaxed ${
              rec ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {plan.unitNote}
          </p>
        )}
      </div>

      <ul
        className={`flex-1 space-y-3 text-sm leading-relaxed ${
          rec ? "mt-8 text-neutral-300" : "mt-6 text-neutral-600"
        }`}
      >
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3">
            <Check className={rec ? "text-[#F6B826]" : "text-neutral-400"} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Botón: radio interior proporcional (24px → 16px) */}
      <button
        type="button"
        onClick={() => onSelect?.(plan)}
        className={[
          "mt-8 w-full rounded-2xl px-5 font-semibold tracking-tight",
          "transition-[transform,background-color] duration-200",
          EASE,
          "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          rec
            ? "h-14 text-base bg-[#F6B826] text-[#0c0d10] [@media(hover:hover)]:hover:bg-[#ffc53d] focus-visible:ring-[#F6B826] focus-visible:ring-offset-[#0c0d10]"
            : "h-12 text-sm bg-neutral-900/[0.04] text-neutral-900 border border-neutral-500/10 [@media(hover:hover)]:hover:bg-neutral-900/[0.07] focus-visible:ring-neutral-400",
        ].join(" ")}
      >
        {plan.cta}
      </button>
    </article>
  );
}

export default function PremiumPricing({
  title = (
    <>
      Elige tu kit <span className="text-neutral-400">y llena tu patio de luz.</span>
    </>
  ),
  subtitle = "Pagas al recibir. Envío gratis a toda Colombia.",
  plans = DEFAULT_PLANS,
  currency = "COP",
  locale = "es-CO",
  onSelect,
}: Props) {
  return (
    <section className="bg-[#f6f5f2] px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Precios
          </p>
          <h2 className="text-4xl font-bold tracking-tighter text-neutral-900 md:text-5xl">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-neutral-600">{subtitle}</p>
        </header>

        {/* Grilla asimétrica 3 · 6 · 3: el plan recomendado domina */}
        <div className="mt-16 grid grid-cols-1 items-start gap-5 md:mt-20 md:grid-cols-12 md:gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currency={currency}
              locale={locale}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
