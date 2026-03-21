/**
 * Example: Google Fonts Preset
 *
 * Libre Baskerville (headings) + Space Grotesk (body) — free, cross-platform.
 *
 * Install:  ./scripts/install-fonts.sh claude-doc google-fonts
 * Build:    ./build.sh examples/mimic-claude-google-fonts
 */

import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { googleFonts } from "../../src/themes/claude-doc/presets.js";

export default async function build() {
  const deck = new Deck(applyPreset(claudeDoc, googleFonts));

  deck.title({
    title: "Google Fonts Preset",
    subtitle: "Libre Baskerville (headings) + Space Grotesk (body) + JetBrains Mono",
  });

  deck.content({
    title: "Typography Check",
    bullets: [
      "Headings use Libre Baskerville Bold (32/26/22pt)",
      "Body text uses Space Grotesk 400 (16pt, line-height 1.6)",
      "Table content uses Libre Baskerville Regular (14pt)",
      "Captions use Space Grotesk 500 (13pt)",
      "Code uses JetBrains Mono (auto-downloaded)",
    ],
  });

  deck.code({
    title: "Code in JetBrains Mono",
    language: "typescript",
    code: [
      'import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";',
      'import { googleFonts } from "../../src/themes/claude-doc/presets.js";',
      "",
      "const deck = new Deck(applyPreset(claudeDoc, googleFonts));",
      'deck.title({ title: "Hello" });',
      'await deck.save("output.pptx");',
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
