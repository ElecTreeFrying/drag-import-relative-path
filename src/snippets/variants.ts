import * as vscode from 'vscode';
import * as path from 'path';

import { FileExtension } from '../types/file-extension';
import { FRAMEWORK_COMPONENT_FILE_EXTENSIONS, STYLESHEET_FILE_EXTENSIONS } from '../constants/extensions';
import { AutoImportConfigNamespace, AutoImportSettingKey, getAutoImportSetting } from '../config/settings';
import { determineImportType } from '../path/import-type';
import { FilePathInfo } from '../editor/file-path-info';

import {
  ImportStyle,
  JAVASCRIPT_IMPORT_OPTIONS,
  TYPESCRIPT_IMPORT_OPTIONS,
  CSS_IMPORT_OPTIONS,
  SCSS_IMPORT_OPTIONS,
  HTML_AUDIO_IMPORT_OPTIONS,
  HTML_IMAGE_IMPORT_OPTIONS,
  HTML_SCRIPT_IMPORT_OPTIONS,
  HTML_VIDEO_IMPORT_OPTIONS,
  MARKDOWN_IMAGE_IMPORT_OPTIONS,
  TEX_GRAPHICS_IMPORT_OPTIONS,
  TEX_INPUT_IMPORT_OPTIONS,
  TEX_BIBLIOGRAPHY_IMPORT_OPTIONS,
} from './_styles';
import { readExportedClassName } from './_class-name';
import { buildAssetImportStatement } from './_react';
import { buildJavaScriptImportSnippetByStyle } from './languages/javascript';
import { buildTypeScriptImportSnippetByStyle } from './languages/typescript';
import { buildCssImportSnippetByStyle, buildCssImageImportSnippet } from './languages/css';
import { buildScssImportSnippetByStyle, prepareScssImportPath } from './languages/scss';
import {
  buildHtmlScriptImportSnippetByStyle,
  buildHtmlImageImportSnippetByStyle,
  buildHtmlVideoImportSnippetByStyle,
  buildHtmlAudioImportSnippetByStyle,
  buildHtmlTextTrackImportSnippet,
  buildHtmlStylesheetImportSnippet,
} from './languages/html';
import { buildMarkdownImportSnippet, buildMarkdownImageImportSnippetByStyle } from './languages/markdown';
import {
  buildTexGraphicsImportSnippetByStyle,
  buildTexInputImportSnippetByStyle,
  buildTexBibliographyImportSnippetByStyle,
  isTexGraphicsSource,
  resolveGraphicsPath,
} from './languages/latex';

export interface ImportSnippetVariant {
  label: string;
  description: string;
  snippetText: string;
  setting?: {
    namespace: AutoImportConfigNamespace;
    key: AutoImportSettingKey;
    value: string;
  };
}

export async function buildImportSnippetVariants(
  info: FilePathInfo,
  insideStyleBlock = false,
): Promise<ImportSnippetVariant[]> {
  const { sourceFilePath, sourceFileExt, destinationFileExt, relativePath } = info;

  const shouldPreserveScriptExtension = getAutoImportSetting<boolean>('script', 'preserve');
  const scriptPath = relativePath + (shouldPreserveScriptExtension ? sourceFileExt : '');
  const fullPath = relativePath + sourceFileExt;
  const labelScriptPath = path.basename(scriptPath);
  const labelFullPath = path.basename(fullPath);

  switch (destinationFileExt) {
    case '.js':
      if (FRAMEWORK_COMPONENT_FILE_EXTENSIONS.includes(sourceFileExt)) {
        const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
        return variant ? [ variant ] : [];
      }
      return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
          buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
          'script', 'javascript',
        ));
    case '.ts': {
      if (FRAMEWORK_COMPONENT_FILE_EXTENSIONS.includes(sourceFileExt)) {
        const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
        return variant ? [ variant ] : [];
      }
      const className = await readExportedClassName(sourceFilePath);
      const resolved = className ?? undefined;
      return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildTypeScriptImportSnippetByStyle(opt.value, scriptPath, resolved),
          buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath, resolved),
          'script', 'typescript',
        ));
    }
    case '.jsx':
      return buildJsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.tsx':
    case '.mdx':
      return buildTsxVariants(sourceFileExt, scriptPath, labelScriptPath, fullPath, labelFullPath);
    case '.vue':
    case '.svelte':
    case '.astro':
      return buildFrameworkComponentVariants(
        sourceFileExt, sourceFilePath, relativePath, scriptPath, labelScriptPath, fullPath, labelFullPath, insideStyleBlock);
    case '.css':
      return buildCssVariants(sourceFilePath, fullPath, labelFullPath);
    case '.scss':
      return buildScssVariants(sourceFilePath, relativePath, fullPath, labelFullPath);
    case '.html':
      return buildHtmlVariants(sourceFilePath, fullPath, labelFullPath);
    case '.md':
      return buildMarkdownVariants(sourceFileExt, sourceFilePath, fullPath, labelFullPath);
    case '.tex':
      return buildTexVariants(sourceFileExt, relativePath);
    default:
      return [];
  }
}

