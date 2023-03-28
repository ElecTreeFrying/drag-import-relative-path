# Drag And Drop Import Relative Path (DEMO)

This [extension] helps developers to quickly and easily import files by dragging them from the tree view to their active text editor. The extension simplifies the workflow, allowing developers to save time and improve their productivity by eliminating the need to type long and tedious import statements and file paths.

[extension]: https://marketplace.visualstudio.com/VSCode

## Supported file extensions

|                      | File extension               |
| -------------------- | ---------------------------- |
| Programming Language | `.js`, `.jsx`, `.ts`, `.tsx` |
| Markup Language      | `.html`, `.md`               |
| Stylesheet           | `.css`, `.scss`              |

## Usage

1. **Drag** supported files from the tree view.
1. Hold `shift` 
1. **Drop** them into any of your active editors.


| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)                                                                                                                                |
| :-------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|              `.html`              | `.js`, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`                                                                                                                   |
|               `.md`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`                                                                                                                            |
|           `.js`, `.ts`            | self                                                                                                                                                                      |
|              `.jsx`               | self, `.js`, `.json`<br>`.css`,`.sass` `.scss`<br>`.png`, `.jpg`, `.gif`, `.svg`, `.webp`<br>`.woff`, `.woff2`, `.ttf`, `.eot`<br>`.md`, `.yml`, `.yaml`, `.html`         |
|              `.tsx`               | self, `.ts`, `.js`, `.json`<br>`.css`, `.sass` `.scss`<br>`.png`, `.jpg`, `.gif`, `.svg`, `.webp`<br>`.woff`, `.woff2`, `.ttf`, `.eot`<br>`.md`, `.yml`, `.yaml`, `.html` |
|              `.css`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`                                                                                                                            |
|              `.scss`              | self,  `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`                                                                                                                   |


## Typescript/Javascript/TSX/JSX support

* Typescript/Javascript/TSX/JSX drag import

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)                                                                                                                                |
| :-------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|           `.js`, `.ts`            | self                                                                                                                                                                      |
|              `.jsx`               | self, `.js`, `.json`<br>`.css`,`.sass` `.scss`<br>`.png`, `.jpg`, `.gif`, `.svg`, `.webp`<br>`.woff`, `.woff2`, `.ttf`, `.eot`<br>`.md`, `.yml`, `.yaml`, `.html`         |
|              `.tsx`               | self, `.ts`, `.js`, `.json`<br>`.css`, `.sass` `.scss`<br>`.png`, `.jpg`, `.gif`, `.svg`, `.webp`<br>`.woff`, `.woff2`, `.ttf`, `.eot`<br>`.md`, `.yml`, `.yaml`, `.html` |

![typescript-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/typescript-demo.gif "Drag and drop import relative path typescript demo")

## HTML support

* CSS drag import
* Javascript drag import
* Images drag import

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)              |
| :-------------------------------: | :------------------------------------------------------ |
|              `.html`              | `.js`, `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp` |

![html-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/html-demo.gif "Drag and drop import relative path html demo")

## CSS/SCSS support

* CSS drag import
* SCSS drag import

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)              |
| :-------------------------------: | :------------------------------------------------------ |
|              `.css`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp`          |
|              `.scss`              | self,  `.css`, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp` |

![scss-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/scss-demo.gif "Drag and drop import relative path scss demo")

## Markdown support

* Markdown drag import
* Images drag import

| Active text editor <br> Drop (to) | Supported file extensions <br> Drag (from)     |
| :-------------------------------: | :--------------------------------------------- |
|               `.md`               | self, `.gif`, `.jpeg`, `.jpg`, `.png`, .`webp` |

![markdown-demo](https://res.cloudinary.com/october7/image/upload/github/drag-import-relative-path/markdown-demo.gif "Drag and drop import relative path markdown demo")
