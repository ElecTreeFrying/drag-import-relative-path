# Drag And Drop Import Relative Path (vscode extension)

[![Version Badge][version-badge]][badge-redirect]
[![Downloads Badge][downloads-badge]][badge-redirect]

[version-badge]: https://vsmarketplacebadges.dev/version/ElecTreeFrying.drag-import-relative-path.png
[downloads-badge]: https://vsmarketplacebadges.dev/downloads-short/ElecTreeFrying.drag-import-relative-path.png
[badge-redirect]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.drag-import-relative-path

Drag and drop import relative path [extension] for [VS Code]. Drag and drop import relative path without typing long and tedious import statements and file paths.

[VS Code]: https://code.visualstudio.com/
[extension]: https://marketplace.visualstudio.com/VSCode

![typescript-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/typescript-demo.gif "Drag and drop import relative path typescript demo")
![html-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/html-demo.gif "Drag and drop import relative path html demo")
![markdown-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/markdown-demo.gif "Drag and drop import relative path markdown demo")
### [Click here for more usage examples]
## Supported file extensions

|                      | File extension               |
| -------------------- | ---------------------------- |
| Programming Language | `.js`, `.jsx`, `.ts`, `.tsx` |
| Markup Language      | `.html`, `.md`               |
| Stylesheet           | `.css`, `.scss`              |

## Usage

[Click here for more usage examples]: ./DEMO.md

1. **Drag** supported files from tree view.
2. Hold `shift`.
3. **Drop** to any of your active editors.

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)              |
| :-------------------------------: | :------------------------------------------------------ |
|              `.html`              | `.js`, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp` |
|               `.md`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`          |
|   `.js`, `.jsx`, `.ts`, `.tsx`    | self                                                    |
|              `.css`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`          |
|              `.scss`              | self,  `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp` |

## Extension Settings

### General settings

* `general.disableNotifications`: Disable all notifications.

### Import statements

**Scripts:** Javascript, React Javascript, Typescript, React Typescript

* `importStatements.script.preserveFileExtension`: _(Boolean)_
  
* `importStatements.script.javascriptImportStyle`
  * `import $1 from '_relativePath_';` **→ default**
  * `import { $1 } from '_relativePath_';`
  * `import { $1 as $2 } from '_relativePath_';`
  * `import * as $1 from '_relativePath_';`
  * `import '_relativePath_';`
  * `var $1 = require('_relativePath_');`
  * `const $1 = require('_relativePath_');`
  * `var $1 = import('_relativePath_');`
  * `const $1 = import('_relativePath_');`

* `importStatements.script.typescriptImportStyle`
  * `import $1 from '_relativePath_';`
  * `import { $1 } from '_relativePath_';` **→ default**
  * `import { $1 as $2 } from '_relativePath_';`
  * `import * as $1 from '_relativePath_';`
  * `import '_relativePath_';`

**Stylesheets:** CSS, SCSS

* `importStatements.styleSheet.preserveFileExtension`: _(Boolean)_

* `importStatements.styleSheet.cssImportStyle`
  * `@import '_relativePath_';` **→ default**
  * `@import url('_relativePath_');`

* `importStatements.styleSheet.cssImageImportStyle`
  * `url('_relativePath_')` **→ default**

* `importStatements.styleSheet.scssImportStyle`
  * `@import '_relativePath_';` **→ default**
  * `@import url('_relativePath_');`
  * `@use '_relativePath_';`
  * `@use '_relativePath_' as *;`

* `importStatements.styleSheet.scssImageImportStyle`
  * `url('_relativePath_')';` **→ default**

**Markup:** HTML, Markdown

* `importStatements.markup.htmlScriptImportStyle`
  * `<script type="text/javascript" src="_relativePath_"></script>` **→ default**

* `importStatements.markup.htmlImageImportStyle`
  * `<img src="_relativePath_" alt="sample">` **→ default**

* `importStatements.markup.htmlStyleSheetImportStyle`
  * `<link href="_relativePath_" rel="stylesheet">` **→ default**

* `importStatements.markup.markdownImportStyle`
  * `![text](_relativePath_)` **→ default**

* `importStatements.markup.markdownImageImportStyle`
  * `![alt-text](_relativePath_ "Hover text")` **→ default**
  * `![alt-text][image] / [image]: _relativePath_ "Hover text"`

## Installation

  1. Install VS Code v1.70.0 or higher
  2. Launch Visual Studio Code
  3. Enter command `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (OSX)
  4. Select → `Extensions: Install Extensions`.
  5. Choose **Drag And Drop Import Relative Path** by _ElecTreeFrying_
  6. Reload Visual Studio Code

## Changelog

See [CHANGELOG] for more information.

[CHANGELOG]: https://github.com/ElecTreeFrying/drag-import-relative-path/blob/main/CHANGELOG.md

## Contributing

* File bugs, or any feature requests in [GitHub Issues].
* Leave a review on [Visual Studio Marketplace].

[Github Issues]: https://github.com/ElecTreeFrying/drag-import-relative-path/issues
[Visual Studio Marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.drag-import-relative-path&ssr=false#review-details

## Related

### More extensions of mine

* [Visual Studio Code]
* [Atom]

[Visual Studio Code]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying
[Atom]: https://atom.io/users/ElecTreeFrying

## License

[MIT]

[MIT]: https://marketplace.visualstudio.com/items/ElecTreeFrying.drag-import-relative-path/license
