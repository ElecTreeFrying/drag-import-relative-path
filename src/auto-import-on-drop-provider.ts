import * as vscode from 'vscode';

import { getImportText, getRelativePath, getFileExt, notify } from './modules';
import { NotifyType } from './model';
import { htmlSupported, markdownSupported, cssSupported, scssSupported } from './providers';

/* 
  Drag and drop handler
 */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(_document: vscode.TextDocument): Promise<vscode.DocumentDropEdit> {

    /* 
      Get the active text editor file path and dragged file path from tree view
      */
    await vscode.commands.executeCommand('copyFilePath');
    const dragFilePath = await vscode.env.clipboard.readText();
    const dropFilePath = _document.uri.fsPath;

    /* 
      Prevents same file drag and drop
      */
    if (dragFilePath.toLowerCase() === dropFilePath.toLowerCase()) {
      return notify(NotifyType.SameFilePath);
    }

    /* 
      Prevents unsupported drag and drop
      */
    if (
      // Checks unsupported drag and drop files
      (((getFileExt(dragFilePath) !== getFileExt(dropFilePath)) 
      && ![ '.html', '.md', '.css', '.scss', '.tsx' ].includes(getFileExt(dropFilePath))))
      // Checks HTML to HTML drag and drop
      || (getFileExt(dragFilePath) === '.html' && getFileExt(dropFilePath) === '.html')
      // Checks unsupported HTML drag import file extensions
      || (!htmlSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.html')
      // Checks unsupported Markdown drag import file extensions
      || (!markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md')
      // Checks unsupported CSS drag import file extensions
      || (!cssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.css')
      // Checks unsupported SCSS drag import file extensions
      || (!scssSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.scss')
    ) {
      return notify(NotifyType.NotSupported);
    }
    
    /* 
      Insert text
      */
    return {
      insertText: getImportText(
        getRelativePath(dropFilePath, dragFilePath),
        dragFilePath,
        dropFilePath
      )
    };
  }
}
