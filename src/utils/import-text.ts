import * as vscode from 'vscode';
import * as path from 'path';

import * as importText from '../import-texts';
import { getFileExt } from '.';
import { preserveScriptFileExtension, preserveStylesheetFileExtension } from '../providers';
import { FileExtensions, ImportTextOptions } from '../model';

/**
 * Get calculated import style to append in editor.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @param {string} dragFilePath Dragged file path. 
 * @param {ImportTextOptions} importTextOption Configured Import text option.
 * @returns SnippetString import style or generic import style string
 */
export function getImportText(
  relativePath: string,
  dragFilePath: string,
  importTextOption: ImportTextOptions
): vscode.SnippetString | string {

  /* 
    Active text editor file extension.
   */
  const fileExt = path.parse(vscode.window.activeTextEditor.document.uri.fsPath).ext;

  switch (fileExt as FileExtensions) {
    case '.js':
    case '.jsx': {
      /* 
        SnippetString Javascript/Javascript React import styles
       */
      const fileType = preserveScriptFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getJavascriptImport(relativePath + fileType);
    }
    case '.ts':
    case '.tsx': {
      /* 
        SnippetString Typescript/Typescript React import styles
       */
      const fileType = preserveScriptFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getTypescriptImport(relativePath + fileType);
    }
    case '.css': {
      /* 
        SnippetString CSS import styles
       */
      return importText.getCSSImport(relativePath + getFileExt(dragFilePath));
    }
    case '.scss': {
      /* 
        SnippetString SCSS import styles
       */
      const fileType = preserveStylesheetFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getSCSSImport(relativePath + fileType);
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
