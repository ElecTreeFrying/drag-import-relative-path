import * as vscode from 'vscode';
import * as path from 'path';

import { getAutoImportSetting } from '../config/settings';
import { SCRIPT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { FileExtension } from '../types/file-extension';
import { FilePathInfo } from './file-path-info';
import {
  adjustForCommentBlock,
  detectBlockIndentation,
  findAstroFrontmatterBounds,
  findBottomLineInRange,
  findEnclosingStyleBounds,
  findSfcScriptBounds,
  getLineIndentation,
  isCommentLine,
  isFrameworkStyleDestination,
  isImportLine,
  isInlineSnippet,
  shouldRepositionCursor,
} from './placement';

export function insertImportSnippet(
  snippet: vscode.SnippetString,
  info: FilePathInfo,
  insideStyleBlock = false,
): void {
  const { sourceFileExt, destinationFileExt } = info;

  if (isInlineSnippet(sourceFileExt, destinationFileExt)) {
    return insertSnippetInline(snippet);
  }

  snippet = snippet.appendText('\n');

  if (shouldRepositionCursor(destinationFileExt)) {
    return insertSnippetAtCursor(snippet, destinationFileExt);
  }

  const placement = getAutoImportSetting<string>('preferences', 'placement');

  if (insideStyleBlock && isFrameworkStyleDestination(destinationFileExt)) {
    return insertSnippetAtStyleBlock(snippet, placement);
  }

  if (destinationFileExt === '.astro') {
    return insertSnippetAtAstroFrontmatter(snippet, placement);
  }

  if (destinationFileExt === '.vue' || destinationFileExt === '.svelte') {
    return insertSnippetAtSfcScript(snippet, placement);
  }

  switch (placement) {
    case 'Top':
      return insertSnippetAtTop(snippet);
    case 'Bottom':
      return insertSnippetAtBottom(snippet);
    case 'Cursor':
      return insertSnippetAtCursor(snippet, destinationFileExt);
    default:
      return insertSnippetAtBottom(snippet);
  }
}

/** Inserts at the exact cursor position (line and column) without a trailing newline. */
function insertSnippetInline(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  editor.insertSnippet(snippet, editor.selection.anchor);
}

function insertSnippetAtTop(snippet: vscode.SnippetString): void {
  insertSnippetAtPosition(snippet, 0);
}

function insertSnippetAtCursor(snippet: vscode.SnippetString, destinationFileExt: FileExtension): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const currentLine = adjustForCommentBlock(lines, editor.selection.anchor.line, destinationFileExt);
  insertSnippetAtPosition(snippet, currentLine);
}

function insertSnippetAtBottom(snippet: vscode.SnippetString): void {
  const editor = vscode.window.activeTextEditor;
  const documentText = editor.document.getText();

  let insertionLine = 0;
  documentText.split('\n').forEach((lineContent, index) => {
    if (!isCommentLine(lineContent) && isImportLine(lineContent)) {
      insertionLine = index + 1;
    }
  });

  insertSnippetAtPosition(snippet, insertionLine);
}

function insertSnippetAtPosition(snippet: vscode.SnippetString, lineNumber: number, indentation?: string): void {
  const editor = vscode.window.activeTextEditor;
  const insertionColumn = determineInsertionColumn(editor);
  const insertionSnippet = indentation
    ? new vscode.SnippetString(indentation + snippet.value)
    : snippet;
  editor.insertSnippet(insertionSnippet, new vscode.Position(lineNumber, insertionColumn));
}

function determineInsertionColumn(editor: vscode.TextEditor): number {
  const currentColumn = editor.selection.anchor.character;
  const fileExtension = path.extname(editor.document.fileName) as FileExtension;

  const isScriptOrStylesheet =
    SCRIPT_FILE_EXTENSIONS.includes(fileExtension) || STYLESHEET_FILE_EXTENSIONS.includes(fileExtension);

  return isScriptOrStylesheet ? 0 : currentColumn;
}


function insertSnippetAtAstroFrontmatter(snippet: vscode.SnippetString, placement: string | undefined): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const bounds = findAstroFrontmatterBounds(lines);

  if (!bounds) {
    const wrappedSnippet = new vscode.SnippetString(`---\n${snippet.value}---\n`);
    editor.insertSnippet(wrappedSnippet, new vscode.Position(0, 0));
    return;
  }

  const { openingLine, closingLine } = bounds;

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, openingLine + 1, indentation);
      return;
    }
    case 'Cursor': {
      const rawCursorLine = editor.selection.anchor.line;
      if (rawCursorLine > openingLine && rawCursorLine < closingLine) {
        const cursorLine = adjustForCommentBlock(lines, rawCursorLine);
        const indentation = getLineIndentation(lines[cursorLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        insertSnippetAtPosition(snippet, cursorLine, indentation);
        return;
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
  }
}

function insertSnippetAtStyleBlock(snippet: vscode.SnippetString, placement: string | undefined): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const bounds = findEnclosingStyleBounds(lines, editor.selection.anchor.line);

  if (!bounds) {
    // The caller decided the cursor was inside a <style> block; if it can no longer be located
    // (an edit shifted the document between detection and insertion), fall back to Bottom.
    return insertSnippetAtBottom(snippet);
  }

  const { openingLine, closingLine } = bounds;

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, openingLine + 1, indentation);
      return;
    }
    case 'Cursor': {
      const cursorLine = adjustForCommentBlock(lines, editor.selection.anchor.line);
      const indentation = getLineIndentation(lines[cursorLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, cursorLine, indentation);
      return;
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
  }
}

function insertSnippetAtSfcScript(snippet: vscode.SnippetString, placement: string | undefined): void {
  const editor = vscode.window.activeTextEditor;
  const lines = editor.document.getText().split('\n');
  const bounds = findSfcScriptBounds(lines);

  if (!bounds) {
    const wrappedSnippet = new vscode.SnippetString(`<script>\n${snippet.value}</script>\n`);
    editor.insertSnippet(wrappedSnippet, new vscode.Position(0, 0));
    return;
  }

  const { openingLine, closingLine } = bounds;

  switch (placement) {
    case 'Top': {
      const indentation = detectBlockIndentation(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, openingLine + 1, indentation);
      return;
    }
    case 'Cursor': {
      const rawCursorLine = editor.selection.anchor.line;
      if (rawCursorLine > openingLine && rawCursorLine < closingLine) {
        const cursorLine = adjustForCommentBlock(lines, rawCursorLine);
        const indentation = getLineIndentation(lines[cursorLine] || '') || detectBlockIndentation(lines, openingLine, closingLine);
        insertSnippetAtPosition(snippet, cursorLine, indentation);
        return;
      }
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
    case 'Bottom':
    default: {
      const bottom = findBottomLineInRange(lines, openingLine, closingLine);
      insertSnippetAtPosition(snippet, bottom.line, bottom.indentation);
      return;
    }
  }
}
