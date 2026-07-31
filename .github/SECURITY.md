# Security Policy

## Supported versions

Only the **latest published version** of Drag And Drop Import Relative Path receives
security fixes. Older versions are never patched in place — a fix ships as a new
release to both registries:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ElecTreeFrying.drag-import-relative-path)
- [Open VSX](https://open-vsx.org/extension/ElecTreeFrying/drag-import-relative-path)

If you are reporting against an older version, please confirm the problem still
reproduces on the latest one first.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.** A public report tells
everyone about the weakness before there is a fix available.

Email **electreefrying.git@gmail.com** with:

- what the problem is, and roughly how severe you think it is
- the extension version, your VS Code (or Cursor / VSCodium / Windsurf) version, and your OS
- steps to reproduce, or a proof of concept
- whether you would like to be credited in the release notes, and under what name

You can expect an acknowledgement as soon as I can manage it — usually within a week.
If the report is confirmed, I will let you know the fix timeline and tell you when the
patched version is live on both registries. If I conclude it is not a vulnerability,
I will explain why rather than going quiet.

This is a solo-maintained project, so please be patient with response times. There is
no bug bounty.

## Scope

This extension runs entirely on your machine. It has **no runtime dependencies**,
makes **no network requests**, and collects **no telemetry** — every import path is
computed locally from the two file paths involved. That rules out most of the
categories people expect to find.

**In scope:**

- Code injection through a crafted file path or file name (the paths flow into
  generated snippets and into VS Code's snippet expansion)
- Anything that causes the extension to read or write outside the open workspace
- A crafted workspace or settings value that leads to unintended code execution
- Dependency vulnerabilities that actually reach the shipped bundle

**Out of scope:**

- Vulnerabilities in VS Code itself — report those to
  [Microsoft](https://github.com/microsoft/vscode/security/policy)
- Generated imports that are merely *wrong* rather than dangerous — those are
  ordinary bugs, please open a normal issue
- Anything requiring an attacker to already have local code execution on the machine

## Disclosure

Please give me a reasonable window to ship a fix before disclosing publicly. Once the
patched version is live on both registries, you are welcome to write about it — and
I will credit you in the release notes if you would like.
