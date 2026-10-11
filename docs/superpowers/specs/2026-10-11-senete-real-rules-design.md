# Seneté real rules — Design
**Status:** final
**Date:** 2026-10-11
**Predecessor / References:** `docs/senete-rules-2026.md` (research: official reglamento, FAQ, sorteos #1470–#1488); existing assumed-rules demo (PR #11).

## Why this exists
The merged Seneté demo assumed an animal-lottery mechanic (25 animals, 1 drawn, 20×). Real Seneté (2026) is a 1–25 lotto with 12- and 15-number grids, four jugadas per weekly sorteo, progressive pozos, and a ₲2M zero-hits consolation. The scaffold `senete.py` and the browser demo must be replaced with the real rules.

## Hard constraints
- Numbers 1–25; **no animals** anywhere.
- Cartón = 2 independent 12-number grids + 2 independent 15-number grids (validated against winner counts).
- All assumed values (pozo bases, step-up, vehicle values) must be visibly labeled as assumptions.
- Responsible-gaming note stays on the section.
- Keep the site's existing visual system (.sim-* classes) and en/es i18n pattern (static strings in `js/main.js`, dynamic strings in the sim file).

## Architecture
- `senete.py` — offline Monte Carlo (mirrors `telebingo.py` structure): weekly draws, configurable cartones/draws, progressive pozos, 8% IRP on prizes ≥ ₲500.000, JSON tier breakdown.
- `js/senete-sim.js` — interactive browser sim: user picks cartones per week, sorteos roll on a timer, live stats + end-of-run summary with per-jugada breakdown.
- `index.html` — replace the animal-picker section with cartón-count config; update facts row and card description.
- `css/style.css` — drop animal-grid styles, add grid/ball styles for the new sim.

## Game model (shared by both sims)
- Jugada 1 GRANDIOSO: 12/25 balls; 12 → POZO (progressive, assumed base ₲100M, +₲10M/wk), 11 → ₲2.000.000.
- Jugada 2 PODEROSO: 12/25; 12 → ₲1.000.000.000 base, +₲100M per unwon week, resets on win; 11 → ₲2M; 10 → ₲50.000; 9/3/2/1 → cartón (₲10.000); 0 → ₲2.000.000.
- Jugada 3 DOBLE CHANCE: 15/25; 15 → POZO (same assumed base/growth), 14 → ₲2M, 13 → ₲50.000, 12 → cartón.
- Jugada 4 cartones al azar: per-cartón win probability 116/175.000; menu 100×₲500.000, 10×₲10M, 5×₲20M, 1×vehicle (valued ₲150M, assumed).
- Tax: 8% withheld on cash prizes ≥ ₲500.000.

## Testing strategy
- `senete.py` runs end-to-end; sanity-check expected winner counts against the validated math (e.g. PODEROSO 9-aciertos ≈ 1/82.6 per grid).
- Browser sim exercised via Playwright: start/stop, live counters move, summary renders, language switch re-renders.

## Out of scope (v1)
- Jugada 4 vehicle catalog per week (single assumed value).
- Pack Ahorro discounts; special-sorteo pricing.
