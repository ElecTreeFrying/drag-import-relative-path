/**
 * POSIX `path` stand-in for the **web bundle only**.
 *
 * The extension's path math is the one place it touches Node. `esbuild.js` aliases
 * the bare `'path'` specifier to this module when building `dist/web/extension.js`,
 * and to nothing at all when building `dist/extension.js` — so the desktop bundle
 * keeps Node's own `path`, with its platform-correct Windows behaviour, untouched.
 *
 * Only the members the extension actually calls are implemented: `relative`,
 * `dirname`, `basename`, `extname`, `parse`, `isAbsolute`, and `sep`. Adding a call
 * to any other member is a build-time type error here, which is the intended
 * tripwire — it means the web bundle needs a decision, not a silent `undefined`.
 *
 * Semantics are POSIX, which is correct for the web extension host: workspace paths
 * there come from `Uri` and are always forward-slashed. `resolve` is deliberately
 * *not* exported — Node's `relative()` resolves its arguments against `process.cwd()`,
 * which has no meaning in a worker, so the internal resolver below anchors relative
 * inputs at `/` instead. Every call site passes absolute `Uri.fsPath` values, so that
 * fallback is unreachable in practice; it exists so the function is total.
 *
 * Verified against Node's own `path.posix` by differential test — see
 * `src/test/path/browser-shim.test.ts`.
 */

const SLASH = 47; /* '/' */
const DOT = 46; /* '.' */

/** POSIX path separator. */
export const sep = '/';

/**
 * Resolve `.` and `..` segments out of a path body.
 *
 * @param body        The path with its leading separator (if any) already removed.
 * @param keepLeading Whether unresolvable leading `..` segments survive. True for
 *                    relative paths (`../../x` is meaningful), false for absolute
 *                    ones (`/..` is just `/`).
 */
function normalizeBody(body: string, keepLeading: boolean): string {
  const out: string[] = [];

  for (const segment of body.split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      if (out.length > 0 && out[out.length - 1] !== '..') {
        out.pop();
      } else if (keepLeading) {
        out.push('..');
      }
      continue;
    }
    out.push(segment);
  }

  return out.join('/');
}

/** Whether `filePath` starts at the root. */
export function isAbsolute(filePath: string): boolean {
  return filePath.charCodeAt(0) === SLASH;
}

/**
 * Anchor `filePath` at the root and normalize it. Relative input is treated as
 * relative to `/` — see the module note on why `process.cwd()` is not consulted.
 */
function toAbsolute(filePath: string): string {
  const normalized = normalizeBody(filePath, false);
  return normalized === '' ? '/' : `/${normalized}`;
}

/** The directory portion of `filePath`. */
export function dirname(filePath: string): string {
  if (filePath.length === 0) {
    return '.';
  }

  const absolute = isAbsolute(filePath);
  let end = -1;
  let sawNonSlash = false;

  for (let i = filePath.length - 1; i >= 1; i--) {
    if (filePath.charCodeAt(i) === SLASH) {
      if (sawNonSlash) {
        end = i;
        break;
      }
    } else {
      sawNonSlash = true;
    }
  }

  if (end === -1) {
    return absolute ? '/' : '.';
  }
  if (absolute && end === 1) {
    return '//';
  }
  return filePath.slice(0, end);
}

/** The last portion of `filePath`, optionally with a trailing `ext` removed. */
export function basename(filePath: string, ext?: string): string {
  let start = 0;
  let end = filePath.length;

  // Trailing separators are not part of the basename.
  while (end > 0 && filePath.charCodeAt(end - 1) === SLASH) {
    end--;
  }
  for (let i = end - 1; i >= 0; i--) {
    if (filePath.charCodeAt(i) === SLASH) {
      start = i + 1;
      break;
    }
  }

  const base = filePath.slice(start, end);

  if (ext !== undefined && ext.length > 0 && ext.length < base.length && base.endsWith(ext)) {
    return base.slice(0, base.length - ext.length);
  }
  return base;
}

/**
 * The extension of `filePath`, from the last `.` to the end, or `''` when there is
 * none. A leading dot on the basename is a hidden file, not an extension: `.gitignore`
 * yields `''`, matching Node.
 */
export function extname(filePath: string): string {
  const base = basename(filePath);
  const index = base.lastIndexOf('.');

  if (index <= 0) {
    return '';
  }
  return base.slice(index);
}

/** The pieces of `filePath`, matching the shape Node's `path.parse` returns. */
export function parse(filePath: string): {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
} {
  const root = isAbsolute(filePath) ? '/' : '';
  const base = basename(filePath);
  const ext = extname(filePath);
  const dir = dirname(filePath);

  return {
    root,
    // Node reports an empty dir when the path has no directory portion at all.
    dir: filePath.length === 0 || dir === '.' && !filePath.includes('/') ? '' : dir,
    base,
    ext,
    name: ext.length > 0 ? base.slice(0, base.length - ext.length) : base,
  };
}

/** The relative path from `from` to `to`, or `''` when they are the same location. */
export function relative(from: string, to: string): string {
  if (from === to) {
    return '';
  }

  const fromAbs = toAbsolute(from);
  const toAbs = toAbsolute(to);

  if (fromAbs === toAbs) {
    return '';
  }

  const fromParts = fromAbs === '/' ? [] : fromAbs.slice(1).split('/');
  const toParts = toAbs === '/' ? [] : toAbs.slice(1).split('/');

  let shared = 0;
  const limit = Math.min(fromParts.length, toParts.length);
  while (shared < limit && fromParts[shared] === toParts[shared]) {
    shared++;
  }

  const up = fromParts.length - shared;
  const down = toParts.slice(shared);

  return [ ...Array<string>(up).fill('..'), ...down ].join('/');
}

/**
 * Namespace re-export so `import * as path from 'path'` call sites resolve
 * `path.posix.*` identically to `path.*`, as they do under Node.
 */
export const posix = { sep, isAbsolute, dirname, basename, extname, parse, relative };

export default { sep, isAbsolute, dirname, basename, extname, parse, relative, posix };
