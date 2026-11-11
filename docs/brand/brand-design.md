# Brand design — Macumba

## Idea

> *From witchcraft and the occult to data science and AI.*

People have always tried to predict the future, first with oracles, cards and
potions, now with models and data. dinero carries the same idea: lottery
"luck" taken apart with simulations. The brand should feel **confident, modern
and a little mystical**: a tech talk with a wink at the occult, never a casino.

## Personality

| We are | We are not |
|---|---|
| Curious, clear, evidence-first | Hype, "get rich" energy |
| Playful about the mystical | Spooky, gothic, horror |
| Bold, flat, editorial | Skeuomorphic, glossy casino gold |
| Bilingual (ES / EN) by default | English-only |

Voice: short declarative headlines and plain-language explanations. Questions
work well as section openers ("¿Algoritmo o Hechicería?"). Emojis are fine as
section markers (🔮 💻 📐), one per heading at most.

## The three surfaces

The decks rotate through three full-bleed slide colours. Each has a job:

| Surface | Hex | Job in the decks | Job in dinero |
|---|---|---|---|
| **Cobalt** | `#1A36B4` | Narrative and section slides, title slide | Hero band, primary buttons, brand blocks |
| **Bone** | `#F5F4EB` | Data-dense slides: tables, Venn diagrams, charts | Light theme base |
| **Charcoal** | `#1D1D1D` | Reflective moments: Ética, Conclusión, Gracias | Dark theme base (default) |

Rule: **one surface per block, flat.** No gradients between surfaces. Depth
comes from glass and shadow, not from colour blending.

## Typography

The decks are set entirely in **Inter** (Light, Regular, SemiBold, Bold,
ExtraBold), loaded from Google Fonts.

| Use | Weight | Notes |
|---|---|---|
| Display / H1 | 800 ExtraBold | `letter-spacing: -0.02em`, `line-height: 1.1`, two or three short lines |
| H2 / H3 | 800 | Same tracking. Sentence case, not ALL CAPS |
| Lead / tagline | 300 Light | Larger size, softer colour |
| Body | 400 | |
| Labels, chips, eyebrows | 600 SemiBold | Uppercase is fine at small sizes with `+0.06em` tracking |
| Numbers, code, stats | Mono (`--font-mono`) | Tabular figures for anything that ticks |

## Motifs

- **Handle pill**: a small charcoal pill with white text (the `ch1llc0d3`
  tag on the title slide). Used for the hero CTA.
- **Outline pills**: thin-bordered rounded chips (the deck footers). Used for
  preset chips and the language switch.
- **Periwinkle bullets**: on dark surfaces, key list items and highlighted
  values turn periwinkle (`#A4C2F4`). It is the only accent; don't add a second.
- **Collage imagery**: books, tarot, scientific engravings and tech logos cut
  out and placed on the flat surface. Use real-object imagery over abstract
  illustration.
- **Esoteric data backdrop**: faint concentric "zodiac" rings and a data-grid
  dot pattern behind the glass, in cobalt and periwinkle.

## Do / don't

- ✅ White or bone type on cobalt. ✅ Periwinkle accents on charcoal.
- ✅ Cobalt for the accent role on bone (periwinkle is only 1.6:1 there).
- ❌ Periwinkle text on bone. ❌ Cobalt text on charcoal (1.8:1).
- ❌ Gold, crimson or casino gradients. The old "System Design Dinero"
  crimson and gold theme is retired.
- ❌ Hard-coded hex values in component CSS. Use the tokens in
  [`css/tokens.css`](../../css/tokens.css).
