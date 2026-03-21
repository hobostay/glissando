/**
 * Claude Documentation Style theme.
 *
 * Exports the full theme object: config + components + layouts.
 * Also exports font presets for easy typography switching.
 *
 * Usage with preset:
 *   import { claudeDoc, applyPreset } from "../../src/themes/claude-doc/index.js";
 *   import { macosNative } from "../../src/themes/claude-doc/presets.js";
 *   const theme = applyPreset(claudeDoc, macosNative);
 */

import type { Theme } from "../../types.js";
import { config } from "./config.js";
import { createComponents } from "./components.js";
import { layouts } from "./layouts.js";
import type { FontPreset } from "./presets.js";

export const claudeDoc: Theme = {
  config,
  createComponents,
  layouts,
};

/** Create a new theme with a font preset applied (immutable — does not modify original). */
export function applyPreset(theme: Theme, preset: FontPreset): Theme {
  return {
    ...theme,
    config: {
      ...theme.config,
      fonts: { ...preset.fonts },
      sizes: { ...preset.sizes },
      ...(preset.codeStyle ? { codeStyle: { ...preset.codeStyle } } : {}),
    },
  };
}

export { macosNative, googleFonts, defaultPreset } from "./presets.js";
