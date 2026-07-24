import * as vscode from 'vscode';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { deriveImportName, deriveComponentName } from '../path/import-name';
import { FilePathInfo } from '../editor/file-path-info';
import { getAutoImportSetting } from '../config/settings';

export type BuildScriptSnippet = (relativePath: string) => vscode.SnippetString;

export interface ReactImportOptions {
  primaryExtensions: ReadonlyArray<FileExtension>;
  primarySnippet: BuildScriptSnippet;
  fallbackExtensions?: ReadonlyArray<FileExtension>;
  fallbackSnippet?: BuildScriptSnippet;
}

export function buildReactImport(opts: ReactImportOptions, info: FilePathInfo): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';
  const sourceFileExt = extractFileExtension(sourceFilePath) as FileExtension;

  if (opts.primaryExtensions.includes(sourceFileExt)) {
    return opts.primarySnippet(relativePath + fileExtension);
  }
  if (opts.fallbackSnippet && opts.fallbackExtensions?.includes(sourceFileExt)) {
    return opts.fallbackSnippet(relativePath + fileExtension);
  }

  const fullPath = relativePath + extractFileExtension(sourceFilePath);
  return new vscode.SnippetString(buildAssetImportStatement(sourceFileExt, fullPath) ?? '');
}

/**
 * Maps a non-script source to its asset import statement, keyed only on the source
 * extension and an already-assembled import path. Pure and config-free — the caller
 * decides the path — so the same mapping is shared by the paste/drop dispatch builders
 * (`_react.ts`, `languages/framework-component.ts`) and the style-picker variant builder
 * (`variants.ts:buildReactNonScriptVariant`) without re-reading config or doing path math.
 *
 * Shapes: CSS-module sources → a `styles` default import; images/data/docs → a basename-derived
 * named default import; framework SFCs (`.vue`/`.svelte`/`.astro`) → a PascalCase-derived component
 * default import; audio-visual and text-track sources → a basename-derived `url` default import;
 * fonts and plain stylesheets → a side-effect import. Returns `null` for any extension that should
 * never reach here — gating in `src/gating.ts` is responsible for keeping unsupported pairs out, and
 * callers translate `null` into an empty result.
 */
export function buildAssetImportStatement(
  sourceFileExt: FileExtension,
  importPath: string,
): string | null {
  if (importPath.endsWith('.module.css') || importPath.endsWith('.module.scss')) {
    return `import \${1:styles} from '${importPath}';`;
  }

  switch (sourceFileExt) {
    case '.gif':
    case '.jpeg':
    case '.jpg':
    case '.png':
    case '.svg':
    case '.avif':
    case '.webp':
    case '.json':
    case '.html':
    case '.yml':
    case '.yaml':
    case '.pdf':
      return `import ${defaultImportPlaceholder(importPath, 'name')} from '${importPath}';`;
    case '.vue':
    case '.svelte':
    case '.astro':
      // Framework SFCs are referenced by a PascalCase identifier regardless of the on-disk filename
      // (`my-button.vue` → `MyButton`), so the binding is pre-filled via `deriveComponentName` rather
      // than the plain-asset camelCase. Falls back to the generic `name` when no legal identifier forms.
      return `import ${componentImportPlaceholder(importPath)} from '${importPath}';`;
    case '.md':
    case '.mdx':
      // Markdown/MDX default-imported as a component (into a framework destination) also reads as
      // PascalCase, but the shipped PascalCase pathway is scoped to framework SFCs — Markdown naming
      // stays generic (neither camelCased like a plain asset nor PascalCased like an SFC). See
      // import-statement-design/framework-components.md (locked-in decision #14).
      return `import \${1:name} from '${importPath}';`;
    case '.mp4':
    case '.webm':
    case '.mov':
    case '.mp3':
    case '.ogg':
    case '.wav':
    case '.m4a':
    case '.vtt':
      return `import ${defaultImportPlaceholder(importPath, 'url')} from '${importPath}';`;
    case '.woff':
    case '.woff2':
    case '.ttf':
    case '.eot':
    case '.css':
    case '.scss':
      return `import '${importPath}';`;
    default:
      return null;
  }
}

/**
 * Builds the `${1:…}` default-import placeholder for an asset, pre-filling it with an identifier
 * derived from the source basename (`deriveImportName`) when one can be formed, and falling back to
 * the generic `fallback` label (`name` / `url`) otherwise. The pre-filled tab stop arrives selected,
 * so type-over behaviour is identical to a bare placeholder — strictly a nicety.
 */
function defaultImportPlaceholder(importPath: string, fallback: string): string {
  const derived = deriveImportName(importPath);
  return `\${1:${derived ?? fallback}}`;
}

/**
 * Builds the `${1:…}` default-import placeholder for a framework SFC, pre-filling it with the
 * PascalCase component identifier derived from the source basename (`deriveComponentName`), and
 * falling back to the generic `name` label when no legal identifier can be formed.
 */
function componentImportPlaceholder(importPath: string): string {
  const derived = deriveComponentName(importPath);
  return `\${1:${derived ?? 'name'}}`;
}
