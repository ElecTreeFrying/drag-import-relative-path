import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from './subscriptions';
import { selectors } from './providers';

/**
 * Called when the extension is activated.
 * Extension is activated the first time the command is executed.
 * @param {vscode.ExtensionContext} context An extension context is a collection of utilities private to an extension.
 * @returns void
 */
export function activate(context: vscode.ExtensionContext) {
  /* 
    Register Drag and drop handler on activation
   */
	context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider(selectors, new AutoImportOnDropProvider())
  );
}
