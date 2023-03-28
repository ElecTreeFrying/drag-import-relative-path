import { FileExtension } from "../model";

/* 
  Supported image files extensions 
  */
const supportedImages: FileExtension[] = [ '.gif', '.jpeg', '.jpg', '.png', '.webp' ];

/* 
  Supported import file extensions to HTML 
  */
export const htmlSupported: FileExtension[] = [ '.js', '.css', ...supportedImages ];

/* 
  Supported import file extensions to Markdown 
  */
export const markdownSupported: FileExtension[] = [ '.md', ...supportedImages ];

/* 
  Supported import file extensions to CSS 
  */
export const cssSupported: FileExtension[] = [ '.css', ...supportedImages ];

/* 
  Supported import file extensions to SCSS 
  */
export const scssSupported: FileExtension[] = [ '.scss', '.css', ...supportedImages ];

export const permittedExts: FileExtension[] = [ '.html', '.md', '.css', '.scss', '.tsx', '.jsx' ];
