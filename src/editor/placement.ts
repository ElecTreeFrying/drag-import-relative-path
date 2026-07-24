import { getAutoImportSetting } from '../config/settings';
import { STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';

/** Markers used by Bottom placement to find the last import line. */
export const IMPORT_INDICATORS = [
  'import ', 'require(',
  "@import '", '@import "', '@import url(', "@use '", '@use "',
  "@forward '", '@forward "'
];

/**
 * Returns `true` when `line` bears an import marker in a *code* position — the
 * predicate Bottom placement uses to find the last import line.
 *
 * Line-leading markers (`import`, `@import`, `@use`, `@forward`) must start the
 * trimmed line, so an `import ` substring inside a string literal
 * (`const msg = "you should import this"`) is correctly NOT counted. `require(`
 * is a call expression, not a line-leading keyword (`const fs = require('fs')`),
 * so it is matched anywhere on the line. A `require(` substring inside a string
 * literal stays a residual false positive — far rarer than the prose-`import`
 * case and not removable without full string-literal parsing.
 */
export function isImportLine(line: string): boolean {
  const trimmed = line.trimStart();
  return IMPORT_INDICATORS.some(indicator =>
    indicator === 'require('
      ? line.includes(indicator)
      : trimmed.startsWith(indicator),
  );
}

/**
 * Returns `true` when the line starts with `//`, `/*`, or `*` (after leading whitespace).
 * For Markdown destinations (`isMarkdown`), a leading `*` is treated as content — bullets,
 * `*italic*`, `**bold**`, `***` — not a block-comment continuation.
 */
export function isCommentLine(line: string, isMarkdown = false): boolean {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
    return true;
  }
  return !isMarkdown && trimmed.startsWith('*');
}

/** Extracts leading whitespace (spaces or tabs) from a line. */
export function getLineIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/** Returns the indentation of the first non-empty content line within a bounded block. */
export function detectBlockIndentation(lines: string[], openingLine: number, closingLine: number): string {
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (lines[i].trim().length > 0) {
      return getLineIndentation(lines[i]);
    }
  }
  return '';
}

/**
 * Returns the indentation of the nearest non-blank line to `line` — scanning below first (the
 * structure a dropped import joins), then above — or `''` when every other line is blank. Serves
 * the blank-line-reuse arm of the forced-cursor drop placement, where the reused line carries no
 * meaningful indentation of its own.
 */
export function findNeighborIndentation(lines: string[], line: number): string {
  for (let i = line + 1; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      return getLineIndentation(lines[i]);
    }
  }
  for (let i = line - 1; i >= 0; i--) {
    if (lines[i].trim().length > 0) {
      return getLineIndentation(lines[i]);
    }
  }
  return '';
}

/** Finds the opening and closing `---` fence lines. Returns `null` if fewer than two fences exist. */
export function findAstroFrontmatterBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (openingLine === -1) {
        openingLine = i;
      } else {
        return { openingLine, closingLine: i };
      }
    }
  }
  return null;
}

/**
 * Finds a `<script...>` / `</script>` pair.
 * Preference: `<script setup` > instance `<script` (no `context=`) > any `<script`.
 */
export function findSfcScriptBounds(lines: string[]): { openingLine: number; closingLine: number } | null {
  return findScriptBlock(lines, '<script setup')
    ?? findScriptBlock(lines, '<script', 'context=')
    ?? findScriptBlock(lines, '<script');
}

function findScriptBlock(
  lines: string[],
  openingTag: string,
  excludePattern?: string,
): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (openingLine === -1) {
      if (trimmed.startsWith(openingTag) && (!excludePattern || !trimmed.includes(excludePattern))) {
        openingLine = i;
      }
    } else if (trimmed === '</script>') {
      return { openingLine, closingLine: i };
    }
  }
  return null;
}

/**
 * Finds the `<style…>`…`</style>` block that strictly encloses `cursorLine`, or `null` when the line
 * is outside every style block. A framework SFC may hold several `<style>` blocks (scoped + global,
 * or `lang`-tagged variants), so each is tested in turn: the opening tag matches `startsWith('<style')`
 * (covering `<style scoped>`, `<style lang="scss">`, …) and the close a trimmed `</style>`. Strict
 * insideness (`cursorLine` between the tag lines, never on them) mirrors the SFC-script and
 * Astro-frontmatter within-fence checks.
 */
