import * as vscode from 'vscode';
import * as path from 'path';

import { FileExtension } from '../types/file-extension';
import { extractFileExtension } from '../path/extension';
import { computeRelative } from '../path/relative';

export interface FilePathInfo {
  relativePath: string;
  sourceFilePath: string;
  destinationFilePath: string;
  destinationFileExt: FileExtension;
  sourceFileExt: FileExtension;
}

/**
 * Splits raw clipboard text into candidate file-path lines: split on `\r\n` or `\n`, trim each
 * line, drop empties. VS Code's built-in `copyFilePath` newline-joins an Explorer multi-selection,
 * so a multi-select copy arrives as one line per selected file; a single-file copy yields one line.
 */
export function parseClipboardPaths(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Filters parsed clipboard lines down to the copyable ones — the absolute paths. Copy is
 * destination-agnostic, and an extensionless file (`LICENSE`, `Dockerfile`) is a valid import source
 * for a Markdown-link destination, so copyability no longer requires an extension; the paste-time
 * gate (which knows the destination) rejects an extensionless source into a non-`.md` destination.
 * A multi-selection drops its non-absolute members instead of failing wholesale.
 */
export function filterCopyablePaths(paths: string[]): string[] {
  return paths.filter(candidate => path.isAbsolute(candidate));
}

export function getFilePathInfoFromPaths(sourceFilePath: string, destinationFilePath: string): FilePathInfo {
  const relativePath = computeRelative(sourceFilePath, destinationFilePath);
  const sourceFileExt = extractFileExtension(sourceFilePath);
  const destinationFileExt = extractFileExtension(destinationFilePath);

  return {
    relativePath,
    sourceFilePath,
    destinationFilePath,
    destinationFileExt,
    sourceFileExt,
  };
}

export async function getFilePathInfo(): Promise<FilePathInfo> {
  const editor = vscode.window.activeTextEditor;

  const sourceFilePath = await vscode.env.clipboard.readText();
  const destinationFilePath = editor.document.uri.fsPath;

  return getFilePathInfoFromPaths(sourceFilePath, destinationFilePath);
}
