import * as vscode from 'vscode';

import { FilePathInfo } from '../../editor/file-path-info';
import { buildJavaScriptImportSnippet } from './javascript';
import { buildReactImport } from '../_react';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  return buildReactImport({
    primaryExtensions: [ '.js', '.jsx' ],
    primarySnippet: buildJavaScriptImportSnippet,
  }, info);
}
