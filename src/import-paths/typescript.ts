import * as vscode from 'vscode';

import * as importText from '../import-texts';
import { getFileExt } from '../modules';
import { tsxStylesSupported } from '../providers';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} dragFilePath File extension of the active text editor. 
 * @param {string} dropFilePath File extension of the dragged file.
 * @returns Import statement string
 */
export function relativeImport(
  relativePath: string,
  dragFilePath: string,
  dropFilePath: string
): vscode.SnippetString | string {

  const preserve = vscode.workspace.getConfiguration('importStatements.script').get('preserveScriptFileExtension');
  let fileType = preserve ? getFileExt(dragFilePath) : '';

  if (getFileExt(dropFilePath) === '.tsx') {
    const supported = tsxStylesSupported.includes(getFileExt(dragFilePath));
    fileType = supported ? getFileExt(dragFilePath) : fileType;
  }

  return importText.getTypescriptImport(relativePath + fileType);
}
