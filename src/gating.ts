import { FilePathInfo } from './editor/file-path-info';
import {
  ASTRO_SUPPORTED_EXTENSIONS,
  CROSS_IMPORT_DESTINATIONS,
  CSS_SUPPORTED_EXTENSIONS,
  HTML_SUPPORTED_EXTENSIONS,
  JAVASCRIPT_SUPPORTED_EXTENSIONS,
  MARKDOWN_SUPPORTED_EXTENSIONS,
  SCSS_SUPPORTED_EXTENSIONS,
  SVELTE_SUPPORTED_EXTENSIONS,
  TEX_SUPPORTED_EXTENSIONS,
  TYPESCRIPT_SUPPORTED_EXTENSIONS,
  VUE_SUPPORTED_EXTENSIONS,
} from './constants/extensions';

/** Returns `false` when the source/destination extension pair is not supported for import generation. */
export function isPairSupported(info: FilePathInfo): boolean {
  const { sourceFileExt, destinationFileExt } = info;

  // An extensionless source (`LICENSE`, `Dockerfile`, `Makefile`) is only importable as a Markdown
  // link — no bundler resolves an extensionless import in a script/style/markup destination. Checked
  // first so the boolean is honest for every flow, including the accept-all `.jsx`/`.tsx`/`.mdx`
  // destinations (which otherwise pass clause 1 and would rely on the empty-snippet backstop).
  if ((sourceFileExt as string) === '') {
    return destinationFileExt === '.md';
  }
  if (!CROSS_IMPORT_DESTINATIONS.includes(destinationFileExt) && sourceFileExt !== destinationFileExt) {
    return false;
  }
  if (sourceFileExt === '.html' && destinationFileExt === '.html') {
    return false;
  }
  if (destinationFileExt === '.html' && !HTML_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.md' && !MARKDOWN_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.css' && !CSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.scss' && !SCSS_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.vue' && !VUE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.svelte' && !SVELTE_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.astro' && !ASTRO_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.tex' && !TEX_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.ts' && !TYPESCRIPT_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  if (destinationFileExt === '.js' && !JAVASCRIPT_SUPPORTED_EXTENSIONS.includes(sourceFileExt)) {
    return false;
  }
  return true;
}
