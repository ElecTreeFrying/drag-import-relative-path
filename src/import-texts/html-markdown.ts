import * as vscode from 'vscode';

import { importStyle } from '../providers';
import { ImportStyle } from '../model';

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getHTMLScriptImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('htmlScriptImportStyle');
      configValue = importStyle.HTMLScript.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `<script type=\"text/javascript\" src=\"${relativePath}\"></script>`;
    default: return `<script type=\"text/javascript\" src=\"${relativePath}\"></script>`;
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
 export function getHTMLImageImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('htmlImageImportStyle');
      configValue = importStyle.HTMLImage.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `<img src=\"${relativePath}\" alt=\"sample\">`;
    default: return `<img src=\"${relativePath}\" alt=\"sample\">`;
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getHTMLStylesheetImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('htmlStyleSheetImportStyle');
      configValue = importStyle.HTMLStylesheet.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `<link href=\"${relativePath}\" rel=\"stylesheet\">`;
    default: return `<link href=\"${relativePath}\" rel=\"stylesheet\">`;
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getMarkdownImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('markdownImportStyle');
      configValue = importStyle.markdown.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `![text](${relativePath})`;
    default: return `![text](${relativePath})`;
  }

}

/**
 * Returns the Import statement string
 * @param {string} relativePath Relative path of dragged file and active text editor.
 * @returns Import statement string
 */
export function getMarkdownImageImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('markdownImageImportStyle');
      configValue = importStyle.markdownImage.find((config: ImportStyle<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `![alt-text](${relativePath} \"Hover text\")`;
    case 1:  return `![alt-text][image] / [image]: ${relativePath} \"Hover text\"`;
    default: return `![alt-text](${relativePath} \"Hover text\")`;
  }

}
