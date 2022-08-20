import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

suite('Extension activation testing', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Check if 1 subscription is registered', async () => {

    const extension = vscode.extensions.getExtension("ElecTreeFrying.drag-import-relative-path");
    const extensionContext = await extension.activate();

    console.log('@@@ ', extensionContext);

  });
});
