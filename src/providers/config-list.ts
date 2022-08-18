import { ConfigItem } from "../model";

/* 
  Javascript/Javascript React/Typescript/Typescript React Import styles
  */
export const javascript: ConfigItem<number>[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
  { value: 5, description: "var name = require('_relativePath_');" },
  { value: 6, description: "const name = require('_relativePath_');" },
  { value: 7, description: "var name = import('_relativePath_');" },
  { value: 8, description: "const name = import('_relativePath_');" }
];

/* 
  Javascript/Javascript React/Typescript/Typescript React Import styles
  */
export const typescript: ConfigItem<number>[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" },
];

/* 
  CSS Import styles
  */
export const css: ConfigItem<number>[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" }
];

/* 
  CSS preprocessor, SCSS Import styles
  */
export const scss: ConfigItem<number>[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
  { value: 2, description: "@use '_relativePath_';" },
  { value: 3, description: "@use '_relativePath_' as *;" }
];

/* 
  HTML scripts Import styles
  */
export const HTMLScript: ConfigItem<number>[] = [
  { value: 0, description: "<script type=\"text/javascript\" src=\"_relativePath_\"></script>" }
];

/* 
  HTML image Import styles
  */
export const HTMLImage: ConfigItem<number>[] = [
  { value: 0, description: "<img src=\"_relativePath_\" alt=\"sample\">" }
];

/* 
  HTML stylesheets Import styles
  */
export const HTMLStylesheet: ConfigItem<number>[] = [
  { value: 0, description: "<link href=\"_relativePath_\" rel=\"stylesheet\">" }
];

/* 
  Markdown Import styles
  */
export const markdown: ConfigItem<number>[] = [
  { value: 0, description: "![text](_relativePath_)" }
];

/* 
  Markdown (image) Import styles
  */
export const markdownImage: ConfigItem<number>[] = [
  { value: 0, description: "![alt-text](_relativePath_ \"Hover text\")" },
  { value: 1, description: "![alt-text][image] / [image]: _relativePath_ \"Hover text\"" }
];
