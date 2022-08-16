import * as vscode from 'vscode';
import * as path from 'path';

import { selectors } from './providers';
import {
  getImportText, getRelativePath,
  disableNotifications, preserveFileExtension
} from './utils';

class ReverseTextOnDropProvider implements vscode.DocumentDropEditProvider {
	async provideDocumentDropEdits(_document: vscode.TextDocument): Promise<vscode.DocumentDropEdit | undefined> {

		const editor = vscode.window.activeTextEditor;

    if (!editor) return { insertText: undefined };

		await vscode.commands.executeCommand('copyFilePath');
		const dragFile = await vscode.env.clipboard.readText();
		const dropFile = editor.document.uri.fsPath;

    if (dropFile.toLowerCase() === dragFile.toLowerCase()) {
      disableNotifications || vscode.window.showWarningMessage(`Same file path.`);
  		return { insertText: undefined };
    }

    if (path.parse(dropFile).ext !== path.parse(dragFile).ext) {
      disableNotifications || vscode.window.showErrorMessage(`Different file extension.`);
  		return { insertText: undefined };
    }

    const importText = getImportText(
      getRelativePath(dropFile, dragFile, {
        preserveFileExt: preserveFileExtension
      })
    );

		const snippet = new vscode.SnippetString();
		snippet.appendText([ importText ].join(''));

		return { insertText: importText };
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider(selectors, new ReverseTextOnDropProvider())
  );
}
