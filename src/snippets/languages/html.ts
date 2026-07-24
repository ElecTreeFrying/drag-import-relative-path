import * as vscode from 'vscode';

import { getAutoImportSetting } from '../../config/settings';
import { extractFileExtension } from '../../path/extension';
import { determineImportType } from '../../path/import-type';
import { FilePathInfo } from '../../editor/file-path-info';
import {
  HTML_AUDIO_IMPORT_OPTIONS,
  HTML_IMAGE_IMPORT_OPTIONS,
  HTML_SCRIPT_IMPORT_OPTIONS,
  HTML_VIDEO_IMPORT_OPTIONS,
  resolveStyleIndex,
} from '../_styles';

export function buildSnippet(info: FilePathInfo): vscode.SnippetString {
  const { sourceFilePath, relativePath } = info;
  const fullPath = relativePath + extractFileExtension(sourceFilePath);

  switch (determineImportType(sourceFilePath)) {
    case 'script': {
      const styleIndex = resolveStyleIndex(HTML_SCRIPT_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'htmlScript'));
      return buildHtmlScriptImportSnippetByStyle(styleIndex, fullPath);
    }
    case 'image': {
      const styleIndex = resolveStyleIndex(HTML_IMAGE_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'htmlImage'));
      return buildHtmlImageImportSnippetByStyle(styleIndex, fullPath);
    }
    case 'video': {
      const styleIndex = resolveStyleIndex(HTML_VIDEO_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'htmlVideo'));
      return buildHtmlVideoImportSnippetByStyle(styleIndex, fullPath);
    }
    case 'audio': {
      const styleIndex = resolveStyleIndex(HTML_AUDIO_IMPORT_OPTIONS, getAutoImportSetting<string>('markup', 'htmlAudio'));
      return buildHtmlAudioImportSnippetByStyle(styleIndex, fullPath);
    }
    case 'text-track':
      return buildHtmlTextTrackImportSnippet(fullPath);
    case 'stylesheet':
      return buildHtmlStylesheetImportSnippet(fullPath);
    default:
      return new vscode.SnippetString('');
  }
}

export function buildHtmlScriptImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`<script src="${relativePath}"></script>`);
    case 1:
      return new vscode.SnippetString(`<script src="${relativePath}" defer></script>`);
    case 2:
      return new vscode.SnippetString(`<script type="module" src="${relativePath}"></script>`);
    case 3:
      return new vscode.SnippetString(`<script src="${relativePath}" async></script>`);
    case 4:
      return new vscode.SnippetString(`<script type="text/javascript" src="${relativePath}"></script>`);
    default:
      return new vscode.SnippetString(`<script src="${relativePath}"></script>`);
  }
}

export function buildHtmlImageImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
    case 1:
      return new vscode.SnippetString(`<img src="${relativePath}" alt="$1" loading="lazy">`);
    case 2:
      return new vscode.SnippetString(`<img src="${relativePath}" alt="$1" width="$2" height="$3">`);
    default:
      return new vscode.SnippetString(`<img src="${relativePath}" alt="sample">`);
  }
}

export function buildHtmlStylesheetImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<link href="${relativePath}" rel="stylesheet">`);
}

export function buildHtmlVideoImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`<video src="${relativePath}" controls></video>`);
    case 1:
      return new vscode.SnippetString(`<video src="${relativePath}" autoplay muted loop playsinline></video>`);
    case 2:
      return new vscode.SnippetString(`<video src="${relativePath}" controls poster="$1"></video>`);
    case 3:
      return new vscode.SnippetString(`<video src="${relativePath}" controls preload="metadata"></video>`);
    default:
      return new vscode.SnippetString(`<video src="${relativePath}" controls></video>`);
  }
}

export function buildHtmlAudioImportSnippetByStyle(
  styleIndex: number | undefined,
  relativePath: string,
): vscode.SnippetString {
  switch (styleIndex) {
    case 0:
      return new vscode.SnippetString(`<audio src="${relativePath}" controls></audio>`);
    case 1:
      return new vscode.SnippetString(`<audio src="${relativePath}" controls preload="metadata"></audio>`);
    default:
      return new vscode.SnippetString(`<audio src="${relativePath}" controls></audio>`);
  }
}

export function buildHtmlTextTrackImportSnippet(relativePath: string): vscode.SnippetString {
  return new vscode.SnippetString(`<track src="${relativePath}" kind="subtitles" srclang="\${1:en}" label="\${2:English}"></track>`);
}
