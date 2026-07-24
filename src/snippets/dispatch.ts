import * as vscode from 'vscode';

import { FilePathInfo } from '../editor/file-path-info';

import * as javascript from './languages/javascript';
import * as typescript from './languages/typescript';
import * as jsx from './languages/jsx';
import * as tsx from './languages/tsx';
import * as css from './languages/css';
import * as scss from './languages/scss';
import * as html from './languages/html';
import * as markdown from './languages/markdown';
import * as frameworkComponent from './languages/framework-component';
import * as latex from './languages/latex';

export async function buildImportSnippet(
  info: FilePathInfo,
  insideStyleBlock = false,
): Promise<vscode.SnippetString> {
  switch (info.destinationFileExt) {
    case '.js':
      return javascript.buildSnippet(info);
    case '.jsx':
      return jsx.buildSnippet(info);
    case '.ts':
      return typescript.buildSnippet(info);
    case '.tsx':
    case '.mdx':
      return tsx.buildSnippet(info);
    case '.css':
      return css.buildSnippet(info);
    case '.scss':
      return scss.buildSnippet(info);
    case '.html':
      return html.buildSnippet(info);
    case '.md':
      return markdown.buildSnippet(info);
    case '.vue':
    case '.svelte':
    case '.astro':
      return frameworkComponent.buildSnippet(info, insideStyleBlock);
    case '.tex':
      return latex.buildSnippet(info);
    default:
      return new vscode.SnippetString('');
  }
}
