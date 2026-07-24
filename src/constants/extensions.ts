import { FileExtension } from '../types/file-extension';

export const IMAGE_FILE_EXTENSIONS: FileExtension[] = [
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.avif',
  '.webp',
];

export const MEDIA_FILE_EXTENSIONS: FileExtension[] = [
  '.mp4',
  '.webm',
  '.mov',
  '.mp3',
  '.ogg',
  '.wav',
  '.m4a',
];

export const TEXT_TRACK_FILE_EXTENSIONS: FileExtension[] = [
  '.vtt',
];

export const TEX_GRAPHICS_FILE_EXTENSIONS: FileExtension[] = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.eps',
];

export const STYLESHEET_FILE_EXTENSIONS: FileExtension[] = [
  '.scss',
  '.css',
];

export const FRAMEWORK_COMPONENT_FILE_EXTENSIONS: FileExtension[] = [
  '.vue',
  '.svelte',
  '.astro',
];

export const HTML_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.js',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
];

export const MARKDOWN_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.md',
  ...IMAGE_FILE_EXTENSIONS,
];

export const CSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

export const SCSS_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.scss',
  '.css',
  ...IMAGE_FILE_EXTENSIONS,
];

export const VUE_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.vue',
  '.ts',
  '.js',
  '.jsx',
  '.tsx',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.mdx',
  ...STYLESHEET_FILE_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
];

export const SVELTE_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.svelte',
  '.ts',
  '.js',
  '.jsx',
  '.tsx',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.mdx',
  ...STYLESHEET_FILE_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
];

export const ASTRO_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.astro',
  '.ts',
  '.js',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.mdx',
  ...STYLESHEET_FILE_EXTENSIONS,
  ...IMAGE_FILE_EXTENSIONS,
  ...MEDIA_FILE_EXTENSIONS,
  ...TEXT_TRACK_FILE_EXTENSIONS,
];

export const TEX_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.tex',
  '.bib',
  ...TEX_GRAPHICS_FILE_EXTENSIONS,
];

export const TYPESCRIPT_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.ts',
  ...FRAMEWORK_COMPONENT_FILE_EXTENSIONS,
];

export const JAVASCRIPT_SUPPORTED_EXTENSIONS: FileExtension[] = [
  '.js',
  ...FRAMEWORK_COMPONENT_FILE_EXTENSIONS,
];

export const SCRIPT_FILE_EXTENSIONS: FileExtension[] = [
  '.ts',
  '.tsx',
  '.mdx',
  '.js',
  '.jsx',
  '.vue',
  '.svelte',
  '.astro',
];

export const CROSS_IMPORT_DESTINATIONS: FileExtension[] = [
  '.html',
  '.md',
  '.css',
  '.scss',
  '.tsx',
  '.mdx',
  '.jsx',
  '.vue',
  '.svelte',
  '.astro',
  '.tex',
  '.ts',
  '.js',
];
