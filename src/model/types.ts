/* 
  Supported file extension types
  */
export type FileExtension = '.ts' | '.tsx' | '.js' | '.jsx' 
  | '.css' | '.scss'
  | '.html' | '.md';

/* 
  Supported image file extension types
  */
export type ImageFileExtension = '.gif' | '.jpeg' | '.jpg' | '.png' | '.webp';

/* 
  Supported image and file extension types
  */
export type SupportedFileExtension = FileExtension | ImageFileExtension;

/* 
  Get Import text option types
  */
export type ImportType = 'script' | 'stylesheet' | 'markdown' | 'image';
