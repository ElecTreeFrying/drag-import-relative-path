import * as path from 'path';

import { ImportType } from '../model';
import { getFileExt } from './file-extension';

/**
 * Get Import type.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns Import type
 */
export function getImportType(relativePath: string): ImportType | null {
  switch (getFileExt(relativePath)) {
    case '.js':   return 'script';
    case '.css':  return 'stylesheet';
    case '.scss': return null;
    case '.md':   return 'markdown';
    default:      return 'image';
  }
}
