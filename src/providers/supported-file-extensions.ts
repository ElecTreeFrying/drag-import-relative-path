import { ImageFileExtension, SupportedFileExtension } from "../model";

/* 
  Supported image files extensions 
  */
const supportedImages: ImageFileExtension[] = [ '.gif', '.jpeg', '.jpg', '.png', '.webp' ];

/* 
  Supported import file extensions to HTML 
  */
export const htmlSupported: SupportedFileExtension[] = [ '.js', '.css', ...supportedImages ];

/* 
  Supported import file extensions to Markdown 
  */
export const markdownSupported: SupportedFileExtension[] = [ '.md', ...supportedImages ];

/* 
  Supported import file extensions to CSS 
  */
export const cssSupported: SupportedFileExtension[] = [ '.css', ...supportedImages ];

/* 
  Supported import file extensions to SCSS 
  */
 export const scssSupported: SupportedFileExtension[] = [ '.scss', '.css', ...supportedImages ];
 
 /* 
   Supported import SCSS file extensions to TSX
   */
export const tsxStylesSupported: SupportedFileExtension[] = [ '.scss' ];
