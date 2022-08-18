/* 
  Supported image files extensions 
  */
const supportedImages = [ '.gif', '.jpeg', '.jpg', '.png', '.webp' ];

/* 
  Supported import file types to HTML 
  */
export const htmlSupported = [ '.js', '.css', ...supportedImages ];

/* 
  Supported import file types to Markdown 
  */
export const markdownSupported = [ '.md', ...supportedImages ];
