import * as vscode from 'vscode';

import * as configList from '../providers/config-list';
import { ConfigItem } from '../model';

/**
 * Returns Javascript/Javascript React SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns Javascript/Javascript React SnippetString import style.
 */
export function getJavascriptImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.script').get('javascriptImportStyle');
      configValue = configList.javascript.find((config: ConfigItem<number>) => config.description === configValue).value;

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
 * Returns Typescript/Typescript React SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns Typescript/Typescript React SnippetString import style.
 */
export function getTypescriptImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.script').get('typescriptImportStyle');
      configValue = configList.typescript.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`import $1 from '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
    case 2:  return new vscode.SnippetString(`import { $1 as $2 } from '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`import * as $1 from '${relativePath}';`);
    case 4:  return new vscode.SnippetString(`import '${relativePath}';`);
    default: return new vscode.SnippetString(`import { $1 } from '${relativePath}';`);
  }

}
