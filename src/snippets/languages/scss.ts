import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { determineImportType } from '../../path/import-type';
import { FilePathInfo } from '../../editor/file-path-info';
import { SCSS_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';
import { buildCssImageImportSnippet } from './css';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return buildCssImageImportSnippet(relativePath + extractFileExtension(sourceFilePath));
    default:
      return buildScssImportSnippet(sourceFilePath, relativePath);
  }
}

/**
 * Config wrapper for the SCSS `@use`/`@import` shapes: prepares the import path (partial-underscore
 * stripping + extension policy via `prepareScssImportPath`), resolves the user's `scssImportStyle`,
 * and renders through `buildScssImportSnippetByStyle`. Mirrors `css.ts:buildCssImportSnippet`; reused
 * by `languages/framework-component.ts` for a `.scss` source dropped inside an SFC `<style>` block.
 */
export function buildScssImportSnippet(sourceFilePath: string, relativePath: string): vscode.SnippetString {
  const preparedPath = prepareScssImportPath(sourceFilePath, relativePath);
  const styleIndex = resolveStyleIndex(SCSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'scss'));
  return buildScssImportSnippetByStyle(styleIndex, preparedPath);
}

export function buildScssImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`@use '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@use '${relativePath}' as \${1:*};`);
    case 2:
      return new vscode.SnippetString(`@use '${relativePath}' as $1;`);
    case 3:
      return new vscode.SnippetString(`@forward '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    default:
      return new vscode.SnippetString(`@use '${relativePath}';`);
  }
}

export function prepareScssImportPath(sourceFilePath: string, relativePath: string): string {
  return normalizePartialFilename(relativePath + determineScssExtension(sourceFilePath));
}

function determineScssExtension(sourceFilePath: string): string {
  if (extractFileExtension(sourceFilePath) === '.css') {
    return extractFileExtension(sourceFilePath);
  }
  const shouldPreserveExtension = getAutoImportSetting('stylesheet', 'preserve');
  return shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';
}

function normalizePartialFilename(relativePath: string): string {
  const segments = relativePath.split('/');
  const lastIndex = segments.length - 1;
  if (segments[lastIndex].startsWith('_')) {
    segments[lastIndex] = segments[lastIndex].substring(1);
  }
  return segments.join('/');
}
