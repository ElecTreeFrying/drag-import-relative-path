import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { deriveImportName } from '../../path/import-name';
import { FilePathInfo } from '../../editor/file-path-info';
import { TYPESCRIPT_IMPORT_OPTIONS, resolveStyleIndex } from '../_styles';
import { readExportedClassName } from '../_class-name';
import { buildAssetImportStatement } from '../_react';
import { FRAMEWORK_COMPONENT_FILE_EXTENSIONS } from '../../constants/extensions';

const LEGACY_ANGULAR_FILE_SUFFIXES = [
  '.component',
  '.directive',
  '.pipe',
  '.service',
  '.module',
];

export async function buildSnippet(info: FilePathInfo): Promise<vscode.SnippetString> {
  const { sourceFilePath, sourceFileExt, relativePath } = info;

  // A framework SFC (.vue/.svelte/.astro) imported into a .ts destination — common in test/setup
  // code — is a component default import, not a script import: it routes through the shared asset
  // switch (PascalCase-named, full extension kept), never the extension-stripping script path. The
  // narrow TYPESCRIPT_SUPPORTED_EXTENSIONS gate keeps every other cross-extension source out, so this
  // branch returns before the class-name read that a real .ts source needs.
  if (FRAMEWORK_COMPONENT_FILE_EXTENSIONS.includes(sourceFileExt)) {
    return new vscode.SnippetString(buildAssetImportStatement(sourceFileExt, relativePath + sourceFileExt) ?? '');
  }

  const shouldPreserveExtension = getAutoImportSetting('script', 'preserve');
  const fileExtension = shouldPreserveExtension ? extractFileExtension(sourceFilePath) : '';

  const className = await readExportedClassName(sourceFilePath);
  return buildTypeScriptImportSnippet(relativePath + fileExtension, className ?? undefined);
}

export function buildTypeScriptImportSnippet(relativePath: string, detectedImportName?: string): vscode.SnippetString {
  const styleIndex = resolveStyleIndex(TYPESCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('script', 'typescript'));
  return buildTypeScriptImportSnippetByStyle(styleIndex, relativePath, detectedImportName);
}

export function buildTypeScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
  detectedImportName?: string,
): vscode.SnippetString {
  // Default-import positions (1, 2, 6) pre-fill the binding from the source basename. The named
  // import at index 0 keeps its own class-detection / legacy-Angular naming; the type-only positions
  // (4, 5) stay `$1` because their binding must match an actual export.
  const name = defaultImportPlaceholder(relativePath);
  switch (styleIndex) {
    case 0: {
      const importName = detectedImportName
        ? `\${1:${detectedImportName}}`
        : generateAngularLegacyImportName(relativePath);
      return new vscode.SnippetString(`import { ${importName} } from '${relativePath}';`);
    }
    case 1:
      return new vscode.SnippetString(`import ${name} from '${relativePath}';`);
    case 2:
      return new vscode.SnippetString(`import * as ${name} from '${relativePath}';`);
    case 3:
      return new vscode.SnippetString(`import '${relativePath}';`);
    case 4:
      return new vscode.SnippetString(`import type { $1 } from '${relativePath}';`);
    case 5:
      return new vscode.SnippetString(`import { $1, type $2 } from '${relativePath}';`);
    case 6:
      return new vscode.SnippetString(`const ${name} = await import('${relativePath}');`);
    default: {
      const importName = detectedImportName ? `\${1:${detectedImportName}}` : '$1';
      return new vscode.SnippetString(`import { ${importName} } from '${relativePath}';`);
    }
  }
}

/** The default-import placeholder: `${1:derived}` from the basename, or a bare `$1` when none forms. */
function defaultImportPlaceholder(relativePath: string): string {
  const derived = deriveImportName(relativePath);
  return derived ? `\${1:${derived}}` : '$1';
}

function generateAngularLegacyImportName(relativePath: string): string {
  if (LEGACY_ANGULAR_FILE_SUFFIXES.some(suffix => relativePath.includes(suffix))) {
    const ext = extractFileExtension(relativePath);
    const withoutExt = (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')
      ? relativePath.slice(0, -ext.length)
      : relativePath;
    const baseName = path.basename(withoutExt).replace(/\./g, '-');
    const derived = baseName
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    return /^[A-Za-z_$][\w$]*$/.test(derived) ? `\${1:${derived}}` : '$1';
  }
  return '$1';
}
