/**
 * Example: Google Fonts Preset
 *
 * Libre Baskerville (headings) + Space Grotesk (body) — free, cross-platform.
 *
 * Install:  ./scripts/install-fonts.sh claude-doc google-fonts
 * Build:    ./build.sh examples/example2-google-fonts
 */

import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
import { googleFonts } from "../../src/themes/claude-doc/presets.js";

export default function build() {
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

  deck.table({
    title: "Font Pairing Details",
    headers: ["Role", "Font", "Weight", "Size"],
    rows: [
      ["Headings", "Libre Baskerville", "Bold", "32/26/22pt"],
      ["Body", "Space Grotesk", "400", "16pt"],
      ["Tables", "Libre Baskerville", "Regular", "14pt"],
      ["Captions", "Space Grotesk", "500", "13pt"],
      ["Code", "JetBrains Mono", "Regular", "13pt"],
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

  deck.quote({
    quote: "Typography is the craft of endowing human language with a durable visual form.",
    attribution: "Robert Bringhurst",
  });

  deck.title({
    title: "Thank You",
  });

  return deck;
}
