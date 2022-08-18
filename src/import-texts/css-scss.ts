import * as vscode from 'vscode';

import * as configList from '../providers/config-list';
import { ConfigItem } from '../model';

/**
 * Returns CSS SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns CSS SnippetString SnippetString import style.
 */
export function getCSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('cssImportStyle');
      configValue = configList.css.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

/**
 * Returns CSS image SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns CSS SnippetString SnippetString import style.
 */
 export function getCSSImageImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('cssImageImportStyle');
      configValue = configList.cssImage.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`url('${relativePath}')`);
    default: return new vscode.SnippetString(`url('${relativePath}')`);
  }

}

/**
 * Returns SCSS SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns SCSS SnippetString SnippetString import style.
 */
export function getSCSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('scssImportStyle');
      configValue = configList.scss.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:  return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`@use '${relativePath}'; as $1`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

/**
 * Returns SCSS image SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns SCSS SnippetString SnippetString import style.
 */
export function getSCSSImageImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('scssImageImportStyle');
      configValue = configList.scssImage.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`url('${relativePath}')`);
    default: return new vscode.SnippetString(`url('${relativePath}')`);
  }

}
