import * as vscode from 'vscode';

import { importStatementSnippet, getRelativePath, getFileExt, notify } from '../utilities';
import { NotifyType } from '../model';
import { htmlSupported, markdownSupported, cssSupported, scssSupported, permittedExts } from '../providers';

/* 
  Drag and drop handler
 */
export class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
		_document: vscode.TextDocument,
		position: vscode.Position,
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): Promise<vscode.DocumentDropEdit> {

    /* 
      Get the active text editor file path and dragged file path from tree view
      */
    const dataTransferItem = dataTransfer.get('text/plain');
    const dropFilePath = _document.uri.fsPath;
    const dragFilePath = dataTransferItem.value;

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
      (!permittedExts.includes(getFileExt(dropFilePath)) && (getFileExt(dragFilePath) !== getFileExt(dropFilePath)) )
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
      notify(NotifyType.NotSupported);
      return { insertText: relativePath(dropFilePath, dragFilePath) };
    }

    const snippet = importStatementSnippet(
      getRelativePath(dropFilePath, dragFilePath),
      dragFilePath,
      dropFilePath
    );

    if (snippet.value === '\n') {
      notify(NotifyType.NotSupported);
      return { insertText: relativePath(dropFilePath, dragFilePath) };
    }

    /* 
      Insert text
      */
    return { insertText: snippet };
  }
}

function relativePath(toFilepath: string, fromFilepath: string): vscode.SnippetString {
  const snippet = new vscode.SnippetString(`${getRelativePath(toFilepath, fromFilepath) + getFileExt(fromFilepath)}`);
  return snippet.appendText('\n');
}
