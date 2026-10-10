"""
Seneté (Paraguay) simulation — SCAFFOLD (rules pending).

Seneté is a separate game from Telebingo (different operator/game rules).
The Telebingo reglamento (JUEGO-RESPONSABLE_ludopatia.pdf) only mentions
that cartón buyers accept "las normas del juego Seneté" — it does NOT
contain the Seneté rules themselves.

TODO: fill in once the actual Seneté game rules are provided:
  - ball/animal pool size and numbering (Seneté is the animal-lottery game)
  - how many are drawn per sorteo
  - ticket cost (in Guaraníes)
  - full prize table
  - drawings per week / per year
  - any special rules

Once the rules are known, this will mirror telebingo.py's structure.
"""

import json

# Placeholder prize table — replace with real Seneté payouts.
times_won = {}

total_spent = 0
earnings = 0


def calc_win_amt(my_numbers, winning_numbers):
    """Score one ticket against the winning numbers. TODO: implement."""
    raise NotImplementedError("Waiting on Seneté game rules.")


def run_simulation():
    """Main loop. TODO: implement once rules are known."""
    raise NotImplementedError("Waiting on Seneté game rules.")


if __name__ == "__main__":
    run_simulation()

    print(f"Spent: ₲{total_spent}")
    print(f"Earnings: ₲{earnings}")
    print(json.dumps(times_won, indent=2))
