/**
 * Simple syntax highlighter for slide code blocks.
 *
 * Produces an array of colored tokens from source code.
 * Not a full parser — handles keywords, strings, comments, numbers.
 */

import type { CodeStyle } from "./types.js";

export interface Token {
  text: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Language keyword sets
// ---------------------------------------------------------------------------

const KEYWORDS: Record<string, Set<string>> = {
  python: new Set([
    "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "finally", "for", "from",
    "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
    "or", "pass", "raise", "return", "try", "while", "with", "yield",
    "True", "False", "None",
  ]),
  typescript: new Set([
    "abstract", "as", "async", "await", "break", "case", "catch", "class",
    "const", "continue", "debugger", "default", "delete", "do", "else",
    "enum", "export", "extends", "false", "finally", "for", "from",
    "function", "if", "implements", "import", "in", "instanceof", "interface",
    "let", "new", "null", "of", "package", "private", "protected", "public",
    "return", "static", "super", "switch", "this", "throw", "true", "try",
    "type", "typeof", "undefined", "var", "void", "while", "yield",
  ]),
  javascript: new Set([
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends",
    "false", "finally", "for", "from", "function", "if", "import", "in",
    "instanceof", "let", "new", "null", "of", "return", "static", "super",
    "switch", "this", "throw", "true", "try", "typeof", "undefined", "var",
    "void", "while", "yield",
  ]),
  rust: new Set([
    "as", "async", "await", "break", "const", "continue", "crate", "dyn",
    "else", "enum", "extern", "false", "fn", "for", "if", "impl", "in",
    "let", "loop", "match", "mod", "move", "mut", "pub", "ref", "return",
    "self", "Self", "static", "struct", "super", "trait", "true", "type",
    "unsafe", "use", "where", "while",
  ]),
  go: new Set([
    "break", "case", "chan", "const", "continue", "default", "defer", "else",
    "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
    "map", "package", "range", "return", "select", "struct", "switch", "type",
    "var", "true", "false", "nil",
  ]),
  bash: new Set([
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done",
    "case", "esac", "in", "function", "return", "exit", "local", "export",
    "source", "echo", "read", "set", "unset", "true", "false",
  ]),
};

// Alias common names
KEYWORDS["ts"] = KEYWORDS["typescript"];
KEYWORDS["js"] = KEYWORDS["javascript"];
KEYWORDS["py"] = KEYWORDS["python"];
KEYWORDS["sh"] = KEYWORDS["bash"];
KEYWORDS["shell"] = KEYWORDS["bash"];

// Comment prefix per language
const COMMENT_PREFIX: Record<string, string> = {
  python: "#",
  bash: "#",
  sh: "#",
  py: "#",
  shell: "#",
};
// Default is "//" for all others

/**
 * Tokenize a single line of code into colored segments.
 */
function tokenizeLine(line: string, lang: string, style: CodeStyle): Token[] {
  const tokens: Token[] = [];
  const keywords = KEYWORDS[lang] ?? new Set();
  const commentChar = COMMENT_PREFIX[lang] ?? "//";
  let i = 0;

  function push(text: string, color: string) {
    if (text) tokens.push({ text, color });
  }

  while (i < line.length) {
    // --- Comment (rest of line) ---
    if (line.startsWith(commentChar, i)) {
      push(line.slice(i), style.comment);
      return tokens;
    }

    // --- String literal ---
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === "\\") j++; // skip escaped char
        j++;
      }
      j++; // include closing quote
      push(line.slice(i, j), style.string);
      i = j;
      continue;
    }

    // --- Number ---
    if (/[0-9]/.test(line[i]) && (i === 0 || /[\s(,=:+\-*/<>[\]{}]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9.xXa-fA-F_]/.test(line[j])) j++;
      push(line.slice(i, j), style.number);
      i = j;
      continue;
    }

    // --- Word (keyword, function, or identifier) ---
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);

      if (keywords.has(word)) {
        push(word, style.keyword);
      } else if (j < line.length && line[j] === "(") {
        push(word, style.function);
      } else {
        push(word, style.text);
      }
      i = j;
      continue;
    }

    // --- Operator / punctuation ---
    if (/[=+\-*/<>!&|^~%?:;,.()\[\]{}@]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[=+\-*/<>!&|^~%?]/.test(line[j])) j++;
      if (j === i) j++; // single punctuation char
      push(line.slice(i, j), style.operator);
      i = j;
      continue;
    }

    // --- Whitespace or other ---
    push(line[i], style.text);
    i++;
  }

  return tokens;
}

/**
 * Tokenize a full code block into lines of colored tokens.
 * Each line is an array of Token objects.
 */
export function highlightCode(code: string, language: string, style: CodeStyle): Token[][] {
  const lang = language.toLowerCase();
  return code.split("\n").map((line) =>
    line.length === 0 ? [{ text: " ", color: style.text }] : tokenizeLine(line, lang, style)
  );
}
