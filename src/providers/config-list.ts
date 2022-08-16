import { ConfigItem } from "../interfaces";

export const preserveFileExtension: ConfigItem<boolean>[] = [
  { value: true, description: "preserve" },
  { value: false, description: "exclude" }
];

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

export const typescript: ConfigItem<number>[] = [
  { value: 0, description: "import name from '_relativePath_';" },
  { value: 1, description: "import { name } from '_relativePath_';" },
  { value: 2, description: "import { default as name } from '_relativePath_';" },
  { value: 3, description: "import * as name from '_relativePath_';" },
  { value: 4, description: "import '_relativePath_';" }
];

export const css: ConfigItem<number>[] = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" }
];

export const scssSass: ConfigItem<number>[] = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import url('');" },
  { value: 2, description: "@use '';" }
];

export const less: ConfigItem<number>[] = [
  { value: 0, description: "@import '';" },
  { value: 1, description: "@import () '';" }
];

export const HTMLScript: ConfigItem<number>[] = [
  { value: 0, description: "<script type=\"text/javascript\" src=\"path\"></script>" }
];

export const HTMLStylesheet: ConfigItem<number>[] = [
  { value: 0, description: "<link href=\"path\" rel=\"stylesheet\">" }
];

export const markdown: ConfigItem<number>[] = [
  { value: 0, description: "![text](path)" }
];

export const markdownImage: ConfigItem<number>[] = [
  { value: 0, description: "![alt-text](path \"Hover text\")" },
  { value: 1, description: "![alt-text][image] / [image]: path \"Hover text\"" }
];
