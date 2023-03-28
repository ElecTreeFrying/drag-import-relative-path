import * as vscode from 'vscode';
import * as path from 'path';

import { importStyle } from '../providers';
import { ImportStyle } from '../model';

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function javascriptImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.script').get('javascriptImportStyle');
      configValue = importStyle.javascript.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:  return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:  return new vscode.SnippetString(`import '${relativePath}';`);
    case 5:  return new vscode.SnippetString(`var $1 = require('${relativePath}');`);
    case 6:  return new vscode.SnippetString(`const $1 = require('${relativePath}');`);
    case 7:  return new vscode.SnippetString(`var $1 = import('${relativePath}');`);
    case 8:  return new vscode.SnippetString(`const $1 = import('${relativePath}');`);
    default: return new vscode.SnippetString(`import $1 from '${relativePath}';`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function typescriptImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.script').get('typescriptImportStyle');
      configValue = importStyle.typescript.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`import { ${importName(relativePath)} } from '${relativePath}';`);
    case 2:  return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:  return new vscode.SnippetString(`import '${relativePath}';`);
    default: return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }

}

/**
 * Returns a customized import name if the file is an Angular component.
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import name
 */
function importName(relativePath: string): string {
  if (
    relativePath.includes('.component')
    || relativePath.includes('.directive')
    || relativePath.includes('.pipe')
  ) {
    const snackCase = path.basename(relativePath).replace(/\./g, '-');
    return snackCase.split('-').map(e => e[0].toUpperCase() + e.slice(1)).join('');  
  } else {
    return '$1';
  }
}
