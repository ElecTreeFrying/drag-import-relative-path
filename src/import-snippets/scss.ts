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
    case 'image':  return importStatement.cssImageImportStatement(relativePath + getFileExt(fromFilepath));
    default:       return importStatement.scssImportStatement(relativePath + getScssFileExt(fromFilepath));
  }
}

/**
 * Get SCSS file extension.
 * @param {string} fromFilepath Dragged file path. 
 * @returns CSS file extension if fromFilepath ext is .css else none
 */
function getScssFileExt(fromFilepath: string): string {
  if (getFileExt(fromFilepath) === '.css') {
    // Auto preserve file extension if file extension is CSS
    return getFileExt(fromFilepath);
  } else {
    const preserve = vscode.workspace.getConfiguration('auto-import.importStatement.styleSheet').get('preserveStylesheetFileExtension');
    return preserve ? getFileExt(fromFilepath) : '';
  }
}