function buildJsxVariants(
  sourceFileExt: FileExtension,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (sourceFileExt === '.js' || sourceFileExt === '.jsx') {
    return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
        buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'javascript',
      ));
  }
  const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
  return variant ? [variant] : [];
}

function buildTsxVariants(
  sourceFileExt: FileExtension,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (sourceFileExt === '.ts' || sourceFileExt === '.tsx') {
    return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTypeScriptImportSnippetByStyle(opt.value, scriptPath),
        buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'typescript',
      ));
  }
  if (sourceFileExt === '.js' || sourceFileExt === '.jsx') {
    return JAVASCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildJavaScriptImportSnippetByStyle(opt.value, scriptPath),
        buildJavaScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'javascript',
      ));
  }
  const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
  return variant ? [variant] : [];
}

function buildFrameworkComponentVariants(
  sourceFileExt: FileExtension,
  sourceFilePath: string,
  relativePath: string,
  scriptPath: string,
  labelScriptPath: string,
  fullPath: string,
  labelFullPath: string,
  insideStyleBlock: boolean,
): ImportSnippetVariant[] {
  if (sourceFileExt === '.ts' || sourceFileExt === '.tsx'
    || sourceFileExt === '.js' || sourceFileExt === '.jsx') {
    return TYPESCRIPT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTypeScriptImportSnippetByStyle(opt.value, scriptPath),
        buildTypeScriptImportSnippetByStyle(opt.value, labelScriptPath),
        'script', 'typescript',
      ));
  }
  // Inside a `<style>` block, a stylesheet source enumerates the CSS / SCSS style pickers (the same
  // `stylesheet` settings the plain `.css`/`.scss` destinations persist) rather than the single
  // hardcoded side-effect variant. The source extension picks which catalogue.
  if (insideStyleBlock && STYLESHEET_FILE_EXTENSIONS.includes(sourceFileExt)) {
    return sourceFileExt === '.scss'
      ? buildScssVariants(sourceFilePath, relativePath, fullPath, labelFullPath)
      : buildCssVariants(sourceFilePath, fullPath, labelFullPath);
  }
  const variant = buildReactNonScriptVariant(sourceFileExt, fullPath, labelFullPath);
  return variant ? [variant] : [];
}

function buildReactNonScriptVariant(
  sourceFileExt: FileExtension,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant | null {
  const insert = buildAssetImportStatement(sourceFileExt, fullPath);
  const label = buildAssetImportStatement(sourceFileExt, labelFullPath);
  if (insert === null || label === null) {
    return null;
  }
  return toHardcodedVariant(new vscode.SnippetString(insert), new vscode.SnippetString(label));
}

function buildCssVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  if (determineImportType(sourceFilePath) === 'image') {
    return [toHardcodedVariant(
      buildCssImageImportSnippet(fullPath),
      buildCssImageImportSnippet(labelFullPath),
    )];
  }
  return CSS_IMPORT_OPTIONS.map(opt =>
    toStyledVariant(
      opt,
      buildCssImportSnippetByStyle(opt.value, fullPath),
      buildCssImportSnippetByStyle(opt.value, labelFullPath),
      'stylesheet', 'css',
    ));
}

function buildScssVariants(
  sourceFilePath: string,
  relativePath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  if (determineImportType(sourceFilePath) === 'image') {
    return [toHardcodedVariant(
      buildCssImageImportSnippet(fullPath),
      buildCssImageImportSnippet(labelFullPath),
    )];
  }
  const scssPath = prepareScssImportPath(sourceFilePath, relativePath);
  const labelScssPath = path.basename(scssPath);
  return SCSS_IMPORT_OPTIONS.map(opt =>
    toStyledVariant(
      opt,
      buildScssImportSnippetByStyle(opt.value, scssPath),
      buildScssImportSnippetByStyle(opt.value, labelScssPath),
      'stylesheet', 'scss',
    ));
}

