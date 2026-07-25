# Changelog

All notable changes to **Drag And Drop Import Relative Path** are documented here.

## v1.0.1 (2026-07-24)

Softened the Marketplace banner color from a bright red to a deep burnt orange (`#7c2d12`) so it complements the icon instead of competing with it. No functional changes.

## v1.0.0 (2026-07-24)

A ground-up rebuild of the drag-and-drop import workflow: drop a file into the editor and get a correct relative-path import, with a configurable style catalogue per language.

### Added

- Drag-and-drop imports for many more languages: Vue (`.vue`), Svelte (`.svelte`), Astro (`.astro`), MDX (`.mdx`), and LaTeX (`.tex`) — alongside the existing JavaScript, TypeScript, React, CSS, SCSS, HTML, and Markdown.
- A full per-language catalogue of import styles (ES module default / named / namespace / side-effect, CommonJS `require`, dynamic `import`, TypeScript type-only and mixed, SCSS `@use` / `@forward` / `@import`, HTML `<script>` / `<img>` / `<video>` / `<audio>` / `<link>`, Markdown link / image, LaTeX figure / `\input` / bibliography).
- Framework-aware import naming for Angular files (`.component`, `.directive`, `.pipe`, `.service`, `.module` derive a PascalCase identifier).
- Configurable import placement (Top, Bottom, or Cursor), with frontmatter/script-block handling for `.astro`, `.vue`, and `.svelte`, and indentation matching.
- Image, video, and audio tag generation when dropping media into HTML and Markdown; LaTeX `\includegraphics` figures.
- Four settings commands: **Set Default Import Style**, **Set Import Placement**, **Toggle Preserve Script File Extension**, and **Reset All Import Styles to Defaults**.
- A review prompt: after you have generated a number of imports, a single notification asks for a Marketplace review, offering **Rate It**, **Not Now**, and **Never Ask Again**. It counts gestures rather than files, never repeats once answered or dismissed, and is governed by the new `drag-import.preferences.requestReview` setting (default `true`) for anyone who would rather never see it.

### Changed

- Settings now live under the `drag-import.*` namespace (e.g. `drag-import.importStatement.script.javascriptImportStyle`). The previous `importStatements.*` keys are no longer used; earlier customisations do not carry over — re-select them via the settings commands.
- Minimum supported VS Code raised to 1.97 (required by the drag-and-drop API this release is built on). Older editors keep receiving the last 0.2.x build automatically.
- Rebuilt and bundled with esbuild; packaging trimmed.

## v0.2.5 (2023-08-27)

### Changed

- The drag-and-drop handler now resolves the dragged file path directly from VS Code's drop `DataTransfer` (the `text/plain` item's `.value`) instead of invoking the `copyFilePath` command and reading the system clipboard via `vscode.env.clipboard.readText()`. This avoids clobbering the user's clipboard and removes the dependency on clipboard state when computing the relative import path.
- `AutoImportOnDropProvider.provideDocumentDropEdits` now implements the full `DocumentDropEditProvider` signature, accepting `position: vscode.Position`, `dataTransfer: vscode.DataTransfer`, and `token: vscode.CancellationToken` in addition to the document, aligning the provider with the VS Code drop-edit API.
- `tsconfig.json`: `compilerOptions.rootDir` changed from `"src"` to `"./src"`.
- `.gitignore`: added `.DS_Store` and `test-directories`.

### Fixed