export function findEnclosingStyleBounds(
  lines: string[],
  cursorLine: number,
): { openingLine: number; closingLine: number } | null {
  let openingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (openingLine === -1) {
      if (trimmed.startsWith('<style')) {
        openingLine = i;
      }
    } else if (trimmed === '</style>') {
      if (cursorLine > openingLine && cursorLine < i) {
        return { openingLine, closingLine: i };
      }
      openingLine = -1;
    }
  }
  return null;
}

/** Finds the insertion line for Bottom placement within a bounded region (Astro frontmatter or SFC script block). */
export function findBottomLineInRange(
  lines: string[],
  openingLine: number,
  closingLine: number,
): { line: number; indentation: string } {
  let insertionLine = openingLine + 1;
  let lastImportIndentation = '';
  for (let i = openingLine + 1; i < closingLine; i++) {
    if (!isCommentLine(lines[i]) && isImportLine(lines[i])) {
      insertionLine = i + 1;
      lastImportIndentation = getLineIndentation(lines[i]);
    }
  }
  const indentation = lastImportIndentation || detectBlockIndentation(lines, openingLine, closingLine);
  return { line: insertionLine, indentation };
}

/** Non-stylesheet source into a stylesheet destination produces an inline `url()` snippet. */
export function isInlineSnippet(sourceFileExt: FileExtension, destinationFileExt: FileExtension): boolean {
  return (
    !STYLESHEET_FILE_EXTENSIONS.includes(sourceFileExt) && STYLESHEET_FILE_EXTENSIONS.includes(destinationFileExt)
  );
}

/** Returns `true` for destinations (`.html`, `.md`, `.tex`) where imports insert at the cursor line. */
export function shouldRepositionCursor(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.html' || destinationFileExt === '.md' || destinationFileExt === '.tex';
}

/** Returns `true` for Markdown destinations (`.md`, `.mdx`) where a leading `*` is content, not a comment. */
export function isMarkdownDestination(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.md' || destinationFileExt === '.mdx';
}

/** Returns `true` for the JSX-family destinations (`.jsx`, `.tsx`, `.mdx`) whose content can carry `{/*` comment spans. */
export function isJsxFamilyDestination(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.jsx' || destinationFileExt === '.tsx' || destinationFileExt === '.mdx';
}

/** Returns `true` for the framework SFC destinations (`.vue`/`.svelte`/`.astro`) that carry `<style>` blocks. */
export function isFrameworkStyleDestination(destinationFileExt: FileExtension): boolean {
  return destinationFileExt === '.vue' || destinationFileExt === '.svelte' || destinationFileExt === '.astro';
}

/**
 * Decides whether a gesture into a framework SFC takes the `<style>`-block stylesheet dialect
 * (`@import` / `@use`) instead of the script-block side-effect import. All three conditions must
 * hold: the destination is a framework SFC, *every* source in the gesture is a stylesheet
 * (`.css`/`.scss`), and the cursor / drop position sits strictly inside a `<style>` block. A mixed
 * selection — any non-stylesheet member — stays script-dialect so the whole stacked block lands in
 * the script region. Pure (no editor read), so the command and drop flows share one detector.
 */
export function isStyleBlockContext(
  documentText: string,
  destinationFileExt: FileExtension,
  sourceFileExts: FileExtension[],
  cursorLine: number,
): boolean {
  if (!isFrameworkStyleDestination(destinationFileExt)) {
    return false;
  }
  if (sourceFileExts.length === 0 || !sourceFileExts.every(ext => STYLESHEET_FILE_EXTENSIONS.includes(ext))) {
    return false;
  }
  return findEnclosingStyleBounds(documentText.split('\n'), cursorLine) !== null;
}

