# VibeSlides

Component-based slide decks for coding agents. Write TypeScript, get native editable PPTX.

## Quick Start

```bash
npm install
./build.sh examples/mimic-claude-macos           # → output.pptx
./build.sh examples/ai-tooling-tutorial           # → output.pptx
```

## Architecture

**Theme = Config + Components + Layouts**

- **Config** (`config.ts`): colors, fonts, sizes, spacing, code style
- **Components** (`components.ts`): pre-designed visual elements (code block, bullet list, callout block, accent bar, quote box, table, etc.) — all themed
- **Layouts** (`layouts.ts`): pre-designed slide arrangements that compose components at fixed positions

The agent only provides **content**. All positioning, colors, and fonts are handled by the theme.

## Creating a New Deck

1. Create a folder under `examples/` (or anywhere)
2. Add `slides.ts` — import Deck and a theme, call layout methods, return the deck
3. Run `./build.sh <your-folder>`

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);
  deck.title({ title: "My Talk", subtitle: "Author" });
  deck.content({ title: "Agenda", bullets: ["One", "Two", "Three"] });
  deck.title({ title: "Thank You" });
  return deck;
}
```

### Using a Font Preset

```ts
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";
// or: import { googleFonts } from "../../src/themes/claude-doc/presets.js";

export default function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));
  // ...
}
```

## File Structure

```
src/
  index.ts                  Deck class (public API)
  types.ts                  TypeScript types for Theme, Components, Layouts
  highlight.ts              Syntax highlighter (per-language keyword coloring)
  icons.ts                  Lucide icon renderer (SVG → PNG via sharp)
  themes/
    claude-doc/
      index.ts              Theme object + applyPreset helper
      config.ts             Colors, fonts, sizes, spacing, code style
      components.ts         Pre-designed components (factory)
      layouts.ts            Pre-designed slide layouts
      presets.ts            Font presets (default, macosNative, googleFonts)
      fonts/                Font files + install instructions
examples/
  ai-tooling-tutorial/      Real-world deck (default preset)
  mimic-claude-macos/       macOS native fonts (Iowan Old Style + Avenir Next)
  mimic-claude-google-fonts/  Google Fonts (Libre Baskerville + Space Grotesk)
build.sh                    Universal build: ./build.sh <path>
runner.ts                   Build runner (called by build.sh)
scripts/
  install-fonts.sh          Font installer (macOS/Linux)
  install-fonts.ps1         Font installer (Windows)
```

## Font Presets

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `macosNative` | Iowan Old Style | Avenir Next | Menlo | No install needed |
| `googleFonts` | Libre Baskerville | Space Grotesk | JetBrains Mono | `./scripts/install-fonts.sh claude-doc google-fonts` |

## Available Layouts

| Method | Description |
|---|---|
| `deck.title({ title, subtitle? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Two-column comparison |
| `deck.code({ title, code, language? })` | Heading + code panel (syntax highlighted) |
| `deck.quote({ quote, attribution? })` | Large quote on accent bg |
| `deck.image({ title, imagePath, caption? })` | Heading + image |
| `deck.table({ title, headers, rows })` | Heading + themed table |
| `deck.blank({ bg? })` | Empty slide (returns raw pptxgenjs slide) |

## Available Components

Components can be used directly for custom slides via `deck.components`:

- `accentBar(slide, { x, y, w?, h? })` — thin brand-colored bar
- `heading(slide, { text, x, y, w })` — bold heading text
- `bodyText(slide, { text, x, y, w, h? })` — paragraph text
- `bulletList(slide, { items, x, y, w, h? })` — accent-colored bullets
- `numberedList(slide, { items, x, y, w, h? })` — accent-colored numbers
- `codeBlock(slide, { code, x, y, w, h?, language? })` — code panel with syntax highlighting, auto-height
- `quoteBox(slide, { quote, x, y, w, h, attribution? })` — serif quote with accent bar
- `table(slide, { headers, rows, x, y, w })` — themed table
- `caption(slide, { text, x, y, w })` — small muted text
- `calloutBlock(slide, { variant, x, y, w, h?, body?, bullets? })` — round-cornered callout panel (async)

## Callout Block Variants

| Variant | Background | Icon | Use for |
|---|---|---|---|
| `card` | White `#FFFFFF` | Pencil | General content, summaries |
| `code` | Warm grey `#F5F3EF` | Lightbulb | Code refs, CLI instructions |
| `info` | Blue tint `#EEF1FA` | Info circle | Tips, notes, helpful info |
| `warning` | Amber `#FDF5EB` | Triangle alert | Cautions, deprecation notices |
| `accent` | Terra cotta `#FAF0EB` | Circle check | Key takeaways, featured items |

## Adding a New Theme

Create a folder in `src/themes/` with `config.ts`, `components.ts`, `layouts.ts`, and `index.ts`. See `claude-doc/` for the full pattern.

## Advanced: Custom Slides

Use `deck.blank()` + `deck.components` for freeform placement:

```ts
const slide = deck.blank({ bg: "primary" });
const { heading, codeBlock, calloutBlock } = deck.components;
heading(slide, { text: "Custom Layout", x: 0.8, y: 0.5, w: 11 });
codeBlock(slide, { code: "print('hi')", x: 0.8, y: 1.5, w: 5, language: "python" });
await calloutBlock(slide, { variant: "info", x: 6.5, y: 1.5, w: 5, body: "Note here" });
```
