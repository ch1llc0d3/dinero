"""
Binguito — Telebingo Triple (Talismán S.A., Paraguay) simulation — REAL 2026 RULES.

"Binguito" is the nickname of Armando Acosta, the popular presenter of
Telebingo Triple. Rules source: official reglamento del sorteo del
18-10-2026 (talisman.com.py/como-jugar), concession per Decreto 934/2023.
See docs/telebingo-triple-rules-2026.md.

Game rules (from the reglamento):
  - Numbers 1–25. Weekly sorteo (Sundays). Cartón ₲10.000 (press-reported).
  - A boleto prints five universos of 8, 12, 13 and 15 numbers per grid;
    four grids are scored by this reglamento's cantadas (the 8-number
    universo plays weekly variation cantadas — not simulated here).
  - 1RA. CANTADA: 12 bolillas from 25.
      12 -> POZO ₲900.000.000
      11 -> ₲2.200.000   10 -> ₲50.000   9 -> ₲10.000
  - 2DA. CANTADA: 13 bolillas from 25.
      13 -> POZO ₲650.000.000
      12 -> ₲2.200.000   11 -> ₲50.000   10 -> ₲10.000
  - 3RA. CANTADA: 15 bolillas from 25.
      15 -> POZO ₲500.000.000 + a Citroën C4 Cactus (especie)
      14 -> ₲2.200.000   13 -> ₲50.000   12 -> ₲10.000
  - REVENTÓN "SALE O SALE": 15 bolillas from 25. The ₲250.000.000 pozo
    goes to the 15-hit boleto(s) or — sale o sale — to the best scorer(s),
    split a prorrata. 14 -> ₲2.200.000, 13 -> ₲50.000, 12 -> ₲10.000.
    Only the highest tier of a cartón pays.
  - EL DÚO: one cartón number drawn from the sold universe wins
    ₲10.000.000; every cartón sharing its last two digits wins ₲50.000.
  - Cash prizes are divisible among winners; 8% IRP withholding on
    individual cash prizes ≥ ₲500.000 (Ley 6380/19, Decreto 3184/2019).

ASSUMPTIONS (not published; clearly labeled):
  - Cartón price ₲10.000 (press-reported, not in the reglamento).
  - Vehicle valued at a flat ₲150.000.000 (especie — not taxed here).
  - Cartones sold per sorteo: 100.000 (drives the REVENTÓN sale-o-sale
    conversion and El Dúo exact-hit odds).
  - Pozo amounts are the published 18-10-2026 values; they vary per
    sorteo — no rollover modeled.
  - When several of YOUR cartones hit a tier, each collects the full
    amount (other players' winners aren't modeled).
"""

import json
import random
from math import comb

POOL_SIZE = 25          # numbers 01–25
TICKET_COST = 10_000    # Gs. per cartón (press-reported)

# --- Pozos — published values, sorteo del 18-10-2026 ---
POZO_1RA = 900_000_000
POZO_2DA = 650_000_000
POZO_3RA = 500_000_000
POZO_REVENTON = 250_000_000
VEHICLE_VALUE = 150_000_000   # ASSUMED (Citroën C4 Cactus, especie)

# --- Fixed prize tables (Gs.) — from the reglamento ---
PRIZES_1RA = {11: 2_200_000, 10: 50_000, 9: 10_000}
PRIZES_2DA = {12: 2_200_000, 11: 50_000, 10: 10_000}
PRIZES_3RA = {14: 2_200_000, 13: 50_000, 12: 10_000}
PRIZES_REVENTON = {13: 50_000, 12: 10_000}  # 14 handled specially (pozo or fixed)

# --- El Dúo ---
DUO_EXACT_PRIZE = 10_000_000
DUO_ENDING_PRIZE = 50_000

# --- ASSUMED cartones sold per sorteo (see docstring) ---
ASSUMED_SOLD = 100_000

TAX_THRESHOLD = 500_000    # 8% IRP withholding at/above this (Ley 6380/19)
TAX_RATE = 0.08

NUM_CARTONES = 10      # cartones bought per sorteo
NUM_DRAWS = 520        # sorteos simulated (520 weeks ≈ 10 years)

# REVENTÓN sale-o-sale: a 14-hit cartón takes the pozo only when no other
# sold cartón scores 14+ (the pozo goes to the best scorer(s) every week).
_COMB_25_15 = comb(25, 15)                                  # 3_268_760
_P14 = comb(15, 14) * comb(10, 1) / _COMB_25_15             # P(exactly 14 hits)
_P15 = 1 / _COMB_25_15                                      # P(exactly 15 hits)
P14_TAKES_POZO = (1 - _P14 - _P15) ** (ASSUMED_SOLD - 1)

