import * as vscode from 'vscode';

import { importStatement } from '../import-statements';
import { getFileExt, getImportType } from '../utilities';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} fromFilepath File extension of the dragged file. 
 * @param {ImportType} importType Import type
 * @returns Import statement string
 */
export function snippet(
  relativePath: string,
  fromFilepath: string
): vscode.SnippetString {
  switch (getImportType(fromFilepath)) {
    case 'image':  return importStatement.cssImageImportStatement(relativePath + getFileExt(fromFilepath));
    default:       return importStatement.cssImportStatement(relativePath + getFileExt(fromFilepath));
  }
}
