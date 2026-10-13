# Telebingo Triple ("Binguito") — real rules, 2026

Research notes for `binguito.py` and `js/binguito-sim.js`.

## What "Binguito" is

**Binguito** is the nickname of **Armando Acosta**, the popular presenter/announcer
of **Telebingo Triple**, the Paraguayan tele-bingo run by **TALISMÁN S.A.**
(RUC 80021636-9), concessionaire per **Decreto del Poder Ejecutivo N° 934/2023**.
Telebingo Triple is a *different game* from the Canal 9 Telebingo operated by
GAMBLING S.A. (which this repo implements in `telebingo.py`).

Sources:

- Official reglamento del sorteo del **18 de octubre de 2026** —
  <https://www.talisman.com.py/como-jugar> (full text scraped 2026-10-13)
- Published results of sorteo TB 11 OCT 2026 — <https://www.talisman.com.py/>
- Cartón price ₲10.000 reported by Última Hora (2023-12-08,
  "Exitoso cierre del año 2023 en el Este del país")

## Game rules (reglamento, sorteo 18-10-2026)

- Numbers **1–25**. Weekly sorteo (Sundays). Cartón **₲10.000** (reported;
  not stated in the reglamento).
- Each boleto prints **five universos** of 8, 12, 13 and 15 distinct numbers
  per grid. Four grids are scored by this reglamento's cantadas; the
  8-number universo plays weekly *variation* cantadas (e.g. the ₲150M
  8-ball cantada seen in the TB 11 OCT 2026 results) — not simulated.

### 1RA. CANTADA — 12 bolillas of 25
| hits | prize |
|---|---|
| 12 | **POZO ₲900.000.000** |
| 11 | ₲2.200.000 |
| 10 | ₲50.000 |
| 9 | ₲10.000 |

### 2DA. CANTADA — 13 bolillas of 25
| hits | prize |
|---|---|
| 13 | **POZO ₲650.000.000** |
| 12 | ₲2.200.000 |
| 11 | ₲50.000 |
| 10 | ₲10.000 |

### 3RA. CANTADA — 15 bolillas of 25
| hits | prize |
|---|---|
| 15 | **POZO ₲500.000.000 + a Citroën C4 Cactus** (especie) |
| 14 | ₲2.200.000 |
| 13 | ₲50.000 |
| 12 | ₲10.000 |

### REVENTÓN — "SALE O SALE 250 MILLONES" — 15 bolillas of 25
- 15 hits (or, failing that, **the best scorer(s)**) win the
  **₲250.000.000** pozo, split *a prorrata*. The pozo is guaranteed to go
  ("sale o sale") every sorteo.
- 14 → ₲2.200.000 · 13 → ₲50.000 · 12 → ₲10.000
- Only the highest tier of a cartón pays.

### EL DÚO
- One cartón number is drawn at random from the sold universe → **₲10.000.000**.
- Every cartón sharing the winner's **last two digits** → **₲50.000**.

### General
- Cash prizes are **divisible** among coinciding winners (equal parts).
- **8% IRP** withholding on individual cash prizes ≥ ₲500.000
  (Ley N° 6380/19, Decreto N° 3184/2019). Especie (vehicle) prizes are
  not cash → no withholding modeled.
- Prizes must be claimed within 60 days.

## Odds (exact, per grid)

- C(25,12) = 5.200.300 → P(12/12) = P(13/13) = 1 in 5.200.300
- C(25,15) = 3.268.760 → P(15/15) = 1 in 3.268.760
- A cartón (4 grids) hits *a* POZO with probability ≈ **1 in 1.004.000**

## Assumptions (not published; labeled in the sims)

- Cartón price ₲10.000 (press-reported).
- Vehicle valued at a flat **₲150.000.000**.
- **Cartones sold per sorteo ≈ 100.000** — drives (a) the REVENTÓN
  sale-o-sale rule (a 14-hit cartón takes the pozo only if no other sold
  cartón scores 14+: probability (1 − P14 − P15)^(sold−1) ≈ 1% at 100k
  sold) and (b) El Dúo exact-hit odds (1/sold per cartón).
- Pozo amounts are the published 18-10-2026 values; they vary per sorteo
  (e.g. TB 11 OCT 2026 paid 800M/650M/500M/150M) — no rollover modeled.
- When several of *your* cartones hit a tier, each collects the full
  amount (other players' winners aren't modeled).
- Weekly variation extras seen in results (extra vehicle winners,
  PACKPLAY, 50 × ₲500K efectivo) are not defined in this reglamento and
  are not simulated.
