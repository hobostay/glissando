/**
 * Example: Preset Demo
 *
 * Demonstrates switching font presets.
 * Change the import below to try different typography.
 *
 * Build:  ./build.sh examples/example2-macos
 */

import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { macosNative } from "../../src/themes/claude-doc/presets.js";

export default async function build() {
  const deck = new Deck(applyPreset(claudeDoc, macosNative));

  deck.title({
    title: "macOS Native Fonts",
    subtitle: "Iowan Old Style (headings) + Avenir Next (body) + Menlo",
  });

  deck.content({
    title: "Typography Check",
    bullets: [
      "Headings use Iowan Old Style Bold (32/26/22pt)",
      "Body text uses Avenir Next Regular (16pt, line-height 1.6)",
      "Table content uses Iowan Old Style (14pt)",
      "Captions use Avenir Next Medium (13pt)",
      "Code uses Menlo (pre-installed on macOS)",
    ],
  });

  deck.code({
    title: "Code in Menlo",
    language: "python",
    code: [
      "def greet(name: str) -> str:",
      '    return f"Hello, {name}!"',
      "",
      'print(greet("world"))',
    ].join("\n"),
  });

  // --- Callout blocks showcase ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: h, accentBar: bar, calloutBlock: cb } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    h(slide, { text: "Callout Blocks", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    const colW = (contentW - 0.4) / 2;
    const rightX = sp.marginLeft + colW + 0.4;
    const row1Y = sp.marginTop + 1.2;
    const row2Y = row1Y + 2.2;

    // Row 1: Card (pencil) + Info (info circle)
    await cb(slide, {
      variant: "card", x: sp.marginLeft, y: row1Y, w: colW, h: 1.9,
      body: "Clean white panel with subtle border. Use for general content, summaries, or feature highlights.",
    });

    await cb(slide, {
      variant: "info", x: rightX, y: row1Y, w: colW, h: 1.9,
      body: "Blue-tinted callout for tips, notes, and helpful information that supplements the main content.",
    });

    // Row 2: Warning (triangle-alert) + Accent (circle-check)
    await cb(slide, {
      variant: "warning", x: sp.marginLeft, y: row2Y, w: colW, h: 1.9,
      body: "Amber callout for cautions, deprecation notices, or important caveats the reader should know.",
    });

    await cb(slide, {
      variant: "accent", x: rightX, y: row2Y, w: colW, h: 1.9,
      bullets: [
        "Terra cotta tinted panel",
        "Ties back to the brand accent #DA7756",
        "Use for key takeaways or featured items",
      ],
    });

    // Row 3: Code (lightbulb) — full width
    await cb(slide, {
      variant: "code", x: sp.marginLeft, y: row2Y + 2.2, w: contentW, h: 1.0,
      body: "Warm grey panel for inline code references, CLI instructions, or config snippets.",
    });
  }

  deck.quote({
    quote: "Typography is the craft of endowing human language with a durable visual form.",
    attribution: "Robert Bringhurst",
  });

  deck.title({
    title: "Thank You",
  });

  return deck;
}
