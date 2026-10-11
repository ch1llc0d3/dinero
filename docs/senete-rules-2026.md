# Seneté — Real Game Rules (researched 2026-10)

Sources: official reglamento (senete.com.py/reglamento, PDF `REGLAMENTO_reglamento.pdf`),
official FAQ (senete.com.py/preguntas), and real draw results from sorteos #1470, #1483,
#1484, #1487, #1488 (May–Oct 2026, via resultadospy.com/senete, sourced from Seneté).

## What Seneté actually is

Weekly lotto-style game by **Gambling S.A.** (Paraguay), drawn **Sundays** and broadcast
live on SNT / Canal 9 Cerro Corá. Sorteo #1 was 01-JUL-2018; sorteo #1488 fell on
2026-10-04. **Numbers 1–25 — no animals.** (The current site demo's animal pool is wrong
and must be replaced.)

- Cartón price: **₲10.000** (special sorteos may price differently).
- Estimated cartones sold per week: **~175,000** (derived below, and consistent across
  every prize tier we cross-checked).

## Cartón structure

Per the reglamento, grids are **independent**:

- **Two grids of 12 numbers** (from 1–25) → used by Jugada 1 (GRANDIOSO) and
  Jugada 2 (PODEROSO).
- **Two grids of 15 numbers** (from 1–25) → used by Jugada 3 (DOBLE CHANCE).

The "two independent grids" model is confirmed by winner-count math (see Validation).

## The four jugadas per sorteo

### Jugada 1 — GRANDIOSO
12 bolillas drawn from 25. A grid hitting **12/12** wins the **POZO** (progressive;
carries over when unwon — shown as "POZO" in results every week we sampled).
- 12 aciertos: POZO (progressive jackpot)
- 11 aciertos: ₲2.000.000

### Jugada 2 — PODEROSO
12 bolillas drawn from 25. Headline jackpot, observed stepping up when unwon:
₲900.000.000 (Jun 2026) → ₲1.000.000.000 (Aug/Sep) → ₲1.100.000.000 (Oct 2026).
- 12 aciertos: ₲1.000.000.000 (base; steps up ~₲100M)
- 11 aciertos: ₲2.000.000
- 10 aciertos: ₲50.000
- 9, 3, 2, 1 aciertos: UN CARTÓN (free cartón; some weeks paid as ₲20.000 cash)
- **0 aciertos: ₲2.000.000** (the famous "consolation" — all 13 undrawn numbers)

### Jugada 3 — DOBLE CHANCE
15 bolillas drawn from 25.
- 15 aciertos: POZO (progressive)
- 14 aciertos: ₲2.000.000
- 13 aciertos: ₲50.000
- 12 aciertos: UN CARTÓN (some weeks ₲20.000)

### Jugada 4 — Cartones al azar
Random cartón-number draw, independent of the bolillas. Typical weekly menu:
- ₲500.000 × 50 cartones (two blocks of 50)
- Occasional ₲10.000.000 × 10 and ₲20.000.000 × 5 cartones
- Vehicles: motorcycles (Honda Navi/CB100/Dio), cars (Fortuner, Explorer, Saveiro,
  Fiorino, Grand i10, Suzuki Fronx…) — 1–5 cartones each

## Validation (winner-count math, C(25,12) = 5,200,300; C(25,15) = 3,268,760)

With G grids in play, expected winners = G / combinations:

| Tier | P (per grid) | Expected @ ~350k 12-grids | Observed |
|---|---|---|---|
| PODEROSO 9 aciertos | 62,920/5,200,300 ≈ 1/82.6 | ~2,120 | 2,121 ✓ |
| PODEROSO 11 aciertos | 156/5,200,300 ≈ 1/33,333 | ~5–10 | 6–14 ✓ |
| PODEROSO 0 aciertos | 13/5,200,300 ≈ 1/400,023 | ~0.9 | 0–1 ✓ |
| DOBLE CHANCE 13 | 4,725/3,268,760 ≈ 1/691.8 | ~507 (2×15-grids) | 511 ✓ |
| DOBLE CHANCE 12 | 54,600/3,268,760 ≈ 1/59.9 | ~5,900 | 5,906 ✓ |

→ ~175k cartones × (2 twelve-grids + 2 fifteen-grids) fits every observed tier.
The two-grids-per-cartón reading of the reglamento is correct.

## Fiscal / operational rules

- Prizes ≥ ₲500.000 (FAQ says from ₲510.000): **8% IRP withholding** (Ley 6380/2019,
  Decreto 4661/20); withholding is final for the winner.
- Claim window: **60 días corridos** (Ley 1016/97); physical cartón is bearer instrument,
  digital cartón redeemed with cédula.
- Digital play: senete.com.py account + Tigo Money / Personal / Zimple / Bancard cards;
  Pack Ahorro bulk discounts; first purchase gets a free cartón.
- Draws may add promo modalities ("divisibles" prizes split among winners).
- Responsible-gaming messaging mandatory; GLI certified.

## Open items (assumptions to flag in the sim)

1. **POZO base/reset values** for GRANDIOSO and DOBLE CHANCE were never observed won in
   the sampled window — model as progressive with an assumed base (e.g. ₲100M) and
   clearly label it.
2. PODEROSO step-up rule (+₲100M per unwon week) is inferred from 3 data points.
3. "UN CARTÓN" vs ₲20.000 cash for low tiers varies by week — model as cartón value
   (₲10.000) with a note, or ₲20.000 where observed.
4. Jugada 4 vehicle values vary weekly — model the cash component only, or use the
   observed 2026 menu as a representative table.
