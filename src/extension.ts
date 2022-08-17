import * as vscode from 'vscode';

import { getImportText, getRelativePath, getFileExt, notify } from './utils';
import { ImportTextOptions, NotifyType } from './interfaces';
import { htmlSupported, markdownSupported, selectors } from './providers';

class AutoImportOnDropProvider implements vscode.DocumentDropEditProvider {
	async provideDocumentDropEdits(_document: vscode.TextDocument): Promise<vscode.DocumentDropEdit> {

    let importTextOption: ImportTextOptions = null;
    const editor = vscode.window.activeTextEditor;

    if (!editor) return { insertText: undefined };

		await vscode.commands.executeCommand('copyFilePath');
		const dragFilePath = await vscode.env.clipboard.readText();
		const dropFilePath = editor.document.uri.fsPath;

    if (dragFilePath.toLowerCase() === dropFilePath.toLowerCase()) {
  		return notify(NotifyType.SameFilePath);
    }

    if (
      (getFileExt(dragFilePath) !== getFileExt(dropFilePath)) 
      && (getFileExt(dropFilePath) !== '.html' || getFileExt(dropFilePath) === '.md')
    ) {
  		return notify(NotifyType.DifferentFileExtension);
    }

    if (getFileExt(dragFilePath) === '.html' && getFileExt(dropFilePath) === '.html') {
  		return notify(NotifyType.NotSupported);
    }

    if (htmlSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.html') {
      importTextOption = getFileExt(dragFilePath) === '.js' ? 'script' : 'stylesheet';
    }
    if (!htmlSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.html') {
  		return notify(NotifyType.NotSupported);
    }

    if (markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md') {
      importTextOption = getFileExt(dragFilePath) === '.md' ? 'markdown' : 'image';
    }
    if (!markdownSupported.includes(getFileExt(dragFilePath)) && getFileExt(dropFilePath) === '.md') {
  		return notify(NotifyType.NotSupported);
    }
    
    const importText = getImportText(
      getRelativePath(dropFilePath, dragFilePath, {
        preserveFileExt: false
      }),
      dragFilePath,
      importTextOption
    );

		return { insertText: importText };
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider(selectors, new AutoImportOnDropProvider())
  );
}
