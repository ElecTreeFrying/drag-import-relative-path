# Drag And Drop Import Relative Path — Functionality Specification

A VS Code extension that generates relative-path import statements for JS, TS, JSX, TSX, MDX, CSS, SCSS, HTML, Markdown, Vue, Svelte, Astro, and LaTeX files. One input gesture: **drag-and-drop** — drag a file from VS Code's Explorer into an open editor, and the extension computes the relative path and inserts the correctly-shaped import statement for that language pair. Four settings commands, one drop provider, twenty-one configuration settings.

---

## Commands

| Command | Title | Context |
|---|---|---|
| `drag-import.setDefaultImportStyle` | Drag Import: Set Default Import Style | Command Palette only |
| `drag-import.setImportPlacement` | Drag Import: Set Import Placement | Command Palette only |
| `drag-import.togglePreserveScriptExtension` | Drag Import: Toggle Preserve Script File Extension | Command Palette only |
| `drag-import.resetImportStyles` | Drag Import: Reset All Import Styles to Defaults | Command Palette only |

All four commands are Command-Palette-only — they are not bound to any shortcut and are grouped under the `Drag Import` prefix. They configure the extension's behavior; the import gesture itself is drag-and-drop (next section).

**Set Default Import Style** shows a QuickPick listing all applicable styles for the current source-destination pair. The current default is marked with a checkmark icon and appears first. If the persisted value matches none of the offered styles (for example, a custom value hand-typed into `settings.json`), no item is marked and the styles appear in their natural order with no current-default indicator. Selecting a style persists the choice to VS Code global settings instead of inserting an import. Destinations that have only one hardcoded shape show a "No configurable style" warning instead.

**Set Import Placement** shows a QuickPick of Top / Bottom / Cursor and persists the choice to `drag-import.preferences.importStatementPlacement`. The current placement is marked with a checkmark and appears first.

**Toggle Preserve Script File Extension** flips `drag-import.importStatement.script.preserveScriptFileExtension` and reports the new On / Off state in an info toast.

**Reset All Import Styles to Defaults** clears every customized `*ImportStyle` override back to its default and shows a toast with an **Undo** action; if nothing was customized, it shows an info toast instead.

---

## Drag-and-Drop Import

Dragging a file from VS Code's Explorer tree into a supported editor generates the import snippet for that source-destination pair. The drop provider activates for all 13 supported destination languages and applies the extension's snippet styles, gating rules, and configuration settings — no separate configuration is needed.

### Supported destination languages

The provider registers against eleven VS Code language IDs — JavaScript, JavaScriptReact, TypeScript, TypeScriptReact, CSS, SCSS, HTML, Markdown, Vue, Svelte, Astro — plus two **file-pattern** selectors, `**/*.mdx` and `**/*.tex`, because neither MDX nor LaTeX has a guaranteed VS Code language ID (a `.tex` file opens as plaintext without a LaTeX extension installed). Each entry is registered with `scheme: 'file'`, so the provider activates only for on-disk, file-backed documents; untitled, in-memory, and non-`file`-scheme (e.g. remote or virtual) documents are excluded even when their language is one of the 13 above.

Beyond the per-language `scheme: 'file'` filter, the provider is registered with `dropMimeTypes: [ 'text/uri-list' ]`, so VS Code only invokes it for drag payloads carrying a `text/uri-list` MIME type (the standard Explorer drag payload) — a second registration-time gate alongside the language/scheme selector. Because of this gate, the `text/plain` fallback below is reached only when a drag does carry `text/uri-list` but its first-line value is empty/whitespace. The registration also declares `providedDropEditKinds` with the same `TextUpdateImports.append('autoImport')` kind every drop edit is tagged with (see Behavior step 7). Declaring the kind up front is what lets VS Code rank this provider's edit **above** its built-in TypeScript/JavaScript "drop to update imports" provider, which bids under the parent `TextUpdateImports` kind on `.tsx`/`.jsx` destinations — without the declaration, the built-in's raw default import was the edit applied on those drops.

### Behavior

Because the Explorer only offers files that already exist on disk, the provider performs no source-existence check; it resolves the dragged paths and builds each import directly.

