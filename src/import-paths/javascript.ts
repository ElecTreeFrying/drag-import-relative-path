import * as vscode from 'vscode';

import * as importText from '../import-texts';
import { getFileExt } from '../modules';

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
    const preserve = vscode.workspace.getConfiguration('importStatements.script').get('preserveScriptFileExtension');
    const fileType = preserve ? getFileExt(dragFilePath) : '';
    return importText.getJavascriptImport(relativePath + fileType);
}
