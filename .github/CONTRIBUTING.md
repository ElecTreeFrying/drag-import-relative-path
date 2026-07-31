# Contributing

Thanks for wanting to help. Bug reports, feature requests, and pull requests are all
welcome.

## Before you start

- **Open an issue first** for anything beyond a small fix. A new import style or a new
  file extension has design consequences, and it is much less painful to agree on the
  shape before the code exists than after.
- Read [`SPEC.md`](../SPEC.md). It is the user-facing behavior contract: every
  supported extension pair, every import style, every notification. If your change
  alters behavior, **it lands there too** — a PR that changes behavior without
  updating the spec is incomplete.

## Setup

```bash
npm install
```

Press <kbd>F5</kbd> in VS Code to launch an Extension Development Host with the
extension loaded. The default build task (`npm: watch`) runs first.

## The commands that matter

```bash
npm run compile        # check-types + lint + esbuild → dist/  ← this is "green"
npm run watch          # incremental dev build
npm run check-types    # tsc --noEmit, no bundling
npm run lint           # eslint src
npm run package        # production bundle; what vscode:prepublish runs
```

**This repository carries no test suite**, so `npm run compile` is the whole automated
gate — it has to pass, and it is the same check CI runs. That puts more weight than
usual on manual verification: exercise your change in the Extension Development Host
(<kbd>F5</kbd>) across a few real destination languages before opening the PR, and say
in the PR description what you actually tried.

## Before you open a PR

1. `npm run compile` passes.
2. You have exercised the change by hand in the Extension Development Host.
3. `SPEC.md` reflects any behavior change.
4. Your commits do not bump `version` in `package.json` — releases own that.

## Code style

- **LF line endings**, enforced by `.gitattributes`. A CRLF re-save produces an
  enormous phantom diff, which is the entire reason the rule exists.
- **Padded single-line arrays**: `[ 'text/uri-list' ]`, not `['text/uri-list']`.
- **Noun-only kebab-case filenames**: `relative-path.ts`, not `relative-path.util.ts`.
  The parent directory carries the kind signal.
- Modules prefixed with `_` are internal to their subtree — importing them from
  outside it is a smell.

## The part that catches people out

Several contracts in this codebase span multiple files and **break silently** when
only one site is updated. The most common one: adding support for a new file
extension is not a one-line change. It touches `types/file-extension.ts`,
`constants/extensions.ts`, `snippets/dispatch.ts`, and `snippets/variants.ts` — and
missing one of them produces an extension that is half-supported in a way no compiler
error will tell you about. With no test suite to catch it, please walk those four
files deliberately.

## Reporting bugs

Use the issue templates. [`SUPPORT.md`](../SUPPORT.md) has a symptom → cause → fix
table that may resolve the problem before you file.

For **security** problems, do not open an issue — see [`SECURITY.md`](SECURITY.md).
