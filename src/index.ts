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
} from "./types.js";

export type { Theme } from "./types.js";

export class Deck {
  private pres: PptxGenJS;
  private theme: Theme;
  private boundComponents: ReturnType<Theme["createComponents"]>;

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
    return this;
  }

  /** Section divider with warm accent background. */
  section(props: SectionLayoutProps): this {
    this.theme.layouts.section(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Standard content slide with heading + bullet list. */
  content(props: ContentLayoutProps): this {
    this.theme.layouts.content(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Two-column comparison slide. */
  twoColumn(props: TwoColumnLayoutProps): this {
    this.theme.layouts.twoColumn(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Code slide with dark code panel. */
  code(props: CodeLayoutProps): this {
    this.theme.layouts.code(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Large quote with attribution. */
  quote(props: QuoteLayoutProps): this {
    this.theme.layouts.quote(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Image slide with title and caption. */
  image(props: ImageLayoutProps): this {
    this.theme.layouts.image(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Table slide with themed headers. */
  table(props: TableLayoutProps): this {
    this.theme.layouts.table(this.pres, this.theme.config, this.boundComponents, props);
    return this;
  }

  /** Empty slide for custom content. Returns the raw pptxgenjs slide. */
  blank(props?: BlankLayoutProps): PptxGenJS.Slide {
    const slide = this.pres.addSlide();
    this.theme.layouts.blank(this.pres, this.theme.config, this.boundComponents, props ?? {});
    return slide;
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
    this.patchThemeFonts(path);
  }

  /**
   * Post-process the PPTX to replace pptxgenjs's hardcoded international
   * fallback fonts (Arial, Times New Roman, etc.) with our theme fonts.
   * This prevents "missing font" dialogs in Keynote/PowerPoint on macOS.
   */
  private patchThemeFonts(pptxPath: string): void {
    const { heading, sans } = this.theme.config.fonts;

    const tmp = mkdtempSync(join(tmpdir(), "vibeslides-"));
    try {
      // Unzip
      execSync(`unzip -q -o "${pptxPath}" -d "${tmp}"`);

      // Patch theme XML — replace all international fallback fonts
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

      // Patch slide master — replace Arial bullet fonts with our sans
      const masterPath = join(tmp, "ppt", "slideMasters", "slideMaster1.xml");
      let masterXml = readFileSync(masterPath, "utf-8");
      masterXml = masterXml.replace(
        /typeface="Arial"/g,
        `typeface="${sans}"`
      );
      writeFileSync(masterPath, masterXml, "utf-8");

      // Repack zip
      execSync(`cd "${tmp}" && zip -q -r "${pptxPath}" .`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
}
