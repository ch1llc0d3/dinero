"""
DEPRECATED — the game rules arrived (Telebingo reglamento, GAMBLING S.A.).

Telebingo and Seneté are different games with different rules, so this
file is split into:
  - telebingo.py — Telebingo de Canal 9 (GRANDIOSO / PODEROSO / DOBLE CHANCE),
    implemented from JUEGO-RESPONSABLE_ludopatia.pdf
  - senete.py    — Seneté (animal lottery), scaffold pending its own rules
"""

import json

# Placeholder prize table — replace with real Binguito payouts.
times_won = {}

total_spent = 0
earnings = 0


def calc_win_amt(my_numbers, winning_numbers):
    """Score one ticket against the winning numbers. TODO: implement."""
    raise NotImplementedError("Waiting on Binguito game rules.")


def run_simulation():
    """Main loop. TODO: implement once rules are known."""
    raise NotImplementedError("Waiting on Binguito game rules.")


if __name__ == "__main__":
    run_simulation()

    print(f"Spent: ₲{total_spent}")
    print(f"Earnings: ₲{earnings}")
    print(json.dumps(times_won, indent=2))
