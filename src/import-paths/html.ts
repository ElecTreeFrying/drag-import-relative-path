import * as vscode from 'vscode';

import * as importText from '../import-texts';
import { getFileExt, getImportType } from '../modules';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} dragFilePath File extension of the dragged file.
 * @returns Import statement string
 */
export function relativeImport(
  relativePath: string,
  dragFilePath: string
): vscode.SnippetString | string {
  switch (getImportType(dragFilePath)) {
    case 'script':     return importText.getHTMLScriptImport(relativePath + getFileExt(dragFilePath));
    case 'image':      return importText.getHTMLImageImport(relativePath + getFileExt(dragFilePath));
    case 'stylesheet': return importText.getHTMLStylesheetImport(relativePath + getFileExt(dragFilePath));
  }
}
