import * as vscode from 'vscode';

import * as importText from '../import-texts';
import { getFileExt, getImportType } from '../modules';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} dragFilePath File extension of the dragged file. 
 * @param {ImportType} importType Import type
 * @returns Import statement string
 */
export function relativeImport(
  relativePath: string,
  dragFilePath: string
): vscode.SnippetString | string {
  switch (getImportType(dragFilePath)) {
    case 'image':  return importText.getCSSImageImport(relativePath + getFileExt(dragFilePath));
    default:       return importText.getCSSImport(relativePath + getFileExt(dragFilePath));
  }
}
