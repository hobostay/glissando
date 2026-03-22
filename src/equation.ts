/**
 * LaTeX equation renderer — LaTeX → SVG (MathJax) → PNG (sharp).
 *
 * Returns base64 data URIs for pptxgenjs addImage, plus the
 * natural aspect ratio so callers can size the image correctly.
 */

import sharp from "sharp";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

// ---------------------------------------------------------------------------
// MathJax bootstrap (singleton — initialized once)
// ---------------------------------------------------------------------------

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" });
const htmlDoc = mathjax.document("", { InputJax: tex, OutputJax: svg });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface EquationResult {
  /** base64 data URI for pptxgenjs addImage ({ data: ... }) */
  data: string;
  /** Natural width/height ratio of the rendered equation */
  aspectRatio: number;
}

// Cache rendered equations
const cache = new Map<string, EquationResult>();

/**
 * Render a LaTeX string to a high-resolution PNG.
 *
 * @param latex  LaTeX math expression (without delimiters)
 * @param color  Hex color WITHOUT # prefix, e.g. "0D0D0D"
 * @param scale  Rendering scale — higher = sharper (default 3 for retina)
 */
export async function renderEquation(
  latex: string,
  color = "0D0D0D",
  scale = 3,
): Promise<EquationResult> {
  const cacheKey = `${latex}|${color}|${scale}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  // Render LaTeX → SVG via MathJax
  const node = htmlDoc.convert(latex, { display: true });
  let svgStr = adaptor.outerHTML(node);

  // MathJax wraps in <mjx-container>; extract the inner <svg>
  const svgMatch = svgStr.match(/<svg[\s\S]*<\/svg>/);
  if (!svgMatch) throw new Error(`MathJax produced no SVG for: ${latex}`);
  svgStr = svgMatch[0];

  // Inject fill color (MathJax uses currentColor)
  svgStr = svgStr.replace(/currentColor/g, `#${color}`);

  // Parse viewBox to get natural dimensions
  const vbMatch = svgStr.match(/viewBox="([^"]*)"/);
  if (!vbMatch) throw new Error("SVG has no viewBox");
  const [, , , vbW, vbH] = vbMatch[1].split(/\s+/).map(Number);

  // Extract width/height in ex units, convert to pixels for rasterization
  const widthMatch = svgStr.match(/width="([\d.]+)ex"/);
  const heightMatch = svgStr.match(/height="([\d.]+)ex"/);
  const exToPx = 16; // approximate: 1ex ≈ 16px at base scale
  const wPx = Math.round((widthMatch ? parseFloat(widthMatch[1]) : vbW) * exToPx * scale);
  const hPx = Math.round((heightMatch ? parseFloat(heightMatch[1]) : vbH) * exToPx * scale);

  // Force pixel dimensions into SVG for sharp
  svgStr = svgStr
    .replace(/width="[^"]*"/, `width="${wPx}"`)
    .replace(/height="[^"]*"/, `height="${hPx}"`);

  // SVG → PNG via sharp
  const pngBuffer = await sharp(Buffer.from(svgStr)).png().toBuffer();
  const data = `image/png;base64,${pngBuffer.toString("base64")}`;
  const aspectRatio = wPx / hPx;

  const result: EquationResult = { data, aspectRatio };
  cache.set(cacheKey, result);
  return result;
}
