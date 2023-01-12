import * as vscode from 'vscode';

import { importStyle } from '../providers';
import { ImportStyle } from '../model';

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getCSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('cssImportStyle');
      configValue = importStyle.css.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
 export function getCSSImageImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('cssImageImportStyle');
      configValue = importStyle.cssImage.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`url('${relativePath}')`);
    default: return new vscode.SnippetString(`url('${relativePath}')`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getSCSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('scssImportStyle');
      configValue = importStyle.scss.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:  return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`@use '${relativePath}'; as $1`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getSCSSImageImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('scssImageImportStyle');
      configValue = importStyle.scssImage.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`url('${relativePath}')`);
    default: return new vscode.SnippetString(`url('${relativePath}')`);
  }

}
