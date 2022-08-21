import * as vscode from 'vscode';

import { AutoImportOnDropProvider } from './auto-import-on-drop-provider';
import { selectors } from './providers';

/**
 * This method is called when the extension is activated.
 * Drag Import Relative Path Extension is activated the very first time the command is executed.
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