/**
 * Returns the line holding the `{/*` opener when `line` begins inside an unclosed JSX comment
 * span, or `null` otherwise — the state-scanned complement to the prefix-based `isCommentLine`.
 * A span's interior lines carry no comment marker of their own, so only opener/closer tracking
 * can see them.
 *
 * Scans every line above `line`, toggling on the `{/*` opener and the star-slash closer (JSX
 * comments do not nest, so one flag suffices). A span opened and closed above leaves no state, and
 * a line that itself opens a span is not "inside" it — inserting at that line's column 0 already
 * lands above the opener.
 */
export function findJsxCommentSpanStart(lines: string[], line: number): number | null {
  let openLine: number | null = null;
  const end = Math.min(line, lines.length);

  for (let i = 0; i < end; i++) {
    const text = lines[i];
    let index = 0;
    while (index < text.length) {
      if (openLine === null) {
        const open = text.indexOf('{/*', index);
        if (open === -1) {
          break;
        }
        openLine = i;
        index = open + 3;
      } else {
        const close = text.indexOf('*/', index);
        if (close === -1) {
          break;
        }
        openLine = null;
        index = close + 2;
      }
    }
  }

  return openLine;
}

/**
 * Scans upward from a line inside a comment block to find the first line above the block.
 * Returns the original line if it is not a comment. `destinationFileExt` selects the dialect:
 * Markdown destinations keep a leading `*` as content (bullets / emphasis) rather than a block
 * continuation, and the JSX-family destinations additionally hop out of a `{/*` comment span via
 * `findJsxCommentSpanStart` — without which an import would be inserted inside the comment,
 * commented-out and inert. Omit the extension for the block-scoped callers (`<style>`,
 * frontmatter, SFC `<script>`), where neither dialect applies.
 */
export function adjustForCommentBlock(lines: string[], line: number, destinationFileExt?: FileExtension): number {
  const isMarkdown = destinationFileExt !== undefined && isMarkdownDestination(destinationFileExt);

  let target = line;
  if (destinationFileExt !== undefined && isJsxFamilyDestination(destinationFileExt)) {
    const spanStart = findJsxCommentSpanStart(lines, line);
    if (spanStart !== null) {
      target = spanStart;
    }
  }

  if (target === line && (line >= lines.length || !isCommentLine(lines[line], isMarkdown))) {
    return line;
  }

  let start = target;
  while (start > 0 && isCommentLine(lines[start - 1], isMarkdown)) {
    start--;
  }
  return start;
}

function computeBottomLine(lines: string[]): number {
  let insertionLine = 0;
  lines.forEach((lineContent, index) => {
    if (!isCommentLine(lineContent) && isImportLine(lineContent)) {
      insertionLine = index + 1;
    }
  });
  return insertionLine;
}

export interface ComputedPlacement {
  line: number;
  column: number;
  indentation: string;
  isInline: boolean;
  wrapperPrefix?: string;
  wrapperSuffix?: string;
  /**
   * When set, the drop reuses the whitespace-only target line instead of inserting above it: the
   * provider replaces the line's content (columns 0..this value) with the block, trailing newline
   * stripped, so no stray blank line is left behind. Set only by the forced-cursor branch.
   */
  replaceLineEndColumn?: number;
}

