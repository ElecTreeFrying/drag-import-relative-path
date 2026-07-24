import * as vscode from 'vscode';

/**
 * The 13 destinations the drop provider registers for (`scheme: 'file'` only). Eleven are matched by
 * VS Code language ID; `.mdx` and `.tex` are matched by file pattern, since neither has a guaranteed
 * language ID (VS Code ships no LaTeX language, and a `.tex` file opens as plaintext when no LaTeX
 * extension is installed).
 */
export const DROP_LANGUAGE_SELECTORS: vscode.DocumentSelector = [
  { language: 'javascript', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'typescript', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },
  { language: 'css', scheme: 'file' },
  { language: 'scss', scheme: 'file' },
  { language: 'html', scheme: 'file' },
  { language: 'markdown', scheme: 'file' },
  { language: 'vue', scheme: 'file' },
  { language: 'svelte', scheme: 'file' },
  { language: 'astro', scheme: 'file' },
  // `.mdx` has no built-in or ecosystem-guaranteed language ID (VS Code ships none; we contribute none),
  // so a `.mdx` file may open as plaintext — a `{ language: 'mdx' }` selector would miss it and the drop
  // would fall back to VS Code's raw-path insert. Match it by file pattern so the drop fires regardless
  // of language, the same way the paste commands key off `path.extname`. See src/drop/CLAUDE.md.
  { pattern: '**/*.mdx', scheme: 'file' },
  // `.tex` likewise has no built-in VS Code language ID; without a LaTeX extension it opens as plaintext.
  // Match it by file pattern too so the drop fires regardless of language, exactly like `.mdx` above.
  { pattern: '**/*.tex', scheme: 'file' },
];
