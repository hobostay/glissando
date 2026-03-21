/**
 * Template 1 — Claude Documentation Style
 *
 * Showcases every available layout. Copy this file to start a new deck.
 *
 * Build:  ./build.sh templates/template1-claude-doc-style
 *
 * Available layouts:
 *   deck.title({ title, subtitle })
 *   deck.section({ title, subtitle })
 *   deck.content({ title, subtitle?, bullets })
 *   deck.twoColumn({ title, leftTitle?, rightTitle?, left, right })
 *   deck.code({ title, code, language? })
 *   deck.quote({ quote, attribution? })
 *   deck.image({ title, imagePath, caption? })
 *   deck.table({ title, headers, rows })
 *   deck.blank({ bg?: "primary" | "dark" | "accent" })
 */

import { Deck } from "../../src/index.js";
import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
// Font presets — uncomment one:
// import { macosNative as preset } from "../../src/themes/claude-doc/presets.js";   // Avenir Next + Iowan Old Style (macOS)
// import { googleFonts as preset } from "../../src/themes/claude-doc/presets.js";   // Space Grotesk + Libre Baskerville
// import { defaultPreset as preset } from "../../src/themes/claude-doc/presets.js"; // DM Serif Display + Inter

export default function build() {
  // To use a preset: new Deck(applyPreset(claudeDoc, preset))
  const deck = new Deck(claudeDoc);

  // 1. Title slide — dark bg, accent bar, large heading
  deck.title({
    title: "Presentation Title",
    subtitle: "Your Name  ·  Date  ·  Audience",
  });

  // 2. Section divider — warm off-white bg
  deck.section({
    title: "Section One",
    subtitle: "An overview of the first topic",
  });

  // 3. Content slide — heading + bullets
  deck.content({
    title: "Key Points",
    bullets: [
      "First important point with supporting detail",
      "Second point — keep bullets concise",
      "Third point that wraps to a second line when the text is longer",
      "Fourth point for completeness",
    ],
  });

  // 4. Content slide with subtitle
  deck.content({
    title: "With Subtitle",
    subtitle: "Additional context below the heading",
    bullets: [
      "Subtitles appear in muted text between the title and bullets",
      "Useful for dates, categories, or caveats",
    ],
  });

  // 5. Two-column slide
  deck.twoColumn({
    title: "Comparison",
    leftTitle: "Approach A",
    left: [
      "Simple to implement",
      "Lower maintenance cost",
      "Well-documented",
    ],
    rightTitle: "Approach B",
    right: [
      "Better performance",
      "More flexible long-term",
      "Requires migration",
    ],
  });

  // 6. Code slide
  deck.code({
    title: "Code Example",
    language: "python",
    code: [
      "from vibeslides import Deck",
      "from vibeslides.themes.claude_doc import theme",
      "",
      "deck = Deck(theme=theme)",
      'deck.title_slide("Hello World")',
      "deck.content_slide(",
      '    "Agenda",',
      '    bullets=["Item 1", "Item 2"],',
      ")",
      'deck.save("output.pptx")',
    ].join("\n"),
  });

  // 7. Table slide
  deck.table({
    title: "Feature Comparison",
    headers: ["Feature", "Status", "Notes"],
    rows: [
      ["PPTX export", "✓ Ready", "Native editable output"],
      ["Components", "✓ Ready", "Pre-designed, themed"],
      ["Layouts", "✓ Ready", "Pre-positioned"],
      ["Custom themes", "✓ Ready", "Config + components + layouts"],
    ],
  });

  // 8. Quote slide
  deck.quote({
    quote: "The best way to predict the future is to invent it.",
    attribution: "Alan Kay",
  });

  // 9. Closing title slide
  deck.title({
    title: "Thank You",
    subtitle: "Questions?",
  });

  return deck;
}
