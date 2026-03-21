/**
 * Claude Documentation Style — theme configuration.
 *
 * Based on https://platform.claude.com/docs visual design:
 * - Warm off-whites, near-black text
 * - Terracotta accent (#D97757)
 * - DM Serif Display / Inter / JetBrains Mono font stack (free defaults)
 * - Tiempos Headline / Styrene A available as premium upgrades
 */

import type { ThemeConfig } from "../../types.js";

export const config: ThemeConfig = {
  name: "claude-doc",

  colors: {
    bgPrimary:      "FFFFFF",
    bgDark:         "141413",
    bgAccent:       "F9F8F5",
    bgCard:         "EDEBE5",

    text:           "141413",
    textSecondary:  "3B3B39",
    textMuted:      "706E6B",
    textOnDark:     "F9F8F5",
    textOnDarkMuted:"99958F",

    accent:         "D97757",
    accentBlue:     "2D74C9",

    codeBg:         "282C34",
    codeText:       "ABB2BF",
  },

  // Free defaults (auto-installed). To use the premium Anthropic fonts,
  // place them in src/themes/claude-doc/fonts/ and change these values to:
  //   heading: "Tiempos Headline"
  //   sans:    "Styrene A"
  //   serif:   "Tiempos Text"
  fonts: {
    heading: "DM Serif Display",
    sans:    "Inter",
    serif:   "DM Serif Display",
    mono:    "JetBrains Mono",
  },

  sizes: {
    title:        40,
    subtitle:     22,
    sectionTitle: 36,
    heading:      28,
    body:         18,
    small:        14,
    code:         13,
    caption:      12,
  },

  spacing: {
    slideWidth:    13.33,
    slideHeight:   7.5,
    marginLeft:    0.8,
    marginRight:   0.8,
    marginTop:     0.6,
    marginBottom:  0.5,
  },
};
