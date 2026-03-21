/**
 * Lucide icon PNGs for slide components.
 *
 * Uses the same path data as lucide-react, renders SVG → PNG via sharp,
 * returns base64 data URIs for pptxgenjs addImage.
 *
 * Icons: Pencil, Info, Lightbulb, TriangleAlert, CircleCheck
 */

import sharp from "sharp";

const ICON_PATHS: Record<string, string> = {
  pencil: [
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    '<path d="m15 5 4 4"/>',
  ].join(""),

  info: [
    '<circle cx="12" cy="12" r="10"/>',
    '<path d="M12 16v-4"/>',
    '<path d="M12 8h.01"/>',
  ].join(""),

  lightbulb: [
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>',
    '<path d="M9 18h6"/>',
    '<path d="M10 22h4"/>',
  ].join(""),

  triangleAlert: [
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>',
    '<path d="M12 9v4"/>',
    '<path d="M12 17h.01"/>',
  ].join(""),

  circleCheck: [
    '<circle cx="12" cy="12" r="10"/>',
    '<path d="m9 12 2 2 4-4"/>',
  ].join(""),
};

// Cache rendered PNGs so we don't re-render the same icon+color combo
const cache = new Map<string, string>();

/**
 * Generate a base64 PNG data URI for a Lucide icon with a specific color.
 * @param name Icon name: "pencil" | "info" | "lightbulb" | "triangleAlert" | "circleCheck"
 * @param color Hex color WITHOUT # prefix, e.g. "DA7756"
 * @param size Render size in pixels (default 96 for retina clarity)
 */
export async function lucideIcon(name: string, color: string, size = 96): Promise<string> {
  const cacheKey = `${name}-${color}-${size}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const paths = ICON_PATHS[name];
  if (!paths) throw new Error(`Unknown icon: ${name}. Available: ${Object.keys(ICON_PATHS).join(", ")}`);

  const svg = Buffer.from([
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"`,
    ` fill="none" stroke="#${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
    paths,
    `</svg>`,
  ].join(""));

  const pngBuffer = await sharp(svg).png().toBuffer();
  const dataUri = `image/png;base64,${pngBuffer.toString("base64")}`;

  cache.set(cacheKey, dataUri);
  return dataUri;
}

export const ICON_NAMES = Object.keys(ICON_PATHS);
