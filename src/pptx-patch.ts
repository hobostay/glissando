/**
 * PPTX post-processing — font patching, connector injection, code block grouping.
 *
 * Operates on an already-written .pptx file: unzips → modifies XML → rezips.
 * Isolated from the Deck API so agents reading index.ts see only the public surface.
 */

import { execSync } from "child_process";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { ConnectorDef } from "./types.js";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface PatchOptions {
  fonts: { heading: string; sans: string };
  connectorDefs: ConnectorDef[];
}

/**
 * Post-process a .pptx file in-place:
 *   1. Replace pptxgenjs theme/master fonts with the theme's fonts
 *   2. Inject native OOXML connectors (<p:cxnSp> + bezier arcs)
 *   3. Group code block shapes into <p:grpSp>
 */
export function patchPptx(pptxPath: string, opts: PatchOptions): void {
  const { heading, sans } = opts.fonts;

  const tmp = mkdtempSync(join(tmpdir(), "vibeslides-"));
  try {
    execSync(`unzip -q -o "${pptxPath}" -d "${tmp}"`);

    // --- Patch theme fonts ---
    const themePath = join(tmp, "ppt", "theme", "theme1.xml");
    let themeXml = readFileSync(themePath, "utf-8");
    themeXml = themeXml.replace(
      /(<a:majorFont>)([\s\S]*?)(<\/a:majorFont>)/,
      `$1<a:latin typeface="${heading}"/><a:ea typeface=""/><a:cs typeface=""/>$3`
    );
    themeXml = themeXml.replace(
      /(<a:minorFont>)([\s\S]*?)(<\/a:minorFont>)/,
      `$1<a:latin typeface="${sans}"/><a:ea typeface=""/><a:cs typeface=""/>$3`
    );
    writeFileSync(themePath, themeXml, "utf-8");

    // --- Patch slide master ---
    const masterPath = join(tmp, "ppt", "slideMasters", "slideMaster1.xml");
    let masterXml = readFileSync(masterPath, "utf-8");
    masterXml = masterXml.replace(/typeface="Arial"/g, `typeface="${sans}"`);
    writeFileSync(masterPath, masterXml, "utf-8");

    // --- Inject OOXML connectors ---
    if (opts.connectorDefs.length > 0) {
      injectConnectors(tmp, opts.connectorDefs, sans);
    }

    // --- Group code block shapes (bg + label + rule + code → <p:grpSp>) ---
    groupCodeBlocks(tmp);

    // Repack
    execSync(`cd "${tmp}" && zip -q -r "${pptxPath}" .`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Connector injection
// ---------------------------------------------------------------------------

/**
 * Inject native <p:cxnSp> connectors into slide XML.
 * Connectors reference shape IDs via objectName lookup,
 * so they move with shapes when dragged in Keynote/PowerPoint.
 */
function injectConnectors(
  tmpDir: string,
  connectorDefs: ConnectorDef[],
  sansFont: string,
): void {
  // Group connectors by slide
  const bySlide = new Map<number, ConnectorDef[]>();
  for (const conn of connectorDefs) {
    const list = bySlide.get(conn.slideIndex) ?? [];
    list.push(conn);
    bySlide.set(conn.slideIndex, list);
  }

  const EMU = 914400; // 1 inch = 914400 EMUs

  for (const [slideIdx, connectors] of bySlide) {
    const slidePath = join(tmpDir, "ppt", "slides", `slide${slideIdx}.xml`);
    let xml = readFileSync(slidePath, "utf-8");

    // Build a map of objectName → shape ID
    const nameToId = new Map<string, number>();
    const nameRegex = /<p:cNvPr id="(\d+)" name="([^"]*)"/g;
    let m;
    while ((m = nameRegex.exec(xml)) !== null) {
      nameToId.set(m[2], parseInt(m[1]));
    }

    // Find max existing ID for generating new unique IDs
    let maxId = 0;
    const idRegex = /id="(\d+)"/g;
    while ((m = idRegex.exec(xml)) !== null) {
      maxId = Math.max(maxId, parseInt(m[1]));
    }

    // Generate connector + label XML
    const injectedXmls: string[] = [];

    for (const conn of connectors) {
      maxId++;
      const fromId = nameToId.get(conn.from._shapeName);
      const toId = nameToId.get(conn.to._shapeName);
      if (!fromId || !toId) continue;

      const fromX = conn.from.x * EMU;
      const fromY = conn.from.y * EMU;
      const toX = conn.to.x * EMU;
      const toY = conn.to.y * EMU;

      const x = Math.min(fromX, toX);
      const y = Math.min(fromY, toY);
      const cx = Math.abs(toX - fromX);
      const cy = Math.abs(toY - fromY);

      const flipH = toX < fromX ? ' flipH="1"' : "";
      const flipV = toY < fromY ? ' flipV="1"' : "";

      const headMap: Record<string, string> = {
        arrow: "triangle", stealth: "stealth", triangle: "triangle", none: "none",
      };
      const headType = headMap[conn.head] ?? "triangle";
      const tailType = headMap[conn.tail] ?? "none";

      const lineW = Math.round(conn.width * 12700);

      if (conn.type === "curved") {
        injectedXmls.push(
          buildCurvedArc(conn, fromX, fromY, toX, toY, maxId, lineW, headType, EMU)
        );
      } else {
        injectedXmls.push(
          buildNativeConnector(
            conn, fromId, toId, x, y, cx, cy, flipH, flipV,
            maxId, lineW, headType, tailType,
          )
        );
      }

      // Connector label — text box near the midpoint/outer edge
      if (conn.label) {
        maxId++;
        injectedXmls.push(
          buildConnectorLabel(conn, fromX, fromY, toX, toY, maxId, sansFont, EMU)
        );
      }
    }

    // Inject before </p:spTree>
    if (injectedXmls.length > 0) {
      xml = xml.replace("</p:spTree>", injectedXmls.join("") + "</p:spTree>");
      writeFileSync(slidePath, xml, "utf-8");
    }
  }
}

// ---------------------------------------------------------------------------
// Connector XML builders
// ---------------------------------------------------------------------------

/** Curved arc via custom bezier geometry (<a:custGeom>). */
function buildCurvedArc(
  conn: ConnectorDef,
  fromX: number, fromY: number, toX: number, toY: number,
  id: number, lineW: number, headType: string, EMU: number,
): string {
  const arcBow = 1.0 * EMU;
  const arcOffX = Math.min(fromX, toX);
  const arcOffY = Math.min(fromY, toY);
  const arcCx = Math.round(arcBow);
  const arcCy = Math.abs(toY - fromY);

  const cp1x = Math.round(arcBow * 2);
  const cp1y = Math.round(arcCy * 0.75);
  const cp2x = Math.round(arcBow * 2);
  const cp2y = Math.round(arcCy * 0.25);

  const goingUp = fromY > toY;
  const pathStartY = goingUp ? arcCy : 0;
  const pathEndY = goingUp ? 0 : arcCy;
  const cpA_y = goingUp ? cp1y : cp2y;
  const cpB_y = goingUp ? cp2y : cp1y;

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Arc ${id}"/>` +
    `<p:cNvSpPr/>` +
    `<p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm>` +
    `<a:off x="${Math.round(arcOffX)}" y="${Math.round(arcOffY)}"/>` +
    `<a:ext cx="${arcCx}" cy="${Math.round(arcCy)}"/>` +
    `</a:xfrm>` +
    `<a:custGeom>` +
    `<a:avLst/>` +
    `<a:gdLst/>` +
    `<a:ahLst/>` +
    `<a:cxnLst/>` +
    `<a:rect l="0" t="0" r="${arcCx}" b="${Math.round(arcCy)}"/>` +
    `<a:pathLst>` +
    `<a:path w="${arcCx}" h="${Math.round(arcCy)}">` +
    `<a:moveTo><a:pt x="0" y="${pathStartY}"/></a:moveTo>` +
    `<a:cubicBezTo>` +
    `<a:pt x="${cp1x}" y="${cpA_y}"/>` +
    `<a:pt x="${cp2x}" y="${cpB_y}"/>` +
    `<a:pt x="0" y="${pathEndY}"/>` +
    `</a:cubicBezTo>` +
    `</a:path>` +
    `</a:pathLst>` +
    `</a:custGeom>` +
    `<a:noFill/>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:sp>`
  );
}

