import * as path from 'path';

import { removeFileExtension } from './extension';

export function computeRelative(sourceFilePath: string, destinationFilePath: string): string {
  const relativePath = toUnixPath(path.relative(path.dirname(destinationFilePath), sourceFilePath));

  // Add './' only when the path doesn't already start with '.'. Same-directory imports come back
  // from path.relative as a bare name ('foo' / 'utils/helper'), so they still get the prefix; paths
  // that already begin with '../' are left untouched (prefixing them would emit a redundant './../').
  const prefix = relativePath.startsWith('.') ? '' : './';

  return prefix + removeFileExtension(relativePath);
}

function toUnixPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}
