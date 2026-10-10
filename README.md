# dinero

Lottery probability simulations — how much money do you actually make (or lose) playing?

## Simulations

### `powerball.py` — US Powerball

- 5 white balls (1–69) + 1 red Powerball (1–26), $2/ticket
- Buys 100 tickets per drawing, 2 drawings/week (156/year)
- Runs until the jackpot ($2B modeled) is hit, then reports spent vs. earnings and a win-tier breakdown

Run:

```bash
python3 powerball.py
```

### `binguito.py` — Paraguayan Binguito (scaffold)

Placeholder for a Paraguayan Binguito simulation. Waiting on the actual game rules
(ball pools, prize table, ticket cost, drawing frequency) before implementing.
