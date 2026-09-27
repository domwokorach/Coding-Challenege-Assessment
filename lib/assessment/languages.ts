/**
 * Candidate-facing language catalog for the coding assessment editor.
 *
 * The assessment's only code-execution path is client-side JavaScript (see
 * `CHALLENGE_LANGUAGE` / `extractFunction` in `lib/challenges.ts` — every
 * challenge's starter code, tests, and `new Function(...)` evaluation are
 * JS-specific). There is no multi-language sandbox/judge backend behind
 * this app, so every other language listed here is a real, named option in
 * the selector but is marked `executable: false` and rendered disabled —
 * it must never look selectable and then fail after Run/Submit.
 *
 * `id` is the application identifier (kept stable for progress storage);
 * `runtimeId` is what a real execution backend would need to receive if
 * one is introduced later. Today only `javascript`'s `runtimeId` is ever
 * used, and it maps to the existing in-browser evaluator, not a REST call.
 */
export type LanguageOption = {
  id: string;
  label: string;
  runtimeId: string;
  executable: boolean;
  /** Editor/file-explorer filename shown for this language, e.g. "solution.py". */
  fileName: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: "c", label: "C", runtimeId: "c", executable: false, fileName: "solution.c" },
  { id: "cpp", label: "C++", runtimeId: "cpp", executable: false, fileName: "solution.cpp" },
  { id: "csharp", label: "C#", runtimeId: "csharp", executable: false, fileName: "Solution.cs" },
  { id: "go", label: "Go", runtimeId: "go", executable: false, fileName: "solution.go" },
  { id: "java21", label: "Java 21", runtimeId: "java-21", executable: false, fileName: "Solution.java" },
  { id: "java11", label: "Java 11", runtimeId: "java-11", executable: false, fileName: "Solution.java" },
  { id: "javascript", label: "JavaScript", runtimeId: "javascript", executable: true, fileName: "solution.js" },
  { id: "kotlin", label: "Kotlin", runtimeId: "kotlin", executable: false, fileName: "solution.kt" },
  { id: "lua", label: "Lua", runtimeId: "lua", executable: false, fileName: "solution.lua" },
  { id: "objective-c", label: "Objective-C", runtimeId: "objective-c", executable: false, fileName: "solution.m" },
  { id: "pascal", label: "Pascal", runtimeId: "pascal", executable: false, fileName: "solution.pas" },
  { id: "php", label: "PHP", runtimeId: "php", executable: false, fileName: "solution.php" },
  { id: "perl", label: "Perl", runtimeId: "perl", executable: false, fileName: "solution.pl" },
  { id: "python", label: "Python", runtimeId: "python", executable: false, fileName: "solution.py" },
  { id: "ruby", label: "Ruby", runtimeId: "ruby", executable: false, fileName: "solution.rb" },
  { id: "scala", label: "Scala", runtimeId: "scala", executable: false, fileName: "solution.scala" },
  { id: "swift", label: "Swift", runtimeId: "swift", executable: false, fileName: "solution.swift" },
  { id: "typescript", label: "TypeScript", runtimeId: "typescript", executable: false, fileName: "solution.ts" },
  { id: "visual-basic", label: "Visual Basic", runtimeId: "visual-basic", executable: false, fileName: "solution.vb" },
];

export const DEFAULT_LANGUAGE_ID = "javascript";

export function getLanguageOption(id: string): LanguageOption | undefined {
  return LANGUAGE_OPTIONS.find((option) => option.id === id);
}

export function isExecutableLanguageId(id: string): boolean {
  return getLanguageOption(id)?.executable ?? false;
}

/** Filename shown in the file explorer/editor tab for a given language id. */
export function getFileNameForLanguage(id: string): string {
  return getLanguageOption(id)?.fileName ?? "solution.js";
}
