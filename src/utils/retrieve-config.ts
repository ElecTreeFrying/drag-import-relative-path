import * as vscode from 'vscode';

export const disableNotifications: boolean = vscode.workspace.getConfiguration('general').get('disableNotifications');
export const preserveFileExtension: boolean = vscode.workspace.getConfiguration('general').get('preserveFileExtension');
