"""
Telebingo de Canal 9 TV Cerro Corá (Paraguay) simulation.

Operator: GAMBLING S.A. — Conajzar Resolución 51/2019, Decreto 3068/2019.
Rules source: "Reglamento del Juego" (JUEGO-RESPONSABLE_ludopatia.pdf).

Game rules (from the reglamento):
  - Each cartón contains 3+ series of distinct numbers, numbered 01–25.
  - GRANDIOSO: 12 balls drawn from 25.
      * 12 hits -> prize in kind (ESPECIE)
      * 11 hits -> prize in kind (ESPECIE)
  - PODEROSO: 12 balls drawn from 25.
      * 12 hits -> POZO (may be divisible among winners)
      * 11, 10, 9, 3, 2, 1, 0 hits -> also win
  - DOBLE CHANCE: 15 balls drawn from 25.
      * 15 hits -> POZO (may be divisible)
      * 14, 13, 12 hits -> also win
      * A cartón has two independent columns; hits are NOT summed and
        each column is scored separately under the same rules.
  - Only the highest winning tier of a card pays in each drawing.

Prize AMOUNTS are not published in the reglamento — they are configurable
below. Defaults are placeholders; set them to the real published values.
"""

import json
import random

POOL_SIZE = 25          # numbers 01–25
SERIES_SIZE = 15        # numbers per series — reglamento doesn't specify;
                        # Telebingo cartones conventionally use 15. Adjust if
                        # the printed cartón shows a different count.
CARTON_SERIES = 3       # series (columns) per cartón

# --- Prize tables (Gs.). Placeholders — replace with real published values. ---

GRANDIOSO_PRIZES = {
    12: 0,  # ESPECIE (prize in kind) — value it if you want it counted
    11: 0,  # ESPECIE
}

PODEROSO_PRIZES = {
    12: 50_000_000,  # POZO (divisible)
    11: 5_000_000,
    10: 1_000_000,
    9: 500_000,
    3: 100_000,
    2: 50_000,
    1: 25_000,
    0: 25_000,
}

DOBLE_CHANCE_PRIZES = {
    15: 100_000_000,  # POZO (divisible)
    14: 5_000_000,
    13: 1_000_000,
    12: 500_000,
}

TICKET_COST = 5_000  # Gs. per cartón — placeholder
NUM_CARTONES = 10    # cartones bought per drawing
NUM_DRAWINGS = 1_000

times_won = {}
total_spent = 0
earnings = 0


def draw_balls(n):
    """Draw n distinct balls from the 01–25 pool."""
    return random.sample(range(1, POOL_SIZE + 1), n)


def make_carton():
    """A cartón: CARTON_SERIES independent series of distinct 01–25 numbers."""
    return [random.sample(range(1, POOL_SIZE + 1), SERIES_SIZE)
            for _ in range(CARTON_SERIES)]


def count_hits(series, balls):
    return sum(1 for n in series if n in balls)


def score_series(hits, prize_table):
    """Return the payout for one series. Only the highest tier pays,
    which for a single series is simply its entry in the table."""
    return prize_table.get(hits, 0)


def calc_win_amt(my_series, winning_balls, prize_table):
    """Score one series against the drawn balls."""
    return score_series(count_hits(my_series, winning_balls), prize_table)


def record(tier):
    times_won[tier] = times_won.get(tier, 0) + 1


def run_simulation():
    global total_spent, earnings

    for _ in range(NUM_DRAWINGS):
        total_spent += TICKET_COST * NUM_CARTONES

        # GRANDIOSO — 12 balls, especie prizes
        balls_g = draw_balls(12)
        # PODEROSO — 12 balls, cash prizes
        balls_p = draw_balls(12)
        # DOBLE CHANCE — 15 balls, cash prizes
        balls_d = draw_balls(15)

        for _ in range(NUM_CARTONES):
            carton = make_carton()

            for series in carton:
                # GRANDIOSO
                amt = calc_win_amt(series, balls_g, GRANDIOSO_PRIZES)
                if amt:
                    earnings += amt
                    record(f"grandioso:{count_hits(series, balls_g)} hits")
                # PODEROSO
                hits = count_hits(series, balls_p)
                amt = calc_win_amt(series, balls_p, PODEROSO_PRIZES)
                if amt:
                    earnings += amt
                    record(f"poderoso:{hits} hits")
                # DOBLE CHANCE — each column scored independently
                hits = count_hits(series, balls_d)
                amt = calc_win_amt(series, balls_d, DOBLE_CHANCE_PRIZES)
                if amt:
                    earnings += amt
                    record(f"doble_chance:{hits} hits")

    print(f"Drawings: {NUM_DRAWINGS} x {NUM_CARTONES} cartones")
    print(f"Spent: ₲{total_spent}")
    print(f"Earnings: ₲{earnings}")
    print(f"Net: ₲{earnings - total_spent}")
    print(json.dumps(times_won, indent=2))


if __name__ == "__main__":
    run_simulation()
