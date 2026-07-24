import * as vscode from 'vscode';

import { FileExtension } from '../../types/file-extension';
import { STYLESHEET_FILE_EXTENSIONS } from '../../constants/extensions';
import { extractFileExtension } from '../../path/extension';
import { FilePathInfo } from '../../editor/file-path-info';
import { getAutoImportSetting } from '../../config/settings';
import { buildTypeScriptImportSnippet } from './typescript';
import { buildCssImportSnippet } from './css';
import { buildScssImportSnippet } from './scss';
import { buildAssetImportStatement } from '../_react';

const SCRIPT_SOURCE_EXTENSIONS: ReadonlyArray<FileExtension> = [ '.ts', '.tsx', '.js', '.jsx' ];

export function buildSnippet(info: FilePathInfo, insideStyleBlock = false): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;

  const sourceFileExt = extractFileExtension(sourceFilePath) as FileExtension;

  if (SCRIPT_SOURCE_EXTENSIONS.includes(sourceFileExt)) {
    const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
    const fileExtension = shouldPreserveExtension ? sourceFileExt : '';
    return buildTypeScriptImportSnippet(relativePath + fileExtension);
  }

  // Inside a `<style>` block, a stylesheet source takes the stylesheet dialect (`@import` / `@use`)
  // rather than the script-block side-effect import. The source extension — not the block's `lang`
  // attribute — picks CSS vs. SCSS shapes. Elsewhere (script block / frontmatter / template) a
  // stylesheet source falls through to the side-effect `import '<path>';` from the asset switch.
  if (insideStyleBlock && STYLESHEET_FILE_EXTENSIONS.includes(sourceFileExt)) {
    return sourceFileExt === '.scss'
      ? buildScssImportSnippet(sourceFilePath, relativePath)
      : buildCssImportSnippet(relativePath + sourceFileExt);
  }

  return new vscode.SnippetString(buildAssetImportStatement(sourceFileExt, relativePath + sourceFileExt) ?? '');
}
