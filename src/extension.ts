import * as vscode from 'vscode';
import {
  executeSetDefaultImportStyle,
  executeSetImportPlacement,
  executeTogglePreserveScriptExtension,
  executeResetImportStyles,
} from './commands';
import { AutoImportOnDropProvider, EDIT_KIND } from './drop/provider';
import { DROP_LANGUAGE_SELECTORS } from './drop/selector';
import { initReviewPrompt } from './editor/review-prompt';

const AUTO_IMPORT_EXTENSION_ID = 'ElecTreeFrying.auto-import';

/*
  Auto Import Relative Path ships this same drag-and-drop provider from v1.0.0
  onward (both extensions share the ported engine). When such a build is
  installed we step aside and let it handle drops — one drop edit, no picker.
  Only defer to a build that actually ships drag-and-drop: an older Auto Import
  (< 1.0.0) has none, so deferring to it would leave the user with no
  drag-and-drop at all.
*/
const AUTO_IMPORT_MAJOR_WITH_DROP = 1;

export function activate(context: vscode.ExtensionContext): void {
  // Hands the global memento to the review-prompt counter before any command can fire. `activate` is
  // the only holder of an ExtensionContext, so this stashes it rather than threading it downward.
  initReviewPrompt(context);

  let dropRegistration: vscode.Disposable | undefined;

  /*
    Register our drop provider only while Auto Import isn't handling drops, and
    re-evaluate whenever the installed extension set changes — installing or
    removing Auto Import mid-session hands off immediately, with no reload.
  */
  const syncDropProvider = () => {
    const autoImport = vscode.extensions.getExtension(AUTO_IMPORT_EXTENSION_ID);
    const autoImportHasDrop = !!autoImport && majorVersion(autoImport.packageJSON?.version) >= AUTO_IMPORT_MAJOR_WITH_DROP;

    if (autoImportHasDrop) {
      dropRegistration?.dispose();
      dropRegistration = undefined;
    } else if (!dropRegistration) {
      dropRegistration = vscode.languages.registerDocumentDropEditProvider(
        DROP_LANGUAGE_SELECTORS,
        new AutoImportOnDropProvider(),
        // `providedDropEditKinds` makes our .tsx/.jsx edit win over the built-in
        // TypeScript "drop to update imports" provider; omit it and our edit loses.
        { dropMimeTypes: [ 'text/uri-list' ], providedDropEditKinds: [ EDIT_KIND ] },
      );
    }
  };

  syncDropProvider();
  context.subscriptions.push(
    vscode.commands.registerCommand('drag-import.setDefaultImportStyle', () => executeSetDefaultImportStyle()),
    vscode.commands.registerCommand('drag-import.setImportPlacement', () => executeSetImportPlacement()),
    vscode.commands.registerCommand('drag-import.togglePreserveScriptExtension', () => executeTogglePreserveScriptExtension()),
    vscode.commands.registerCommand('drag-import.resetImportStyles', () => executeResetImportStyles()),
    vscode.extensions.onDidChange(syncDropProvider),
    { dispose: () => dropRegistration?.dispose() },
  );
}

export function deactivate(): void {
}

function majorVersion(version: string | undefined): number {
  const major = Number.parseInt((version ?? '').split('.')[0], 10);
  return Number.isNaN(major) ? 0 : major;
}
