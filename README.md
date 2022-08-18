# Drag Import Relative Path (vscode extension)

[![lorem_ipsum_dolor_sit_amet][version-badge]][package]
[![lorem_ipsum_dolor_sit_amet][downloads-badge]][package]
[![lorem_ipsum_dolor_sit_amet][installs-badge]][package]
[![lorem_ipsum_dolor_sit_amet][rating-badge]][package]

[version-badge]: https://vsmarketplacebadges.dev/version/ElecTreeFrying.drag-import-relative-path.svg
[downloads-badge]: https://vsmarketplacebadges.dev/downloads-short/ElecTreeFrying.drag-import-relative-path.svg
[installs-badge]: https://vsmarketplacebadges.dev/installs-short/ElecTreeFrying.drag-import-relative-path.svg
[rating-badge]: https://vsmarketplacebadges.dev/rating-short/ElecTreeFrying.drag-import-relative-path.svg
[package]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.auto-import

Drag and drop import relative path extension

## Supported file extensions

|                      | File extension               |
| -------------------- | ---------------------------- |
| Programming Language | `.js`, `.jsx`, `.ts`, `.tsx` |
| Markup Language      | `.html`, `.md`               |
| Stylesheet           | `.css`, `.scss`, `.sass`     |


## Usage

1. Drag supported files from tree view.
2. Hold `shift`.
3. Drop to any of your active editors.

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)     |
| :-------------------------------: | :--------------------------------------------- |
|              `.html`              | `.js`, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png` |
|               `.md`               | `.md`, `.gif`, `.jpeg`, `.jpg`, `.png`         |
|   `.js`, `.jsx`, `.ts`, `.tsx`    | self                                           |
|              `.css`               | self                                           |
|         `.scss`, `.sass`          | self,  `.css`                                  |


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

**Stylesheets:** CSS, SASS/SCSS

* `importStatements.styleSheet.preserveFileExtension`: _(Boolean)_

* `importStatements.styleSheet.cssImportStyle`
  * `@import '_relativePath_';` **→ default**
  * `@import url('_relativePath_');`

* `importStatements.styleSheet.scssSassImportStyle`
  * `@import '_relativePath_';` **→ default**
  * `@import url('_relativePath_');`
  * `@use '_relativePath_';`
  * `@use '_relativePath_' as *;`

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

### Settings Preview

![extension-settings-preview](images/settings.gif "auto import relative path extension settings preview")

## Installation

  1. Install VS Code v1.70.0 or higher
  2. Launch Visual Studio Code
  3. Enter command `Ctrl+Shift+P` (Windows, Linux) or `Cmd+Shift+P` (OSX)
  4. Select → `Extensions: Install Extensions`.
  5. Choose **Drag Import Relative Path** by _ElecTreeFrying_
  6. Reload Visual Studio Code

## Changelog

See [CHANGELOG] for more information.

[CHANGELOG]: https://github.com/ElecTreeFrying/drag-import-relative-path/blob/main/CHANGELOG.md

## Contributing

* File bugs, or any feature requests in [GitHub Issues].
* Leave a review on [Visual Studio Marketplace].

[Github Issues]: https://github.com/ElecTreeFrying/drag-import-relative-path/issues
[Visual Studio Marketplace]: https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.drag-import-relative-path&ssr=false#review-details

<!-- ## Support

### Donate by Cryptocurrencies

| Coin | Address                                    |                       |
| :--- | :----------------------------------------- | :-------------------- |
| BTC  | bc1qtp9ch0uaxavdxv7jujtzfhtyxep06wccla3m8k | Native BTC Blockchain |
| ETH  | 0x9605e41544789E31Aa3a17Ff1eCfC5FA93f11337 | ERC20                 |
| USDT | 0x9605e41544789E31Aa3a17Ff1eCfC5FA93f11337 | ERC20                 |
| USDC | 0x9605e41544789E31Aa3a17Ff1eCfC5FA93f11337 | ERC20                 | -->

## Related

### More extensions of mine

* [Visual Studio Code]
* [Atom]

[Visual Studio Code]: https://marketplace.visualstudio.com/publishers/ElecTreeFrying
[Atom]: https://atom.io/users/ElecTreeFrying

## License

[MIT]

[MIT]: [https://marketpl](https://marketplace.visualstudio.com/items/ElecTreeFrying.drag-import-relative-path/license)
