import { ImportType } from '../types/import-type';
import { extractFileExtension } from './extension';

export function determineImportType(filePath: string): ImportType | null {
  switch (extractFileExtension(filePath)) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
    case '.vue':
    case '.svelte':
    case '.astro':
      return 'script';
    case '.css':
      return 'stylesheet';
    case '.md':
      return 'markdown';
    case '.mp4':
    case '.webm':
    case '.mov':
      return 'video';
    case '.mp3':
    case '.ogg':
    case '.wav':
    case '.m4a':
      return 'audio';
    case '.vtt':
      return 'text-track';
    case '.html':
      return null;
    case '.scss':
      return null;
    default:
      return 'image';
  }
}
