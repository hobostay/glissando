# VibeSlides

Component-based slide decks for coding agents. Write TypeScript, get native editable PPTX.

## Quick Start

```bash
npm install
./build.sh templates/template1-claude-doc-style    # → output.pptx
./build.sh examples/ai-tooling-tutorial            # → output.pptx
```

## Architecture

**Theme = Config + Components + Layouts**

- **Config** (`config.ts`): colors, fonts, sizes, spacing
- **Components** (`components.ts`): pre-designed visual elements (code block, bullet list, accent bar, quote box, table, etc.) — all themed
- **Layouts** (`layouts.ts`): pre-designed slide arrangements that compose components at fixed positions

The agent only provides **content**. All positioning, colors, and fonts are handled by the theme.

## Creating a New Deck

1. Create a folder anywhere (e.g., `examples/my-deck/`)
2. Add `slides.ts` — import Deck and a theme, call layout methods, return the deck
3. Run `./build.sh examples/my-deck`

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

## File Structure

```
src/
  index.ts                  Deck class (public API)
  types.ts                  TypeScript types for Theme, Components, Layouts
  themes/
    claude-doc/
      index.ts              Theme object (config + components + layouts)
      config.ts             Colors, fonts, sizes, spacing
      components.ts         Pre-designed components
      layouts.ts            Pre-designed slide layouts
templates/                  Reference templates (copy to start)
examples/                   Working examples
build.sh                    Universal build: ./build.sh <path>
runner.ts                   Build runner (called by build.sh)
```

## Available Layouts

| Method | Description |
|---|---|
| `deck.title({ title, subtitle? })` | Dark bg opening/closing slide |
| `deck.section({ title, subtitle? })` | Warm bg section divider |
| `deck.content({ title, subtitle?, bullets })` | Heading + bullet list |
| `deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })` | Two-column comparison |
| `deck.code({ title, code, language? })` | Heading + dark code panel |
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
- `codeBlock(slide, { code, x, y, w, h, language? })` — dark code panel
- `quoteBox(slide, { quote, x, y, w, h, attribution? })` — serif quote with accent bar
- `table(slide, { headers, rows, x, y, w })` — themed table
- `caption(slide, { text, x, y, w })` — small muted text

## Adding a New Theme

Create a folder in `src/themes/` with `config.ts`, `components.ts`, `layouts.ts`, and `index.ts`. See `claude-doc/` for the full pattern.

## Advanced: Custom Slides

Use `deck.blank()` + `deck.components` for freeform placement:

```ts
const slide = deck.blank({ bg: "primary" });
const { heading, codeBlock, bodyText } = deck.components;
heading(slide, { text: "Custom Layout", x: 0.8, y: 0.5, w: 11 });
codeBlock(slide, { code: "...", x: 0.8, y: 1.5, w: 5, h: 4 });
bodyText(slide, { text: "Notes here", x: 6.5, y: 1.5, w: 5 });
```