/** Straight or elbow native OOXML connector (<p:cxnSp>). */
function buildNativeConnector(
  conn: ConnectorDef,
  fromId: number, toId: number,
  x: number, y: number, cx: number, cy: number,
  flipH: string, flipV: string,
  id: number, lineW: number, headType: string, tailType: string,
): string {
  const presetMap: Record<string, string> = {
    straight: "straightConnector1",
    elbow: "bentConnector3",
  };
  const preset = presetMap[conn.type];
  const avLst = conn.type === "elbow"
    ? '<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>'
    : '<a:avLst/>';

  return (
    `<p:cxnSp>` +
    `<p:nvCxnSpPr>` +
    `<p:cNvPr id="${id}" name="Connector ${id}"/>` +
    `<p:cNvCxnSpPr>` +
    `<a:cxnSpLocks noChangeShapeType="1"/>` +
    `<a:stCxn id="${fromId}" idx="${conn.from.idx}"/>` +
    `<a:endCxn id="${toId}" idx="${conn.to.idx}"/>` +
    `</p:cNvCxnSpPr>` +
    `<p:nvPr/>` +
    `</p:nvCxnSpPr>` +
    `<p:spPr>` +
    `<a:xfrm${flipH}${flipV}>` +
    `<a:off x="${Math.round(x)}" y="${Math.round(y)}"/>` +
    `<a:ext cx="${Math.round(cx)}" cy="${Math.round(cy)}"/>` +
    `</a:xfrm>` +
    `<a:prstGeom prst="${preset}">${avLst}</a:prstGeom>` +
    `<a:ln w="${lineW}">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:headEnd type="${tailType}"/>` +
    `<a:tailEnd type="${headType}"/>` +
    `</a:ln>` +
    `</p:spPr>` +
    `</p:cxnSp>`
  );
}

