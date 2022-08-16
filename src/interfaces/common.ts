export type FileExtensions = '.ts' | '.tsx' | '.js' | '.jsx' 
  | '.html' 
  | '.css' | '.sass' | '.scss' | '.less';


export interface ConfigItem<T> {
  value: T;
  description: string;
};
