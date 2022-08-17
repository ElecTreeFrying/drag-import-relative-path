import * as vscode from 'vscode';

/* 
  General > Disable all notifications
  */
export const disableNotifications = vscode
  .workspace.getConfiguration('general')
  .get<boolean>('disableNotifications');

/* 
  Import Statements > Script > Preserve file extension
  */
export const preserveScriptFileExtension = vscode
  .workspace.getConfiguration('importStatements.script')
  .get<boolean>('preserveFileExtension');

/* 
  Import Statements > Stylesheet > Preserve file extension
  */
export const preserveStylesheetFileExtension = vscode
  .workspace.getConfiguration('importStatements.styleSheet')
  .get<boolean>('preserveFileExtension');
