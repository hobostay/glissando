/**
 * Example: Preset Demo
 *
 * Demonstrates switching font presets.
 * Change the import below to try different typography.
 *
 * Build:  ./build.sh examples/mimic-claude-macos
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

  // --- Diagram: Coding Assistant Architecture ---
  {
    const slide = deck.blank({ bg: "primary" });
    const { heading: hd, accentBar: bar, diagramBox: box, container: ctr, bodyText: bt } = deck.components;
    const sp = deck.config.spacing;
    const contentW = sp.slideWidth - sp.marginLeft - sp.marginRight;

    hd(slide, { text: "How a Coding Assistant Works", x: sp.marginLeft, y: sp.marginTop, w: contentW });
    bar(slide, { x: sp.marginLeft, y: sp.marginTop + 0.8, w: 1.5 });

    // ---- Create shapes (all return ShapeRef with connection points) ----

    bt(slide, { text: "Task", x: 0.5, y: 2.15, w: 2.8, italic: true, color: "3B3B39" });
    const task = box(slide, {
      text: "Got an error.\nFind and fix the issue.",
      x: 0.5, y: 2.5, w: 2.8, h: 2.4,
      fill: "FFFFFF", border: "B8B8B8", fontSize: 14, bold: false,
    });

    ctr(slide, { label: "Assistant", x: 4.2, y: 1.8, w: 8.5, h: 5.0, fill: "F9F9F7", border: "B8B8B8" });

    const lm = box(slide, {
      text: "Language\nModel",
      x: 4.7, y: 3.0, w: 2.2, h: 1.6,
      fill: "FFFFFF", border: "DA7756", borderWidth: 2, fontSize: 20,
    });

    const tools = box(slide, {
      text: "Set of\ntools",
      x: 4.7, y: 5.2, w: 2.2, h: 1.2,
      fill: "FFFFFF", border: "D4C9A0", borderWidth: 1.5, fontSize: 18,
    });

    const gc = box(slide, {
      text: "Gather context",
      x: 7.8, y: 2.3, w: 3.2, h: 0.9,
      fill: "E8DFC4", border: "D4C9A0", fontSize: 18, textColor: "0D0D0D",
    });

    const fp = box(slide, {
      text: "Formulate a plan",
      x: 7.8, y: 3.7, w: 3.2, h: 0.9,
      fill: "D4956C", border: "C07A50", fontSize: 18, textColor: "FFFFFF",
    });

    const ta = box(slide, {
      text: "Take an action",
      x: 7.8, y: 5.1, w: 3.2, h: 0.9,
      fill: "B8613D", border: "9A4E30", fontSize: 18, textColor: "FFFFFF",
    });

    // ---- Connectors (all native OOXML — move with shapes) ----
    const ac = "999999";

    // Task → LM
    deck.connector({ from: task.right, to: lm.left, color: ac });

    // LM → GC / FP / TA (3 elbow connectors — all bend at the same X, forming a trident)
    deck.connector({ from: lm.right, to: gc.left,  color: ac, type: "elbow" });
    deck.connector({ from: lm.right, to: fp.left,  color: ac, type: "elbow" });
    deck.connector({ from: lm.right, to: ta.left,  color: ac, type: "elbow" });

    // GC → FP → TA vertical chain
    deck.connector({ from: gc.bottom, to: fp.top, color: ac });
    deck.connector({ from: fp.bottom, to: ta.top, color: ac });

    // LM ↔ Tools (bidirectional)
    deck.connector({ from: lm.bottom, to: tools.top, color: ac, head: "arrow", tail: "arrow" });

    // Iterate arc: TA → GC (curved connector with label)
    deck.connector({
      from: ta.right, to: gc.right,
      type: "curved", color: ac,
      label: "Iterate",
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
