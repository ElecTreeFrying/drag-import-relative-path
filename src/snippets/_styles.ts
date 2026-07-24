export interface ImportStyle {
  value: number;
  description: string;
  tag?: string;
}

export function resolveStyleIndex(table: ImportStyle[], configValue: string | undefined): number | undefined {
  return table.find(option => option.description === configValue)?.value;
}

export const JAVASCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import name from '_relativePath_';", tag: 'ES module: default import' },
  { value: 1, description: "import { name } from '_relativePath_';", tag: 'ES module: named import (destructured)' },
  { value: 2, description: "import name, { other } from '_relativePath_';", tag: 'ES module: default + named import (mixed)' },
  { value: 3, description: "import * as name from '_relativePath_';", tag: 'ES module: namespace import (every export bound under one name)' },
  { value: 4, description: "import '_relativePath_';", tag: 'ES module: side-effect import (no binding)' },
  { value: 5, description: "const name = require('_relativePath_');", tag: 'CommonJS: const require()' },
  { value: 6, description: "const name = await import('_relativePath_');", tag: 'Dynamic import: lazy-load / code-splitting' },
];

export const TYPESCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "import { name } from '_relativePath_';", tag: 'ES module: named import — legacy Angular files (.component / .directive / .pipe / .service / .module) auto-fill PascalCase identifiers (back-compat)' },
  { value: 1, description: "import name from '_relativePath_';", tag: 'ES module: default import' },
  { value: 2, description: "import * as name from '_relativePath_';", tag: 'ES module: namespace import (every export bound under one name)' },
  { value: 3, description: "import '_relativePath_';", tag: 'ES module: side-effect import (no binding)' },
  { value: 4, description: "import type { name } from '_relativePath_';", tag: 'TypeScript: type-only import (TS 3.8+ — zero runtime, erased at compile time)' },
  { value: 5, description: "import { name, type Type } from '_relativePath_';", tag: 'TypeScript: mixed value + type import (TS 4.5+ inline modifier)' },
  { value: 6, description: "const name = await import('_relativePath_');", tag: 'Dynamic import: lazy-load / code-splitting' },
];

export const CSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@import '_relativePath_';", tag: '@import with quoted path' },
  { value: 1, description: "@import url('_relativePath_');", tag: '@import with url() function' },
];

export const CSS_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "url('_relativePath_')" },
];

export const SCSS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: "@use '_relativePath_';", tag: 'Modern @use — Sass module system (recommended)' },
  { value: 1, description: "@use '_relativePath_' as *;", tag: 'Modern @use with wildcard alias — no namespace prefix required' },
  { value: 2, description: "@use '_relativePath_' as name;", tag: 'Modern @use with named alias' },
  { value: 3, description: "@forward '_relativePath_';", tag: 'Sass module re-export — barrel pattern' },
  { value: 4, description: "@import '_relativePath_';", tag: 'Legacy @import — Sass-deprecated' },
];

export const HTML_SCRIPT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<script src="_relativePath_"></script>', tag: 'Modern minimal — type is the HTML5 default' },
  { value: 1, description: '<script src="_relativePath_" defer></script>', tag: 'Deferred execution — runs after parsing, preserves order' },
  { value: 2, description: '<script type="module" src="_relativePath_"></script>', tag: 'ES module — native ESM in HTML' },
  { value: 3, description: '<script src="_relativePath_" async></script>', tag: 'Async execution — order-independent, runs when downloaded' },
  { value: 4, description: '<script type="text/javascript" src="_relativePath_"></script>', tag: 'Legacy — includes redundant type="text/javascript"' },
];

export const HTML_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<img src="_relativePath_" alt="sample">' },
  { value: 1, description: '<img src="_relativePath_" alt="" loading="lazy">', tag: 'Lazy loading — opt-in for below-fold images' },
  { value: 2, description: '<img src="_relativePath_" alt="" width="" height="">', tag: 'Explicit dimensions — Core Web Vitals CLS prevention' },
];

export const HTML_VIDEO_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<video src="_relativePath_" controls></video>' },
  { value: 1, description: '<video src="_relativePath_" autoplay muted loop playsinline></video>', tag: 'Silent autoplay — background video (hero sections)' },
  { value: 2, description: '<video src="_relativePath_" controls poster=""></video>', tag: 'Controls + poster — custom thumbnail before playback' },
  { value: 3, description: '<video src="_relativePath_" controls preload="metadata"></video>', tag: 'Long-form video — preload metadata only (Core Web Vitals)' },
];

export const HTML_AUDIO_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<audio src="_relativePath_" controls></audio>' },
  { value: 1, description: '<audio src="_relativePath_" controls preload="metadata"></audio>', tag: 'Network-friendly — preload metadata only' },
];

export const HTML_STYLESHEET_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '<link href="_relativePath_" rel="stylesheet">' },
];

export const MARKDOWN_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '[text](_relativePath_)' },
];

export const MARKDOWN_IMAGE_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '![alt-text](_relativePath_)', tag: 'Bare inline image — most common Markdown image form' },
  { value: 1, description: '![alt-text](_relativePath_ "Hover text")', tag: 'Inline image syntax with hover-text title' },
  { value: 2, description: '<img src="_relativePath_" alt="" width="" height="">', tag: 'HTML embed for sizing — Core Web Vitals CLS prevention' },
];

export const TEX_GRAPHICS_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '\\begin{figure}[htbp] \\centering \\includegraphics[width=0.5\\textwidth]{_relativePath_} \\caption{} \\label{fig:} \\end{figure}', tag: 'Figure float — centered, sized, with caption and label' },
  { value: 1, description: '\\includegraphics[width=0.5\\textwidth]{_relativePath_}', tag: 'Sized graphic — width as a fraction of \\textwidth, no float' },
  { value: 2, description: '\\includegraphics{_relativePath_}', tag: 'Bare graphic — natural size, no float' },
];

export const TEX_INPUT_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '\\input{_relativePath_}', tag: 'Inline include — \\input (no page break)' },
  { value: 1, description: '\\include{_relativePath_}', tag: 'Chapter include — \\include (page break, \\includeonly-able)' },
];

export const TEX_BIBLIOGRAPHY_IMPORT_OPTIONS: ImportStyle[] = [
  { value: 0, description: '\\addbibresource{_relativePath_}', tag: 'Modern biblatex — \\addbibresource (keeps .bib)' },
  { value: 1, description: '\\bibliography{_relativePath_}', tag: 'Legacy BibTeX — \\bibliography (drops .bib)' },
];
