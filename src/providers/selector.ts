import * as vscode from 'vscode';

/* 
  Declared language identifiers
  for drop edit provider registration
  */
export const selectors: vscode.DocumentSelector = [
  {
    language: 'javascript',
    scheme: 'file'
  },
  {
    language: 'javascriptreact',
    scheme: 'file'
  },
  {
    language: 'typescript',
    scheme: 'file'
  },
  {
    language: 'typescriptreact',
    scheme: 'file'
  },
  {
    language: 'css',
    scheme: 'file'
  },
  {
    language: 'scss',
    scheme: 'file'
  },
  {
    language: 'html',
    scheme: 'file'
  },
  {
    language: 'markdown',
    scheme: 'file'
  }
];
