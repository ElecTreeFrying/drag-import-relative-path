import * as vscode from 'vscode';

import { NotificationType } from '../types/notification';

const SUPPORTED_PAIRS_URL = 'https://github.com/ElecTreeFrying/drag-import-relative-path#supported-languages';

export function showNotification(type: 'same-file-path' | 'no-active-editor' | 'no-file-to-copy' | 'empty-clipboard' | 'no-styles-to-reset' | 'styles-restored'): void;
export function showNotification(type: 'not-supported', payload: { sourceExt: string; destinationExt: string }): void;
export function showNotification(type: 'no-extension', payload: { basename: string }): void;
export function showNotification(type: 'source-not-found', payload: { basename: string }): void;
export function showNotification(type: 'copy-success', payload: { basenames: string[] }): Thenable<string | undefined>;
export function showNotification(type: 'no-configurable-style', payload: { sourceExt: string; destinationExt: string }): void;
export function showNotification(type: 'default-style-saved', payload: { description: string }): void;
export function showNotification(type: 'placement-saved', payload: { placement: string }): void;
export function showNotification(type: 'preserve-script-extension-toggled', payload: { enabled: boolean }): void;
export function showNotification(type: 'styles-reset', payload: { count: number }): Thenable<string | undefined>;
export function showNotification(type: 'review-request', payload: { count: number }): Thenable<string | undefined>;
export function showNotification(
  type: NotificationType,
  payload?: { sourceExt?: string; destinationExt?: string; basename?: string; basenames?: string[]; description?: string; placement?: string; enabled?: boolean; count?: number },
): Thenable<string | undefined> | void {
  switch (type) {
    case 'same-file-path':
      vscode.window.showWarningMessage('Drag Import: A file cannot import itself.');
      break;
    case 'not-supported':
      void vscode.window.showWarningMessage(
        `Drag Import: Cannot import ${payload!.sourceExt} into ${payload!.destinationExt} files.`,
        'View Supported Files',
      ).then(action => {
        if (action === 'View Supported Files') {
          vscode.env.openExternal(vscode.Uri.parse(SUPPORTED_PAIRS_URL));
        }
      });
      break;
    case 'no-active-editor':
      vscode.window.showWarningMessage('Drag Import: Open a file to paste an import.');
      break;
    case 'no-file-to-copy':
      vscode.window.showWarningMessage('Drag Import: No file selected to copy.');
      break;
    case 'no-extension':
      vscode.window.showWarningMessage(`Drag Import: ${payload!.basename} has no file extension — only Markdown links support extensionless files.`);
      break;
    case 'empty-clipboard':
      vscode.window.showWarningMessage('Drag Import: Clipboard does not contain a file path.');
      break;
    case 'source-not-found':
      vscode.window.showWarningMessage(`Drag Import: Source file no longer exists: ${payload!.basename}.`);
      break;
    case 'copy-success': {
      const basenames = payload!.basenames!;
      const message = basenames.length === 1
        ? `Drag Import: Copied path — ${basenames[0]}`
        : `Drag Import: Copied ${basenames.length} paths — ${formatBasenameList(basenames)}`;
      return vscode.window.showInformationMessage(
        message,
        'Paste with Style',
        'Paste Now',
      );
    }
    case 'no-configurable-style':
      vscode.window.showWarningMessage(`Drag Import: ${payload!.sourceExt} → ${payload!.destinationExt} imports use a fixed style.`);
      break;
    case 'default-style-saved':
      vscode.window.showInformationMessage(`Drag Import: Default style saved — ${payload!.description}`);
      break;
    case 'placement-saved':
      vscode.window.showInformationMessage(`Drag Import: Import placement saved — ${payload!.placement}`);
      break;
    case 'preserve-script-extension-toggled':
      vscode.window.showInformationMessage(`Drag Import: Preserve script file extension — ${payload!.enabled ? 'On' : 'Off'}`);
      break;
    case 'styles-reset': {
      const message = payload!.count === 1
        ? `Drag Import: Reset 1 import style to defaults`
        : `Drag Import: Reset ${payload!.count} import styles to defaults`;
      return vscode.window.showInformationMessage(message, 'Undo');
    }
    case 'no-styles-to-reset':
      vscode.window.showInformationMessage('Drag Import: No custom import styles to reset.');
      break;
    case 'styles-restored':
      vscode.window.showInformationMessage('Drag Import: Import styles restored.');
      break;
    case 'review-request':
      return vscode.window.showInformationMessage(
        `Drag Import: You have generated ${payload!.count} imports. Mind leaving a quick review?`,
        'Rate It',
        'Not Now',
        'Never Ask Again',
      );
  }
}

/** Renders up to three basenames for the plural copy toast, eliding the rest as `+N more`. */
function formatBasenameList(basenames: string[]): string {
  const shown = basenames.slice(0, 3).join(', ');
  const hidden = basenames.length - 3;
  return hidden > 0 ? `${shown}, +${hidden} more` : shown;
}

export function clearNotifications(): void {
  void vscode.commands.executeCommand('notifications.clearAll');
}