/** Computes the proper insertion position for an import without touching the editor. */
export function computeImportPlacement(
  documentText: string,
  destinationFileExt: FileExtension,
  sourceFileExt: FileExtension,
  dropLine: number,
  dropColumn: number,
  insideStyleBlock = false,
): ComputedPlacement {
  const lines = documentText.split('\n');

  if (isInlineSnippet(sourceFileExt, destinationFileExt)) {
    return { line: dropLine, column: dropColumn, indentation: '', isInline: true };
  }

  if (shouldRepositionCursor(destinationFileExt)) {
    const adjustedLine = adjustForCommentBlock(lines, dropLine, destinationFileExt);
    // The \r a CRLF document leaves after the \n split is stripped, so the reuse range end
    // matches the line's real content length (the editor's line text excludes the EOL).
    const lineText = (lines[adjustedLine] ?? '').replace(/\r$/, '');
    // A drop column is where the mouse button came up, not intent: the import takes its own line.
    // A whitespace-only target line is reused outright (no stray blank left below it); a content
    // line keeps its own indent column, so the import lands as its sibling and the displaced line
    // is re-indented by snippet whitespace normalization. The command flow deliberately differs —
    // insert-snippet.ts:determineInsertionColumn keeps the caret column for these destinations.
    if (lineText.trim().length === 0) {
      return {
        line: adjustedLine,
        column: 0,
        indentation: findNeighborIndentation(lines, adjustedLine),
        isInline: false,
        replaceLineEndColumn: lineText.length,
      };
    }
    return { line: adjustedLine, column: getLineIndentation(lineText).length, indentation: '', isInline: false };
  }

  if (insideStyleBlock && isFrameworkStyleDestination(destinationFileExt)) {
    const bounds = findEnclosingStyleBounds(lines, dropLine);
    if (bounds) {
      return computeStyleBlockPlacement(lines, dropLine, bounds);
    }
  }

  if (destinationFileExt === '.astro') {
    return computeAstroPlacement(lines, dropLine);
  }

  if (destinationFileExt === '.vue' || destinationFileExt === '.svelte') {
    return computeSfcPlacement(lines, dropLine);
  }

  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top':
      return { line: 0, column: 0, indentation: '', isInline: false };
    case 'Cursor': {
      const adjustedLine = adjustForCommentBlock(lines, dropLine, destinationFileExt);
      return { line: adjustedLine, column: 0, indentation: '', isInline: false };
    }
    case 'Bottom':
    default: {
      const line = computeBottomLine(lines);
      return { line, column: 0, indentation: '', isInline: false };
    }
  }
}

/**
 * Positions an import within an already-located `<style>` block (bounds enclose `dropLine`). Honors
 * the user's Top / Bottom / Cursor setting inside the block — the same within-region logic as
 * `computeSfcPlacement`, but scoped to the style block rather than the `<script>` pair. Column 0 (the
 * framework destinations sit in `SCRIPT_FILE_EXTENSIONS`); the indentation prefix carries the block's
 * indent.
 */
function computeStyleBlockPlacement(
  lines: string[],
  dropLine: number,
  bounds: { openingLine: number; closingLine: number },
): ComputedPlacement {
  const { openingLine, closingLine } = bounds;
  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      return { line: openingLine + 1, column: 0, indentation, isInline: false };
    }
    case 'Cursor': {
      const adjustedLine = adjustForCommentBlock(lines, dropLine);
      const indentation = getLineIndentation(lines[adjustedLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
      return { line: adjustedLine, column: 0, indentation, isInline: false };
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
  }
}

function computeAstroPlacement(lines: string[], dropLine: number): ComputedPlacement {
  const bounds = findAstroFrontmatterBounds(lines);

  if (!bounds) {
    return { line: 0, column: 0, indentation: '', isInline: false, wrapperPrefix: '---\n', wrapperSuffix: '---\n' };
  }

  const { openingLine, closingLine } = bounds;
  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      return { line: openingLine + 1, column: 0, indentation, isInline: false };
    }
    case 'Cursor': {
      if (dropLine > openingLine && dropLine < closingLine) {
        const adjustedLine = adjustForCommentBlock(lines, dropLine);
        const indentation = getLineIndentation(lines[adjustedLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        return { line: adjustedLine, column: 0, indentation, isInline: false };
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
  }
}

function computeSfcPlacement(lines: string[], dropLine: number): ComputedPlacement {
  const bounds = findSfcScriptBounds(lines);

  if (!bounds) {
    return { line: 0, column: 0, indentation: '', isInline: false, wrapperPrefix: '<script>\n', wrapperSuffix: '</script>\n' };
  }

  const { openingLine, closingLine } = bounds;
  const placement = getAutoImportSetting<string>('preferences', 'placement');

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      return { line: openingLine + 1, column: 0, indentation, isInline: false };
    }
    case 'Cursor': {
      if (dropLine > openingLine && dropLine < closingLine) {
        const adjustedLine = adjustForCommentBlock(lines, dropLine);
        const indentation = getLineIndentation(lines[adjustedLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        return { line: adjustedLine, column: 0, indentation, isInline: false };
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      return { line: bottom.line, column: 0, indentation: bottom.indentation, isInline: false };
    }
  }
}
