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
    case 'image':  return importText.getSCSSImageImport(relativePath + getFileExt(dragFilePath));
    default:       return importText.getSCSSImport(relativePath + getScssFileExt(dragFilePath));
  }
}

/**
 * Get SCSS file extension.
 * @param {string} dragFilePath Dragged file path. 
 * @returns CSS file extension if dragFilePath ext is .css else none
 */
function getScssFileExt(dragFilePath: string): string {
  if (getFileExt(dragFilePath) === '.css') {
    // Auto preserve file extension if file extension is CSS
    return getFileExt(dragFilePath);
  } else {
    const preserve = vscode.workspace.getConfiguration('importStatements.styleSheet').get('preserveStylesheetFileExtension');
    return preserve ? getFileExt(dragFilePath) : '';
  }
}
