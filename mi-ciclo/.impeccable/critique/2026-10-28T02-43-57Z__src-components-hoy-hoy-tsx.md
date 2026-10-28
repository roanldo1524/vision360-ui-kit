---
target: Inicio
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/home/user/vision360-ui-kit/mi-ciclo/src/components/hoy/Hoy.tsx"
target_fingerprint: "sha256:8127dc3d8bc04bb6c5249945f9db1e65abc4c49189c9e322c8f28c3717661a9e"
target_path: /home/user/vision360-ui-kit/mi-ciclo/src/components/hoy/Hoy.tsx
timestamp: 2026-10-28T02-43-57Z
slug: src-components-hoy-hoy-tsx
---
# Critique: Inicio (src/components/hoy/Hoy.tsx)
Method: dual-agent (A: design review, B: detector + browser)
User intent: unique, desirable above Flo/period calendars; calm and peace ("paz, tranquilidad, que no quiera salirse"); excellent layout; nothing AI-looking; brandbook colors + miciclo.co fonts; brandbook fonts feel too heavy.

## Heuristics: 23/40
1 Visibility 3 · 2 Match 2 · 3 Control 3 · 4 Consistency 2 · 5 Error prevention 3 · 6 Recognition 3 · 7 Flexibility 2 · 8 Aesthetic/minimalist 1 · 9 Error recovery 2 · 10 Help 2

## Design specificity
Welcome cover is on-brand. Inicio is category-interchangeable (Flo layout); 2x2 identical bento cards read as AI template; no Mi Ciclo logo on Inicio. Differentiator to express: daily sachet ritual + community.

## Priority issues
- [P1] Dashboard of equal-weight modules (9 blocks, ~6 filled red buttons, 1450px). Fix: Inicio = phase -> ritual -> mood; diary/pareja one level down; one red button. Commands: distill, layout.
- [P1] Brand red #F62C39 with white = 3.93:1 fails AA on 22 text nodes (Registrar período, Sí, HOY, pills); week letters #a08ea2 on #fdf1ef 2.76:1; bottom bar 2.88:1. Fix: large bold button text (>=18.66px bold), deeper red for small text, darker greys. Commands: audit, polish.
- [P1] Heavy type, 20 font sizes, 14 nodes at 9.5px; Glodok + Fraunces 900 everywhere. Fix: Glodok only brand moments; Fraunces medium with italic accent; <=5 sizes; min 12px. Command: typeset.
- [P2] Phase card collides at 360px; CTA "Registrar período" wrong on period day 4. Fix: stack/clamp ring; state-aware CTA; unify "período". Commands: adapt, clarify.
- [P2] Ritual squeezed into half row beside duplicate onboarding question (motivo). Fix: full-width ritual with real sachet; drop motivo from Inicio. Commands: layout, delight.

## Persona red flags
Valentina (24, Bogotá, cramps at 7am): sees "Registrar período" + "0 días seguidos"; relief 2 scrolls down; "cólicos" behind small link.
First-timer: unexplained badge dots; "ventana fértil" unexplained; diario vs espacio con tu amor unclear.
Accessibility: 9.5px text; mood "Cansada" hidden in horizontal scroll; stacked toasts.

## Minor
Mood faces use non-brand mint/peach/yellow; Caveat loaded (not brand); --violeta #e7befb vs #E7BEF8; dead CSS for water/goal/products in hoy.module.css; heart instead of flor-luna; generic uppercase eyebrows; awkward line breaks; 150px empty end; ai-color-palette on bloqueLila is a false positive (brand violet).

## Questions
1. One thing at 7am: phase, sachet or feeling?
2. Why does the cover's art direction vanish inside?
3. Do pareja features belong on a period-day home?
