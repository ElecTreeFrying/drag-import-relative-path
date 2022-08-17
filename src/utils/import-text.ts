import * as vscode from 'vscode';
import * as path from 'path';

import * as importText from '../import-texts';
import { FileExtensions, ImportTextOptions } from '../interfaces';
import { getFileExt } from './common';
import { preserveScriptFileExtension, preserveStylesheetFileExtension } from '.';

export function getImportText(
  relativePath: string,
  dragFilePath: string,
  importTextOption: ImportTextOptions
): vscode.SnippetString | string {

  const fileExt = path.parse(vscode.window.activeTextEditor.document.uri.fsPath).ext;

  switch (fileExt as FileExtensions) {
    case '.js':
    case '.jsx': {
      const fileType = preserveScriptFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getJavascriptImport(relativePath + fileType);
    }
    case '.ts':
    case '.tsx': {
      const fileType = preserveScriptFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getTypescriptImport(relativePath + fileType);
    }
    case '.css': {
      const fileType = preserveStylesheetFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getCSSImport(relativePath + fileType);
    }
    case '.scss':
    case '.sass': {
      const fileType = preserveStylesheetFileExtension ? getFileExt(dragFilePath) : '';
      return importText.getSCSSSASSSImport(relativePath + fileType);
    }
    case '.html': {
      switch (importTextOption) {
        case 'script':     return importText.getHTMLScriptImport(relativePath);
        case 'stylesheet': return importText.getHTMLStylesheetImport(relativePath);
      }
    }
    case '.md': {
      switch (importTextOption) {
        case 'markdown': return importText.getMarkdownImport(relativePath);
        case 'image':    return importText.getMarkdownImageImport(relativePath);
      }
    }
  }
}