function buildHtmlVariants(sourceFilePath: string, fullPath: string, labelFullPath: string): ImportSnippetVariant[] {
  switch (determineImportType(sourceFilePath)) {
    case 'script':
      return HTML_SCRIPT_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlScriptImportSnippetByStyle(opt.value, fullPath),
          buildHtmlScriptImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlScript',
        ));
    case 'image':
      return HTML_IMAGE_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlImageImportSnippetByStyle(opt.value, fullPath),
          buildHtmlImageImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlImage',
        ));
    case 'video':
      return HTML_VIDEO_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlVideoImportSnippetByStyle(opt.value, fullPath),
          buildHtmlVideoImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlVideo',
        ));
    case 'audio':
      return HTML_AUDIO_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildHtmlAudioImportSnippetByStyle(opt.value, fullPath),
          buildHtmlAudioImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'htmlAudio',
        ));
    case 'text-track':
      return [toHardcodedVariant(
        buildHtmlTextTrackImportSnippet(fullPath),
        buildHtmlTextTrackImportSnippet(labelFullPath),
      )];
    case 'stylesheet':
      return [toHardcodedVariant(
        buildHtmlStylesheetImportSnippet(fullPath),
        buildHtmlStylesheetImportSnippet(labelFullPath),
      )];
    default:
      return [];
  }
}

function buildMarkdownVariants(
  sourceFileExt: FileExtension,
  sourceFilePath: string,
  fullPath: string,
  labelFullPath: string,
): ImportSnippetVariant[] {
  // Extensionless sources (LICENSE, Dockerfile, Makefile) are a single link variant — the same shape
  // as a .md source. `fullPath` already equals the whole relative path here (no extension appended).
  if ((sourceFileExt as string) === '') {
    return [toHardcodedVariant(
      buildMarkdownImportSnippet(fullPath),
      buildMarkdownImportSnippet(labelFullPath),
    )];
  }

  switch (determineImportType(sourceFilePath)) {
    case 'markdown':
      return [toHardcodedVariant(
        buildMarkdownImportSnippet(fullPath),
        buildMarkdownImportSnippet(labelFullPath),
      )];
    case 'image':
      return MARKDOWN_IMAGE_IMPORT_OPTIONS.map(opt =>
        toStyledVariant(
          opt,
          buildMarkdownImageImportSnippetByStyle(opt.value, fullPath),
          buildMarkdownImageImportSnippetByStyle(opt.value, labelFullPath),
          'markup', 'markdownImage',
        ));
    default:
      return [];
  }
}

function buildTexVariants(sourceFileExt: FileExtension, relativePath: string): ImportSnippetVariant[] {
  if (isTexGraphicsSource(sourceFileExt)) {
    const graphicsPath = resolveGraphicsPath(relativePath, sourceFileExt);
    const labelGraphicsPath = path.basename(graphicsPath);
    return TEX_GRAPHICS_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTexGraphicsImportSnippetByStyle(opt.value, graphicsPath),
        buildTexGraphicsImportSnippetByStyle(opt.value, labelGraphicsPath),
        'latex', 'graphics',
      ));
  }
  if (sourceFileExt === '.tex') {
    const labelPath = path.basename(relativePath);
    return TEX_INPUT_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTexInputImportSnippetByStyle(opt.value, relativePath),
        buildTexInputImportSnippetByStyle(opt.value, labelPath),
        'latex', 'input',
      ));
  }
  if (sourceFileExt === '.bib') {
    const labelPath = path.basename(relativePath);
    return TEX_BIBLIOGRAPHY_IMPORT_OPTIONS.map(opt =>
      toStyledVariant(
        opt,
        buildTexBibliographyImportSnippetByStyle(opt.value, relativePath, sourceFileExt),
        buildTexBibliographyImportSnippetByStyle(opt.value, labelPath, sourceFileExt),
        'latex', 'bibliography',
      ));
  }
  return [];
}

function toStyledVariant(
  opt: ImportStyle,
  insertSnippet: vscode.SnippetString,
  labelSnippet: vscode.SnippetString,
  namespace: AutoImportConfigNamespace,
  key: AutoImportSettingKey,
): ImportSnippetVariant {
  return {
    label: renderLabel(labelSnippet.value),
    description: opt.tag ?? opt.description,
    snippetText: insertSnippet.value,
    setting: { namespace, key, value: opt.description },
  };
}

function toHardcodedVariant(
  insertSnippet: vscode.SnippetString,
  labelSnippet: vscode.SnippetString,
): ImportSnippetVariant {
  return {
    label: renderLabel(labelSnippet.value),
    description: '',
    snippetText: insertSnippet.value,
  };
}

function renderLabel(snippetText: string): string {
  return snippetText
    .replace(/\$\{\d+:([^}]+)\}/g, '$1')
    .replace(/\$\d+/g, 'name')
    .replace(/\n\s*/g, ' ');
}
