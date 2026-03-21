/**
 * Pre-designed components for the Claude doc theme.
 *
 * Components are created via a factory that receives the runtime ThemeConfig,
 * so they respect font presets and config overrides.
 */

import type PptxGenJS from "pptxgenjs";
import type {
  ThemeConfig,
  ThemeComponents,
  ComponentFactory,
  AccentBarProps,
  HeadingProps,
  BodyTextProps,
  BulletListProps,
  NumberedListProps,
  CodeBlockProps,
  QuoteBoxProps,
  TableProps,
  CaptionProps,
  CalloutBlockProps,
  CalloutVariant,
  DiagramBoxProps,
  ShapeRef,
  ArrowProps,
  HookArrowProps,
  ContainerProps,
} from "../../types.js";
import { highlightCode } from "../../highlight.js";
import { lucideIcon } from "../../icons.js";

export const createComponents: ComponentFactory = (cfg: ThemeConfig): ThemeComponents => {
  const { colors: c, fonts: f, sizes: s } = cfg;

  // --- Accent bar ---
  function accentBar(slide: PptxGenJS.Slide, props: AccentBarProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y,
      w: props.w ?? 2, h: props.h ?? 0.04,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0.5 },
    });
  }

  // --- Heading ---
  function heading(slide: PptxGenJS.Slide, props: HeadingProps): void {
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: 0.7,
      fontSize: props.fontSize ?? s.heading,
      fontFace: f.heading,
      color: props.color ?? c.text,
      bold: true,
      valign: "bottom",
    });
  }

  // --- Body text ---
  function bodyText(slide: PptxGenJS.Slide, props: BodyTextProps): void {
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: props.h ?? 0.5,
      fontSize: props.fontSize ?? s.body,
      fontFace: props.fontFace ?? f.sans,
      color: props.color ?? c.textSecondary,
      bold: props.bold ?? false,
      italic: props.italic ?? false,
      valign: "top",
    });
  }

  // --- Bullet list ---
  function bulletList(slide: PptxGenJS.Slide, props: BulletListProps): void {
    const fontSize = props.fontSize ?? s.body;
    const textRows: PptxGenJS.TextProps[] = props.items.map((item) => ({
      text: item,
      options: {
        fontSize,
        fontFace: f.sans,
        color: c.textSecondary,
        bullet: { type: "bullet", color: c.accent },
        paraSpaceAfter: 8,
        indentLevel: 0,
      },
    }));
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h: props.h ?? 4.5,
      valign: "top",
      lineSpacingMultiple: 1.2,
    });
  }

  // --- Numbered list ---
  function numberedList(slide: PptxGenJS.Slide, props: NumberedListProps): void {
    const fontSize = props.fontSize ?? s.body;
    const textRows: PptxGenJS.TextProps[] = props.items.map((item) => ({
      text: item,
      options: {
        fontSize,
        fontFace: f.sans,
        color: c.textSecondary,
        bullet: { type: "number", color: c.accent },
        paraSpaceAfter: 8,
      },
    }));
    slide.addText(textRows, {
      x: props.x, y: props.y, w: props.w, h: props.h ?? 4.5,
      valign: "top",
      lineSpacingMultiple: 1.2,
    });
  }

  // --- Code block (with syntax highlighting) ---
  function codeBlock(slide: PptxGenJS.Slide, props: CodeBlockProps): void {
    const cs = cfg.codeStyle;

    // Calculate height from code content
    const lineCount = props.code.split("\n").length;
    const lineHeightIn = (s.code / 72) * 1.4; // fontSize pt → inches, × line-spacing
    const headerHeight = props.language ? 0.5 : 0.25;
    const padding = 0.35; // top + bottom padding inside the panel
    const autoH = headerHeight + lineCount * lineHeightIn + padding;
    const h = props.h ? Math.min(props.h, autoH) : autoH;

    // Top margin in pt to leave room for the language label + separator
    const topMarginPt = props.language ? 36 : 18; // ~0.5" or ~0.25"
    const sidePadPt = 22; // ~0.3"
    const lang = props.language ?? "";

    if (lang) {
      // Build multi-run highlighted text
      const lines = highlightCode(props.code, lang, cs);
      const textRows: PptxGenJS.TextProps[] = [];

      for (let li = 0; li < lines.length; li++) {
        const tokens = lines[li];
        for (let ti = 0; ti < tokens.length; ti++) {
          const isLastToken = ti === tokens.length - 1;
          textRows.push({
            text: tokens[ti].text,
            options: {
              fontSize: s.code,
              fontFace: f.mono,
              color: tokens[ti].color,
              breakType: isLastToken ? "break" : undefined,
            },
          });
        }
      }

      // Single shape with code text built-in (bg + code move together)
      slide.addText(textRows, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: cs.bg },
        rectRadius: cs.borderRadius ?? 0.1,
        line: cs.border
          ? { color: cs.border, width: 1 }
          : { color: cs.bg, width: 0.5 },
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin: [topMarginPt, sidePadPt, 10, sidePadPt],
      });
    } else {
      // No language — plain monochrome text, single shape
      slide.addText(props.code, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: cs.bg },
        rectRadius: cs.borderRadius ?? 0.1,
        line: cs.border
          ? { color: cs.border, width: 1 }
          : { color: cs.bg, width: 0.5 },
        fontSize: s.code,
        fontFace: f.mono,
        color: cs.text,
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin: [topMarginPt, sidePadPt, 10, sidePadPt],
      });
    }

    // Language label + separator line (overlaid chrome — separate elements)
    if (props.language) {
      slide.addText(props.language, {
        x: props.x + props.w - 1.5, y: props.y + 0.1,
        w: 1.3, h: 0.28,
        fontSize: s.small - 2,
        fontFace: f.mono,
        color: cs.label,
        align: "right",
      });

      slide.addShape("line", {
        x: props.x,
        y: props.y + 0.4,
        w: props.w,
        h: 0,
        line: { color: cs.border ?? cs.text, width: 0.75 },
      });
    }
  }

  // --- Quote box ---
  function quoteBox(slide: PptxGenJS.Slide, props: QuoteBoxProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y, w: 0.06, h: props.h,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0.5 },
    });
    slide.addText("\u201C", {
      x: props.x + 0.25, y: props.y - 0.2, w: 0.6, h: 0.8,
      fontSize: 60, fontFace: f.serif, color: c.accent, bold: true,
    });
    slide.addText(props.quote, {
      x: props.x + 0.3, y: props.y + 0.5,
      w: props.w - 0.5, h: props.h - 1.2,
      fontSize: 22, fontFace: f.serif, color: c.text,
      italic: true, valign: "top", lineSpacingMultiple: 1.5,
    });
    if (props.attribution) {
      slide.addText(`— ${props.attribution}`, {
        x: props.x + 0.3, y: props.y + props.h - 0.6,
        w: props.w - 0.5, h: 0.4,
        fontSize: s.body, fontFace: f.sans, color: c.textMuted,
        valign: "bottom",
      });
    }
  }

  // --- Table ---
  function table(slide: PptxGenJS.Slide, props: TableProps): void {
    const headerRow: PptxGenJS.TableCell[] = props.headers.map((h) => ({
      text: h,
      options: {
        fontSize: s.small, fontFace: f.sans, color: c.text, bold: true,
        fill: { color: c.bgAccent },
        border: [
          { type: "none" }, { type: "none" },
          { pt: 1.5, color: c.accent }, { type: "none" },
        ],
        valign: "middle" as const, paraSpaceBefore: 4, paraSpaceAfter: 4,
      },
    }));
    const dataRows: PptxGenJS.TableCell[][] = props.rows.map((row) =>
      row.map((cell) => ({
        text: cell,
        options: {
          fontSize: s.small, fontFace: f.sans, color: c.textSecondary,
          border: [
            { type: "none" }, { type: "none" },
            { pt: 0.5, color: "E5E3DB" }, { type: "none" },
          ],
          valign: "middle" as const, paraSpaceBefore: 3, paraSpaceAfter: 3,
        },
      }))
    );
    slide.addTable([headerRow, ...dataRows], {
      x: props.x, y: props.y, w: props.w,
      colW: Array(props.headers.length).fill(props.w / props.headers.length),
    });
  }

  // --- Caption ---
  function caption(slide: PptxGenJS.Slide, props: CaptionProps): void {
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: 0.35,
      fontSize: s.caption, fontFace: f.sans, color: c.textMuted,
      italic: true, align: "center",
    });
  }

  // --- Callout block — round-cornered panels (card, info, warning, accent, code) ---

  const calloutStyles: Record<CalloutVariant, {
    bg: string; border: string; textColor: string; iconName: string;
  }> = {
    card:    { bg: "FFFFFF",  border: "B8B8B8", textColor: c.textSecondary, iconName: "pencil" },
    code:    { bg: "F5F3EF",  border: "C9C4B8", textColor: c.textSecondary, iconName: "lightbulb" },
    info:    { bg: "EEF1FA",  border: "9BADD4", textColor: "9BADD4",       iconName: "info" },
    warning: { bg: "FDF5EB",  border: "D4B57A", textColor: "D4B57A",       iconName: "triangleAlert" },
    accent:  { bg: "FAF0EB",  border: "C9A08E", textColor: c.textSecondary, iconName: "circleCheck" },
    success: { bg: "ECFAF0",  border: "7BBF96", textColor: "7BBF96",       iconName: "circleCheck" },
  };

  async function calloutBlock(slide: PptxGenJS.Slide, props: CalloutBlockProps): Promise<void> {
    const style = calloutStyles[props.variant];

    // Calculate auto-height from content
    const bodyLineH = (s.small / 72) * 1.5;
    let contentLines = 0;
    if (props.body) contentLines += Math.ceil(props.body.length / 50);
    if (props.bullets) contentLines += props.bullets.length;
    const padding = 0.5;
    const autoH = contentLines * bodyLineH + padding;
    const h = props.h ?? Math.max(autoH, 0.7);

    // Left margin in points to leave room for the icon
    const iconInset = 48; // ~0.63 inches in points (icon 0.28" + padding)

    // Single shape with text built-in (text moves with shape on drag)
    if (props.body) {
      slide.addText(props.body, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: style.bg },
        rectRadius: 0.08,
        line: { color: style.border, width: 1 },
        fontSize: s.small, fontFace: f.sans,
        color: style.textColor,
        valign: "top",
        lineSpacingMultiple: 1.4,
        margin: [14, 14, 14, iconInset],
      });
    } else if (props.bullets) {
      const rows: PptxGenJS.TextProps[] = props.bullets.map((item) => ({
        text: item,
        options: {
          fontSize: s.small, fontFace: f.sans,
          color: style.textColor,
          bullet: { type: "bullet", color: style.border },
          paraSpaceAfter: 4,
        },
      }));
      slide.addText(rows, {
        x: props.x, y: props.y, w: props.w, h,
        shape: "roundRect" as any,
        fill: { color: style.bg },
        rectRadius: 0.08,
        line: { color: style.border, width: 1 },
        valign: "top",
        lineSpacingMultiple: 1.2,
        margin: [14, 14, 14, iconInset],
      });
    }

    // Lucide PNG icon (top-left, overlaid — only element that's separate)
    const iconData = await lucideIcon(style.iconName, style.border, 96);
    slide.addImage({
      data: iconData,
      x: props.x + 0.2, y: props.y + 0.18,
      w: 0.28, h: 0.28,
    });
  }

  // =========================================================================
  // DIAGRAM COMPONENTS
  // =========================================================================

  const defaultArrowColor = c.textMuted;
  let shapeCounter = 0;

  function makeShapeRef(name: string, x: number, y: number, w: number, h: number): ShapeRef {
    return {
      top:    { x: x + w / 2, y,         idx: 0, _shapeName: name },
      right:  { x: x + w,     y: y + h / 2, idx: 1, _shapeName: name },
      bottom: { x: x + w / 2, y: y + h,     idx: 2, _shapeName: name },
      left:   { x,            y: y + h / 2, idx: 3, _shapeName: name },
    };
  }

  // --- Diagram box — round-cornered labeled rectangle (single object, text built-in) ---
  function diagramBox(slide: PptxGenJS.Slide, props: DiagramBoxProps): ShapeRef {
    const name = `diag-box-${shapeCounter++}`;
    slide.addText(props.text, {
      x: props.x, y: props.y, w: props.w, h: props.h,
      shape: "roundRect" as any,
      fill: { color: props.fill ?? c.bgCard },
      rectRadius: 0.06,
      line: {
        color: props.border ?? c.textMuted,
        width: props.borderWidth ?? 1,
      },
      fontSize: props.fontSize ?? s.body,
      fontFace: f.heading,
      color: props.textColor ?? c.text,
      bold: props.bold ?? true,
      align: "center",
      valign: "middle",
      margin: [0, 8, 0, 8],
      objectName: name,
    });
    return makeShapeRef(name, props.x, props.y, props.w, props.h);
  }

  // --- Straight arrow with optional arrowheads ---
  function arrow(slide: PptxGenJS.Slide, props: ArrowProps): void {
    const color = props.color ?? defaultArrowColor;
    const w = props.to.x - props.from.x;
    const h = props.to.y - props.from.y;

    slide.addShape("line", {
      x: props.from.x,
      y: props.from.y,
      w: w,
      h: h,
      line: {
        color,
        width: props.width ?? 1,
        dashType: props.dashed ? "dash" : "solid",
      },
      // pptxgenjs: lineHead = start point, lineTail = end point
      // our API: head = arrowhead at destination, tail = arrowhead at source
      lineHead: props.tail ?? "none",
      lineTail: props.head ?? "arrow",
    });
  }

  // --- Hook arrow (L-shaped connector with right-angle bend) ---
  function hookArrow(slide: PptxGenJS.Slide, props: HookArrowProps): void {
    const color = props.color ?? defaultArrowColor;
    const lineWidth = props.width ?? 1;
    const dashType = props.dashed ? "dash" : "solid";
    const head = props.head ?? "arrow";
    const tail = props.tail ?? "none";

    // Calculate the midpoint where the bend occurs.
    // For directions like "right-up" where from.x == to.x, add a 0.4" offset
    // so the hook visually clears the boxes before turning.
    const offset = 0.4;
    let midX: number, midY: number;
    switch (props.hookDirection) {
      case "right-down":
        midX = props.to.x; midY = props.from.y;
        break;
      case "right-up":
        // Extend right from source, then turn up to target
        midX = Math.max(props.from.x, props.to.x) + offset;
        midY = props.from.y;
        break;
      case "down-right":
        midX = props.from.x; midY = props.to.y;
        break;
      case "down-left":
        midX = props.from.x; midY = props.to.y;
        break;
      case "up-right":
        midX = props.from.x; midY = props.to.y;
        break;
      case "left-down":
        midX = props.to.x; midY = props.from.y;
        break;
    }

    // pptxgenjs: lineHead = start point, lineTail = end point
    // our API: head = arrowhead at destination (end), tail = arrowhead at source (start)
    if (props.hookDirection === "right-up") {
      // 3-segment U-shaped connector: right → up → left into target
      slide.addShape("line", {
        x: props.from.x, y: props.from.y,
        w: midX - props.from.x, h: 0,
        line: { color, width: lineWidth, dashType },
        lineHead: tail, lineTail: "none",
      });
      slide.addShape("line", {
        x: midX, y: props.to.y,
        w: 0, h: props.from.y - props.to.y,
        line: { color, width: lineWidth, dashType },
        lineHead: "none", lineTail: "none",
      });
      slide.addShape("line", {
        x: props.to.x, y: props.to.y,
        w: midX - props.to.x, h: 0,
        line: { color, width: lineWidth, dashType },
        lineHead: head, lineTail: "none",
      });
    } else {
      // Standard 2-segment L-shaped connector
      slide.addShape("line", {
        x: props.from.x, y: props.from.y,
        w: midX - props.from.x, h: midY - props.from.y,
        line: { color, width: lineWidth, dashType },
        lineHead: tail, lineTail: "none",
      });
      slide.addShape("line", {
        x: midX, y: midY,
        w: props.to.x - midX, h: props.to.y - midY,
        line: { color, width: lineWidth, dashType },
        lineHead: "none", lineTail: head,
      });
    }
  }

  // --- Container — large grouping rectangle with label ---
  function container(slide: PptxGenJS.Slide, props: ContainerProps): ShapeRef {
    const name = `diag-ctr-${shapeCounter++}`;
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h: props.h,
      fill: { color: props.fill ?? "FFFFFF" },
      rectRadius: 0.1,
      line: {
        color: props.border ?? c.textMuted,
        width: 1,
      },
      shadow: {
        type: "outer", blur: 3, offset: 1,
        color: "000000", opacity: 0.08,
      },
      objectName: name,
    } as any);
    if (props.label) {
      slide.addText(props.label, {
        x: props.x, y: props.y - 0.35,
        w: props.w, h: 0.35,
        fontSize: props.fontSize ?? s.body,
        fontFace: f.sans,
        color: props.labelColor ?? c.textSecondary,
        align: "center",
        valign: "bottom",
        italic: true,
      });
    }
    return makeShapeRef(name, props.x, props.y, props.w, props.h);
  }

  return { accentBar, heading, bodyText, bulletList, numberedList, codeBlock, quoteBox, table, caption, calloutBlock, diagramBox, arrow, hookArrow, container };
};
