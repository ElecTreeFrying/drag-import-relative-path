type HTMLFileExtension = '.html';

type YAMLFileExtension = '.yaml' | '.yml';

type MarkdownFileExtension = '.md';

type StylesheetFileExtension = '.css' | '.scss';

type ScriptFileExtension = '.ts' | '.tsx' | '.js' | '.jsx';

type ImageFileExtension = '.gif' | '.jpeg' | '.jpg' | '.png' | '.webp';

type FontFileExtension = '.woff' | '.woff2' | '.ttf' | '.eot';

type WebFileExtension = HTMLFileExtension | StylesheetFileExtension | YAMLFileExtension | MarkdownFileExtension | ImageFileExtension | FontFileExtension;

type DataFileExtension = '.json';

export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension;

export type ImportType = 'script' | 'stylesheet' | 'markdown' | 'image';
