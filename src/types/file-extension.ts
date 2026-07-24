
type HtmlFileExtension = '.html';

type YamlFileExtension =
  | '.yaml'
  | '.yml';

type MarkdownFileExtension = '.md';

type StylesheetFileExtension =
  | '.css'
  | '.scss';

type ImageFileExtension =
  | '.gif'
  | '.jpeg'
  | '.jpg'
  | '.png'
  | '.svg'
  | '.avif'
  | '.webp';

type FontFileExtension =
  | '.woff'
  | '.woff2'
  | '.ttf'
  | '.eot';

type DocumentFileExtension = '.pdf';

type VideoFileExtension =
  | '.mp4'
  | '.webm'
  | '.mov';

type AudioFileExtension =
  | '.mp3'
  | '.ogg'
  | '.wav'
  | '.m4a';

type TextTrackFileExtension = '.vtt';

type VueFileExtension = '.vue';

type SvelteFileExtension = '.svelte';

type AstroFileExtension = '.astro';

type FrameworkComponentFileExtension = VueFileExtension | SvelteFileExtension | AstroFileExtension;

type MediaFileExtension = VideoFileExtension | AudioFileExtension | TextTrackFileExtension;

type WebFileExtension =
  | HtmlFileExtension
  | YamlFileExtension
  | MarkdownFileExtension
  | StylesheetFileExtension
  | ImageFileExtension
  | FontFileExtension;

type ScriptFileExtension =
  | '.ts'
  | '.tsx'
  | '.mdx'
  | '.js'
  | '.jsx';

type DataFileExtension = '.json';

type LatexFileExtension = '.tex';

type BibliographyFileExtension = '.bib';

type EncapsulatedPostScriptFileExtension = '.eps';

export type FileExtension = WebFileExtension | ScriptFileExtension | DataFileExtension | DocumentFileExtension | MediaFileExtension | FrameworkComponentFileExtension | LatexFileExtension | BibliographyFileExtension | EncapsulatedPostScriptFileExtension;
