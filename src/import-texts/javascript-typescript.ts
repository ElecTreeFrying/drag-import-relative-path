import * as vscode from 'vscode';

import * as configList from '../providers/config-list';
import { ConfigItem } from '../interfaces';
import { getImportName } from '../utils';

export function getJavascriptImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.javascript').get('javascriptImportStyle');
      configValue = configList.javascript.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0:  return `import name from '${relativePath}';`;
    case 1:  return `import { name } from '${relativePath}';`;
    case 2:  return `import { default as name } from '${relativePath}';`;
    case 3:  return `import * as name from '${relativePath}';`;
    case 4:  return `import '${relativePath}';`;
    case 5:  return `var name = require('${relativePath}');`;
    case 6:  return `const name = require('${relativePath}');`;
    case 7:  return `var name = import('${relativePath}');`;
    case 8:  return `const name = import('${relativePath}');`;
    default: return `import name from '${relativePath}';`;
  }

}

export function getTypescriptImport(relativePath: string): string {

  let configValue = vscode.workspace.getConfiguration('importStatements.javascript').get('typescriptImportStyle');
      configValue = configList.typescript.find((config: ConfigItem<number>) => config.description === configValue).value;

  switch (configValue as number) {
    case 0: return `import name from '${relativePath}';`;
    case 1: return `import { ${getImportName(relativePath)} } from '${relativePath}';`;
    case 2: return `import { ${getImportName(relativePath)} as name } from '${relativePath}';`;
    case 3: return `import * as ${getImportName(relativePath)} from '${relativePath}';`;
    case 4: return `import '${relativePath}';`;
    default: return `import { ${getImportName(relativePath)} } from '${relativePath}';`;
  }

}
