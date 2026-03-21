/**
 * Example: AI Tooling Tutorial
 *
 * A real-world deck built with the Claude doc theme.
 *
 * Build:  ./build.sh examples/ai-tooling-tutorial
 */

import { Deck } from "../../src/index.js";
import { claudeDoc } from "../../src/themes/claude-doc/index.js";

export default function build() {
  const deck = new Deck(claudeDoc);

  deck.title({
    title: "Building with AI Tools",
    subtitle: "A practical guide to modern AI-assisted development",
  });

  deck.section({
    title: "Why AI Tooling?",
    subtitle: "The shift from manual to AI-augmented workflows",
  });

  deck.content({
    title: "The Landscape",
    bullets: [
      "Code generation — from autocomplete to full-function synthesis",
      "Code review — automated bug detection and style enforcement",
      "Documentation — generate and maintain docs from source",
      "Testing — AI-written test cases from specifications",
    ],
  });

  deck.twoColumn({
    title: "Before vs. After",
    leftTitle: "Traditional",
    left: [
      "Write every line manually",
      "Search Stack Overflow",
      "Copy-paste boilerplate",
      "Manual code review cycles",
    ],
    rightTitle: "AI-Augmented",
    right: [
      "Describe intent, refine output",
      "Ask the model in-context",
      "Generate from spec",
      "Instant automated feedback",
    ],
  });

  deck.section({ title: "Getting Started" });

  deck.code({
    title: "Your First AI-Assisted Script",
    language: "python",
    code: [
      '# Prompt: "write a function that retries',
      '#          an HTTP request with backoff"',
      "",
      "import time, requests",
      "",
      "def fetch_with_retry(url, retries=3):",
      "    for i in range(retries):",
      "        resp = requests.get(url)",
      "        if resp.ok:",
      "            return resp",
      "        time.sleep(2 ** i)",
      '    raise RuntimeError("all retries failed")',
    ].join("\n"),
  });

  deck.content({
    title: "Best Practices",
    bullets: [
      "Be specific in your prompts — context beats cleverness",
      "Review generated code before committing",
      "Use AI for first drafts, human judgment for final review",
      "Keep the human in the loop for security-sensitive code",
      "Version control everything — diffs are your safety net",
    ],
  });

  deck.quote({
    quote:
      "AI won't replace developers, but developers who use AI will replace those who don't.",
    attribution: "Industry consensus, 2024",
  });

  deck.content({
    title: "Key Takeaways",
    bullets: [
      "Start small — autocomplete and chat are low-friction entry points",
      "Build trust incrementally by verifying AI output",
      "Combine AI speed with human judgment for best results",
    ],
  });

  deck.title({
    title: "Thank You",
    subtitle: "Questions and discussion",
  });

  return deck;
}