times_won = {}
total_spent = 0
earnings = 0


def after_tax(amount):
    """Apply the 8% IRP withholding to cash prizes at/above the threshold."""
    if amount >= TAX_THRESHOLD:
        return round(amount * (1 - TAX_RATE))
    return amount


def draw_balls(n):
    """Draw n distinct bolillas from the 01–25 pool."""
    return set(random.sample(range(1, POOL_SIZE + 1), n))


def make_grid(size):
    """One independent grid of distinct 01–25 numbers."""
    return set(random.sample(range(1, POOL_SIZE + 1), size))


def make_carton():
    """A cartón: scoring grids of 12, 13, 15 and 15 numbers, all independent."""
    return [make_grid(12), make_grid(13), make_grid(15), make_grid(15)]


def count_hits(grid, balls):
    return len(grid & balls)


def record(tier):
    times_won[tier] = times_won.get(tier, 0) + 1


def run_simulation():
    global total_spent, earnings

    for _ in range(NUM_DRAWS):
        total_spent += TICKET_COST * NUM_CARTONES

        balls_1ra = draw_balls(12)       # 1RA. CANTADA
        balls_2da = draw_balls(13)       # 2DA. CANTADA
        balls_3ra = draw_balls(15)       # 3RA. CANTADA
        balls_reventon = draw_balls(15)  # REVENTÓN

        cartones = [make_carton() for _ in range(NUM_CARTONES)]

        for carton in cartones:
            # 1RA. CANTADA (12-number grid)
            hits = count_hits(carton[0], balls_1ra)
            if hits == 12:
                amt = after_tax(POZO_1RA)
                earnings += amt
                record("1ra:12 POZO")
            elif hits in PRIZES_1RA:
                amt = after_tax(PRIZES_1RA[hits])
                earnings += amt
                record(f"1ra:{hits} hits")

            # 2DA. CANTADA (13-number grid)
            hits = count_hits(carton[1], balls_2da)
            if hits == 13:
                amt = after_tax(POZO_2DA)
                earnings += amt
                record("2da:13 POZO")
            elif hits in PRIZES_2DA:
                amt = after_tax(PRIZES_2DA[hits])
                earnings += amt
                record(f"2da:{hits} hits")

            # 3RA. CANTADA (15-number grid) — pozo + vehicle on 15 hits
            hits = count_hits(carton[2], balls_3ra)
            if hits == 15:
                amt = after_tax(POZO_3RA) + VEHICLE_VALUE
                earnings += amt
                record("3ra:15 POZO + vehicle")
            elif hits in PRIZES_3RA:
                amt = after_tax(PRIZES_3RA[hits])
                earnings += amt
                record(f"3ra:{hits} hits")

            # REVENTÓN (15-number grid) — sale o sale: best scorers take
            # the pozo; only the highest tier of the cartón pays.
            hits = count_hits(carton[3], balls_reventon)
            if hits == 15:
                amt = after_tax(POZO_REVENTON)
                earnings += amt
                record("reventon:15 POZO")
            elif hits == 14:
                if random.random() < P14_TAKES_POZO:
                    amt = after_tax(POZO_REVENTON)
                    earnings += amt
                    record("reventon:14 POZO (sale o sale)")
                else:
                    amt = after_tax(2_200_000)
                    earnings += amt
                    record("reventon:14 hits")
            elif hits in PRIZES_REVENTON:
                amt = after_tax(PRIZES_REVENTON[hits])
                earnings += amt
                record(f"reventon:{hits} hits")

            # EL DÚO — exact cartón number + last-two-digits matches
            if random.random() < 1 / ASSUMED_SOLD:
                amt = after_tax(DUO_EXACT_PRIZE)
                earnings += amt
                record("duo:exacto")
            if random.random() < 1 / 100:
                earnings += DUO_ENDING_PRIZE  # below the tax threshold
                record("duo:terminacion")

    print(f"Sorteos: {NUM_DRAWS} weeks x {NUM_CARTONES} cartones")
    print(f"Spent: ₲{total_spent:,}")
    print(f"Earnings: ₲{earnings:,}")
    print(f"Net: ₲{earnings - total_spent:,}")
    print(json.dumps(times_won, indent=2))


if __name__ == "__main__":
    run_simulation()
