"""
Seneté (Gambling S.A., Paraguay) simulation — REAL 2026 RULES.

Rules source: official reglamento (senete.com.py/reglamento) + published
results of sorteos #1470–#1488 (May–Oct 2026). See docs/senete-rules-2026.md.

Game rules:
  - Numbers 1–25. Weekly sorteo (Sundays, broadcast on SNT). Cartón ₲10.000.
  - A cartón has two independent 12-number grids and two independent
    15-number grids (validated against real winner counts).
  - Jugada 1 GRANDIOSO: 12 bolillas from 25.
      12 hits -> POZO (progressive; carries over when unwon)
      11 hits -> ₲2.000.000
  - Jugada 2 PODEROSO: 12 bolillas from 25.
      12 hits -> jackpot (base ₲1.000.000.000, observed stepping up
                  ~₲100M per unwon week: 900M -> 1.000M -> 1.100M)
      11 -> ₲2.000.000   10 -> ₲50.000
      9, 3, 2, 1 -> un cartón (valued at ₲10.000)
      0 -> ₲2.000.000 (all 13 undrawn numbers)
  - Jugada 3 DOBLE CHANCE: 15 bolillas from 25.
      15 hits -> POZO (progressive)
      14 -> ₲2.000.000   13 -> ₲50.000   12 -> un cartón
  - Jugada 4 cartones al azar: drawn by cartón number, ~116 winners per
    ~175.000 cartones. Menu modeled on the 2026 draws (see below).
  - Cash prizes ≥ ₲500.000 suffer an 8% IRP withholding (Ley 6380/2019).

ASSUMPTIONS (not published; clearly labeled):
  - POZO bases and weekly growth for GRANDIOSO / DOBLE CHANCE.
  - PODEROSO +₲100M step-up rule (inferred from 3 data points).
  - Vehicle prize valued at a flat ₲150.000.000.
"""

import json
import random

POOL_SIZE = 25          # numbers 01–25
GRIDS_12 = 2            # 12-number grids per cartón (GRANDIOSO / PODEROSO)
GRIDS_15 = 2            # 15-number grids per cartón (DOBLE CHANCE)
TICKET_COST = 10_000    # Gs. per cartón
CARTON_VALUE = 10_000   # value of an "UN CARTÓN" prize

# --- Progressive pozos (ASSUMED bases/growth — see docstring) ---
GRANDIOSO_POZO_BASE = 100_000_000
GRANDIOSO_POZO_GROWTH = 10_000_000      # per unwon week (assumed)
DOBLE_POZO_BASE = 100_000_000
DOBLE_POZO_GROWTH = 10_000_000          # per unwon week (assumed)
PODEROSO_BASE = 1_000_000_000
PODEROSO_STEP = 100_000_000             # per unwon week (inferred)

# --- Fixed prize tables (Gs.) — from published 2026 results ---
GRANDIOSO_PRIZES = {
    11: 2_000_000,
}

PODEROSO_PRIZES = {
    11: 2_000_000,
    10: 50_000,
    9: CARTON_VALUE,
    3: CARTON_VALUE,
    2: CARTON_VALUE,
    1: CARTON_VALUE,
    0: 2_000_000,
}

DOBLE_CHANCE_PRIZES = {
    14: 2_000_000,
    13: 50_000,
    12: CARTON_VALUE,
}

# --- Jugada 4: cartones al azar (menu from 2026 draws; vehicle ASSUMED) ---
AZAR_WINNERS = 116          # winners per sorteo
AZAR_SOLD = 175_000         # estimated cartones sold per sorteo
AZAR_MENU = (
    [(500_000)] * 100 + [(10_000_000)] * 10 + [(20_000_000)] * 5
    + [(150_000_000)]      # vehicle (assumed value)
)

TAX_THRESHOLD = 500_000    # 8% IRP withholding at/above this (Ley 6380/2019)
TAX_RATE = 0.08

NUM_CARTONES = 10      # cartones bought per sorteo
NUM_DRAWS = 520        # sorteos simulated (520 weeks ≈ 10 years)

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
    """A cartón: 2 grids of 12 + 2 grids of 15, all independent."""
    return ([make_grid(12) for _ in range(GRIDS_12)]
            + [make_grid(15) for _ in range(GRIDS_15)])


def count_hits(grid, balls):
    return len(grid & balls)


def record(tier):
    times_won[tier] = times_won.get(tier, 0) + 1


def run_simulation():
    global total_spent, earnings

    grandioso_pozo = GRANDIOSO_POZO_BASE
    doble_pozo = DOBLE_POZO_BASE
    poderoso_jackpot = PODEROSO_BASE

    for _ in range(NUM_DRAWS):
        total_spent += TICKET_COST * NUM_CARTONES

        balls_g = draw_balls(12)   # GRANDIOSO
        balls_p = draw_balls(12)   # PODEROSO
        balls_d = draw_balls(15)   # DOBLE CHANCE

        cartones = [make_carton() for _ in range(NUM_CARTONES)]

        for carton in cartones:
            for i, grid in enumerate(carton):
                if i < GRIDS_12:
                    # GRANDIOSO (12-ball)
                    hits = count_hits(grid, balls_g)
                    if hits == 12:
                        amt = after_tax(grandioso_pozo)
                        earnings += amt
                        record("grandioso:12 POZO")
                        grandioso_pozo = GRANDIOSO_POZO_BASE
                    elif hits in GRANDIOSO_PRIZES:
                        amt = after_tax(GRANDIOSO_PRIZES[hits])
                        earnings += amt
                        record(f"grandioso:{hits} hits")

                    # PODEROSO (same 12-number grids, different draw)
                    hits = count_hits(grid, balls_p)
                    if hits == 12:
                        amt = after_tax(poderoso_jackpot)
                        earnings += amt
                        record("poderoso:12 JACKPOT")
                        poderoso_jackpot = PODEROSO_BASE
                    elif hits in PODEROSO_PRIZES:
                        amt = after_tax(PODEROSO_PRIZES[hits])
                        earnings += amt
                        record(f"poderoso:{hits} hits")
                else:
                    # DOBLE CHANCE (15-ball)
                    hits = count_hits(grid, balls_d)
                    if hits == 15:
                        amt = after_tax(doble_pozo)
                        earnings += amt
                        record("doble_chance:15 POZO")
                        doble_pozo = DOBLE_POZO_BASE
                    elif hits in DOBLE_CHANCE_PRIZES:
                        amt = after_tax(DOBLE_CHANCE_PRIZES[hits])
                        earnings += amt
                        record(f"doble_chance:{hits} hits")

            # Jugada 4 — cartones al azar (by cartón number)
            if random.random() < AZAR_WINNERS / AZAR_SOLD:
                amt = after_tax(random.choice(AZAR_MENU))
                earnings += amt
                record("cartones_al_azar")

        # Pozos grow when unwon this week
        grandioso_pozo += GRANDIOSO_POZO_GROWTH
        doble_pozo += DOBLE_POZO_GROWTH
        poderoso_jackpot += PODEROSO_STEP

    print(f"Sorteos: {NUM_DRAWS} weeks x {NUM_CARTONES} cartones")
    print(f"Spent: ₲{total_spent:,}")
    print(f"Earnings: ₲{earnings:,}")
    print(f"Net: ₲{earnings - total_spent:,}")
    print(json.dumps(times_won, indent=2))


if __name__ == "__main__":
    run_simulation()
