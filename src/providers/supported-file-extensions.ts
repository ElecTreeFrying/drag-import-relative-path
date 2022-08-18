import { FileExtensions, ImageFileExtensions, SupportedFileExtensions } from "../model";

/* 
  Supported image files extensions 
  */
const supportedImages: ImageFileExtensions[] = [ '.gif', '.jpeg', '.jpg', '.png', '.webp' ];

/* 
  Supported import file types to HTML 
  */
export const htmlSupported: SupportedFileExtensions[] = [ '.js', '.css', ...supportedImages ];

/* 
  Supported import file types to Markdown 
  */
export const markdownSupported: SupportedFileExtensions[] = [ '.md', ...supportedImages ];

/* 
  Supported import file types to Markdown 
  */
export const scssSupported: FileExtensions[] = [ '.scss', '.css' ];
