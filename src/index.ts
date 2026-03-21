/**
 * VibeSlides — component-based slide decks for coding agents.
 *
 * Usage:
 *   import { Deck } from "../../src/index.js";
 *   import { claudeDoc } from "../../src/themes/claude-doc/index.js";
 *
 *   const deck = new Deck(claudeDoc);
 *   deck.title({ title: "Hello", subtitle: "World" });
 *   deck.content({ title: "Points", bullets: ["A", "B", "C"] });
 *   await deck.save("output.pptx");
 */

import { execSync } from "child_process";
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import PptxGenJS from "pptxgenjs";
import type {
  Theme,
  TitleLayoutProps,
  SectionLayoutProps,
  ContentLayoutProps,
  TwoColumnLayoutProps,
  CodeLayoutProps,
  QuoteLayoutProps,
  ImageLayoutProps,
  TableLayoutProps,
  BlankLayoutProps,
  ConnectorProps,
  ConnectorDef,
  ConnectionPoint,
} from "./types.js";

export type { Theme, ShapeRef, ConnectionPoint } from "./types.js";

export class Deck {
  private pres: PptxGenJS;
  private theme: Theme;
  private boundComponents: ReturnType<Theme["createComponents"]>;
  private _connectorDefs: ConnectorDef[] = [];
  private _slideCount = 0;

  constructor(theme: Theme) {
    this.theme = theme;
    this.pres = new PptxGenJS();

    // Create components bound to this theme's config (respects presets)
    this.boundComponents = theme.createComponents(theme.config);

    const { slideWidth, slideHeight } = theme.config.spacing;
    this.pres.defineLayout({ name: "CUSTOM", width: slideWidth, height: slideHeight });
    this.pres.layout = "CUSTOM";

    // Override pptxgenjs default theme fonts (Calibri/Calibri Light)
    this.pres.theme = {
      headFontFace: theme.config.fonts.heading,
      bodyFontFace: theme.config.fonts.sans,
    };
  }

