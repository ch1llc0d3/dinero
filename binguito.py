"""
Paraguayan Binguito simulation — SCAFFOLD (rules pending).

TODO: fill in once the actual game rules are provided:
  - ball pool size(s) and ranges
  - how many balls are drawn per game
  - ticket cost (in Guaraníes or USD)
  - full prize table (match -> payout)
  - drawings per week / per year
  - any special rules (extra balls, progressive jackpot, etc.)

Once the rules are known, this will mirror powerball.py's structure:
  1. Draw the winning numbers.
  2. Buy N tickets per drawing.
  3. Score each ticket against the prize table.
  4. Track total spent vs. total earnings until a target (e.g. top prize) is hit.
  5. Report spent, earnings, and a breakdown of wins by prize tier.
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
