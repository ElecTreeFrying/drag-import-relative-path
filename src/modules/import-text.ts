import * as vscode from 'vscode';

import * as importPath from '../import-paths';
import { getFileExt } from '.';

/**
 * Get calculated import style to append in editor.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @param {string} dragFilePath Dragged file path. 
 * @param {string} dropFilePath Dropped file path. 
 * @param {ImportTextOption} importTextOption Configured Import text option.
 * @returns Import statement string
 */
export function getImportText(
  relativePath: string,
  dragFilePath: string,
  dropFilePath: string
): vscode.SnippetString | string {

  switch (getFileExt(dropFilePath)) {
    case '.js':
    case '.jsx': {
      return importPath.javascript.relativeImport(relativePath, dragFilePath);
    }
    case '.ts':
    case '.tsx': {
      return importPath.typescript.relativeImport(relativePath, dragFilePath, dropFilePath);
    }
    case '.css': {
      return importPath.css.relativeImport(relativePath, dragFilePath);
    }
    case '.scss': {
      return importPath.scss.relativeImport(relativePath, dragFilePath);
    }
    case '.html': {
      return importPath.html.relativeImport(relativePath, dragFilePath);
    }
    case '.md': {
      return importPath.markdown.relativeImport(relativePath, dragFilePath);
    }
  }
}
