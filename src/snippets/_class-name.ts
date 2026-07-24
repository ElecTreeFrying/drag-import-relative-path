import * as vscode from 'vscode';

/** Matches `export class Name` or `export abstract class Name` at column 0. */
const EXPORTED_CLASS_PATTERN = /^export\s+(?:abstract\s+)?class\s+(\w+)/m;

/**
 * Extracts the name of the first top-level exported class from file content.
 *
 * Strips comments before scanning so that commented-out declarations don't
 * produce false positives. Returns `null` when no exported class is found.
 */
export function extractFirstExportedClassName(fileContent: string): string | null {
  const stripped = stripComments(fileContent);
  const match = EXPORTED_CLASS_PATTERN.exec(stripped);
  return match?.[1] ?? null;
}

/**
 * Reads the source file and returns the first exported class name, or `null`
 * on any failure (missing file, permission error, no exported class).
 */
export async function readExportedClassName(sourceFilePath: string): Promise<string | null> {
  try {
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(sourceFilePath));
    const content = new TextDecoder('utf-8').decode(bytes);
    return extractFirstExportedClassName(content);
  } catch {
    return null;
  }
}

/** Strips block comments and single-line comments from source text. */
function stripComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}