/** Text box label positioned near a connector. */
function buildConnectorLabel(
  conn: ConnectorDef,
  fromX: number, fromY: number, toX: number, toY: number,
  id: number, sansFont: string, EMU: number,
): string {
  let labelX: number, labelY: number;
  if (conn.type === "curved") {
    labelX = Math.max(fromX, toX) + 0.9 * EMU;
    labelY = (fromY + toY) / 2 - 0.15 * EMU;
  } else {
    labelX = (fromX + toX) / 2;
    labelY = (fromY + toY) / 2 - 0.25 * EMU;
  }
  const labelW = 1.0 * EMU;
  const labelH = 0.35 * EMU;
  const italic = conn.labelItalic !== false ? ' i="1"' : "";

  return (
    `<p:sp>` +
    `<p:nvSpPr>` +
    `<p:cNvPr id="${id}" name="Label ${id}"/>` +
    `<p:cNvSpPr txBox="1"/>` +
    `<p:nvPr/>` +
    `</p:nvSpPr>` +
    `<p:spPr>` +
    `<a:xfrm>` +
    `<a:off x="${Math.round(labelX)}" y="${Math.round(labelY)}"/>` +
    `<a:ext cx="${Math.round(labelW)}" cy="${Math.round(labelH)}"/>` +
    `</a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>` +
    `<a:noFill/>` +
    `</p:spPr>` +
    `<p:txBody>` +
    `<a:bodyPr wrap="square" rtlCol="0"/>` +
    `<a:lstStyle/>` +
    `<a:p>` +
    `<a:r>` +
    `<a:rPr lang="en-US" sz="1400"${italic} dirty="0">` +
    `<a:solidFill><a:srgbClr val="${conn.color}"/></a:solidFill>` +
    `<a:latin typeface="${sansFont}"/>` +
    `</a:rPr>` +
    `<a:t>${conn.label}</a:t>` +
    `</a:r>` +
    `</a:p>` +
    `</p:txBody>` +
    `</p:sp>`
  );
}

// ---------------------------------------------------------------------------
// Code block grouping
// ---------------------------------------------------------------------------

/**
 * Group code block shapes (bg, label, rule, code) into <p:grpSp>.
 * Shapes are tagged with objectName "cb-N-bg/label/rule/code".
 */
