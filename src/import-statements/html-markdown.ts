import * as vscode from 'vscode';

import { importStyle } from '../providers';
import { ImportStyle } from '../model';

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function htmlScriptImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.markup').get('htmlScriptImportStyle');
      configValue = importStyle.HTMLScript.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`<script type=\"text/javascript\" src=\"${relativePath}\"></script>`);
    default: return new vscode.SnippetString(`<script type=\"text/javascript\" src=\"${relativePath}\"></script>`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
 export function htmlImageImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.markup').get('htmlImageImportStyle');
      configValue = importStyle.HTMLImage.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`<img src=\"${relativePath}\" alt=\"sample\">`);
    default: return new vscode.SnippetString(`<img src=\"${relativePath}\" alt=\"sample\">`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function htmlStylesheetImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.markup').get('htmlStyleSheetImportStyle');
      configValue = importStyle.HTMLStylesheet.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`<link href=\"${relativePath}\" rel=\"stylesheet\">`);
    default: return new vscode.SnippetString(`<link href=\"${relativePath}\" rel=\"stylesheet\">`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function markdownImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.markup').get('markdownImportStyle');
      configValue = importStyle.markdown.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`![text](${relativePath})`);
    default: return new vscode.SnippetString(`![text](${relativePath})`);
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function markdownImageImportStatement(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('auto-import.importStatement.markup').get('markdownImageImportStyle');
      configValue = importStyle.markdownImage.find((config: ImportStyle) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`![alt-text](${relativePath} \"Hover text\")`);
    case 1:  return new vscode.SnippetString(`![alt-text][image] / [image]: ${relativePath} \"Hover text\"`);
    default: return new vscode.SnippetString(`![alt-text](${relativePath} \"Hover text\")`);
  }

}
