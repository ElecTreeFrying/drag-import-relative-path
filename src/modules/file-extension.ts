import * as path from 'path';

import { FileExtension } from '../model';

/**
 * Get file extension from path/relative paths.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns FileExtension: Supported file extensions
 */
export function getFileExt(relativePath: string): FileExtension {
  return path.parse(relativePath).ext as FileExtension;
}
