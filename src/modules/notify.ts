import * as vscode from 'vscode';

import { NotifyType } from "../model";

/**
 * Notification actions
 * @param {NotifyType} type Indicated notification type
 * @returns {vscode.DocumentDropEdit} undefined text in active text editor.
 */
export function notify(type: NotifyType): vscode.DocumentDropEdit {

  const disableAllDropNotifications = vscode.workspace.getConfiguration('general').get<boolean>('disableAllDropNotifications');

  switch (type) {
    case NotifyType.SameFilePath: {
      /* 
        Emit same file path, window notification (warning)
      */
      disableAllDropNotifications || vscode.window.showWarningMessage(`Same file path.`);
  		return { insertText: undefined };
    }
    case NotifyType.NotSupported: {
      /* 
        Emit not supported, window notification (warning)
      */
      disableAllDropNotifications || vscode.window.showWarningMessage(`Not supported.`);
  		return { insertText: undefined };
    }
  }

}
