"""
Powerball (USA) lottery simulation — interactive edition.

Rules modeled:
- 5 white balls drawn from 1-69, 1 red Powerball from 1-26.
- Configurable ticket price (default $2).
- Jackpot modeled at $2,000,000,000 (lump-sum approximation).

You choose how many tickets to buy per drawing (drawings happen twice a
week, 156/year) and the ticket cost. The sim then runs with a live
timeline showing years passing, money "invested" (spent), earnings, and
net profit/loss — until the jackpot is hit (or you Ctrl+C to cash out).
"""

import random
import shutil
import sys
import time

white_possibles = list(range(1, 70))
red_possibles = list(range(1, 27))

DRAWINGS_PER_YEAR = 156  # twice a week


def ask(prompt, default, cast=str, minimum=None):
    """Prompt the user, falling back to `default` on empty/invalid input."""
    while True:
        raw = input(f"{prompt} [{default}]: ").strip()
        if raw == "":
            return default
        try:
            value = cast(raw)
            if minimum is not None and value < minimum:
                print(f"  Must be at least {minimum}, try again.")
                continue
            return value
        except ValueError:
            print("  Invalid value, try again.")


def money(n):
    return f"${n:,.0f}"


def calc_win_amt(my_numbers, winning_numbers, times_won, jackpot):
    """Return (win_amt, is_jackpot) for one ticket."""
    win_amt = 0
    is_jackpot = False

    white_matches = len(my_numbers["whites"].intersection(winning_numbers["whites"]))
    power_match = my_numbers["red"] == winning_numbers["red"]

    if white_matches == 5:
        if power_match:
            win_amt = jackpot
            is_jackpot = True
            times_won["5+P"] += 1
        else:
            win_amt = 1_000_000
            times_won["5"] += 1
    elif white_matches == 4:
        if power_match:
            win_amt = 50_000
            times_won["4+P"] += 1
        else:
            win_amt = 100
            times_won["4"] += 1
    elif white_matches == 3:
        if power_match:
            win_amt = 100
            times_won["3+P"] += 1
        else:
            win_amt = 7
            times_won["3"] += 1
    elif white_matches == 2 and power_match:
        win_amt = 7
        times_won["2+P"] += 1
    elif white_matches == 1 and power_match:
        win_amt = 4
        times_won["1+P"] += 1
    elif power_match:
        win_amt = 4
        times_won["P"] += 1
    else:
        times_won["0"] += 1

    return win_amt, is_jackpot


def run_simulation(tickets_per_drawing, ticket_cost, jackpot, live=True):
    """Run the sim until the jackpot is hit. Returns a summary dict."""
    times_won = {
        "5+P": 0, "5": 0, "4+P": 0, "4": 0, "3+P": 0, "3": 0,
        "2+P": 0, "1+P": 0, "P": 0, "0": 0,
    }

    total_spent = 0
    earnings = 0
    best_win = 0
    drawings = 0
    hit_jp = False

    try:
        while True:
            drawings += 1
            winning_numbers = {
                "whites": set(random.sample(white_possibles, k=5)),
                "red": random.choice(red_possibles),
            }

            for _ in range(tickets_per_drawing):
                total_spent += ticket_cost
                my_numbers = {
                    "whites": set(random.sample(white_possibles, k=5)),
                    "red": random.choice(red_possibles),
                }

                win_amt, is_jackpot = calc_win_amt(my_numbers, winning_numbers, times_won, jackpot)
                earnings += win_amt
                best_win = max(best_win, win_amt)

                if is_jackpot:
                    hit_jp = True
                    break

            years = drawings / DRAWINGS_PER_YEAR

            if live and sys.stdout.isatty():
                # Live timeline line, updated in place (fits ~80 cols).
                line = (
                    f"\r⏳ {years:6.1f}y | d {drawings:>6,} | "
                    f"spent {money(total_spent):>11} | "
                    f"won {money(earnings):>11} | "
                    f"net {money(earnings - total_spent):>11}"
                )
                sys.stdout.write(line[: shutil.get_terminal_size().columns - 1])
                sys.stdout.flush()
                time.sleep(0.002)  # keep the timeline watchable
            elif drawings % DRAWINGS_PER_YEAR == 0:
                # Piped/redirected output: one line per simulated year.
                print(
                    f"⏳ {years:6.1f} yrs | drawings: {drawings:>7,} | "
                    f"invested: {money(total_spent):>16} | "
                    f"earnings: {money(earnings):>16} | "
                    f"net: {money(earnings - total_spent):>16}"
                )

            if hit_jp:
                break
    except KeyboardInterrupt:
        print("\n\n🛑 Stopped early — cashing out with what you have.")

    return {
        "drawings": drawings,
        "years": drawings / DRAWINGS_PER_YEAR,
        "total_spent": total_spent,
        "earnings": earnings,
        "best_win": best_win,
        "hit_jackpot": hit_jp,
        "times_won": times_won,
    }


def print_summary(result, tickets_per_drawing, ticket_cost):
    print()
    print("=" * 60)
    if result["hit_jackpot"]:
        print("🎉 JACKPOT HIT! 🎉")
    else:
        print("Simulation ended early (Ctrl+C).")
    print("=" * 60)
    print(f"Tickets per drawing : {tickets_per_drawing:,}")
    print(f"Ticket cost         : {money(ticket_cost)}")
    print(f"Drawings played     : {result['drawings']:,}")
    print(f"Time playing        : {result['years']:.1f} years")
    print(f"Total invested      : {money(result['total_spent'])}")
    print(f"Total earnings      : {money(result['earnings'])}")
    net = result["earnings"] - result["total_spent"]
    verdict = "PROFIT" if net >= 0 else "LOSS"
    print(f"Net result          : {money(net)}  ({verdict})")
    print(f"Best single win     : {money(result['best_win'])}")
    print()
    print("Wins breakdown:")
    for tier, count in result["times_won"].items():
        if count:
            print(f"  {tier:>3}: {count:,}")
    print("=" * 60)


def main():
    print("=" * 60)
    print("  POWERBALL SIMULATOR — how long until you win?")
    print("=" * 60)
    print("Drawings happen twice a week (156/year).")
    print("Press Ctrl+C at any time to stop and see your results.\n")

    tickets_per_drawing = ask("Tickets per drawing", 100, cast=int, minimum=1)
    ticket_cost = ask("Cost per ticket ($)", 2, cast=float, minimum=0.01)
    jackpot = ask("Jackpot amount ($)", 2_000_000_000, cast=float, minimum=1_000_000)

    print(f"\nBuying {tickets_per_drawing:,} tickets per drawing at "
          f"{money(ticket_cost)} each — that's "
          f"{money(tickets_per_drawing * ticket_cost)} per drawing, "
          f"{money(tickets_per_drawing * ticket_cost * DRAWINGS_PER_YEAR)} per year.\n")

    result = run_simulation(tickets_per_drawing, ticket_cost, jackpot)
    print()  # newline after the live timeline line
    print_summary(result, tickets_per_drawing, ticket_cost)


if __name__ == "__main__":
    main()
