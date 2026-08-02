<!--
Thanks for contributing! Nothing here is mandatory — delete any section that
doesn't apply. The checklist exists to catch the things CI can't.
-->

## What this changes

<!-- One or two sentences. What behaviour is different after this PR? -->

## Why

<!-- The problem being solved. Link an issue with "Closes #123" if there is one. -->

## How to verify

<!--
The steps a reviewer follows to see it working. For a behaviour change, the most
useful form is: open <file type>, do <gesture>, expect <result>.
-->

---

## Checklist

- [ ] `npm run compile` passes (check-types + lint + esbuild).
- [ ] If `package.json` display strings changed — `package.nls.json` **and all eight
      locale files** were updated together. A key missing from one locale silently
      falls back to English there, which reads as a broken translation.
- [ ] No configuration `enum` value or `default` was localized. Those are matched at
      runtime by exact string; only their *descriptions* are display text.
- [ ] Behaviour changes are reflected in `SPEC.md`, the tracked user-facing contract.
- [ ] `README.md` still describes what the extension actually does — it is the
      Marketplace and Open VSX front page, not just a GitHub file.
- [ ] Links added to `README.md` or `CHANGELOG.md` are **absolute URLs**. Both ship
      inside the VSIX, where relative paths do not resolve.
- [ ] No AI attribution anywhere in the commits or this description — no
      `Co-Authored-By: Claude`, no "Generated with", no 🤖.
- [ ] Line endings are LF (enforced by `.gitattributes`; a CRLF re-save produces an
      enormous phantom diff).
- [ ] `version` in `package.json` was **not** hand-bumped — `vsce publish` owns that.
