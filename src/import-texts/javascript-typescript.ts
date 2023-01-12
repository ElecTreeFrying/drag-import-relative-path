import * as vscode from 'vscode';

import { importStyle } from '../providers';
import { ImportStyle } from '../model';

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getJavascriptImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.script').get('javascriptImportStyle');
      configValue = importStyle.javascript.find((config: ImportStyle<number>) => config.description === configValue).value;

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
export function getTypescriptImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.script').get('typescriptImportStyle');
      configValue = importStyle.typescript.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:  return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:  return new vscode.SnippetString(`import '${relativePath}';`);
    default: return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }

}
