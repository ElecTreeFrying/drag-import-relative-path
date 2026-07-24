import * as vscode from 'vscode';

import { FilePathInfo } from '../../editor/file-path-info';
import { buildJavaScriptImportSnippet } from './javascript';
import { buildTypeScriptImportSnippet } from './typescript';
import { buildReactImport } from '../_react';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  return buildReactImport({
    primaryExtensions: [ '.ts', '.tsx' ],
    primarySnippet: buildTypeScriptImportSnippet,
    fallbackExtensions: [ '.js', '.jsx' ],
    fallbackSnippet: buildJavaScriptImportSnippet,
  }, info);
}
