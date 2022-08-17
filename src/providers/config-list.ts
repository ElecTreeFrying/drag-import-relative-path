import { ConfigItem } from "../interfaces";

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
  { value: 4, description: "import '_relativePath_';" },
];

export const css: ConfigItem<number>[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" }
];

export const scssSass: ConfigItem<number>[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import url('_relativePath_');" },
  { value: 2, description: "@use '_relativePath_';" },
  { value: 3, description: "@use '_relativePath_' as *;" }
];

export const less: ConfigItem<number>[] = [
  { value: 0, description: "@import '_relativePath_';" },
  { value: 1, description: "@import (name) '_relativePath_';" }
];

export const HTMLScript: ConfigItem<number>[] = [
  { value: 0, description: "<script type=\"text/javascript\" src=\"_relativePath_\"></script>" }
];

export const HTMLStylesheet: ConfigItem<number>[] = [
  { value: 0, description: "<link href=\"_relativePath_\" rel=\"stylesheet\">" }
];

export const markdown: ConfigItem<number>[] = [
  { value: 0, description: "![text](_relativePath_)" }
];

export const markdownImage: ConfigItem<number>[] = [
  { value: 0, description: "![alt-text](_relativePath_ \"Hover text\")" },
  { value: 1, description: "![alt-text][image] / [image]: _relativePath_ \"Hover text\"" }
];
