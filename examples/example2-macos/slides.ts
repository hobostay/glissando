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

export default function build() {
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

  deck.quote({
    quote: "Typography is the craft of endowing human language with a durable visual form.",
    attribution: "Robert Bringhurst",
  });

  deck.title({
    title: "Thank You",
  });

  return deck;
}
