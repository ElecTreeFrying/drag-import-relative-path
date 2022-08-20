import * as vscode from 'vscode';

import { getImportText, getRelativePath, getFileExt, notify } from './utils';
import { ImportTextOptions, NotifyType } from './model';
import { htmlSupported, markdownSupported, cssSupported, scssSupported } from './providers';

/* 
  Drag and drop (DnD) handler
 */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(_document: vscode.TextDocument): Promise<vscode.DocumentDropEdit> {

    let importTextOption: ImportTextOptions = null;

    /* 
      Get editor file path and dragged file path 
      */
    await vscode.commands.executeCommand('copyFilePath');
    const dragFilePath = await vscode.env.clipboard.readText();
    const dropFilePath = _document.uri.fsPath;

    /* 
      Prevents same file DnD
      */
    if (dragFilePath.toLowerCase() === dropFilePath.toLowerCase()) {
      return notify(NotifyType.SameFilePath);
    }

    /* 
      Prevents different file extension DnD
      Except ['.html','.md','.css','.scss'] file extensions
      */
    if (
      (getFileExt(dragFilePath) !== getFileExt(dropFilePath)) 
      && ![ '.html', '.md', '.css', '.scss' ].includes(getFileExt(dropFilePath))
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
        case '.js':  { importTextOption = 'script';     break; }
        case '.css': { importTextOption = 'stylesheet'; break; }
        default:     { importTextOption = 'image';      break; }
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
      switch (getFileExt(dragFilePath)) {
        case '.md': { importTextOption = 'markdown'; break; }
        default:    { importTextOption = 'image';    break; }
      }
    }
    /* 
      Catches unsupported DnD file extension to html
      */
    if (!markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md') {
      return notify(NotifyType.NotSupported);
    }

    /* 
      Adds importTextOption, with respect to the given dragged file extension
      */
    if (
      (cssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.css')
      || (scssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.scss')
    ) {
      switch (getFileExt(dragFilePath)) {
        case '.css':
        case '.scss': { importTextOption = null;    break; }
        default:      { importTextOption = 'image'; break; }
      }
    }
    /* 
      Catches unsupported DnD file extension to css and scss
      */
    if (
      (!cssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.css')
      || (!scssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.scss')
    ) {
      return notify(NotifyType.NotSupported);
    }
    
    /* 
      Get calculated import style
      */
    const importText = getImportText(
      getRelativePath(dropFilePath, dragFilePath),
      dragFilePath,
      dropFilePath,
      importTextOption
    );

    /* 
      Insert text
      */
    return { insertText: importText };
  }
}
