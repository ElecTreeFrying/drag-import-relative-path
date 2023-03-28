import * as vscode from 'vscode';

import { importStatement } from '../import-statements';
import { getFileExt, getImportType } from '../utilities';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} fromFilepath File extension of the dragged file. 
 * @returns Import statement string
 */
export function snippet(
  relativePath: string,
  fromFilepath: string
): vscode.SnippetString {
  switch (getImportType(fromFilepath)) {
    case 'markdown': return importStatement.markdownImportStatement(relativePath + getFileExt(fromFilepath));
    case 'image':    return importStatement.markdownImageImportStatement(relativePath + getFileExt(fromFilepath));
  }
}
