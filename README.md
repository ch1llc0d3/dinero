# dinero

Lottery probability simulations — how much money do you actually make (or lose) playing?

**🌐 Live demo:** the repo ships with an interactive landing page hosted on GitHub Pages — [ch1llc0d3.github.io/dinero](https://ch1llc0d3.github.io/dinero/)

## What's in this repo

| File | What it is |
|---|---|
| `index.html` + `css/` + `js/` | Interactive landing page (EN/ES, dark/light theme) describing the project and linking each simulation's source |
| `powerball.py` | US Powerball simulation (implemented) |
| `telebingo.py` | Telebingo de Canal 9 (Paraguay) simulation (implemented) |
| `senete.py` | Seneté (Paraguay) simulation — scaffold, rules pending |
| `binguito.py` | Deprecated — superseded by `telebingo.py` and `senete.py` |

## Simulations

### `powerball.py` — US Powerball 🇺🇸

- 5 white balls (1–69) + 1 red Powerball (1–26), $2/ticket
- Buys 100 tickets per drawing, 2 drawings/week (156/year)
- Runs until the jackpot ($2B modeled) is hit, then reports spent vs. earnings and a win-tier breakdown

Run:

```bash
python3 powerball.py
```

### `telebingo.py` — Telebingo de Canal 9 (Paraguay) 🇵🇾

Implemented from the official reglamento (GAMBLING S.A. — Conajzar Resolución 51/2019, Decreto 3068/2019):

- Each cartón has 3+ series of numbers 01–25
- Three game modes: **GRANDIOSO** (12 balls), **PODEROSO** (12 balls), **DOBLE CHANCE** (15 balls, two independently scored columns)
- Prize amounts aren't published in the reglamento — they're configurable at the top of the file (defaults are placeholders)

Run:

```bash
python3 telebingo.py
```

### `senete.py` — Seneté (Paraguay) 🇵🇾 — scaffold

Seneté is a separate game (the animal lottery) with its own rules, which aren't in the Telebingo reglamento. This file is a placeholder that will mirror `telebingo.py` once the real rules arrive.

### `binguito.py` — deprecated

The original scaffold. When the rules arrived, they turned out to be Telebingo's — the work was split into `telebingo.py` and `senete.py`. Kept only for history.

## License

See [LICENSE](LICENSE).