  /** Dark-background opening or closing slide. */
  title(props: TitleLayoutProps): this {
    this.theme.layouts.title(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Section divider with warm accent background. */
  section(props: SectionLayoutProps): this {
    this.theme.layouts.section(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Standard content slide with heading + bullet list. */
  content(props: ContentLayoutProps): this {
    this.theme.layouts.content(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Two-column comparison slide. */
  twoColumn(props: TwoColumnLayoutProps): this {
    this.theme.layouts.twoColumn(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Code slide with dark code panel. */
  code(props: CodeLayoutProps): this {
    this.theme.layouts.code(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Large quote with attribution. */
  quote(props: QuoteLayoutProps): this {
    this.theme.layouts.quote(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Image slide with title and caption. */
  image(props: ImageLayoutProps): this {
    this.theme.layouts.image(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Table slide with themed headers. */
  table(props: TableLayoutProps): this {
    this.theme.layouts.table(this.pres, this.theme.config, this.boundComponents, props);
    this._slideCount++;
    return this;
  }

  /** Empty slide for custom content. Returns the raw pptxgenjs slide. */
  blank(props?: BlankLayoutProps): PptxGenJS.Slide {
    const slide = this.pres.addSlide();
    const bgMap = {
      primary: this.theme.config.colors.bgPrimary,
      dark: this.theme.config.colors.bgDark,
      accent: this.theme.config.colors.bgAccent,
    };
    slide.background = { color: bgMap[(props?.bg) ?? "primary"] };
    this._slideCount++;
    return slide;
  }

  /** Connect two shapes with a native OOXML connector (moves with shapes on drag). */
  connector(props: ConnectorProps): this {
    this._connectorDefs.push({
      slideIndex: this._slideCount, // current slide (1-indexed)
      from: props.from,
      to: props.to,
      type: props.type ?? "straight",
      color: props.color ?? this.theme.config.colors.textMuted,
      width: props.width ?? 1,
      head: props.head ?? "arrow",
      tail: props.tail ?? "none",
      label: props.label,
      labelItalic: props.labelItalic ?? true,
    });
    return this;
  }

  /** Access the underlying pptxgenjs instance for advanced use. */
  get raw(): PptxGenJS {
    return this.pres;
  }

  /** Access the theme's components for custom slide building. */
  get components() {
    return this.boundComponents;
  }

  /** Access the theme config (colors, fonts, sizes). */
  get config() {
    return this.theme.config;
  }

  /** Write the deck to a .pptx file. */
  async save(path: string): Promise<void> {
    await this.pres.writeFile({ fileName: path });
    this.patchPptx(path);
  }

  /**
   * Post-process the PPTX: fix theme fonts, inject native OOXML connectors.
   */
  private patchPptx(pptxPath: string): void {
    const { heading, sans } = this.theme.config.fonts;

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
      if (this._connectorDefs.length > 0) {
        this.injectConnectors(tmp);
      }

      // Repack
      execSync(`cd "${tmp}" && zip -q -r "${pptxPath}" .`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  /**
   * Inject native <p:cxnSp> connectors into slide XML.
   * These connectors reference shape IDs via objectName lookup,
   * so they move with shapes when dragged in Keynote/PowerPoint.
   */
  private injectConnectors(tmpDir: string): void {
    // Group connectors by slide
    const bySlide = new Map<number, ConnectorDef[]>();
    for (const conn of this._connectorDefs) {
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
      const { sans } = this.theme.config.fonts;

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

        // Connector geometry
        const presetMap: Record<string, string> = {
          straight: "straightConnector1",
          elbow: "bentConnector3",
          curved: "curvedConnector3",
        };
        const preset = presetMap[conn.type];

        const headMap: Record<string, string> = {
          arrow: "triangle", stealth: "stealth", triangle: "triangle", none: "none",
        };
        const headType = headMap[conn.head] ?? "triangle";
        const tailType = headMap[conn.tail] ?? "none";

        const lineW = Math.round(conn.width * 12700);

        if (conn.type === "curved") {
          // --- Curved arc: custom bezier geometry (not a connector) ---
          // Draws a C-shaped bezier from source to target, bowing outward.
          // Used for feedback loops (e.g. right→right iterate arrows).
          const arcBow = 1.0 * EMU; // how far the arc extends outward
          const startX = Math.round(fromX);
          const startY = Math.round(fromY);
          const endX = Math.round(toX);
          const endY = Math.round(toY);

          // Bounding box: from the attachment point, extending rightward by arcBow
          const arcOffX = Math.min(startX, endX);
          const arcOffY = Math.min(startY, endY);
          const arcCx = Math.round(arcBow);
          const arcCy = Math.abs(endY - startY);

          // Bezier control points within path coordinates (EMU)
          // Control points push the curve outward to the right
          const cp1x = Math.round(arcBow * 2);
          const cp1y = Math.round(arcCy * 0.75);
          const cp2x = Math.round(arcBow * 2);
          const cp2y = Math.round(arcCy * 0.25);

          // Path direction: if from is below to, start at bottom
          const goingUp = fromY > toY;
          const pathStartY = goingUp ? arcCy : 0;
          const pathEndY = goingUp ? 0 : arcCy;
          const cpA_y = goingUp ? cp1y : cp2y;
          const cpB_y = goingUp ? cp2y : cp1y;

          injectedXmls.push(
            `<p:sp>` +
            `<p:nvSpPr>` +
            `<p:cNvPr id="${maxId}" name="Arc ${maxId}"/>` +
            `<p:cNvSpPr/>` +
            `<p:nvPr/>` +
            `</p:nvSpPr>` +
            `<p:spPr>` +
            `<a:xfrm>` +
            `<a:off x="${arcOffX}" y="${arcOffY}"/>` +
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
        } else {
          // --- Straight or elbow: native OOXML connector ---
          const presetMap: Record<string, string> = {
            straight: "straightConnector1",
            elbow: "bentConnector3",
          };
          const preset = presetMap[conn.type];
          const avLst = conn.type === "elbow"
            ? '<a:avLst><a:gd name="adj1" fmla="val 50000"/></a:avLst>'
            : '<a:avLst/>';

          injectedXmls.push(
            `<p:cxnSp>` +
            `<p:nvCxnSpPr>` +
            `<p:cNvPr id="${maxId}" name="Connector ${maxId}"/>` +
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

        // Connector label — text box near the midpoint/outer edge
        if (conn.label) {
          maxId++;
          // Position label at outer edge for curved, midpoint for others
          let labelX: number, labelY: number;
          if (conn.type === "curved") {
            // Position at the outer bulge of the bezier arc
            labelX = Math.max(fromX, toX) + 0.9 * EMU;
            labelY = (fromY + toY) / 2 - 0.15 * EMU;
          } else {
            labelX = (fromX + toX) / 2;
            labelY = (fromY + toY) / 2 - 0.25 * EMU;
          }
          const labelW = 1.0 * EMU;
          const labelH = 0.35 * EMU;
          const italic = conn.labelItalic !== false ? ' i="1"' : "";

          injectedXmls.push(
            `<p:sp>` +
            `<p:nvSpPr>` +
            `<p:cNvPr id="${maxId}" name="Label ${maxId}"/>` +
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
            `<a:latin typeface="${sans}"/>` +
            `</a:rPr>` +
            `<a:t>${conn.label}</a:t>` +
            `</a:r>` +
            `</a:p>` +
            `</p:txBody>` +
            `</p:sp>`
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
}