function groupCodeBlocks(tmpDir: string): void {
  const slidesDir = join(tmpDir, "ppt", "slides");
  const slideFiles = readdirSync(slidesDir).filter((f) => /^slide\d+\.xml$/.test(f));

  for (const file of slideFiles) {
    const slidePath = join(slidesDir, file);
    let xml = readFileSync(slidePath, "utf-8");

    // Find all code block group IDs
    const groupIds = new Set<string>();
    const namePattern = /name="cb-(\d+)-bg"/g;
    let m: RegExpExecArray | null;
    while ((m = namePattern.exec(xml)) !== null) {
      groupIds.add(m[1]);
    }

    if (groupIds.size === 0) continue;

    for (const gid of groupIds) {
      const parts = ["bg", "label", "rule", "code"];
      const shapes: string[] = [];

      // Extract all 4 shapes
      for (const part of parts) {
        const shapeXml = extractShape(xml, `cb-${gid}-${part}`);
        if (shapeXml) {
          xml = xml.replace(shapeXml, "");
          shapes.push(shapeXml);
        }
      }

      if (shapes.length === 0) continue;

      // Get bounding box from the bg shape (first one)
      const offMatch = shapes[0].match(/<a:off x="(\d+)" y="(\d+)"/);
      const extMatch = shapes[0].match(/<a:ext cx="(\d+)" cy="(\d+)"/);
      if (!offMatch || !extMatch) continue;

      const gx = parseInt(offMatch[1]);
      const gy = parseInt(offMatch[2]);
      const gcx = parseInt(extMatch[1]);
      const gcy = parseInt(extMatch[2]);

      // Next available ID
      let maxId = 0;
      const idRegex = /id="(\d+)"/g;
      let im: RegExpExecArray | null;
      while ((im = idRegex.exec(xml)) !== null) {
        maxId = Math.max(maxId, parseInt(im[1]));
      }
      maxId++;

      // Build group — bg first (back), then rule, then label+code on top
      const grpSpXml =
        `<p:grpSp>` +
        `<p:nvGrpSpPr>` +
        `<p:cNvPr id="${maxId}" name="CodeBlock ${gid}"/>` +
        `<p:cNvGrpSpPr><a:grpSpLocks noChangeAspect="0"/></p:cNvGrpSpPr>` +
        `<p:nvPr/>` +
        `</p:nvGrpSpPr>` +
        `<p:grpSpPr>` +
        `<a:xfrm>` +
        `<a:off x="${gx}" y="${gy}"/>` +
        `<a:ext cx="${gcx}" cy="${gcy}"/>` +
        `<a:chOff x="${gx}" y="${gy}"/>` +
        `<a:chExt cx="${gcx}" cy="${gcy}"/>` +
        `</a:xfrm>` +
        `</p:grpSpPr>` +
        shapes.join("") +
        `</p:grpSp>`;

      xml = xml.replace("</p:spTree>", grpSpXml + "</p:spTree>");
    }

    writeFileSync(slidePath, xml, "utf-8");
  }
}

/**
 * Extract a complete <p:sp>...</p:sp> element that contains
 * the given objectName (from name="..." attribute).
 */
function extractShape(xml: string, objectName: string): string | null {
  const nameStr = `name="${objectName}"`;
  const nameIdx = xml.indexOf(nameStr);
  if (nameIdx === -1) return null;

  // Walk backwards to find the opening <p:sp> tag
  let start = nameIdx;
  while (start > 0) {
    if (xml.startsWith("<p:sp>", start) || xml.startsWith("<p:sp ", start)) {
      const afterTag = xml[start + 5]; // char after "<p:sp"
      if (afterTag === ">" || afterTag === " ") {
        break;
      }
    }
    start--;
  }

  // Walk forward to find the closing </p:sp> tag
  let end = nameIdx;
  const closeTag = "</p:sp>";
  while (end < xml.length) {
    if (xml.startsWith(closeTag, end)) {
      end += closeTag.length;
      break;
    }
    end++;
  }

  if (start === 0 && !xml.startsWith("<p:sp>") && !xml.startsWith("<p:sp ")) {
    return null;
  }

  return xml.substring(start, end);
}