- Closes [#4](https://github.com/ElecTreeFrying/drag-import-relative-path/issues/4): because the dragged path is now read from the drop event's `DataTransfer` rather than the clipboard, drop imports no longer depend on (or overwrite) the system clipboard contents.

## v0.2.4 (2023-03-28)

### Changed

- Documentation-only maintenance release (version bump 0.2.3 to 0.2.4 in package.json and package-lock.json); no source code or extension-configuration changes.
- Expanded the JSX/TSX supported-extension tables in README.md and DEMO.md: split `.jsx` and `.tsx` into their own rows (previously `.jsx` shared a `self`-only row with `.js`/`.ts`, and `.tsx` only listed `self, .scss`) and broadly enlarged their drag-from lists to include `.js`, `.json`, `.css`, `.sass`, `.scss`, image formats (`.png`, `.jpg`, `.gif`, `.svg`, `.webp`), font formats (`.woff`, `.woff2`, `.ttf`, `.eot`), and `.md`, `.yml`, `.yaml`, `.html`.
- Clarified the Extension Settings docs in README.md: annotated both `importStatements.script.preserveFileExtension` and `importStatements.styleSheet.preserveFileExtension` with their **default → false** value.
- Removed the stale `### General settings` / `general.disableNotifications` documentation line from README.md.
- Added the v0.2.4 entry to CHANGELOG.md.

## v0.2.3 (2023-03-28)

### Added

- Unsupported drops now insert a usable result instead of nothing. When a dragged file cannot be turned into an import statement for the target file, the extension inserts the computed relative path (with the dragged file's extension appended and a trailing newline) rather than the previous empty insert. This fallback fires both when the drop fails the support checks and when a `.tsx`/`.jsx` handler produces an empty snippet for an unrecognized sub-type.
- Added dedicated drop handling for React files via new `.tsx` and `.jsx` snippet generators (`import-snippets/tsx.ts`, `import-snippets/jsx.ts`). They emit `import name$1 from '...'` for scripts, images, JSON, HTML, YAML, and Markdown, and a side-effect `import '...'` for stylesheets (`.css`/`.scss`) and font files (`.woff`/`.woff2`/`.ttf`/`.eot`); the `.tsx` generator also accepts `.ts`, the `.jsx` generator `.js`. `.jsx` was added to the set of file types accepted as a drop target (now `.html`, `.md`, `.css`, `.scss`, `.tsx`, `.jsx`), and that set is now centralized as the `permittedExts` array in providers instead of an inline literal in the drop provider.
- Broadened the recognized file-extension set used when matching drops to include YAML (`.yaml`, `.yml`), font files (`.woff`, `.woff2`, `.ttf`, `.eot`), and JSON (`.json`), in addition to the existing script, stylesheet, HTML, Markdown, and image types. The `FileExtension` type was restructured into named sub-groups (HTML, YAML, Markdown, stylesheet, script, image, font, data).

### Fixed

- Fixed SCSS partial imports: dragging a partial such as `_variables.scss` previously produced an `@import` that kept the leading underscore, which is not how SCSS partials are referenced. The generated SCSS import now strips the leading underscore from the final path segment via a new `parsePartialFile` helper (e.g. `@import 'variables';`).
- Extended Angular-aware import naming, which previously only applied to `*.component` files, to also generate a PascalCase import name for `*.directive` and `*.pipe` files.

### Removed

- Removed the `general.disableAllDropNotifications` setting ("Disable all drag-and-drop notifications") from the extension's configuration, along with the corresponding guard in `notify` so the "Same file path" and "Not supported" warnings are now always shown.
- Removed the `tsxStylesSupported` provider export and the old `.tsx`-specific logic that force-preserved a dragged `.scss` extension. `.tsx` drops are now routed to the new dedicated `.tsx` snippet generator rather than through the TypeScript import-style path, so they no longer consult the TypeScript import-style configuration.

### Changed

- Internal restructure of the source tree with no change to the emitted import text for existing targets: the import-generation modules were renamed and regrouped (`import-paths` -> `import-snippets`, `import-texts` -> `import-statements`, `modules` -> `utilities`), the per-language entry points were renamed from `relativeImport`/`getImportText` to `snippet`/`importStatementSnippet`, the statement functions were renamed (e.g. `getCSSImport` -> `cssImportStatement`, `getJavascriptImport` -> `javascriptImportStatement`), and the drop provider was moved into a `subscriptions/` module. The HTML/Markdown statement helpers now return a `vscode.SnippetString` rather than a raw `string` (same literal output). The `ImportStyle<T>` generic was simplified to a non-generic `ImportStyle` with a numeric `value`.
- Configuration is now read from the `auto-import.importStatement.*` settings namespace (e.g. `auto-import.importStatement.script.javascriptImportStyle`, `auto-import.importStatement.styleSheet.*`, `auto-import.importStatement.markup.*`) instead of the previous `importStatements.*` keys.

## v0.2.2 (2023-03-26)

### Fixed

- Reworked the same-directory detection used when generating drag-and-drop relative imports. The `isSameDir` check in `src/modules/relative-path.ts` no longer relies on a single strict equality of the two parsed directory paths; it now normalizes each path by lowercasing AND `.trim()`-ing the parsed `dir`, and returns a match on either exact equality OR substring inclusion (`from === to || from.includes(to)`). The intent is to apply the leading `./` prefix more reliably for files that share a parent directory, where the previous untrimmed exact-match check could omit the prefix and produce an incorrect relative import path.

### Changed

- Bumped the extension version from 0.2.1 to 0.2.2 in `package.json` (and the corresponding `package-lock.json` entry).

## v0.2.1 (2023-01-13)

### Added

- Angular component support for the TypeScript named-import style (`import { Name } from '...'`): when a dragged file path contains `.component`, the import name is now auto-derived as PascalCase from the filename (e.g. `foo.component.ts` -> `FooComponentTs`) instead of leaving an empty `$1` tab stop, so dropping an Angular component yields a ready-to-use named import. Non-component files still fall back to the empty tab stop, and only the TypeScript path (`getTypescriptImport`) is affected.

### Fixed

- Corrected the settings category title from the stale "Auto Import Relative Path" to the actual extension name "Drag And Drop Import Relative Path", so the configuration section is now labeled consistently in VS Code Settings.
- Repaired the version badge URL: replaced the dead `vsmarketplacebadge.apphb.com` host with `vsmarketplacebadges.dev`, switched the path segment from `version-short` to `version`, and fixed the publisher casing from `Electreefrying` to `ElecTreeFrying`, so the version badge renders again on the Marketplace page.

### Changed

- Polished setting titles and descriptions for clarity: "drag and drop" -> "drag-and-drop" in the disable-notifications setting, fuller wording such as "Disable all drag-and-drop notifications when a file is dropped on the active pane.", and "Preserve the file extension in the relative path." (applied to both the script and stylesheet preserve-extension settings).

## v0.2.0 (2023-01-12)

### Added

- `.tsx` editors can now import `.scss` stylesheets: dragging a `.scss` file onto a `.tsx` editor produces a TypeScript import statement, where previously `.tsx` only accepted dropping the same file type (self). Backed by a new `tsxStylesSupported` allowlist (`[ '.scss' ]`) in `src/providers/supported-file-extensions.ts`.
- When a supported style file is dropped onto a `.tsx` editor, its file extension is now automatically preserved in the generated relative path (overriding the `preserveScriptFileExtension` setting), so the import points at the actual `.scss` file. Implemented in the new `src/import-paths/typescript.ts`.
- Added a dedicated `getImportType()` helper (`src/modules/import-type.ts`) that resolves the import type (`script` / `stylesheet` / `markdown` / `image`, or `null` for `.scss`) directly from the dragged file's extension, replacing the import-type that the drop handler used to compute and pass around manually.

### Changed

- Added `.tsx` to the set of drop targets that may receive a differently-typed dragged file, alongside `.html`, `.md`, `.css`, and `.scss`, so cross-extension drops onto `.tsx` are no longer rejected outright.
- Reworked the drag-and-drop handler (`AutoImportOnDropProvider` in `src/auto-import-on-drop-provider.ts`): the long chain of per-extension `if`/`switch` branches that selected an import-text option was collapsed into a single combined guard that rejects unsupported drops, with import-statement generation fully delegated to the new per-language modules.
- Refactored import-statement generation into per-language modules under `src/import-paths/` (`javascript`, `typescript`, `css`, `scss`, `html`, `markdown`), each exposing a `relativeImport()` function, dispatched by the drop file's extension from a new `src/modules/import-text.ts`. This replaces the previous monolithic `src/utils/import-text.ts` (now deleted). The per-language modules still delegate the final string building to the existing `src/import-texts/` helpers.
- Changed the `getImportText()` signature: it no longer takes a precomputed `importTextOption` argument and instead derives the import type internally (via `getImportType()`), since each per-language module now resolves its own behavior.
- Renamed the `src/utils/` directory to `src/modules/`: `notify` and `relative-path` were moved as-is, `file-extension` was reimplemented under the new model type name, and `import-type` (new) and `import-text` (rewritten as a dispatcher) round out the barrel. Updated all imports accordingly; `relative-path` now reuses `getFileExt()` instead of calling `path.parse` inline.
- Renamed model types for consistency: `FileExtensions` to `FileExtension`, `ImageFileExtensions` to `ImageFileExtension`, `SupportedFileExtensions` to `SupportedFileExtension`, and `ImportTextOptions` to `ImportType`.
- Changed the providers barrel (`src/providers/index.ts`) to re-export the import-configuration module under a namespaced `importStyle` instead of a flat re-export, and updated the `src/import-texts/*` modules to import `{ importStyle }` from `../providers`. Also normalized many JSDoc comments to a uniform "Returns the Import statement string" wording.
- Updated the extension description in `package.json`, plus the README and DEMO docs, to describe the productivity-focused drag-and-drop workflow and to document the new `.tsx` self + `.scss` support in the supported-extensions tables (splitting `.tsx` out of the shared `.js`/`.jsx`/`.ts` row).

### Removed

- Removed the `DifferentFileExtension` notification type (from `NotifyType`) and its dedicated "Different file extension." error message. Drops that aren't supported (including mismatched extensions) now consistently surface a single "Not supported." warning instead.

## v0.1.18 (2022-08-21)

### Changed

- Maintenance release: removed the `dependencies` block entirely — the unused `lodash` runtime dependency and the `relative` package — and dropped the integration-test toolchain devDependencies (`mocha`, `@vscode/test-electron`, `@types/mocha`). The third-party `relative` package is replaced by a small in-house `relative()` helper built on Node's `path` module (`path.relative(path.dirname(from), to)`), intended to preserve `getRelativePath` behavior. Internal-only; no user-facing behavior changes.

### Removed

- Deleted the Mocha integration-test suite: `src/test/runTest.ts`, `src/test/suite/index.ts`, and `src/test/suite/extension.test.ts`.
- Removed the `pretest` and `test` npm scripts from package.json (the `lint` and `compile`/`watch` scripts are retained).

## v0.1.17 (2022-08-21)

### Changed

- Maintenance release: internal test scaffolding and linting/lockfile cleanup only, with no changes to drag-and-drop import behavior. The sample unit test now activates the extension, activate() returns its ExtensionContext to support that, and an invalid ESLint naming-convention rule value was corrected.

## v0.1.16 (2022-08-21)

### Changed

- Version bumped to 0.1.16 (package.json and package-lock.json); no source code changes in this release.

## v0.1.15 (2022-08-21)

### Fixed

- Configuration checkboxes now take effect immediately. Settings (`general.disableAllDropNotifications`, `importStatements.script.preserveScriptFileExtension`, and `importStatements.styleSheet.preserveStylesheetFileExtension`) were previously read only once when the extension activated (via the `settings-config.ts` module's eager top-level `workspace.getConfiguration(...).get(...)` calls), so toggling them in Settings had no effect until VS Code was reloaded. They are now read live at the moment of each drop/notification — inline in `getImportText` for the preserve-extension flags and inline in `notify()` for the disable-notifications flag — so changes apply right away.
- The import style is now derived from the document you actually drop into. Previously the extension took the target file extension from `vscode.window.activeTextEditor` (both for the drop path in the provider and via `path.parse(vscode.window.activeTextEditor.document.uri.fsPath).ext` inside `getImportText`), so dropping onto an editor that wasn't the focused/active one could produce the wrong import syntax. The drop handler now uses the `_document` passed to `provideDocumentDropEdits` for `dropFilePath` and threads that explicit `dropFilePath` through to `getImportText`, which switches on `path.parse(dropFilePath).ext`.

### Changed

- Improved startup performance by replacing the wildcard activation (`"*"`) with eight targeted `onLanguage` activation events. The extension now activates only for the languages it supports — JavaScript, JavaScript React, TypeScript, TypeScript React, CSS, SCSS, HTML, and Markdown — instead of loading on every workspace.
- Refactored configuration reads to be evaluated on demand instead of being cached at module load. The dedicated `settings-config.ts` provider that captured config values eagerly was removed in favor of inline `workspace.getConfiguration(...).get(...)` calls in the import-text and notification code paths.

### Removed

- Removed the `src/providers/settings-config.ts` module (and its re-export from `src/providers/index.ts`), which held configuration values read once at activation time and caused the stale-settings behavior.
- Removed the early `if (!editor) return { insertText: undefined };` guard in the drop provider that bailed out when there was no active text editor; the handler now relies on the `_document` argument provided to `provideDocumentDropEdits` instead of `vscode.window.activeTextEditor`.

## v0.1.14 (2022-08-21)

### Changed

- Renamed the notification setting `general.disableNotifications` to `general.disableAllDropNotifications`. The setting title changed from "Disable all notifications" to "Disable all drag and drop notifications" and its description from "Disable all notifications on file drop to active pane." to "Disable all drag and drop notifications on file drop to active pane." The rename is applied consistently across `package.json`, the `settings-config.ts` accessor (now `disableAllDropNotifications`), and all three call sites in `utils/notify.ts`. This is a breaking config-key change: settings stored under the old `general.disableNotifications` key will no longer be read and must be re-set under the new key.
- Replaced the nested ternary that chose the `importTextOption` for drops into `.css`/`.scss` files with an equivalent `switch` on the dragged file extension (`.css`/`.scss` -> `null`, otherwise `'image'`); behavior is unchanged. Also updated the adjacent guard comment to list the allowed extensions as `['.html','.md','.css','.scss']`.
- Internal refactor of the import-style configuration module: renamed `src/providers/config-list.ts` to `src/providers/import-configuration.ts` and the `ConfigItem<T>` interface (in `src/model/interfaces.ts`) to `ImportStyle<T>`. Updated the import-text generators (`javascript-typescript.ts`, `css-scss.ts`, `html-markdown.ts`) to import the module as `importStyle` and use the `ImportStyle` type, and updated the providers barrel (`src/providers/index.ts`) to re-export from the renamed file. No import styles, languages, or behavior changed.
- Documentation: pointed the README changelog link at the VS Code Marketplace changelog page (was the GitHub `CHANGELOG.md` link), and reworked the README/DEMO usage-example links and tables (reference-style "more usage examples" links, a new "More usage examples" section in the README, and the DEMO TypeScript/JavaScript table split into one row per extension). Formatting and links only; no change to supported extensions or import styles.

## v0.1.13 (2022-08-19)

### Added

- New [DEMO.md](https://github.com/ElecTreeFrying/drag-import-relative-path/blob/v0.1.13/DEMO.md) usage guide with a supported-file-extensions table, step-by-step drag/drop instructions, and per-language sections (Typescript/Javascript/TSX/JSX, HTML, CSS/SCSS, Markdown) each with its own demo GIF.
- Marketplace Version and Downloads badges to the top of the README (rendered via reference-style links to vsmarketplacebadges.dev) and a corresponding `badges` array in package.json (version badge from vsmarketplacebadge.apphb.com, downloads badge from vsmarketplacebadges.dev).
- A new markdown-demo GIF and a "Click here for more usage examples" link to DEMO.md in the README.

### Changed

- This is a documentation/metadata-only release: there are no changes to `src/` or extension behavior.
- Expanded the README intro from "Drag and drop import relative path extension" to a fuller description linking to VS Code and the Marketplace.
- Made the drag/drop usage steps clearer by bolding the **Drag** and **Drop** actions.
- Corrected the extension name in the install instructions from "Drag Import Relative Path" to "Drag And Drop Import Relative Path".
- Fixed the malformed MIT license link in the README (was a broken nested `[https://marketpl](...)` link, now a clean Marketplace license URL).
- Corrected the README support table so the `.md` drop target lists `self` as a drag source instead of `.md`.
- Added `local/*` and `ISSUES.md` to .gitignore.
- Bumped the version to 0.1.13 (package.json and package-lock.json).

## v0.1.12 (2022-08-18)

### Fixed

- Dropping a file into an HTML document now inserts the correct import style. The `switch` in `src/auto-import-on-drop-provider.ts` that picks between `script`, `stylesheet`, and `image` was missing `break` statements, so every case fell through to `default` and always set the option to `image`. As a result `.js` files were inserted as image embeds (`getHTMLImageImport`) instead of `<script>` tags (`getHTMLScriptImport`), and `.css` files as image embeds instead of `<link>` stylesheets (`getHTMLStylesheetImport`). A `break` was added to each case so the correct style is selected.
- Dropping a Markdown file into a `.md` document now inserts a `markdown` link rather than an image embed. The same fall-through bug forced `.md` source files to use the `image` option (`getMarkdownImageImport`); the missing `break` in the Markdown `switch` was added so `.md` files resolve to the `markdown` option (`getMarkdownImport`).

### Changed

- Updated the README demo GIF, swapping the generic `demo.gif` for `html-demo.gif` to showcase the corrected HTML drop behavior.

## v0.1.11 (2022-08-18)

### Changed

- Maintenance release: version bump 0.1.10 to 0.1.11 (package.json and package-lock.json), with one wording cleanup to the `importStatements.markup.htmlImageImportStyle` setting's `description` field — "Supported image HTML import styles for script" reworded to "Supported HTML image import styles for script", aligning its word order with the setting's already-correct `title` ("HTML image import styles for script"). No change to the setting's options/enum, default, or any runtime behavior.

## v0.1.10 (2022-08-18)

### Changed

- Filled in the previously-empty Settings UI descriptions for two markup configuration options: importStatements.markup.htmlScriptImportStyle now reads "Supported HTML import styles for script" and importStatements.markup.htmlImageImportStyle now reads "Supported image HTML import styles for script".
- Corrected the htmlImageImportStyle option's title, which mistakenly read "HTML import styles for script" and now reads "HTML image import styles for script". The htmlScriptImportStyle title was left unchanged.
- Settings metadata only: no source/behavior changes, no new configuration keys, languages, default values, or enum import styles were introduced (only the displayName-adjacent description/title strings were edited).

## v0.1.9 (2022-08-18)

### Added

- Documented `.webp` as a supported image source across the drag-from matrix in the README (for HTML, Markdown, CSS, and SCSS drop targets).
- Documented the `importStatements.styleSheet.cssImageImportStyle` and `importStatements.styleSheet.scssImageImportStyle` settings (both defaulting to `url('_relativePath_')`) in the README settings list; the keys themselves already existed in the manifest.
- Added animated demo GIFs (typescript-demo and extension-demo, hosted on Cloudinary) to the README, replacing the old local `images/settings.gif` reference.

### Changed

- Renamed the extension's display name from "Drag Import Relative Path" to "Drag And Drop Import Relative Path" (package.json `displayName` and the README's top-level heading) for clearer marketplace branding.
- Pluralized the settings titles for the import-style configuration options in the manifest (e.g. "...import style" → "...import styles") across the JavaScript, TypeScript, CSS, SCSS, HTML, and Markdown keys.
- Filled in the previously-empty `description` fields for the JavaScript, TypeScript, CSS, SCSS, HTML stylesheet, and Markdown import-style settings (e.g. "Supported CSS import styles"), making them clearer in VS Code Settings; the two HTML script/image keys (`htmlScriptImportStyle`, `htmlImageImportStyle`) had their titles pluralized but their descriptions left blank.
- Clarified the inline source-code comments in src/providers/settings-config.ts for the file-extension toggles, distinguishing "Preserve script file extension" (importStatements.script) from "Preserve stylesheet file extension" (importStatements.styleSheet).

### Removed

- Removed the marketplace badges block (version, downloads, installs, and rating badges) from the package.json manifest and the matching badge block from the README.
- Removed the commented-out cryptocurrency-donation "Support" section from the README.

### Fixed

- Corrected the JSDoc summary lines for the CSS and SCSS image-import helpers in src/import-texts/css-scss.ts, which previously described the image-import functions as plain "CSS"/"SCSS" import styles instead of "CSS image"/"SCSS image" import styles.

## v0.1.8 (2022-08-18)

### Fixed

- Dragging an image into a SCSS file now generates a correct image import path. The SCSS image-import branch used `getScssFileExt`, which only preserves the real extension for `.css` sources and otherwise drops it (returning empty unless the stylesheet-preservation setting is on); it now uses `getFileExt` so the emitted path always keeps the actual image extension (`.png`, `.jpg`, `.gif`, `.jpeg`, `.webp`).
- Dropping a `.css` stylesheet (or any file with a different extension) into a CSS document is no longer blocked by the "different file extension" warning. `.css` was missing from the same-extension bypass list that already covered `.html`, `.md`, and `.scss`, so legitimate drops into CSS files were rejected.
- Stylesheets dragged into CSS/SCSS files are now treated as stylesheet `@import` rules instead of image imports. A fall-through `switch` (missing `break`/`return` statements) let the `.css`/`.scss` cases fall into the `default`, overwriting the intended `null` import option with `'image'` for every drop, so dragging one stylesheet into another produced an image-style import; the option is now selected with a ternary that yields `null` for `.css`/`.scss` sources and `'image'` only for non-stylesheet files.

## v0.1.7 (2022-08-18)

### Added

- Image imports in stylesheets: dragging an image file (`.gif`, `.jpeg`, `.jpg`, `.png`, `.webp`) into a CSS or SCSS file now inserts a `url('<relative-path>')` reference. A new `cssSupported` extension set (`.css` plus the supported images) accepts images into CSS, and `scssSupported` was broadened from only `.scss`/`.css` to also include all supported image extensions.
- Two new configuration keys under `importStatements.styleSheet`: `cssImageImportStyle` and `scssImageImportStyle`, each defaulting to `url('_relativePath_')` (single-value enum), so the generated image-import snippet for CSS and SCSS can be selected from settings.
- New stylesheet image-import generators `getCSSImageImport()` and `getSCSSImageImport()` in `src/import-texts/css-scss.ts` that resolve the configured style and emit the `url('...')` snippet.
- New `cssImage` and `scssImage` config-item lists in `src/providers/config-list.ts` (each a single `url('_relativePath_')` entry) that back the two new image-import settings.

### Changed

- Refactored the drag-and-drop handler out of `extension.ts` into a dedicated `src/auto-import-on-drop-provider.ts` module, shrinking `extension.ts` to just activation wiring and exporting `AutoImportOnDropProvider` so it is independently importable.
- Stylesheet import routing now branches on the dragged file type: in the `.css` and `.scss` cases `getImportText()` switches on the import option, using the new image generators when an image is dropped and otherwise the existing `@import`/`@use` generators. SCSS file-extension preservation was extracted into a dedicated `getScssFileExt()` helper (CSS sources keep their `.css` extension, others follow the `preserveStylesheetFileExtension` setting).
- Renamed the supported-extension comments from "file types" to "file extensions" for accuracy, and `scssSupported` was retyped from `FileExtensions[]` to `SupportedFileExtensions[]`.

### Fixed

- Removed a redundant pre-switch assignment in the Markdown drop branch where `importTextOption` was computed twice (once via a ternary, then immediately overwritten by the switch), eliminating dead, misleading logic.

### Removed

- Dropped the `RelativePathOptions` interface and the now-unused `options` / `preserveFileExt` parameter from `getRelativePath()`; relative paths are always returned with the file extension stripped, and the call site no longer passes `{ preserveFileExt: true }`.
- Removed the unused `FileExtensions` import in `src/providers/supported-file-extensions.ts`, which is now typed entirely with `SupportedFileExtensions`.

## v0.1.6 (2022-08-18)

### Added

- `.scss` is now an accepted drop target. The mismatched-extension guard and a new dedicated `scssSupported` allow-list let you drag a stylesheet onto an open `.scss` file, where previously dropping anything onto `.scss` was rejected outright as a "different file extension".
- Added the `scssSupported` allow-list (`[ '.scss', '.css' ]`) that restricts which dragged files may be dropped into a `.scss` file; dragging anything other than `.scss` or `.css` onto a `.scss` file now triggers a "not supported" notification.
- Dropping a `.css` file into a `.scss` file now forces the `.css` extension onto the generated import regardless of the `preserveStylesheetFileExtension` setting (via an explicit `if (dragFileExt === '.css')` branch in the SCSS import case), whereas dropping a `.scss` file continues to honor `preserveStylesheetFileExtension`.

### Fixed

- Replaced the broken drop-target validation guard `(dropFileExt !== '.html' || dropFileExt === '.md')`, which logically simplifies to `dropFileExt !== '.html'` and therefore exempted ONLY `.html` from the mismatched-extension rejection — contradicting its own "Except .html and .md" comment and wrongly rejecting mismatched drops onto `.md`. It is now an explicit membership test, `![ '.html', '.md', '.scss' ].includes(dropFileExt)`, so `.html`, `.md`, and `.scss` are all correctly exempted.

### Changed

- The drop handler now calls `getRelativePath(..., { preserveFileExt: true })` instead of `false`, so the computed relative path retains the dragged file's extension. Note that the per-language branches in `getImportText` still append the extension on top (e.g. `relativePath + getFileExt(dragFilePath)`), so on the CSS, HTML, Markdown, and CSS-into-SCSS paths this results in the extension appearing twice (e.g. `foo.css.css`).
- Introduced `ImageFileExtensions` and `SupportedFileExtensions` type aliases in `model/types.ts` and applied them to the provider lists: `supportedImages` is now typed `ImageFileExtensions[]`, `htmlSupported` and `markdownSupported` are typed `SupportedFileExtensions[]`, and the new `scssSupported` is typed `FileExtensions[]`. No change to existing HTML/Markdown drop behavior.

## v0.1.5 (2022-08-18)

### Removed

- Dropped support for Sass (`.sass`) and Less (`.less`) files. The `sass` and `less` document selectors were removed from `src/providers/selector.ts`, and both extensions were removed from the `FileExtensions` type in `src/model/types.ts` (now only `.css` and `.scss` remain for stylesheets), so dragging a `.sass` or `.less` file no longer produces an import statement. The README supported-file tables were updated to match.
- Removed the redundant `enum: [true, false]` constraint from the three boolean settings `importStatements.script.disableAllNotification`, `importStatements.script.preserveScriptFileExtension`, and `importStatements.styleSheet.preserveFileExtension`, leaving a plain boolean with a `false` default.

### Changed

- Renamed the stylesheet import-style setting `importStatements.styleSheet.scssSassImportStyle` to `importStatements.styleSheet.scssImportStyle` and retitled it from "SCSS/SASS import style" to "SCSS import style". This is a breaking configuration rename: any previously saved `scssSassImportStyle` value must be re-set under the new key.
- Changed the activation event from `onStartupFinished` to `*`, so the extension now activates eagerly rather than waiting until VS Code finishes startup.
- Renamed the SCSS import helper `getSCSSSASSSImport` to `getSCSSImport`, the source file `src/import-texts/css-scss-sass.ts` to `css-scss.ts` (with the barrel export in `src/import-texts/index.ts` updated accordingly), and the config-list export `scssSass` to `scss` in `src/providers/config-list.ts`, scoping the stylesheet preprocessor handling to SCSS only (`@import '...';`, `@import url('...');`, `@use '...';`). The `.scss`/`.sass` case in `src/utils/import-text.ts` was collapsed to a single `.scss` case.

### Fixed

- Removed leftover debug `console.log` calls (logging the preserve-extension flag and the dragged file extension) that ran on every script-file drop in `src/utils/import-text.ts`.

## v0.1.4 (2022-08-18)

### Changed

- Added explicit `enum: [true, false]` constraints to the three boolean settings `general.disableNotifications`, `importStatements.script.preserveScriptFileExtension`, and `importStatements.styleSheet.preserveStylesheetFileExtension`, so each now presents an explicit true/false dropdown in the VS Code Settings UI instead of an unbounded boolean field. No behavior or defaults changed (all three still default to `false`).

## v0.1.3 (2022-08-18)

### Added

- Added two `console.log('@@@ ', ...)` debug statements in `import-text.ts` (logging `preserveScriptFileExtension` and the resolved file extension) on the JavaScript import path. These appear to be leftover debugging output.

### Changed

- Renamed the two "Preserve file extension" configuration keys so each leaf name is unique to its category, replacing the previously shared `preserveFileExtension` leaf: `importStatements.script.preserveFileExtension` is now `importStatements.script.preserveScriptFileExtension`, and `importStatements.styleSheet.preserveFileExtension` is now `importStatements.styleSheet.preserveStylesheetFileExtension`. Users who had customized either setting will need to set the new key.
- Changed the default of the script "Preserve file extension" setting (`importStatements.script.preserveScriptFileExtension`) from `true` to `false`, so generated JavaScript/TypeScript import paths now omit the file extension by default.

### Fixed

- Updated `settings-config.ts` to read the renamed `preserveScriptFileExtension` and `preserveStylesheetFileExtension` keys, so the "Preserve file extension" options are correctly applied when building import text after the config rename.

## v0.1.2 (2022-08-18)

### Changed

- Switched the extension's `activationEvents` from the wildcard `"*"` to [`"onStartupFinished"`](https://code.visualstudio.com/api/references/activation-events#onStartupFinished), so it no longer activates eagerly during VS Code's launch. The extension now loads only after the editor has finished starting up, reducing its impact on startup performance (commit "updated activation events").

## v0.1.1 (2022-08-18)

### Changed

- Maintenance release: version bump to 0.1.1 (package.json and package-lock.json) with no source-code changes. The only content edit switches the four Visual Studio Marketplace README badges (version, downloads, installs, rating) on vsmarketplacebadges.dev from `.svg` to `.png` image URLs.

## v0.1.0 (2022-08-18)

### Added

- Initial release: drag a file from the Explorer and drop it into an open editor to automatically insert a correctly-computed relative-path import at the drop location, powered by VS Code's [DocumentDropEditProvider](https://code.visualstudio.com/api/references/vscode-api#DocumentDropEditProvider) API (`registerDocumentDropEditProvider`, requires VS Code ^1.70.0). The dragged file's path is read via the `copyFilePath` command and the clipboard.
- JavaScript and JavaScript React support: dropping into `.js`/`.jsx` files inserts a `SnippetString` with tab-stop placeholders (`$1`, plus `$2` for the aliased form) for the import name, chosen via the `importStatements.script.javascriptImportStyle` setting across nine styles — `import name from '...'` (default), `import { name } from '...'`, `import { default as name } from '...'`, `import * as name from '...'`, side-effect `import '...'`, plus `var`/`const` forms of both `require('...')` and dynamic `import('...')`.
- TypeScript and TypeScript React support: dropping into `.ts`/`.tsx` files inserts a `SnippetString` controlled by `importStatements.script.typescriptImportStyle`, defaulting to `import { name } from '...'`, with five ES-module styles (named-default, named, default-as-alias, namespace, and side-effect import).
- CSS support: dropping a stylesheet into a `.css` file inserts an `@import` rule, selectable via `importStatements.styleSheet.cssImportStyle` between `@import '...';` (default) and `@import url('...');`.
- SCSS/SASS support: dropping into `.scss`/`.sass` files inserts a rule selectable via `importStatements.styleSheet.scssSassImportStyle` among `@import '...';` (default), `@import url('...');`, `@use '...';`, and `@use '...' as *;`.
- HTML support: dropping into a `.html` file generates the appropriate tag based on the dragged file type — `<script type="text/javascript" src>` for `.js`, `<link rel="stylesheet" href>` for `.css`, and `<img src alt="sample">` for images — backed by the `importStatements.markup.htmlScriptImportStyle`, `htmlStyleSheetImportStyle`, and `htmlImageImportStyle` settings (each currently exposes a single template value).
- Markdown support: dropping another `.md` file into a `.md` file inserts an embed in `![text](...)` form via `importStatements.markup.markdownImportStyle`; dropping an image inserts an embed via `importStatements.markup.markdownImageImportStyle`, which offers both inline (`![alt-text](path "Hover text")`, default) and reference-style (`![alt-text][image] / [image]: path "Hover text"`) forms.
- Image file support across HTML and Markdown drop targets for `.gif`, `.jpeg`, `.jpg`, `.png`, and `.webp` files.
- Configurable file-extension preservation: `importStatements.script.preserveFileExtension` (default `true`) and `importStatements.styleSheet.preserveFileExtension` (default `false`) control whether the dragged file's extension is kept in the generated script/stylesheet relative path. (CSS always appends the dragged extension; HTML and Markdown always include it.)
- `general.disableNotifications` setting (default `false`) to suppress all on-drop warning/error notifications.
- Relative paths are normalized to forward slashes (backslashes replaced) for cross-platform consistency, and a `./` prefix is automatically prepended when the dragged file and target editor file live in the same directory (case-insensitive comparison).
- On-drop validation notifications: a warning on same-file drops, an error on mismatched file extensions, and a warning on unsupported file-type/target combinations (including HTML-into-HTML).
- Drop-edit provider also registered for the `less` language selector, though no LESS import-text handler is implemented (the LESS case yields no insertion).
- Packaged as an extension pack that also installs the `ElecTreeFrying.auto-import` companion extension; built on `lodash` and the `relative` npm package.
- MIT license, README, and CHANGELOG.
