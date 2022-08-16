import * as vscode from 'vscode';
import * as path from 'path';

import * as importText from '../import-texts';
import { FileExtensions } from '../interfaces';

export function getImportText(relativePath: string): string {

  const fileExt = path.parse(vscode.window.activeTextEditor.document.uri.fsPath).ext as FileExtensions;

  switch (fileExt) {
    case '.js':
    case '.jsx': {
      return importText.getJavascriptImport(relativePath);
    }
    case '.ts':
    case '.tsx': {
      return importText.getTypescriptImport(relativePath);
    }
  }
}
