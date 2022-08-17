import * as vscode from 'vscode';

import * as configList from '../providers/config-list';
import { ConfigItem } from '../interfaces';

export function getCSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('cssImportStyle');
      configValue = configList.css.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';"`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

export function getSCSSSASSSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('scssSassImportStyle');
      configValue = configList.scssSass.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import url('${relativePath}');`);
    case 2:  return new vscode.SnippetString(`@use '${relativePath}';`);
    case 3:  return new vscode.SnippetString(`@use '${relativePath}'; as $1`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}

export function getLESSImport(relativePath: string): vscode.SnippetString {

  let configValue = vscode.workspace.getConfiguration('importStatements.styleSheet').get('lessImportStyle');
      configValue = configList.less.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return new vscode.SnippetString(`@import '${relativePath}';`);
    case 1:  return new vscode.SnippetString(`@import ($1) '${relativePath}';`);
    default: return new vscode.SnippetString(`@import '${relativePath}';`);
  }

}
