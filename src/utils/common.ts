import * as path from 'path';

import { FileExtensions } from '../interfaces';

export function getFileExt(relativePath: string): FileExtensions {
  return path.parse(relativePath).ext as FileExtensions;
}
