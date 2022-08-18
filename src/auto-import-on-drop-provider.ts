import * as vscode from 'vscode';

import { getImportText, getRelativePath, getFileExt, notify } from './utils';
import { ImportTextOptions, NotifyType } from './model';
import { htmlSupported, markdownSupported, scssSupported } from './providers';

/* 
  Drag and drop (DnD) handler
 */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(_document: vscode.TextDocument): Promise<vscode.DocumentDropEdit> {

    let importTextOption: ImportTextOptions = null;
    const editor = vscode.window.activeTextEditor;

    /* 
      Prevents DnD in non-editor
      */
    if (!editor) return { insertText: undefined };

    /* 
      Get editor file path and dragged file path 
      */
    await vscode.commands.executeCommand('copyFilePath');
    const dragFilePath = await vscode.env.clipboard.readText();
    const dropFilePath = editor.document.uri.fsPath;

    /* 
      Prevents same file DnD
      */
    if (dragFilePath.toLowerCase() === dropFilePath.toLowerCase()) {
      return notify(NotifyType.SameFilePath);
    }

    /* 
      Prevents different file extension DnD
      Except (.html) and (.md) file extensions
      */
    if (
      (getFileExt(dragFilePath) !== getFileExt(dropFilePath)) 
      && ![ '.html', '.md', '.scss' ].includes(getFileExt(dropFilePath))
    ) {
      return notify(NotifyType.DifferentFileExtension);
    }

    /* 
      Prevents html to html DnD
      */
    if (getFileExt(dragFilePath) === '.html' && getFileExt(dropFilePath) === '.html') {
      return notify(NotifyType.NotSupported);
    }

    /* 
      Adds importTextOption, with respect to the given dragged file extension
      */
    if (htmlSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.html') {
      switch (getFileExt(dragFilePath)) {
        case '.js':  { importTextOption = 'script'; }
        case '.css': { importTextOption = 'stylesheet'; }
        default:     { importTextOption = 'image'; }
      }
    }
    /* 
      Catches unsupported DnD file extension to html
      */
    if (!htmlSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.html') {
      return notify(NotifyType.NotSupported);
    }

    /* 
      Adds importTextOption, with respect to the given dragged file extension
      */
    if (markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md') {
      importTextOption = getFileExt(dragFilePath) === '.md' ? 'markdown' : 'image';
      switch (getFileExt(dragFilePath)) {
        case '.md': { importTextOption = 'markdown'; }
        default:    { importTextOption = 'image'; }
      }
    }
    /* 
      Catches unsupported DnD file extension to html
      */
    if (!markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md') {
      return notify(NotifyType.NotSupported);
    }

    /* 
      Catches unsupported DnD file extension to scss
      */
    if (!scssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.scss') {
      return notify(NotifyType.NotSupported);
    }
    
    const importText = getImportText(
      getRelativePath(dropFilePath, dragFilePath),
      dragFilePath,
      importTextOption
    );

    return { insertText: importText };
  }
}
