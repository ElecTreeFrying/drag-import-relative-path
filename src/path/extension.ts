import * as path from 'path';

import { FileExtension } from '../types/file-extension';

export function extractFileExtension(filePath: string): FileExtension {
  return path.parse(filePath).ext as FileExtension;
}

export function removeFileExtension(filePath: string): string {
  const ext = extractFileExtension(filePath);
  // Guard the empty-extension case: `slice(0, -0)` is `slice(0, 0)` === '' (a zero-width slice), which
  // would erase an extensionless path (`LICENSE` → ''). Extensionless sources are kept whole so their
  // relative path survives (`../LICENSE`) for the Markdown-link destination.
  return ext ? filePath.slice(0, -ext.length) : filePath;
}
