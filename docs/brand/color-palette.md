# Color palette — Macumba

Colours were sampled from rendered pages of both Macumba decks
(`pdftoppm` → ImageMagick histogram). The dominant fills are exact matches
for the slide backgrounds.

## Core

| Swatch | Token | Hex | RGB | Role |
|---|---|---|---|---|
| 🟦 | `--macumba-cobalt` | `#1A36B4` | 26 54 180 | **Primary**: hero, primary buttons, brand blocks, accent on light |
| 🩵 | `--macumba-periwinkle` | `#A4C2F4` | 164 194 244 | **Accent**: highlights, values, active states on dark |
| ⬜ | `--macumba-bone` | `#F5F4EB` | 245 244 235 | **Light surface** and text on dark |
| ⬛ | `--macumba-charcoal` | `#1D1D1D` | 29 29 29 | **Dark surface** and text on light |
| ◻️ | `--macumba-white` | `#FFFFFF` | 255 255 255 | Type on cobalt |

## Derived (tonal steps, not new hues)

| Token | Hex | Use |
|---|---|---|
| `--macumba-cobalt-deep` | `#12257D` | Primary hover / pressed on light |
| `--macumba-cobalt-bright` | `#2E4FD6` | Primary hover on dark |
| `--macumba-cobalt-night` | `#14204F` | Cobalt sunk into charcoal, for the dark backdrop |
| `--macumba-ash` | `#5E605D` | Muted text on bone |

## Functional (status only)

The decks have no status colours, so these are functional additions. Use them
only for win/loss and validity, never as decoration.

| Token | Hex | Theme |
|---|---|---|
| `--signal-green` | `#10B981` | Win / positive net, dark |
| `--signal-green-deep` | `#047857` | Win / positive net, light |
| `--signal-red` | `#FF6B6B` | Loss / error, dark |
| `--signal-red-deep` | `#B42318` | Loss / error, light |

## Contrast (WCAG 2.x, measured)

| Foreground on background | Ratio | Text AA (4.5) |
|---|---|---|
| White on Cobalt | 9.41 | ✅ |
| Bone on Cobalt | 8.53 | ✅ |
| Periwinkle on Cobalt | 5.20 | ✅ |
| Periwinkle on Charcoal | 9.31 | ✅ |
| Charcoal on Periwinkle | 9.31 | ✅ (active badge, dark) |
| Bone on Charcoal | 15.27 | ✅ |
| Cobalt on Bone | 8.53 | ✅ |
| Charcoal on Bone | 15.27 | ✅ |
| Ash on Bone | 5.75 | ✅ |
| White on Cobalt-bright | 6.55 | ✅ |
| White on Cobalt-deep | 13.24 | ✅ |
| Green on Charcoal | 6.65 | ✅ |
| Green-deep on Bone | 4.97 | ✅ |
| Red on Charcoal | 6.07 | ✅ |
| Red-deep on Bone | 5.96 | ✅ |
| **Periwinkle on Bone** | 1.64 | ❌ never as text |
| **Cobalt on Charcoal** | 1.79 | ❌ never as text (fills only) |

This is why `--accent` is periwinkle in the dark theme and cobalt in the
light theme. The *role* stays the same while the hex changes.

## Proportions

Follow the decks' balance on any screen:

- **~60%** surface (charcoal or bone, by theme)
- **~30%** cobalt (hero band, primary actions, glows)
- **~10%** periwinkle accent (values, active chips, focus)
- Status green/red only where a number is a win or a loss.
