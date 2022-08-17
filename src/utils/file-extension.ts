import * as path from 'path';

import { FileExtensions } from '../model';

/**
 * Get file extension from path/relative paths.
 * @param {string} relativePath Calculated relative path from dragged file and text editor.
 * @returns FileExtensions: Supported file extensions
 */
export function getFileExt(relativePath: string): FileExtensions {
  return path.parse(relativePath).ext as FileExtensions;
}
