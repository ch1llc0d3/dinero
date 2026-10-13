# dinero

Lottery probability simulations — how much money do you actually make (or lose) playing?

**🌐 Live demo:** the repo ships with an interactive landing page hosted on GitHub Pages — [ch1llc0d3.github.io/dinero](https://ch1llc0d3.github.io/dinero/)

## What's in this repo

| File | What it is |
|---|---|
| `index.html` + `css/` + `js/` | Interactive landing page (EN/ES, dark/light theme) describing the project and linking each simulation's source |
| `powerball.py` | US Powerball simulation (implemented) |
| `telebingo.py` | Telebingo de Canal 9 (Paraguay) simulation (implemented) |
| `senete.py` | Seneté (Paraguay) simulation — real 2026 rules |
| `binguito.py` | Telebingo Triple (Talismán S.A.) simulation — real 2026 rules |

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

### `senete.py` — Seneté (Paraguay) 🇵🇾 — real 2026 rules

Implemented from the official reglamento and published 2026 results (see `docs/senete-rules-2026.md`):

- Numbers 1–25 (no animals); cartones with two 12-number and two 15-number grids
- Four jugadas per Sunday sorteo: GRANDIOSO, PODEROSO, DOBLE CHANCE and cartones al azar
- Progressive pozos and a ₲2M zero-hits consolation; 8% IRP on prizes ≥ ₲500.000

Run:

```bash
python3 senete.py
```

### `binguito.py` — Telebingo Triple (Paraguay) 🇵🇾 — real 2026 rules

"Binguito" is the nickname of Armando Acosta, the popular presenter of **Telebingo Triple** (Talismán S.A., Decreto 934/2023) — a different game from the GAMBLING S.A. Telebingo above. Implemented from the official reglamento del sorteo del 18-10-2026 (see `docs/telebingo-triple-rules-2026.md`):

- Numbers 1–25; cartones (₲10.000) with four scoring grids — 12, 13, 15 and 15 numbers
- Four cantadas per Sunday sorteo: 1RA (12 balls, pozo ₲900M), 2DA (13 balls, ₲650M), 3RA (15 balls, ₲500M + vehicle) and the REVENTÓN "sale o sale" (15 balls, ₲250M to the best scorers)
- El Dúo: one cartón number wins ₲10M; its last two digits pay ₲50K to every matching cartón
- 8% IRP withholding on cash prizes ≥ ₲500.000

Run:

```bash
python3 binguito.py
```

## License

See [LICENSE](LICENSE).
