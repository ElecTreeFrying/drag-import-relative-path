import * as vscode from 'vscode';

export const disableNotifications = vscode
  .workspace.getConfiguration('general')
  .get<boolean>('disableNotifications');

export const preserveScriptFileExtension = vscode
  .workspace.getConfiguration('importStatements.script')
  .get<boolean>('preserveFileExtension');

export const preserveStylesheetFileExtension = vscode
  .workspace.getConfiguration('importStatements.styleSheet')
  .get<boolean>('preserveFileExtension');
