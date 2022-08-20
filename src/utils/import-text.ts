import * as vscode from 'vscode';
import * as path from 'path';

import * as importText from '../import-texts';
import { getFileExt } from '.';
import { FileExtensions, ImportTextOptions } from '../model';

/**
 * Get calculated import style to append in editor.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @param {string} dragFilePath Dragged file path. 
 * @param {string} dropFilePath Dragged file path. 
 * @param {ImportTextOptions} importTextOption Configured Import text option.
 * @returns SnippetString import style or generic import style string
 */
export function getImportText(
  relativePath: string,
  dragFilePath: string,
  dropFilePath: string,
  importTextOption: ImportTextOptions
): vscode.SnippetString | string {

  switch (path.parse(dropFilePath).ext as FileExtensions) {
    case '.js':
    case '.jsx': {
      /* 
        SnippetString Javascript/Javascript React import styles
       */
      const preserve = vscode.workspace.getConfiguration('importStatements.script').get('preserveScriptFileExtension');
      const fileType = preserve ? getFileExt(dragFilePath) : '';
      return importText.getJavascriptImport(relativePath + fileType);
    }
    case '.ts':
    case '.tsx': {
      /* 
        SnippetString Typescript/Typescript React import styles
       */
      const preserve = vscode.workspace.getConfiguration('importStatements.script').get('preserveScriptFileExtension');
      const fileType = preserve ? getFileExt(dragFilePath) : '';
      return importText.getTypescriptImport(relativePath + fileType);
    }
    case '.css': {
      /* 
        SnippetString CSS import styles
       */
      switch (importTextOption) {
        case 'image':  return importText.getCSSImageImport(relativePath + getFileExt(dragFilePath));
        default:       return importText.getCSSImport(relativePath + getFileExt(dragFilePath));
      }
    }
    case '.scss': {
      /* 
        SnippetString SCSS import styles
       */      
      switch (importTextOption) {
        case 'image':  return importText.getSCSSImageImport(relativePath + getFileExt(dragFilePath));
        default:       return importText.getSCSSImport(relativePath + getScssFileExt(dragFilePath));
      }
    }
    case '.html': {
      /* 
        HTML import styles
       */
      switch (importTextOption) {
        case 'script':     return importText.getHTMLScriptImport(relativePath + getFileExt(dragFilePath));
        case 'image':      return importText.getHTMLImageImport(relativePath + getFileExt(dragFilePath));
        case 'stylesheet': return importText.getHTMLStylesheetImport(relativePath + getFileExt(dragFilePath));
      }
    }
    case '.md': {
      /* 
        Markdown import styles
       */
      switch (importTextOption) {
        case 'markdown': return importText.getMarkdownImport(relativePath + getFileExt(dragFilePath));
        case 'image':    return importText.getMarkdownImageImport(relativePath + getFileExt(dragFilePath));
      }
    }
  }
}

/**
 * Get SCSS file extension.
 * @param {string} dragFilePath Dragged file path. 
 * @returns CSS file extension if dragFilePath ext is .css else none
 */
function getScssFileExt(dragFilePath: string): string {
  if (getFileExt(dragFilePath) === '.css') {
    // Auto preserve file extension if file extension is CSS
    return getFileExt(dragFilePath);
  } else {
    const preserve = vscode.workspace.getConfiguration('importStatements.styleSheet').get('preserveStylesheetFileExtension');
    return preserve ? getFileExt(dragFilePath) : '';
  }
}
