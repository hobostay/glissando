/**
 * Core types for VibeSlides.
 *
 * Theme = Config + Components + Layouts
 *   - Config:     colors, fonts, sizes, spacing
 *   - Components: pre-designed visual elements (code block, bullet list, etc.)
 *   - Layouts:    pre-designed slide arrangements that compose components
 */

import type PptxGenJS from "pptxgenjs";

// ---------------------------------------------------------------------------
// Theme config
// ---------------------------------------------------------------------------

export interface ThemeColors {
  bgPrimary: string;      // Main slide background (white)
  bgDark: string;         // Dark slide background (near-black)
  bgAccent: string;       // Warm accent background (off-white)
  bgCard: string;         // Card/panel background

  text: string;           // Primary text
  textSecondary: string;  // Secondary text
  textMuted: string;      // Muted/caption text
  textOnDark: string;     // Text on dark backgrounds
  textOnDarkMuted: string;// Muted text on dark backgrounds

  accent: string;         // Brand accent color
  accentBlue: string;     // Secondary accent

  codeBg: string;         // Code block background
  codeText: string;       // Code block text
}

export interface ThemeFonts {
  heading: string;  // Tiempos Headline — slide titles, section headings
  sans: string;     // Styrene A — body text, bullets, UI elements
  serif: string;    // Tiempos Text — quotes, emphasis
  mono: string;     // JetBrains Mono — code blocks
}

export interface ThemeSizes {
  title: number;          // Title slide heading (pt)
  subtitle: number;       // Title slide subtitle (pt)
  sectionTitle: number;   // Section divider heading (pt)
  heading: number;        // Content slide heading (pt)
  body: number;           // Body text / bullets (pt)
  small: number;          // Small annotations (pt)
  code: number;           // Code text (pt)
  caption: number;        // Image captions (pt)
}

export interface ThemeSpacing {
  marginLeft: number;     // inches from left edge
  marginRight: number;    // inches from right edge
  marginTop: number;      // inches from top edge
  marginBottom: number;   // inches from bottom edge
  slideWidth: number;     // inches
  slideHeight: number;    // inches
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  sizes: ThemeSizes;
  spacing: ThemeSpacing;
}

// ---------------------------------------------------------------------------
// Component props — what you pass to each pre-designed component
// ---------------------------------------------------------------------------

export interface AccentBarProps {
  x: number;
  y: number;
  w?: number;     // default ~2 inches
  h?: number;     // default thin (0.04)
}

export interface HeadingProps {
  text: string;
  x: number;
  y: number;
  w: number;
  color?: string;
  fontSize?: number;
}

export interface BodyTextProps {
  text: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  color?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFace?: string;
}

export interface BulletListProps {
  items: string[];
  x: number;
  y: number;
  w: number;
  h?: number;
  fontSize?: number;
}

export interface NumberedListProps {
  items: string[];
  x: number;
  y: number;
  w: number;
  h?: number;
  fontSize?: number;
}

export interface CodeBlockProps {
  code: string;
  x: number;
  y: number;
  w: number;
  h: number;
  language?: string;
}

export interface QuoteBoxProps {
  quote: string;
  attribution?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
  x: number;
  y: number;
  w: number;
}

export interface CaptionProps {
  text: string;
  x: number;
  y: number;
  w: number;
}

// ---------------------------------------------------------------------------
// Components — functions that render elements onto a slide
// ---------------------------------------------------------------------------

export interface ThemeComponents {
  accentBar: (slide: PptxGenJS.Slide, props: AccentBarProps) => void;
  heading: (slide: PptxGenJS.Slide, props: HeadingProps) => void;
  bodyText: (slide: PptxGenJS.Slide, props: BodyTextProps) => void;
  bulletList: (slide: PptxGenJS.Slide, props: BulletListProps) => void;
  numberedList: (slide: PptxGenJS.Slide, props: NumberedListProps) => void;
  codeBlock: (slide: PptxGenJS.Slide, props: CodeBlockProps) => void;
  quoteBox: (slide: PptxGenJS.Slide, props: QuoteBoxProps) => void;
  table: (slide: PptxGenJS.Slide, props: TableProps) => void;
  caption: (slide: PptxGenJS.Slide, props: CaptionProps) => void;
}

// ---------------------------------------------------------------------------
// Layout props — what the user passes to each slide type
// ---------------------------------------------------------------------------

export interface TitleLayoutProps {
  title: string;
  subtitle?: string;
}

export interface SectionLayoutProps {
  title: string;
  subtitle?: string;
}

export interface ContentLayoutProps {
  title: string;
  subtitle?: string;
  bullets: string[];
}

export interface TwoColumnLayoutProps {
  title: string;
  leftTitle?: string;
  rightTitle?: string;
  left: string[];
  right: string[];
}

export interface CodeLayoutProps {
  title: string;
  code: string;
  language?: string;
}

export interface QuoteLayoutProps {
  quote: string;
  attribution?: string;
}

export interface ImageLayoutProps {
  title: string;
  imagePath: string;
  caption?: string;
}

export interface TableLayoutProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface BlankLayoutProps {
  bg?: "primary" | "dark" | "accent";
}

// ---------------------------------------------------------------------------
// Layouts — functions that create a full slide using components
// ---------------------------------------------------------------------------

export interface ThemeLayouts {
  title: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TitleLayoutProps) => void;
  section: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: SectionLayoutProps) => void;
  content: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: ContentLayoutProps) => void;
  twoColumn: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TwoColumnLayoutProps) => void;
  code: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: CodeLayoutProps) => void;
  quote: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: QuoteLayoutProps) => void;
  image: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: ImageLayoutProps) => void;
  table: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: TableLayoutProps) => void;
  blank: (pres: PptxGenJS, config: ThemeConfig, components: ThemeComponents, props: BlankLayoutProps) => void;
}

// ---------------------------------------------------------------------------
// Theme — the full package
// ---------------------------------------------------------------------------

/** Factory that creates components bound to a specific config. */
export type ComponentFactory = (config: ThemeConfig) => ThemeComponents;

export interface Theme {
  config: ThemeConfig;
  createComponents: ComponentFactory;
  layouts: ThemeLayouts;
}
