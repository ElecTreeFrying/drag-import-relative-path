import * as vscode from 'vscode';

import { importStatement } from '../import-statements';
import { getFileExt } from '../utilities';

/**
 * Returns the import statement
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @param {string} fromFilepath File extension of the active text editor. 
 * @param {string} toFilepath File extension of the dragged file.
 * @returns Import statement string
 */
export function snippet(
  relativePath: string,
  fromFilepath: string
): vscode.SnippetString {
  const preserve = vscode.workspace.getConfiguration('auto-import.importStatement.script').get('preserveScriptFileExtension');
  let fileType = preserve ? getFileExt(fromFilepath) : '';
  return importStatement.typescriptImportStatement(relativePath + fileType);
}
