# Design system — Macumba

How the [Macumba brand](brand/README.md) becomes code. Frosted-glass
surfaces sit over a cobalt/charcoal backdrop, the hero is a flat cobalt
"slide", and everything is set in Inter.

```
css/tokens.css   ← brand palette + semantic tokens (source of truth)
css/style.css    ← components; consumes semantic tokens only
```

`index.html` loads Inter (Google Fonts), then `tokens.css`, then
`style.css`.

## Token layers

1. **Brand** (`--macumba-*`, `--signal-*`, `--font-*`, `--radius-*`). Fixed
   hexes, identical in both themes. Documented in
   [brand/color-palette.md](brand/color-palette.md).
2. **Semantic** (`--bg`, `--text`, `--muted`, `--primary`, `--on-primary`,
   `--accent`, `--on-accent`, `--link`, `--focus`, `--focus-ring`,
   `--success`, `--danger`, `--glass*`, `--hero-*`, `--backdrop-*`).
   Redefined per `[data-theme]`. **Components use only these.**

`style.css` contains no raw colour values except white highlight
`rgba(255,255,255,…)` sheens. To add a colour, add a brand token, map it to a
semantic token in both themes, then use the semantic one.

### Theme mapping

| Semantic | Dark (default) | Light |
|---|---|---|
| `--bg` | Charcoal | Bone |
| `--text` | Bone | Charcoal |
| `--muted` | Bone @ 68% | Ash `#5E605D` |
| `--primary` / hover | Cobalt / Cobalt-bright | Cobalt / Cobalt-deep |
| `--accent` | Periwinkle | Cobalt (periwinkle fails on bone) |
| `--on-accent` | Charcoal | White |
| `--link` | Periwinkle | Cobalt |
| `--success` | `#10B981` | `#047857` |
| `--danger` | `#FF6B6B` | `#B42318` |
| `--hero-bg` | Cobalt | Cobalt |

The theme lives on `<html data-theme>`, toggled and persisted by `js/main.js`.

## Components

| Component | Treatment |
|---|---|
| **Hero** | Full-bleed flat `--hero-bg` (cobalt) in both themes, white ExtraBold title, Light tagline |
| **CTA** | Charcoal "handle pill" (white text); inverts to white/cobalt on hover |
| **Cards / sim panels** | `--glass` + `backdrop-filter: blur(18px)`; accent border and glow on hover |
| **Nested panels** (stats, inputs, chips, balls) | `--glass-inset`, no own blur; the parent already frosts |
| **Primary button** (▶ Start) | Flat `--primary`, `--on-primary` text |
| **Secondary button** (Cash out) | `--accent` outline; fills `--accent` with `--on-accent` text on hover |
| **Active switch / chip** | `--accent` fill, `--on-accent` text |
| **Focus** | `--focus` border + 3px `--focus-ring` |
| **Jackpot** | Heading flashes `--accent` with an `--accent-glow` shadow; money-rain bills turn cobalt and periwinkle |

## Glass rules

- Only top-level panels (`.card`, `.sim`, `.run`, controls) get
  `backdrop-filter`. Nested `backdrop-filter`s are expensive and add nothing.
- Browsers without `backdrop-filter` fall back to `--glass-strong`
  (light) or `--glass-fallback` (dark) via `@supports not (...)`.
- The fixed `body::before` backdrop gives the glass something to blur:
  cobalt glows, periwinkle "zodiac" rings, and a dot grid.

## Motion

The jackpot flash, sim-running glow and money rain respect
`prefers-reduced-motion` (money rain becomes a no-op).
