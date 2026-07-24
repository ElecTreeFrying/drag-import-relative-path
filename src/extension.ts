import * as vscode from 'vscode';
import {
  executeSetDefaultImportStyle,
  executeSetImportPlacement,
  executeTogglePreserveScriptExtension,
  executeResetImportStyles,
} from './commands';
import { AutoImportOnDropProvider, EDIT_KIND } from './drop/provider';
import { DROP_LANGUAGE_SELECTORS } from './drop/selector';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('drag-import.setDefaultImportStyle', () => executeSetDefaultImportStyle()),
    vscode.commands.registerCommand('drag-import.setImportPlacement', () => executeSetImportPlacement()),
    vscode.commands.registerCommand('drag-import.togglePreserveScriptExtension', () => executeTogglePreserveScriptExtension()),
    vscode.commands.registerCommand('drag-import.resetImportStyles', () => executeResetImportStyles()),
    vscode.languages.registerDocumentDropEditProvider(
      DROP_LANGUAGE_SELECTORS,
      new AutoImportOnDropProvider(),
      // `providedDropEditKinds` makes our .tsx/.jsx edit win over the built-in TypeScript
      // "drop to update imports" provider; omit it and our edit loses. `EDIT_KIND` is exported
      // from drop/provider.ts (ported in B4). Re-check this options object against Auto
      // Import's final extension.ts at B4/B7 — it drifted once already (this kind was added).
      { dropMimeTypes: [ 'text/uri-list' ], providedDropEditKinds: [ EDIT_KIND ] },
    ),
  );
}

export function deactivate(): void {
}
