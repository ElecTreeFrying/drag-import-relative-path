import { ImageFileExtensions, SupportedFileExtensions } from "../model";

/* 
  Supported image files extensions 
  */
const supportedImages: ImageFileExtensions[] = [ '.gif', '.jpeg', '.jpg', '.png', '.webp' ];

/* 
  Supported import file extensions to HTML 
  */
export const htmlSupported: SupportedFileExtensions[] = [ '.js', '.css', ...supportedImages ];

/* 
  Supported import file extensions to Markdown 
  */
export const markdownSupported: SupportedFileExtensions[] = [ '.md', ...supportedImages ];

/* 
  Supported import file extensions to CSS 
  */
export const cssSupported: SupportedFileExtensions[] = [ '.css', ...supportedImages ]

/* 
  Supported import file extensions to SCSS 
  */
export const scssSupported: SupportedFileExtensions[] = [ '.scss', '.css', ...supportedImages ];
