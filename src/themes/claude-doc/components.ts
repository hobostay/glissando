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
} from "../../types.js";

export const createComponents: ComponentFactory = (cfg: ThemeConfig): ThemeComponents => {
  const { colors: c, fonts: f, sizes: s } = cfg;

  // --- Accent bar ---
  function accentBar(slide: PptxGenJS.Slide, props: AccentBarProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y,
      w: props.w ?? 2, h: props.h ?? 0.04,
      fill: { color: c.accent },
      line: { width: 0 },
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

  // --- Code block ---
  function codeBlock(slide: PptxGenJS.Slide, props: CodeBlockProps): void {
    slide.addShape("roundRect", {
      x: props.x, y: props.y, w: props.w, h: props.h,
      fill: { color: c.codeBg },
      rectRadius: 0.1,
      line: { width: 0 },
    });
    if (props.language) {
      slide.addText(props.language, {
        x: props.x + props.w - 1.5, y: props.y + 0.12,
        w: 1.3, h: 0.3,
        fontSize: s.small - 2,
        fontFace: f.mono,
        color: "5C6370",
        align: "right",
      });
    }
    const codeTop = props.language ? 0.35 : 0.25;
    slide.addText(props.code, {
      x: props.x + 0.3, y: props.y + codeTop,
      w: props.w - 0.6, h: props.h - codeTop - 0.25,
      fontSize: s.code,
      fontFace: f.mono,
      color: c.codeText,
      valign: "top",
      lineSpacingMultiple: 1.4,
    });
  }

  // --- Quote box ---
  function quoteBox(slide: PptxGenJS.Slide, props: QuoteBoxProps): void {
    slide.addShape("rect", {
      x: props.x, y: props.y, w: 0.06, h: props.h,
      fill: { color: c.accent },
      line: { width: 0 },
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

  return { accentBar, heading, bodyText, bulletList, numberedList, codeBlock, quoteBox, table, caption };
};
