export type FileExtensions = '.ts' | '.tsx' | '.js' | '.jsx' 
  | '.css' | '.sass' | '.scss' | '.less'
  | '.html' | '.md';

export type ImportTextOptions = 'script' | 'stylesheet' | 'markdown' | 'image';

export interface ConfigItem<T> {
  value: T;
  description: string;
};
