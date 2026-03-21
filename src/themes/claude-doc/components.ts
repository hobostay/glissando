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

    // Background panel — with optional border
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h,
      fill: { color: cs.bg },
      rectRadius: cs.borderRadius ?? 0.1,
      line: cs.border
        ? { color: cs.border, width: 1 }
        : { width: 0 },
    });

    // Language label + separator line (terminal title bar)
    if (props.language) {
      slide.addText(props.language, {
        x: props.x + props.w - 1.5, y: props.y + 0.1,
        w: 1.3, h: 0.28,
        fontSize: s.small - 2,
        fontFace: f.mono,
        color: cs.label,
        align: "right",
      });

      // Horizontal rule below the language tag — full width, same as border
      slide.addShape("line", {
        x: props.x,
        y: props.y + 0.4,
        w: props.w,
        h: 0,
        line: { color: cs.border ?? cs.text, width: 0.75 },
      });
    }

    // Syntax-highlighted code
    const codeTop = props.language ? 0.5 : 0.25;
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

      slide.addText(textRows, {
        x: props.x + 0.3, y: props.y + codeTop,
        w: props.w - 0.6, h: h - codeTop - 0.15,
        valign: "top",
        lineSpacingMultiple: 1.4,
      });
    } else {
      // No language — plain monochrome text
      slide.addText(props.code, {
        x: props.x + 0.3, y: props.y + codeTop,
        w: props.w - 0.6, h: h - codeTop - 0.15,
        fontSize: s.code,
        fontFace: f.mono,
        color: cs.text,
        valign: "top",
        lineSpacingMultiple: 1.4,
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

    // Round-cornered rectangle
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h,
      fill: { color: style.bg },
      rectRadius: 0.08,
      line: { color: style.border, width: 1 },
    });

    // Lucide PNG icon (top-left)
    const iconSize = 0.28;
    const iconX = props.x + 0.2;
    const iconY = props.y + 0.18;
    const iconData = await lucideIcon(style.iconName, style.border, 96);
    slide.addImage({
      data: iconData,
      x: iconX, y: iconY,
      w: iconSize, h: iconSize,
    });

    // Content area — to the right of the icon
    const contentX = iconX + iconSize + 0.15;
    const contentW = props.w - (contentX - props.x) - 0.2;
    const contentY = iconY;
    const contentH = h - 0.36;

    // Body text
    if (props.body) {
      slide.addText(props.body, {
        x: contentX, y: contentY,
        w: contentW, h: contentH,
        fontSize: s.small, fontFace: f.sans,
        color: style.textColor,
        valign: "top",
        lineSpacingMultiple: 1.4,
      });
    }

    // Bullet list inside callout
    if (props.bullets) {
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
        x: contentX, y: contentY,
        w: contentW, h: contentH,
        valign: "top",
        lineSpacingMultiple: 1.2,
      });
    }
  }

  return { accentBar, heading, bodyText, bulletList, numberedList, codeBlock, quoteBox, table, caption, calloutBlock };
};
