import * as vscode from 'vscode';

import * as configList from '../providers/config-list';
import { ConfigItem } from '../model';

/**
 * Returns HTML script SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns HTML script SnippetString import style.
 */
export function getHTMLScriptImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('htmlScriptImportStyle');
      configValue = configList.HTMLScript.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `<script type=\"text/javascript\" src=\"${relativePath}\"></script>`;
    default: return `<script type=\"text/javascript\" src=\"${relativePath}\"></script>`;
  }

}

/**
 * Returns HTML stylesheet SnippetString import style.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns HTML stylesheet SnippetString import style.
 */
export function getHTMLStylesheetImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.markup').get('htmlStyleSheetImportStyle');
      configValue = configList.HTMLStylesheet.find((config: ConfigItem<number>) => config.description === configValue).value;

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
      configValue = configList.markdown.find((config: ConfigItem<number>) => config.description === configValue).value;

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
      configValue = configList.markdownImage.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `![alt-text](${relativePath} \"Hover text\")`;
    case 1:  return `Reference style: ![alt-text][image] / [image]: ${relativePath} \"Hover text\"`;
    default: return `![alt-text](${relativePath} \"Hover text\")`;
  }

}
