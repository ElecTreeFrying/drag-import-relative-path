/* 
  Supported file extension types
  */
export type FileExtensions = '.ts' | '.tsx' | '.js' | '.jsx' 
  | '.css' | '.scss'
  | '.html' | '.md';

/* 
  Supported image file extension types
  */
export type ImageFileExtensions = '.gif' | '.jpeg' | '.jpg' | '.png' | '.webp';

/* 
  Supported image and file extension types
  */
export type SupportedFileExtensions = FileExtensions | ImageFileExtensions;

/* 
  Get Import text option types
  */
export type ImportTextOptions = 'script' | 'stylesheet' | 'markdown' | 'image';
