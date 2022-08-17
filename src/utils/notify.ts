import * as vscode from 'vscode';

import { disableNotifications } from '../utils';
import { NotifyType } from "../interfaces";

export function notify(type: NotifyType): vscode.DocumentDropEdit {

  switch (type) {
    case NotifyType.SameFilePath: {
      disableNotifications || vscode.window.showWarningMessage(`Same file path.`);
  		return { insertText: undefined };
    }
    case NotifyType.DifferentFileExtension: {
      disableNotifications || vscode.window.showErrorMessage(`Different file extension.`);
  		return { insertText: undefined };
    }
    case NotifyType.NotSupported: {
      disableNotifications || vscode.window.showWarningMessage(`Not supported.`);
  		return { insertText: undefined };
    }
  }

}
