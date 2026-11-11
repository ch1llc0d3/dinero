# System Design Dinero

The web UI uses a **glassmorphism** style — translucent frosted-glass cards,
soft background blurs and glowing borders — over an esoteric, data-driven
backdrop (crimson + gold glows, faint "zodiac wheel" rings and a data-grid
dot pattern). All styling lives in [`css/style.css`](../css/style.css).

## Palette

| Role | Name | Hex | Used for |
|---|---|---|---|
| Primary | Mystic Crimson | `#8B0000` | Branding, backdrop, primary buttons (▶ Start) |
| Secondary | Lucky Gold | `#FFD700` | Wins, badges, highlights, CTA pill, Cash out, glowing borders |
| Accent / Action | Algorithmic Blue | `#1E3A8A` | Links, focus rings, active states |
| Background (Light) | Parchment Cream | `#FDFBF7` | Light-theme base |
| Background (Dark) | Terminal Dark | `#0F172A` | Dark-theme base |
| Success / Win | Vibrant Emerald | `#10B981` | Positive net, wins, money-rain bills |

## Token layers

1. **Brand tokens** (`--mystic-crimson`, `--lucky-gold`, …) — the six hex
   codes above, identical in both themes.
2. **Semantic tokens** (`--text`, `--accent`, `--link`, `--success`,
   `--danger`, `--glass*`, `--backdrop-*`) — redefined per
   `[data-theme]`. Components only use these.

Where a raw brand colour fails WCAG AA as *text* on a theme's background,
the semantic token uses a tint of it instead:

| Token | Dark theme | Light theme |
|---|---|---|
| `--accent` (gold text) | `#FFD700` | `#8A6A00` (darkened gold) |
| `--link` | `#8FA8F0` (lightened blue) | `#1E3A8A` |
| `--success` | `#10B981` | `#047857` (darkened emerald) |
| `--danger` | `#FF6B6B` (lightened crimson) | `#8B0000` |

The raw brand colours are still used for fills, borders and glows.

## Glass surfaces

- **Top-level panels** (`.card`, `.sim`, `.run`, controls): `--glass`
  background + `backdrop-filter: blur(18px) saturate(140%)`, a translucent
  border, an inset top highlight and a soft drop shadow. Cards gain a gold
  glow on hover.
- **Nested panels** (facts, stats, verdicts, inputs, chips, balls): a tinted
  `--glass-inset` fill *without* their own blur — the parent already frosts
  the backdrop, and nested `backdrop-filter`s are expensive.
- Browsers without `backdrop-filter` fall back to a more opaque surface via
  `@supports not (...)`.
