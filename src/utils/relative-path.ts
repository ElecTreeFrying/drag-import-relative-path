import * as path from 'path';
import * as relative from 'relative';

interface RelativePathOptions {
  preserveFileExt: boolean
}

export function getRelativePath(from: string, to: string, options: RelativePathOptions): string {
  const startChars = isSameDir(from, to) ? './' : '';
  const relativePath = toWindowsPath(relative(from, to));
  return options.preserveFileExt
    ? startChars + relativePath
    : startChars + removeFileExt(relativePath);
}

function toWindowsPath(relativePath: string): string {
  return relativePath.replace(/\\/gi, '/');
}

function removeFileExt(relativePath: string): string {
  const ext = path.parse(relativePath).ext;
  return relativePath.slice(0, -(ext.length));
}

function isSameDir(from: string, to: string): boolean {
  return path.parse(from).dir.toLowerCase() === path.parse(to).dir.toLowerCase();
}
