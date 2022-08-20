import * as vscode from 'vscode';

import * as importStyle from '../providers/import-configuration';
import { ImportStyle } from '../model';

/**
 * Returns HTML script SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns HTML script SnippetString import style.
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
 * Returns HTML image SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns HTML image SnippetString import style.
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
 * Returns HTML stylesheet SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns HTML stylesheet SnippetString import style.
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
 * Returns Markdown SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns Markdown SnippetString import style.
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
 * Returns Markdown image SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns Markdown image SnippetString import style.
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