1. The source file paths are resolved from the drag payload: the `text/uri-list` value is tried first — split on newlines (`\r\n` or `\n`), blank and `#`-comment lines dropped (RFC 2483), and every surviving line parsed via `Uri.parse(...).fsPath`. Only if that yields nothing is the `text/plain` value used, and then **only when it is an absolute path** (`path.isAbsolute`); a relative `text/plain` value is not accepted (the provider yields no drop edit). When several files are dragged from the Explorer at once, VS Code delivers them as a newline-separated `text/uri-list` and **every** dragged file participates — the provider fans out per member (see [§Multi-File Import](#multi-file-import)).
   - **Unresolvable payload**: if step 1 yields no usable path (the drag has neither a `text/uri-list` entry nor an absolute `text/plain` value), the provider returns `null` silently — no toast and no drop edit are offered. This is the only drop rejection path with no notification; the same-file, no-extension, unsupported-pair, and empty-snippet checks below each show a toast.
2. The destination is the file receiving the drop.
3. **Same-file check**: a member equal to the destination (case-insensitive) is skipped. When that leaves no member standing, a "same file" toast appears and nothing is inserted.
4. **Extension and pair gating**: before pair gating, an **extensionless** member (`LICENSE`, `Dockerfile`, `Makefile`) is admitted only into a `.md` destination (as a link); into any other destination it is skipped and its basename tracked for a "no file extension" toast. Then pair gating runs: a member whose source-destination extension pair is unsupported is skipped. When no member survives the fan-out, one toast appears in this precedence — unsupported pair > same file > no extension — and nothing is inserted (the provider returns a *suppressing empty edit* that out-ranks VS Code's default insert-relative-path drop — not `null`, which would let that raw-path default through).
5. **Snippet generation**: each surviving member's import snippet is produced by the extension's per-language dispatch (`snippets/dispatch.ts`). All configurable styles and settings apply.
6. **Empty-snippet guard**: a member whose generated snippet is empty or newline-only (`snippet.value === '' || snippet.value === '\n'`) — an unsupported source/destination combination that cleared pair gating but produced a no-op, e.g. a `.ts` source into a `.jsx` destination — is skipped and counts as unsupported for the aggregate toast (the same `not-supported` message and `{ sourceExt, destinationExt }` payload as Pair gating, from a distinct call site). See Rejection rules #3.
7. **Insertion**: the block's final position is determined by `computeImportPlacement()` — the Top / Bottom / Cursor logic of [§Placement](#placement), parameterized with the drop line as the cursor input. Statement-style imports ignore the mouse column: a dropped import lands on its own line, never spliced mid-line. On the forced-cursor destinations (HTML, Markdown, LaTeX) it takes the structural indentation of the line it lands above, and a drop onto a blank or whitespace-only line **reuses** that line in place — no stray blank is left behind; every other destination inserts at **column 0**. Placement is destination-driven, so the surviving statements are stacked into one block (tab stops renumbered so each import's placeholder stays independent) and a `WorkspaceEdit` via `additionalEdit` places it at the computed position (not the drop position). One pair is the exception: a framework-component (`.vue`/`.svelte`/`.astro`) source dropped into a `.ts`/`.js` destination delivers its block through the drop edit's own `insertText` at the drop point instead — the built-in TypeScript provider also bids on script destinations and out-ranks an empty-`insertText` edit, and since it cannot import an SFC the raw path would land; a concrete `insertText` keeps this provider's edit the applied one. For inline snippets (e.g., images into CSS/SCSS), the `DocumentDropEdit` places the snippet directly at the drop coordinates; inline values cannot stack, so an all-inline drop inserts the first member only, and a mixed drop keeps the statement-style members and drops the inline ones. Every drop edit (both the inline path and the non-inline `additionalEdit` path) is tagged with a stable `TextUpdateImports.append('autoImport')` edit kind — the same kind declared in `providedDropEditKinds` at registration — which ranks it above the built-in TypeScript/JavaScript "drop to update imports" provider on `.tsx`/`.jsx` destinations, so VS Code surfaces it as this extension's drop option in the drop-edit picker.

---

## Multi-File Import

A multi-file drag inserts a **stacked block** of import statements — one per file, in drag order, placed as a single insertion at the shared destination placement. The stack is assembled by shared compose helpers: each statement's snippet tab stops are renumbered past the previous statements' so every import keeps an independent placeholder. (VS Code links equal-numbered tab stops within one inserted snippet — a naive join would make typing one import's `name` edit all of them.)

### Member rules

Each dragged file is validated, gated, and built independently. A member is **skipped silently** — the rest still import — when it is:

- the destination file itself (case-insensitive match);
- extensionless (`LICENSE`, `Makefile`) into a **non-`.md`** destination — into a `.md` destination an extensionless member imports as a link and is not skipped;
- an unsupported source for the destination (the same pair gating as single-file), or a pair whose builder produces an empty snippet.

When **every** member is skipped, nothing is inserted and a single warning reports the most informative failure, in this precedence: unsupported pair > same file > no extension. (A dragged file exists by definition and the Explorer supplies a valid file URI, so the missing-source and non-absolute-path cases never arise.)

### Inline `url()` members

A non-stylesheet source into `.css` / `.scss` produces an inline `url('…')` value, not a standalone statement — inline values cannot stack. An all-inline selection inserts the **first member only** at the drop position; in a mixed selection the statement-style members are stacked and the inline members are dropped.

### How a multi-file drag fans out

A multi-file drag delivers a newline-separated `text/uri-list`; every URI is resolved and fanned out the same way, stacked at the drop placement — including the Astro frontmatter and Vue / Svelte script-block constraints. A single-file drag walks the same path with one member, so its behavior is unchanged.

---

## Supported File Extensions

38 extensions across 18 categories.

| Category | Extensions | Count |
|---|---|---|
| Script | `.ts`, `.tsx`, `.mdx`, `.js`, `.jsx` | 5 |
| Stylesheet | `.css`, `.scss` | 2 |
| HTML | `.html` | 1 |
| Markdown | `.md` | 1 |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | 7 |
| Font | `.woff`, `.woff2`, `.ttf`, `.eot` | 4 |
| Video | `.mp4`, `.webm`, `.mov` | 3 |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | 4 |
| Text track | `.vtt` | 1 |
| Data | `.json` | 1 |
| YAML | `.yaml`, `.yml` | 2 |
| Document | `.pdf` | 1 |
| Vue | `.vue` | 1 |
| Svelte | `.svelte` | 1 |
| Astro | `.astro` | 1 |
| LaTeX | `.tex` | 1 |
| Bibliography | `.bib` | 1 |
| Encapsulated PostScript | `.eps` | 1 |

---

## Cross-Import Compatibility

Which source extensions each destination accepts. A source-destination pair not listed here is rejected with a "Cannot import" warning.

Exactly thirteen destinations may import a source of a *different* extension (the cross-import set): `.html`, `.md`, `.css`, `.scss`, `.tsx`, `.mdx`, `.jsx`, `.vue`, `.svelte`, `.astro`, `.tex`, `.ts`, `.js`. The `.ts`/`.js` script destinations are the narrowest: they accept only their own extension plus framework-component sources (`.vue`/`.svelte`/`.astro`); every remaining non-cross-import destination accepts only its own extension (the same-extension default). Additionally, an **extensionless** source (`LICENSE`, `Dockerfile`, `Makefile`) may be imported into a `.md` destination as a link. The per-destination tables that follow detail the accepted sources for each destination.

### Script destinations (`.js`, `.ts`)

`.js` and `.ts` destinations accept their own extension **plus framework-component sources** (`.vue`/`.svelte`/`.astro`) — the common test-and-setup-code path (Vitest, Vue Test Utils, `customElement` registration). The own-extension source flows through the configurable script import style; a framework component becomes a fixed **default name import** (`import Name from './Comp.vue';`), PascalCase-derived from the basename with the full extension always kept, shared with the JSX/TSX/MDX component shape and bypassing the script style picker. Every other cross-extension source is rejected.

| Destination | Accepted sources | What gets generated |
|---|---|---|
| `.js` | `.js`, `.vue`, `.svelte`, `.astro` | JavaScript import style for `.js`; fixed PascalCase default import for components |
| `.ts` | `.ts`, `.vue`, `.svelte`, `.astro` | TypeScript import style for `.ts`; fixed PascalCase default import for components |

### Script-oriented destinations (JSX, TSX, MDX)

These accept script sources through their configurable import style, plus a broad set of non-script sources through hardcoded per-category dispatch.

Mechanically, `.jsx`/`.tsx`/`.mdx` carry NO per-destination source allow-list in `gating.ts` — unlike the stylesheet, markup, and script (`.ts`/`.js`) destinations below (each backed by a `*_SUPPORTED_EXTENSIONS` clause), these three are accepted purely by membership in `CROSS_IMPORT_DESTINATIONS` and therefore accept ANY source extension that clears the cross-import gate. The table below enumerates the 35 asset/script extensions that have a JSX/TSX/MDX shape, so it is exhaustive in practice. (The three LaTeX-only extensions — `.tex`, `.bib`, `.eps` — clear the cross-import gate too, but have no branch in the asset switch, so a `.tex`/`.bib`/`.eps` source dropped into `.jsx`/`.tsx`/`.mdx` falls through to `default:` (`null`) → not-supported.) A newly added file extension is likewise auto-accepted into these three destinations with no gating change. It still needs a source branch in the shared `_react.ts:buildAssetImportStatement` switch — the single canonical asset switch, reached for JSX/TSX/MDX from the default drop flow via `buildReactImport` and the style-picker flow via `variants.ts:buildReactNonScriptVariant` (and, for non-script sources into `.vue`/`.svelte`/`.astro` destinations, from `languages/framework-component.ts`) — to emit a non-empty snippet; without one the extension falls through to that switch's `default:` (`null`), which the drop flow wraps as an empty `SnippetString` and the picker flow drops as a missing variant.

| Source category | Extensions | `.jsx` | `.tsx` | `.mdx` |
|---|---|---|---|---|
| Script (JS) | `.js`, `.jsx` | Yes | Yes (JS fallback) | Yes (JS fallback) |
| Script (TS) | `.ts`, `.tsx` | — | Yes | Yes |
| CSS Modules | `.module.css`, `.module.scss` | Yes | Yes | Yes |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes | Yes |
| Font | `.woff`, `.woff2`, `.ttf`, `.eot` | Yes | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | Yes | Yes |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | Yes | Yes |
| Text track | `.vtt` | Yes | Yes | Yes |
| Data | `.json` | Yes | Yes | Yes |
| YAML | `.yaml`, `.yml` | Yes | Yes | Yes |
| Document | `.pdf` | Yes | Yes | Yes |
| Markup | `.html`, `.md`, `.mdx` | Yes | Yes | Yes |
| Stylesheet | `.css`, `.scss` | Yes | Yes | Yes |
| Component | `.vue`, `.svelte`, `.astro` | Yes | Yes | Yes |

### Stylesheet destinations

| Source category | Extensions | `.css` | `.scss` |
|---|---|---|---|
| Same stylesheet | `.css` / `.scss` | `.css` only | `.scss`, `.css` |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes |

### Markup destinations

| Source category | Extensions | `.html` | `.md` |
|---|---|---|---|
| Script | `.js` | Yes | — |
| Stylesheet | `.css` | Yes | — |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | — |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | — |
| Text track | `.vtt` | Yes | — |
| Markdown | `.md` | — | Yes |
| Extensionless | `LICENSE`, `Dockerfile`, `Makefile` (no extension) | — | Yes — `[text](path)` link |

`.html` to `.html` is always rejected — no relative-import syntax exists for HTML embedding itself. `.md` is the **only** destination that accepts an extensionless source — no bundler resolves an extensionless import in a script, style, or markup destination, whereas a Markdown link needs no resolver.

### Framework component destinations

| Source category | Extensions | `.vue` | `.svelte` | `.astro` |
|---|---|---|---|---|
| Self | `.vue` / `.svelte` / `.astro` | `.vue` | `.svelte` | `.astro`, `.vue`, `.svelte` |
| Script | `.ts`, `.js`, `.jsx`, `.tsx` | Yes | Yes | Yes |
| Image | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp` | Yes | Yes | Yes |
| Video | `.mp4`, `.webm`, `.mov` | Yes | Yes | Yes |
| Audio | `.mp3`, `.ogg`, `.wav`, `.m4a` | Yes | Yes | Yes |
| Text track | `.vtt` | Yes | Yes | Yes |
| Data | `.json` | Yes | Yes | Yes |
| YAML | `.yaml`, `.yml` | Yes | Yes | Yes |
| Stylesheet | `.css`, `.scss` | Yes | Yes | Yes |
| Markdown | `.md`, `.mdx` | Yes | Yes | Yes |

A **stylesheet source** (`.css` / `.scss`) is shaped by where the cursor sits: strictly inside a `<style>` block it emits the CSS/SCSS dialect (`@import` / `@use`, configurable via `cssImportStyle` / `scssImportStyle`); anywhere else it emits a side-effect `import './styles.css';`. See [§ Vue / Svelte / Astro](#vue--svelte--astro) and [§ Vue / Svelte / Astro `<style>` block constraint](#vue--svelte--astro-style-block-constraint).

### LaTeX destination

`.tex` accepts three source kinds, each dispatched by the source extension. The graphics set is the **engine-renderable** formats only — `.svg`, `.gif`, `.webp`, `.avif` are rejected (`pdflatex` cannot render them without a plugin + shell-escape), so they do not appear here even though they are accepted by other destinations.

| Source category | Extensions | `.tex` |
|---|---|---|
| Self (file inclusion) | `.tex` | Yes — `\input` / `\include` |
| Bibliography | `.bib` | Yes — `\addbibresource` / `\bibliography` |
| Graphics | `.pdf`, `.png`, `.jpg`, `.jpeg`, `.eps` | Yes — `figure` / `\includegraphics` |

### Rejection rules

Pair gating is implemented by `isPairSupported(info)` in `src/gating.ts`, a single boolean that reads only the source/destination extension fields (no path data). Its **first clause special-cases an extensionless source**: it returns `true` only for a `.md` destination (a link) and `false` otherwise — the one early-return in the function. Every other source runs the reject-clause chain: the universal cross-import gate, the explicit `.html → .html` reject, then ten per-destination allow-list guards (the last two being the `.ts` and `.js` script destinations, whose lists are their own extension plus the framework-component sources). The first matching clause rejects; a pair is accepted by surviving them all. (The same-file and empty-snippet rules below are separate checks in the drop provider, not part of this boolean.)

1. **Same file**: source path equals destination path (case-insensitive) — "A file cannot import itself."
2. **Unsupported pair**: source extension not in the destination's accepted list — "Cannot import {ext} into {ext} files."
3. **Empty snippet**: if the import generator produces an empty or newline-only string, the pair is treated as unsupported. This happens two ways: (a) a per-language builder has no branch for the source (e.g. a `.ts` source into a `.jsx` destination, which passes pair gating but has no script branch), or (b) the destination-extension dispatcher (`snippets/dispatch.ts`) has no `case` for the destination — reached by same-extension pairs that clear the same-file/same-extension gate but have no import syntax, such as `.json` → `.json` or `.png` → `.png` (there is no `.json`/`.png` builder at all). In both cases the empty snippet signals the drop provider to treat the pair as unsupported.

---

## Import Statement Styles

**Configuration drift**: every styled builder resolves the persisted style by exact-matching the setting value against its enum description strings (`resolveStyleIndex`, byte-identical string equality). The stored value is the full option string (e.g. `import name from '_relativePath_';`), not an index. If the value matches none — a typo, a stray space, a value left over after an option string changed across an extension update, or one hand-edited into `settings.json` — resolution yields no index and the renderer silently falls back to that language's index-0 shape (e.g. JavaScript → `import name from './path';`) rather than erroring or inserting nothing. This is the snippet-insertion behavior on the drop path; no error, toast, or log is shown. It is distinct from the Set Default Style picker, which separately surfaces an unmatched value by showing no current-default checkmark (see Set Default Import Style). Hardcoded single-shape destinations are unaffected — they never consult the setting. Each style setting's enum strings are kept byte-identical at three sites — the `package.json` `enum`, the matching `ImportStyle[]` `description` strings in `snippets/_styles.ts` (matched by string equality), and each language's per-style `…ByStyle` switch (keyed by numeric index) — with every such switch ending in a `default:` arm emitting the index-0 shape, so drift at any site degrades to the default style rather than an error.

In the style picker, each entry's label is the snippet shape with the source basename substituted (placeholders rendered as identifier text); its right-aligned description is a short tag. The "Description" column in the per-language tables below paraphrases that tag for every row — it is not a verbatim copy. The default (index 0) HTML image, video, and audio styles have no tag in code, so the picker shows their snippet shape as the description there.

**Default-import auto-naming.** The identifier in a default-import shape — `import name from …`, `import name, { … }`, `import * as name`, `const name = require(…)` / `await import(…)`, and the asset `import name from …` / `import url from …` forms — is **pre-filled from the source file's basename** instead of left as an empty placeholder: `logo.svg` → `import logo from './logo.svg'`; `App.jsx` → `import App from './App'` (a PascalCase filename keeps its case; a kebab/snake name camelCases — `my-logo.v2.svg` → `myLogoV2`). The pre-filled name is an editable, pre-selected tab stop, so typing over it behaves exactly as an empty placeholder did. When the basename can't form a legal identifier (leading digit or non-ASCII, e.g. `404.png`), the shape falls back to a generic `name` / `url` placeholder. Named and type-only imports (`import { name }`, `import type { name }`) are **not** pre-filled — their binding must match an actual export; TypeScript's named default (index 0) instead uses exported-class / Angular-convention detection (below). Framework SFC sources (`.vue`/`.svelte`/`.astro`) instead pre-fill the conventional **PascalCase** component identifier (`my-button.vue` → `import MyButton from './my-button.vue'`; see **Framework component PascalCase** under Path Computation); Markdown/MDX sources (`.md`/`.mdx`) keep the generic `name`.

### JavaScript

7 configurable styles. Setting: **`drag-import.importStatement.script.javascriptImportStyle`**. Default: index 0.

Used for `.js` destinations, and for `.js`/`.jsx` sources imported into `.jsx` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `import name from './path';` | ES module: default import **(default)** |
| 1 | `import { name } from './path';` | ES module: named import |
| 2 | `import name, { other } from './path';` | ES module: default + named |
| 3 | `import * as name from './path';` | ES module: namespace import |
| 4 | `import './path';` | ES module: side-effect (no binding) |
| 5 | `const name = require('./path');` | CommonJS require |
| 6 | `const name = await import('./path');` | Dynamic import |

### TypeScript

7 configurable styles. Setting: **`drag-import.importStatement.script.typescriptImportStyle`**. Default: index 0.

Used for `.ts` destinations, for `.ts`/`.tsx` sources imported into `.tsx`/`.mdx` destinations, and for all script sources imported into `.vue`/`.svelte`/`.astro` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `import { name } from './path';` | ES module: named import **(default)** |
| 1 | `import name from './path';` | ES module: default import |
| 2 | `import * as name from './path';` | ES module: namespace import |
| 3 | `import './path';` | ES module: side-effect (no binding) |
| 4 | `import type { name } from './path';` | Type-only import (TS 3.8+) |
| 5 | `import { name, type Type } from './path';` | Mixed value + type (TS 4.5+) |
| 6 | `const name = await import('./path');` | Dynamic import |

**Angular legacy auto-fill** (index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the placeholder is pre-filled with a PascalCase identifier derived from the filename — for example, `app-root.component.ts` produces `import { AppRootComponent } from './path';`. The derived name is validated against `/^[A-Za-z_$][\w$]*$/`; if it is not a legal JS identifier (e.g. a basename containing a space, or one whose first segment starts with a digit), the pre-fill is dropped and an anonymous `$1` tab stop is used instead. Other indexes use a generic placeholder.

**Exported class detection** (`.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the placeholder at index 0. This takes priority over Angular legacy auto-fill when both would apply. Other destinations that use the TypeScript import style (`.tsx`, `.mdx`, `.vue`, `.svelte`, `.astro`) do not perform class detection — index 0 falls through to Angular legacy auto-fill or an anonymous tab stop. Detection is line-anchored: only a class declared at column 0 (the very start of a line) is matched. An `export class` that is indented — including one nested inside a `namespace`/`module` block — is not detected, and index 0 then falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). A default-exported class (`export default class Foo`) is likewise not detected: only the bare `export class`/`export abstract class` forms match, so a `default` between `export` and `class` is skipped and index 0 falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). When a file declares multiple top-level exported classes, only the first (top-most by line order) is used for the pre-fill. Commented-out declarations are ignored — both `//` line comments and `/* */` block comments (including multi-line blocks) are stripped before scanning, so a commented-out `export class` does not pre-fill the placeholder. Class detection degrades silently: if the source file cannot be read, no warning is shown and index 0 simply uses its normal fallback — Angular legacy auto-fill or an anonymous tab stop.

**Config-drift fallback**: if the persisted `typescriptImportStyle` value matches none of the seven enum strings (unset, mistyped, or trailing-space drift, so `resolveStyleIndex` returns `undefined`), the builder still emits a usable `import { name } from './path';` — the index-0 shape, with exported-class pre-fill honored when a class was detected (`.ts` destinations). Unlike the explicitly-selected index 0, this drift path does NOT apply Angular legacy auto-fill, so a `.component`/`.directive`/`.pipe`/`.service`/`.module` source that would PascalCase-fill under a chosen index 0 instead gets a plain `$1` tab stop when index 0 is reached only via drift.

### CSS stylesheet

2 configurable styles. Setting: **`drag-import.importStatement.styleSheet.cssImportStyle`**. Default: index 0.

Used for `.css` source imported into `.css` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `@import './path';` | Quoted path **(default)** |
| 1 | `@import url('./path');` | url() function |

### CSS image — hardcoded

1 shape, not configurable.

Used for image sources imported into `.css` destinations.

```
url('./path')
```

Inserted inline at the exact cursor position (line and column). No trailing newline — this is a CSS value fragment, not a standalone statement.

### SCSS stylesheet

5 configurable styles. Setting: **`drag-import.importStatement.styleSheet.scssImportStyle`**. Default: index 0.

Used for `.scss` and `.css` sources imported into `.scss` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `@use './path';` | Modern @use — Sass module system **(default)** |
| 1 | `@use './path' as *;` | @use with wildcard alias |
| 2 | `@use './path' as name;` | @use with named alias |
| 3 | `@forward './path';` | Module re-export (barrel pattern) |
| 4 | `@import './path';` | Legacy @import (Sass-deprecated) |

**SCSS partial normalization**: a leading `_` on the last path segment is stripped — `_variables.scss` becomes `variables` in the import path.

**SCSS `.css` preservation**: the `.css` extension is always kept on the import path regardless of the `preserveStylesheetFileExtension` setting. Sass requires it to recognize a foreign-language import.

### SCSS image — hardcoded

1 shape, not configurable. Reuses the CSS image builder.

```
url('./path')
```

Same inline insertion behavior as CSS image.

### HTML script

5 configurable styles. Setting: **`drag-import.importStatement.markup.htmlScriptImportStyle`**. Default: index 0.

Used for `.js` source imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<script src="./path"></script>` | Modern minimal **(default)** |
| 1 | `<script src="./path" defer></script>` | Deferred execution |
| 2 | `<script type="module" src="./path"></script>` | ES module |
| 3 | `<script src="./path" async></script>` | Async execution |
| 4 | `<script type="text/javascript" src="./path"></script>` | Legacy |

### HTML image

3 configurable styles. Setting: **`drag-import.importStatement.markup.htmlImageImportStyle`**. Default: index 0.

Used for image sources imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<img src="./path" alt="sample">` | **(default)** — no tag in code; picker shows the snippet shape |
| 1 | `<img src="./path" alt="" loading="lazy">` | Lazy loading |
| 2 | `<img src="./path" alt="" width="" height="">` | Explicit dimensions (CLS prevention) |

### HTML video

4 configurable styles. Setting: **`drag-import.importStatement.markup.htmlVideoImportStyle`**. Default: index 0.

Used for video sources (`.mp4`, `.webm`, `.mov`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<video src="./path" controls></video>` | **(default)** — no tag in code; picker shows the snippet shape |
| 1 | `<video src="./path" autoplay muted loop playsinline></video>` | Silent autoplay (hero sections) |
| 2 | `<video src="./path" controls poster=""></video>` | Custom poster thumbnail |
| 3 | `<video src="./path" controls preload="metadata"></video>` | Metadata preload (Core Web Vitals) |

### HTML audio

2 configurable styles. Setting: **`drag-import.importStatement.markup.htmlAudioImportStyle`**. Default: index 0.

Used for audio sources (`.mp3`, `.ogg`, `.wav`, `.m4a`) imported into `.html` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `<audio src="./path" controls></audio>` | **(default)** — no tag in code; picker shows the snippet shape |
| 1 | `<audio src="./path" controls preload="metadata"></audio>` | Metadata preload |

### HTML stylesheet — hardcoded

1 shape, not configurable.

Used for `.css` source imported into `.html` destinations.

```
<link href="./path" rel="stylesheet">
```

### HTML text track — hardcoded

1 shape, not configurable.

Used for `.vtt` source imported into `.html` destinations.

```
<track src="./path" kind="subtitles" srclang="en" label="English"></track>
```

The `srclang` and `label` values are snippet placeholders that the user fills in after insertion.

### Markdown link — hardcoded

1 shape, not configurable.

Used for `.md` source imported into `.md` destinations.

```
[text](./path)
```

### Markdown image

3 configurable styles. Setting: **`drag-import.importStatement.markup.markdownImageImportStyle`**. Default: index 0.

Used for image sources imported into `.md` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `![alt-text](./path)` | Bare inline image **(default)** |
| 1 | `![alt-text](./path "Hover text")` | Inline with title |
| 2 | `<img src="./path" alt="" width="" height="">` | HTML embed (CLS prevention) |

### JSX / TSX / MDX non-script sources

When a non-script source is imported into a `.jsx`, `.tsx`, or `.mdx` destination, the import shape is determined by the source's category rather than a configurable setting. All placeholders (`styles`, `name`, `url`, and derived identifiers like `MyButton`) are editable — the cursor lands on them after insertion.

| Source category | Extensions | Snippet |
|---|---|---|
| CSS Modules | `.module.css`, `.module.scss` | `import styles from './path';` |
| Image, data, markup, document | `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.avif`, `.webp`, `.json`, `.html`, `.yml`, `.yaml`, `.md`, `.mdx`, `.pdf` | `import name from './path';` |
| Framework component | `.vue`, `.svelte`, `.astro` | `import MyButton from './path';` |
| Media, text track | `.mp4`, `.webm`, `.mov`, `.mp3`, `.ogg`, `.wav`, `.m4a`, `.vtt` | `import url from './path';` |
| Font, stylesheet | `.woff`, `.woff2`, `.ttf`, `.eot`, `.css`, `.scss` | `import './path';` |

Every shape in this table keeps the full real source extension on the path verbatim — neither preserve setting applies to these non-script imports.

**Script routing**: `.jsx` destinations route `.js` and `.jsx` sources through the JavaScript import style. `.tsx` and `.mdx` destinations route `.ts` and `.tsx` sources through the TypeScript import style, and `.js` and `.jsx` sources through the JavaScript import style as a fallback.

### Vue / Svelte / Astro

Script sources (`.ts`, `.tsx`, `.js`, `.jsx`) use the TypeScript import style. **Stylesheet sources** (`.css` / `.scss`) are context-sensitive: strictly inside a `<style>` block they emit the CSS/SCSS dialect (`@import` for `.css`, `@use` for `.scss`, configurable via `cssImportStyle` / `scssImportStyle`, and honouring the SCSS partial-underscore and `preserveStylesheetFileExtension` rules); everywhere else — the `<script>` block, Astro frontmatter, or template — they emit a side-effect `import './styles.css';`. Every other non-script source is dispatched by source category through the **same `buildAssetImportStatement` switch used by JSX/TSX/MDX** (`_react.ts`) — `import name from` for images, data, YAML, and Markdown/MDX (`.md` / `.mdx`); a **PascalCase**-derived default import for framework components (`my-button.vue` → `import MyButton from './my-button.vue';`, falling back to `name` when the basename yields no legal identifier); `import url from` for media and text tracks — with the full source extension preserved on the path. (Fonts are still not accepted here — a font belongs in an SFC's `@font-face` rule. A `.module.css` / `.module.scss` source is accepted like any stylesheet: in the script region the CSS-Modules guard gives it the `import styles from '…'` default import; inside a `<style>` block it takes the plain `@import` / `@use` dialect.)

### LaTeX

`.tex` is the only destination that ships its **own** picker namespace for non-script sources (`drag-import.importStatement.latex.*`). Source classification is by raw extension — graphics → `figure`/`\includegraphics`, `.tex` → `\input`/`\include`, `.bib` → `\addbibresource`/`\bibliography`.

#### LaTeX graphics

3 configurable styles. Setting: **`drag-import.importStatement.latex.graphicsImportStyle`**. Default: index 0. Used for `.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps` sources imported into `.tex` destinations. The path keeps its extension unless `preserveGraphicsFileExtension` is off (it defaults to *on* — keep).

| Index | Snippet | Description |
|---|---|---|
| **0** | `\begin{figure}[htbp] … \includegraphics[width=0.5\textwidth]{./path} … \caption{…} \label{fig:…} \end{figure}` | Figure float — **(default)**; rendered multi-line |
| 1 | `\includegraphics[width=0.5\textwidth]{./path}` | Sized graphic, no float |
| 2 | `\includegraphics{./path}` | Bare graphic, natural size |

Index 0 is the only **multi-line** snippet in the extension — it renders as six lines, with `\caption` emitted **before** `\label` so `\ref` resolves to the figure number (a `\label` placed above its `\caption` captures the section counter). The `caption` and `label` placeholders are pre-filled editable tab stops (caption → label). Index 1 puts an editable `0.5` tab stop on the width fraction.

#### LaTeX `\input` / `\include`

2 configurable styles. Setting: **`drag-import.importStatement.latex.inputImportStyle`**. Default: index 0. Used for `.tex` sources imported into `.tex` destinations. The `.tex` extension is always dropped from the path (`\include` requires it omitted).

| Index | Snippet | Description |
|---|---|---|
| **0** | `\input{./path}` | Inline include, no page break **(default)** |
| 1 | `\include{./path}` | Chapter-level — page break, `\includeonly`-able |

#### LaTeX bibliography

2 configurable styles. Setting: **`drag-import.importStatement.latex.bibliographyImportStyle`**. Default: index 0. Used for `.bib` sources imported into `.tex` destinations.

| Index | Snippet | Description |
|---|---|---|
| **0** | `\addbibresource{./path.bib}` | Modern biblatex — keeps `.bib` **(default)** |
| 1 | `\bibliography{./path}` | Legacy BibTeX — drops `.bib` |

---

## Placement

### Configurable modes

Setting: **`drag-import.preferences.importStatementPlacement`**. Default: `"Bottom"`.

| Mode | Behavior |
|---|---|
| **Top** | Insert before the first line of the file (line 0). |
| **Bottom** | Insert after the last recognized import line. Falls back to line 0 if no import is found. |
| **Cursor** | Insert at the current cursor line. If the cursor sits inside a comment block (lines starting with `//`, `/*`, or `*` after whitespace), the import is placed on the first line *above* that block, so it lands above commented-out code/prose rather than inside the comment. For Markdown destinations (`.md`, `.mdx`) a leading `*` is treated as content (bullet / emphasis), not a comment. In the JSX-family destinations (`.jsx`, `.tsx`, `.mdx`), a cursor inside a multi-line JSX comment span (`{/* … */}`) additionally hops above the span's **opening** line — the span's interior lines carry no line-leading comment marker, so the extension separately scans upward for an unclosed `{/*` opener; the comment-block walk-up then continues from the opener, so a `//` run sitting directly above the span pushes the import further up still. `.md` never span-scans — `{/*` is literal text in Markdown. |

### Bottom mode — import line detection

Bottom mode scans the document line by line for the last line that bears one of these 9 markers in a *code* position (the `isImportLine` predicate):

```
import 
require(
@import '
@import "
@import url(
@use '
@use "
@forward '
@forward "
```

The eight line-leading markers (`import`, the `@import` family, `@use`, `@forward`) count only when they start the trimmed line, so an `import ` substring inside a string literal (`const msg = "you should import this"`) does **not** trigger Bottom placement; `require(` is matched anywhere, so a `require(` inside a string literal is a rare residual false positive. Lines starting with `//`, `/*`, or `*` (comment lines) are also skipped during the scan. The import is inserted on the line after the last match. If no marker matches, falls back to line 0.

### Placement overrides

These overrides take effect regardless of the user's placement setting.

| Condition | Forced placement | Reason |
|---|---|---|
| HTML, Markdown, or LaTeX destination (`.html`, `.md`, `.tex` — **not** `.mdx`) | Cursor (line and column) | No canonical "top of file" for embedded tags; for LaTeX, line 0 is the preamble (before `\documentclass`), so a figure / `\input` belongs in the body at the cursor. |
| Non-stylesheet source into stylesheet destination (e.g., image into `.css`/`.scss`) | Inline at exact cursor position (line and column), no trailing newline | `url()` is a CSS value fragment, not a standalone statement. |

`.mdx` is intentionally excluded from this forced-cursor override (`shouldRepositionCursor` checks `.html`/`.md`/`.tex`); it follows the user's Top/Bottom/Cursor setting, though it is still treated as Markdown for `*`-comment handling (see Cursor mode above).

### Astro frontmatter constraint

For `.astro` destinations, import placement is constrained to within the `---` frontmatter fences.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `---` line. |
| Bottom | Scan the frontmatter region for import markers, insert after the last match. Falls back to after the opening `---`. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `---` lines (not on the fence lines themselves). Otherwise falls back to Bottom. |

In Cursor mode, when the cursor is inside the block, the same comment-block walk-up applies before insertion. The inserted import is indented to match the surrounding block — Top uses the block's detected indentation (the indent of its first content line); Bottom reuses the last existing import's own indentation (falling back to the block's); Cursor uses the cursor line's own indentation (falling back to the block's). When Cursor falls back to Bottom (cursor outside the fences), it inherits Bottom's indentation. Imports inserted outside a frontmatter/script block (the general Top/Bottom/Cursor flow) are not re-indented. This rule applies on every drop.

If no frontmatter exists, a new `---` block is created at line 0 and the import is placed inside it.

### Vue / Svelte script block constraint

For `.vue` and `.svelte` destinations, import placement is constrained to within a `<script>` block, chosen by a three-tier preference: (1) `<script setup>`; otherwise (2) a `<script>` whose opening tag does NOT contain `context=` (so a Svelte `<script context="module">` block is skipped in favor of the instance script); otherwise (3) the first `<script>` of any kind.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `<script...>` tag. |
| Bottom | Scan the script block for import markers, insert after the last match. Falls back to after the opening tag. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `<script>` and `</script>` lines (not on the tag lines themselves). Otherwise falls back to Bottom. |

In Cursor mode, when the cursor is inside the block, the same comment-block walk-up applies before insertion. The inserted import is indented to match the surrounding block — Top uses the block's detected indentation (the indent of its first content line); Bottom reuses the last existing import's own indentation (falling back to the block's); Cursor uses the cursor line's own indentation (falling back to the block's). When Cursor falls back to Bottom (cursor outside the tags), it inherits Bottom's indentation. Imports inserted outside a frontmatter/script block (the general Top/Bottom/Cursor flow) are not re-indented. This rule applies on every drop.

If no script block exists, a new `<script>`/`</script>` pair is created at line 0 and the import is placed inside it.

### Vue / Svelte / Astro `<style>` block constraint

When a **stylesheet source** (`.css` / `.scss`) is imported strictly inside a `<style…>`…`</style>` block of a `.vue` / `.svelte` / `.astro` destination, placement is constrained to that enclosing style block (chosen by which block contains the cursor / drop line — a file may hold several). This takes precedence over the frontmatter / script-block constraints above, so the stylesheet import lands beside the block's other `@import` / `@use` rules rather than in the script region.

| Mode | Behavior |
|---|---|
| Top | Insert after the opening `<style…>` tag. |
| Bottom | Scan the style block for import markers (`@import` / `@use` / `@forward`), insert after the last match. Falls back to after the opening tag. |
| Cursor | Insert at the cursor line if the cursor is strictly between the `<style>` and `</style>` lines (not on the tag lines themselves). Otherwise falls back to Bottom. |

Indentation matches the block, mirroring the frontmatter / script-block rules. This applies **only** when the gesture is entirely stylesheet sources landing inside a `<style>` block; a mixed multi-file selection, or a stylesheet dropped outside a style block, takes the script-side placement above (a side-effect `import`). No `<style>` block is ever synthesised — without one, the script-side placement is already correct. This rule applies on every drop.

### Insertion column

| Destination type | Column |
|---|---|
| Script (`.ts`, `.tsx`, `.mdx`, `.js`, `.jsx`, `.vue`, `.svelte`, `.astro`) | Column 0 |
| Stylesheet (`.css`, `.scss`) | Column 0 |
| HTML, Markdown, LaTeX | Own line at the target line's structural indent (a blank target line is reused in place) |

**Newline**: every non-inline import has a trailing newline appended before insertion, so each import occupies its own line. The inline `url()` path (the overrides row above) is the only exception. For the no-frontmatter and no-script-block fallbacks, this appended newline is also what lands the synthesized closing fence/tag on its own line — the created blocks are `---\n<import>\n---\n` and `<script>\n<import>\n</script>\n`. The LaTeX figure shape is itself multi-line (six lines joined by `\n`); it is inserted as one block at the cursor line, and VS Code re-indents its interior lines to the insertion column.

---

## Configuration Reference

### Preferences

| Setting | Type | Default | Values |
|---|---|---|---|
| `drag-import.preferences.importStatementPlacement` | string | `"Bottom"` | `"Top"`, `"Bottom"`, `"Cursor"` |
| `drag-import.preferences.requestReview` | boolean | `true` | `true`, `false` |

### Script

| Setting | Type | Default | Values |
|---|---|---|---|
| `drag-import.importStatement.script.preserveScriptFileExtension` | boolean | `false` | `true` / `false` |
| `drag-import.importStatement.script.javascriptImportStyle` | string | `"import name from '_relativePath_';"` | 7 enum values (see JavaScript styles) |
| `drag-import.importStatement.script.typescriptImportStyle` | string | `"import { name } from '_relativePath_';"` | 7 enum values (see TypeScript styles) |

### Stylesheet

| Setting | Type | Default | Values |
|---|---|---|---|
| `drag-import.importStatement.styleSheet.preserveStylesheetFileExtension` | boolean | `false` | `true` / `false` |
| `drag-import.importStatement.styleSheet.cssImportStyle` | string | `"@import '_relativePath_';"` | 2 enum values (see CSS styles) |
| `drag-import.importStatement.styleSheet.cssImageImportStyle` | string | `"url('_relativePath_')"` | 1 value (hardcoded) |
| `drag-import.importStatement.styleSheet.scssImportStyle` | string | `"@use '_relativePath_';"` | 5 enum values (see SCSS styles) |
| `drag-import.importStatement.styleSheet.scssImageImportStyle` | string | `"url('_relativePath_')"` | 1 value (hardcoded) |

### Markup

| Setting | Type | Default | Values |
|---|---|---|---|
| `drag-import.importStatement.markup.htmlScriptImportStyle` | string | `"<script src=\"_relativePath_\"></script>"` | 5 enum values (see HTML script styles) |
| `drag-import.importStatement.markup.htmlImageImportStyle` | string | `"<img src=\"_relativePath_\" alt=\"sample\">"` | 3 enum values (see HTML image styles) |
| `drag-import.importStatement.markup.htmlVideoImportStyle` | string | `"<video src=\"_relativePath_\" controls></video>"` | 4 enum values (see HTML video styles) |
| `drag-import.importStatement.markup.htmlAudioImportStyle` | string | `"<audio src=\"_relativePath_\" controls></audio>"` | 2 enum values (see HTML audio styles) |
| `drag-import.importStatement.markup.htmlStyleSheetImportStyle` | string | `"<link href=\"_relativePath_\" rel=\"stylesheet\">"` | 1 value (hardcoded) |
| `drag-import.importStatement.markup.markdownImportStyle` | string | `"[text](_relativePath_)"` | 1 value (hardcoded) |
| `drag-import.importStatement.markup.markdownImageImportStyle` | string | `"![alt-text](_relativePath_)"` | 3 enum values (see Markdown image styles) |

### LaTeX

| Setting | Type | Default | Values |
|---|---|---|---|
| `drag-import.importStatement.latex.preserveGraphicsFileExtension` | boolean | `true` | `true` / `false` |
| `drag-import.importStatement.latex.graphicsImportStyle` | string | figure float (multi-line) | 3 enum values (see LaTeX graphics styles) |
| `drag-import.importStatement.latex.inputImportStyle` | string | `"\\input{_relativePath_}"` | 2 enum values (see LaTeX `\input` styles) |
| `drag-import.importStatement.latex.bibliographyImportStyle` | string | `"\\addbibresource{_relativePath_}"` | 2 enum values (see LaTeX bibliography styles) |

`preserveGraphicsFileExtension` defaults to `true` (keep the extension), inverted from the two script/stylesheet preserve booleans (both `false`): keeping the dragged file's exact extension is unambiguous and always compiles, where LaTeX's "omit and let the engine resolve" convention is the opt-in.

**Note**: four settings have only a single enum value (`cssImageImportStyle`, `scssImageImportStyle`, `htmlStyleSheetImportStyle`, `markdownImportStyle`). These appear in the VS Code Settings UI for completeness but are not configurable at runtime — the extension always produces the one hardcoded shape.

---

## UX & Notifications

Set Default Import Style clears existing notifications before executing, so a toast from a previous command is dismissed when a new one starts. The other three settings commands (Set Import Placement, Toggle Preserve Script File Extension, Reset All Import Styles) and the drop provider emit their toast without clearing.

### Workflow: Set Default Style

The command resolves the current source-destination pair and applies the same gating as a drop — an unsupported pair shows the "Cannot import" warning and writes nothing. For a supported, configurable pair it shows a QuickPick with placeholder "Set default import style". The picker enables `matchOnDescription`, so typing also filters against each row's description column — the style's short tag when it declares one (true for 42 of the 45 styled entries), otherwise the full style-description string. The current default is marked with a checkmark icon and appears first. If the persisted value does not match any offered style (for example, a custom value hand-typed into `settings.json`), no item is marked and the styles appear in their natural order with no current-default indicator. Selecting a style persists the choice to VS Code global settings and shows a confirmation toast. Pressing Escape dismisses the picker silently — no setting is written and no confirmation toast appears. Destinations with only one hardcoded shape show a "No configurable style" warning instead.

Each picker row's primary label is the rendered import shape itself, but (a) the path is shortened to the source file's basename — a source at `../../components/widget.tsx` shows as `widget`, keeping rows width-stable regardless of nesting depth — and (b) snippet placeholder syntax is converted to plain identifiers for display (the `${1:X}` default text is shown verbatim — `${1:styles}` → `styles`, `${1:logo}` → `logo` for a basename-derived default import, `${1:url}` → `url`, `@use '...' as ${1:*}` → `as *`; a bare `$1` renders as the literal `name`). The full relative path is restored in the text actually inserted. The row's secondary text is the style's tag (or its full description when no tag is defined; empty for single-shape hardcoded destinations) — this is what "filter by description" matches against.

### Notification reference

All messages are prefixed with "Drag Import:".

| Condition | Level | Message | Action buttons |
|---|---|---|---|
| Default style saved | Info | Default style saved — {settingValue} | — |
| Placement saved | Info | Import placement saved — {placement} | — |
| Preserve script extension toggled | Info | Preserve script file extension — On / Off | — |
| Import styles reset | Info | Reset {count} import style(s) to defaults | **Undo** |
| No styles to reset | Info | No custom import styles to reset. | — |
| Import styles restored | Info | Import styles restored. | — |
| Same file | Warning | A file cannot import itself. | — |
| Unsupported pair | Warning | Cannot import {sourceExt} into {destinationExt} files. | **View Supported Files** |
| No file extension | Warning | {basename} has no file extension — only Markdown links support extensionless files. | — |
| No configurable style | Warning | {sourceExt} → {destinationExt} imports use a fixed style. | — |

Clicking **View Supported Files** on the Unsupported pair toast opens the project README's supported-languages section (`https://github.com/ElecTreeFrying/drag-import-relative-path#supported-languages`) in the default browser; dismissing the toast does nothing. Clicking **Undo** on the Import styles reset toast re-writes the cleared overrides to their captured prior values (then shows the *Import styles restored.* toast); dismissing leaves the reset in place.

`{settingValue}` is the persisted setting string written to `settings.json` — the byte-exact `package.json` enum value (the `_relativePath_` import shape), e.g. `import name from '_relativePath_';`, with the literal `_relativePath_` token shown unexpanded. It is **not** the human-readable phrase shown in the "Description" column of the style tables above (that phrase is the QuickPick row's description). A custom value hand-typed into `settings.json` would likewise be echoed verbatim.

---

## Path Computation

**Relative path**: computed via Node's `path.relative` from the destination file's directory to the source file. Always uses Unix-style forward slashes, including on Windows.

**`./` prefix**: added when `path.relative`'s result (after Unix-slash normalization via `toUnixPath`) does not already start with `.`. The decision is a single `relativePath.startsWith('.')` test in `computeRelative` (`src/path/relative.ts`) — there is no source-vs-destination directory comparison and no case-folding anywhere in this file. Same-directory imports receive the prefix implicitly, because `path.relative` returns a bare filename (e.g. `foo` / `utils/helper`) for them, which does not begin with `.`. Paths that already begin with `../` are left untouched (prefixing would emit a redundant `./../`). (The only case-insensitive path comparisons in the extension are the same-*file* rejection checks in the drop provider, which compare full file paths upstream — unrelated to this prefix rule.)

**Extension stripping**: the import path keeps or drops the source extension depending on which builder renders it.

- **Script sources** (`.ts`, `.tsx`, `.js`, `.jsx`): the extension is stripped by default and kept when `preserveScriptFileExtension` is on. This applies for script destinations (`.js`/`.ts`/`.jsx`/`.tsx`/`.mdx`) and for script sources into `.vue`/`.svelte`/`.astro`. (`.mdx` is never a *script source* — no builder strips an `.mdx` path; see the exception below.)
- **`.scss` source → `.scss` destination** (and a `.scss` source into a framework SFC `<style>` block): the `.scss` extension is stripped by default and kept when `preserveStylesheetFileExtension` is on. (A `.css` source into `.scss` always keeps `.css` — Sass needs it.)
- **`.css` source → `.css` destination** (and a `.css` source into a framework SFC `<style>` block): the `.css` extension is ALWAYS kept; the CSS builder does not consult `preserveStylesheetFileExtension`.
- **HTML, Markdown, and all other source types** (images, fonts, media, data, documents, YAML, components) always preserve the full extension.
- **LaTeX graphics** (`.pdf`/`.png`/`.jpg`/`.jpeg`/`.eps` → `.tex`): the extension is **kept** by default and dropped when `preserveGraphicsFileExtension` is off — the *inverse* default of the script/stylesheet toggles. **LaTeX `\input`/`\include`** (`.tex` → `.tex`): the `.tex` extension is always dropped (`\include` requires it omitted). **LaTeX bibliography**: `\addbibresource` keeps `.bib`, `\bibliography` drops it.

**Exception — JSX/TSX/MDX non-script sources**: when a non-script source (including `.css`, `.scss`, `.md`, `.mdx`, `.html`, images, media) is imported into a `.jsx`/`.tsx`/`.mdx` destination, the full real source extension is ALWAYS kept on the path regardless of either preserve setting — the non-script branch in `_react.ts` never reads the setting.

**SCSS partial normalization**: a leading `_` on the last path segment is stripped to match Sass's partial-resolution convention. `_variables.scss` becomes `variables` in the import path.

**SCSS `.css` preservation**: the `.css` extension is always kept on SCSS import paths regardless of the `preserveStylesheetFileExtension` setting. Sass requires it to distinguish foreign-language imports.

**Angular legacy PascalCase** (TypeScript style index 0 only): when the source path contains `.component`, `.directive`, `.pipe`, `.service`, or `.module`, the named import placeholder is pre-filled with a PascalCase identifier derived from the filename. Example: `app-root.component.ts` produces `{ AppRootComponent }`. The derived identifier is validated against `/^[A-Za-z_$][\w$]*$/`; if the basename yields an illegal identifier (e.g. one containing a space or starting with a digit), the pre-fill is skipped and an anonymous `$1` tab stop is emitted instead.

**Framework component PascalCase** (Vue/Svelte/Astro sources, default import): a `.vue`/`.svelte`/`.astro` source imported as a default binding — into `.jsx`/`.tsx`/`.mdx` or into a framework destination, including self-imports — pre-fills the binding with the conventional PascalCase component identifier derived from the source basename: `my-button.vue` → `import MyButton from './my-button.vue'`. The basename is split on `-`/`_`/`.`/whitespace and every segment is capitalized (`button.spec.vue` → `ButtonSpec`); an already-PascalCase filename is unchanged (`BaseCard.vue` → `BaseCard`). The derived identifier is validated against `/^[A-Za-z_$][\w$]*$/`; a basename that yields an illegal identifier (a leading digit such as `2fa-widget.vue`, or a non-ASCII name) falls back to the editable generic `name` placeholder. This is independent of the Angular index-0 mechanism (which drives *named* imports) and of exported-class detection; Markdown and MDX sources are not framework components and keep the generic `name`.

**Exported class detection** (TypeScript style index 0, `.ts` destinations only): when the source file contains an `export class Name` or `export abstract class Name` declaration, the class name is pre-filled into the named import placeholder. This takes priority over Angular legacy PascalCase when both would apply. Does not apply when importing into `.tsx`, `.mdx`, `.vue`, `.svelte`, or `.astro` destinations. Detection is line-anchored: only a class declared at column 0 (the very start of a line) is matched. An `export class` that is indented — including one nested inside a `namespace`/`module` block — is not detected, and index 0 then falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). A default-exported class (`export default class Foo`) is likewise not detected: only the bare `export class`/`export abstract class` forms match, so a `default` between `export` and `class` is skipped and index 0 falls through to Angular legacy auto-fill (or, failing that, an anonymous tab stop). When a file declares multiple top-level exported classes, only the first (top-most by line order) is used for the pre-fill. Commented-out declarations are ignored — both `//` line comments and `/* */` block comments (including multi-line blocks) are stripped before scanning, so a commented-out `export class` does not pre-fill the placeholder. Class detection degrades silently: if the source file cannot be read, no warning is shown and index 0 simply uses its normal fallback — Angular legacy auto-fill or an anonymous tab stop.

---

## Snippet Placeholders

After an import is inserted, the cursor lands on the first editable position. Press Tab to advance to the next.

### Pre-filled placeholders

These show default text that the user can overwrite by typing.

| Placeholder | Meaning | Appears in |
|---|---|---|
| `styles` | CSS Module binding | JSX/TSX/MDX CSS Module import (`import styles from`) |
| `name` | Generic import binding | JSX/TSX/MDX non-script import (`import name from`) |
| `url` | Media file binding | JSX/TSX/MDX media/text-track import (`import url from`) |
| `text` | Link display text | Markdown link (`[text](path)`) |
| `alt-text` | Image alt text | Markdown image (`![alt-text](path)`) |
| `Hover text` | Image title | Markdown image with title (`"Hover text"`) |
| `en` | Language code | HTML text track (`srclang="en"`) |
| `English` | Language label | HTML text track (`label="English"`) |
| `*` | Wildcard alias (overwrite to namespace) | SCSS `@use as *` (index 1) |
| `caption` | Figure caption text | LaTeX figure (`\caption{caption}`) |
| `label` | Figure label (after `fig:`) | LaTeX figure (`\label{fig:label}`) |
| `0.5` | Graphic width fraction of `\textwidth` | LaTeX sized graphic (`width=0.5\textwidth`, index 1) |

### Tab stops

All other editable positions are anonymous tab stops — the cursor lands there with no default text, and the user types from scratch. JS/TS imports place the cursor on the binding name. TS index 0 pre-fills the binding with a detected class name or Angular PascalCase identifier when available; otherwise it is an empty tab stop. HTML image indexes 1–2 and Markdown image index 2 (the HTML `<img>` embed) place tab stops on `alt`, `width`, `height`. HTML video index 2 places an anonymous tab stop on `poster`. SCSS `@use as` index 2 places an anonymous tab stop on the alias.

HTML image index 0 uses the literal word `sample` as alt text — this is static output, not an editable position.

---

## Activation

The extension activates on any of the 13 supported destination languages (`onLanguage:javascript`, `onLanguage:typescriptreact`, `onLanguage:latex`, etc.) so the drop provider is registered before the user's first drag. Because MDX and LaTeX have no guaranteed VS Code language ID, two `workspaceContains` activation events (`workspaceContains:**/*.mdx`, `workspaceContains:**/*.tex`) also fire when such a file is present in the workspace. Invoking any of the four contributed commands likewise triggers activation — each carries an implicit `onCommand` activation event — so the extension activates from a cold start even before one of the 13 languages is opened, e.g. running Set Default Import Style or Set Import Placement.

---

## Host Capabilities

The manifest declares how the extension loads across VS Code's workspace-trust, virtual, and remote hosts. Because it only reads file paths and inserts snippets — never executing workspace code and never requiring filesystem trust — it opts into every restricted context.

| Declaration | Value | Effect |
|---|---|---|
| `capabilities.untrustedWorkspaces` | `{ "supported": true }` | Loads and runs in Restricted Mode; the extension needs no workspace-trust grant. |
| `capabilities.virtualWorkspaces` | `true` | Loads in virtual workspaces (e.g. github.dev, vscode.dev). |
| `extensionKind` | `["workspace"]` | Runs on the workspace host in remote setups (Remote-SSH, WSL, Dev Containers, Codespaces), so relative paths are computed next to the files they reference rather than on the local UI host. |

The drop provider is registered with a `scheme: 'file'` selector (see Drag-and-Drop → Supported destination languages), so it activates only for on-disk, file-backed documents — independent of these host declarations.
