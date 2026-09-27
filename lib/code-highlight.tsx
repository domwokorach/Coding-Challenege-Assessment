/**
 * Minimal, dependency-free syntax highlighting used both by the live
 * CodeEditor overlay and the Timeline Player's code replay. The app has no
 * highlighting library and no Monaco/CodeMirror editor — this is a small
 * regex tokenizer covering the JS/TS-family and Java/C-family keyword sets
 * (the languages actually offered in the editor's language selector), good
 * enough for editor/replay display rather than full language-aware parsing.
 */

const KEYWORDS = new Set([
  // JS/TS
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "class", "extends",
  "typeof", "instanceof", "in", "of", "try", "catch", "finally", "throw",
  "async", "await", "yield", "import", "export", "from", "default", "this",
  "super", "null", "undefined", "true", "false", "void", "delete", "static",
  "get", "set", "interface", "type", "enum", "implements", "public",
  "private", "protected", "readonly", "as",
  // Java/C-family additions
  "int", "String", "boolean", "double", "float", "long", "char", "byte",
  "short", "package", "throws", "final", "abstract", "synchronized",
  "native", "transient", "volatile", "assert", "package_info",
]);

type TokenType = "comment" | "string" | "keyword" | "number" | "plain";

type Token = { text: string; type: TokenType };

const TOKEN_REGEX =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(line))) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
    }
    const [full, comment, blockComment, string, number, word] = match;
    if (comment || blockComment) {
      tokens.push({ text: full, type: "comment" });
    } else if (string) {
      tokens.push({ text: full, type: "string" });
    } else if (number) {
      tokens.push({ text: full, type: "number" });
    } else if (word) {
      tokens.push({ text: full, type: KEYWORDS.has(word) ? "keyword" : "plain" });
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: "plain" });
  }
  return tokens;
}

const TOKEN_CLASS: Record<TokenType, string> = {
  comment: "text-zinc-500 italic dark:text-zinc-500",
  string: "text-emerald-700 dark:text-emerald-400",
  keyword: "text-violet-700 dark:text-violet-400",
  number: "text-amber-700 dark:text-amber-500",
  plain: "text-zinc-900 dark:text-zinc-100",
};

export function HighlightedLine({ line }: { line: string }) {
  const tokens = tokenizeLine(line);
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={TOKEN_CLASS[token.type]}>
          {token.text}
        </span>
      ))}
      {tokens.length === 0 && "\u00A0"}
    </>
  );
}
