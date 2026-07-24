import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { determineImportType } from '../../path/import-type';
import { FilePathInfo } from '../../editor/file-path-info';
import { CSS_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'image':
      return buildCssImageImportSnippet(fullPath);
    default:
      return buildCssImportSnippet(fullPath);
  }
}

export function buildCssImportSnippet(relativePath: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(CSS_IMPORT_OPTIONS, getAutoImportSetting<string>('stylesheet', 'css'));
  return buildCssImportSnippetByStyle(styleIndex, relativePath);
}

export function buildCssImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:
      return new vscode.SnippetString(`@import url('${relativePath}');`);
    default:
      return new vscode.SnippetString(`@import '${relativePath}';`);
  }
}

export function buildCssImageImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`url('${relativePath}')`);
}
