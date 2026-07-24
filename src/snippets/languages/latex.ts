import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { TEX_GRAPHICS_FILE_EXTENSIONS } from '../../constants/extensions';
import { FileExtension } from '../../types/file-extension';
import { FilePathInfo } from '../../editor/file-path-info';
import {
  TEX_BIBLIOGRAPHY_IMPORT_OPTIONS,
  TEX_GRAPHICS_IMPORT_OPTIONS,
  TEX_INPUT_IMPORT_OPTIONS,
  resolveStyleIndex,
} from '../_styles';

/**
 * Builds the import snippet for a `.tex` destination, branching on the raw source extension:
 * graphics (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps`) → `figure`/`\includegraphics`, `.tex` → `\input`/`\include`,
 * `.bib` → `\addbibresource`/`\bibliography`. LaTeX graphics formats do not match the web `ImportType`
 * classifier, so this builder dispatches on the extension directly (like `../_react.ts`) rather than
 * via `determineImportType`.
 */
export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  const { sourceFileExt, relativePath } = info;

  if (isTexGraphicsSource(sourceFileExt)) {
    const styleIndex = resolveStyleIndex(TEX_GRAPHICS_IMPORT_OPTIONS, getAutoImportSetting<string>('latex', 'graphics'));
    return buildTexGraphicsImportSnippetByStyle(styleIndex, resolveGraphicsPath(relativePath, sourceFileExt));
  }
  if (sourceFileExt === '.tex') {
    const styleIndex = resolveStyleIndex(TEX_INPUT_IMPORT_OPTIONS, getAutoImportSetting<string>('latex', 'input'));
    return buildTexInputImportSnippetByStyle(styleIndex, relativePath);
  }
  if (sourceFileExt === '.bib') {
    const styleIndex = resolveStyleIndex(TEX_BIBLIOGRAPHY_IMPORT_OPTIONS, getAutoImportSetting<string>('latex', 'bibliography'));
    return buildTexBibliographyImportSnippetByStyle(styleIndex, relativePath, sourceFileExt);
  }
  return new vscode.SnippetString('');
}

/** Returns `true` when the source extension is a LaTeX-renderable graphics format. */
export function isTexGraphicsSource(sourceFileExt: FileExtension): boolean {
  return TEX_GRAPHICS_FILE_EXTENSIONS.includes(sourceFileExt);
}

/**
 * Appends the source extension to the graphics path unless the user opted to drop it via
 * `preserveGraphicsFileExtension`. Unlike `\input` (which always drops `.tex`), graphics keep the
 * extension by default — it is unambiguous and matches the dropped file.
 */
export function resolveGraphicsPath(relativePath: string, sourceFileExt: FileExtension): string {
  const preserve = getAutoImportSetting<boolean>('latex', 'preserve');
  return relativePath + (preserve ? sourceFileExt : '');
}

/** Renders a graphics source as a `figure` float (default), a sized `\includegraphics`, or a bare one. */
export function buildTexGraphicsImportSnippetByStyle(
  styleIndex: number | undefined,
  graphicsPath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(buildFigureSnippet(graphicsPath));
    case 1:
      return new vscode.SnippetString(`\\includegraphics[width=\${1:0.5}\\textwidth]{${graphicsPath}}`);
    case 2:
      return new vscode.SnippetString(`\\includegraphics{${graphicsPath}}`);
    default:
      return new vscode.SnippetString(buildFigureSnippet(graphicsPath));
  }
}

/** The full `figure` float — `[htbp]`, `\centering`, sized graphic, then `\caption` before `\label` (so `\ref` numbers correctly). */
function buildFigureSnippet(graphicsPath: string): string {
  return [
    '\\begin{figure}[htbp]',
    '    \\centering',
    `    \\includegraphics[width=0.5\\textwidth]{${graphicsPath}}`,
    '    \\caption{${1:caption}}',
    '    \\label{fig:${2:label}}',
    '\\end{figure}',
  ].join('\n');
}

/** Renders a `.tex` source as `\input` (default) or `\include`. The `.tex` extension is omitted (`\include` requires it omitted). */
export function buildTexInputImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`\\input{${relativePath}}`);
    case 1:
      return new vscode.SnippetString(`\\include{${relativePath}}`);
    default:
      return new vscode.SnippetString(`\\input{${relativePath}}`);
  }
}

/**
 * Renders a `.bib` source as `\addbibresource` (biblatex, default — keeps `.bib`) or `\bibliography`
 * (BibTeX — drops `.bib`). Takes the extensionless path plus the extension so each style can decide
 * whether to append it.
 */
export function buildTexBibliographyImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
  sourceFileExt: FileExtension,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`\\addbibresource{${relativePath}${sourceFileExt}}`);
    case 1:
      return new vscode.SnippetString(`\\bibliography{${relativePath}}`);
    default:
      return new vscode.SnippetString(`\\addbibresource{${relativePath}${sourceFileExt}}`);
  }
}
