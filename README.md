<p align="center">
  <img src="assets/badge.png" alt="Glissando" width="500">
</p>

<p align="center">
  <strong>Slide decks as code, built for AI agents.</strong><br>
  Write TypeScript, get native editable PPTX.
</p>

<p align="center">
  <a href="https://github.com/concertoy/glissando/releases"><img src="https://img.shields.io/github/v/release/concertoy/glissando?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="https://discord.gg/TODO"><img src="https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

Agents provide **content only** — themes handle all positioning, colors, and fonts.

## Setup

```bash
npm install
```

## Build a deck

```bash
./build.sh examples/mimic-claude-macos        # → output.pptx
./build.sh examples/ai-tooling-tutorial        # → output.pptx
./build.sh <your-folder> --output slides.pptx  # custom output path
```

## How it works

A deck is a TypeScript file that calls layout methods:

```ts
import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default async function build() {
  const deck = new Deck(claudeDoc);

  deck.title({ title: "My Talk", subtitle: "Author" });
  deck.content({ title: "Agenda", bullets: ["One", "Two", "Three"] });
  deck.code({ title: "Example", code: "print('hello')", language: "python" });

  await deck.equation({
    title: "Key Formulas",
    equations: [{ latex: "E = mc^2", label: "Mass-energy equivalence" }],
  });

  deck.title({ title: "Thank You" });
  return deck;
}
```

Layouts: `title`, `section`, `content`, `twoColumn`, `code`, `quote`, `image`, `table`, `equation`, `blank`.

For custom slides, use `deck.blank()` + `deck.components` to place elements freely.

## Using with a coding agent

Point your agent at this repo and give it a prompt like:

> Create a new folder `examples/my-deck/slides.ts`. Using the Glissando framework (see `CLAUDE.md` for the full API reference), build a 10-slide deck about [your topic]. Use the `claudeDoc` theme. Include a title slide, content slides with bullets, a code example, an equation, and a closing slide. Then run `./build.sh examples/my-deck` to generate the PPTX.

The agent only needs to write one file (`slides.ts`). The theme handles all visual design. See `CLAUDE.md` for the complete list of layouts, components, callout variants, connectors, and font presets.

## Font presets

```ts
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

const deck = new Deck(applyPreset(claudeDoc, macosNative));
```

| Preset | Headings | Body | Code | Install |
|---|---|---|---|---|
| `default` | DM Serif Display | Inter | JetBrains Mono | `./scripts/install-fonts.sh` |
| `macosNative` | Iowan Old Style | Avenir Next | Menlo | Pre-installed on macOS |
| `googleFonts` | Libre Baskerville | Space Grotesk | JetBrains Mono | `./scripts/install-fonts.sh claude-doc google-fonts` |

## Tests

```bash
npm test          # builds all example decks, asserts output.pptx is produced
npx tsc --noEmit  # type-check
```

## Release

See [Releases](https://github.com/concertoy/glissando/releases) for changelogs and pre-built artifacts.

## Community

Questions, ideas, or show off your decks — join the [Discord](https://discord.gg/TODO).

## License

[MIT](LICENSE)
