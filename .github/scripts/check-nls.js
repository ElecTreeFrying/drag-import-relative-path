#!/usr/bin/env node
/**
 * Manifest-localization gate.
 *
 * VS Code substitutes a manifest string ONLY when the whole value matches
 * /^%key%$/. A key missing from the bundle leaves the literal "%key%" rendered in
 * the UI, and a placeholder embedded in a longer string is never substituted at
 * all. Neither is caught by tsc, eslint, or `vsce package` — but both are fully
 * decidable from the files on disk, which is what this script does.
 *
 * Zero dependencies, so it runs on a bare checkout with no `npm ci`.
 *
 * Exit 0 = clean. Exit 1 = at least one error.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const LOCALES = [ 'zh-cn', 'es', 'fr', 'pt-br', 'ru', 'de', 'ja', 'tr' ];
const EXACT = /^%([\w\d.\-]+)%$/;
const ANY = /%[\w\d.\-]+%/;

/** Positions whose value VS Code matches at runtime — never display text. */
const FORBIDDEN = [
  [ /\.enum\[\]$/, 'enum VALUE is matched against settings at runtime' ],
  [ /\.default$/, 'default VALUE is matched at runtime' ],
  [ /^contributes\.commands\[\]\.command$/, 'command ID is resolved at runtime' ],
  [ /\.when$/, 'when-clause is a context expression' ],
  [ /^contributes\.menus\./, 'menu entries are runtime-resolved' ],
  [ /^contributes\.keybindings\[\]\./, 'keybindings are runtime-resolved' ],
  [ /^(name|publisher|version|main|browser|icon|license)$/, 'manifest identity field' ],
  [ /^categories\[\]$/, 'category is matched against a fixed VS Code vocabulary' ],
];

const errors = [];
const warnings = [];

const readJson = (p) => {
  const raw = fs.readFileSync(p, 'utf8');
  if (raw.charCodeAt(0) === 0xfeff) errors.push(`${path.basename(p)}: has a UTF-8 BOM`);
  return { raw, json: JSON.parse(raw.replace(/^﻿/, '')) };
};

/** Flat one-level bundles: a line scan finds keys JSON.parse would silently collapse. */
function duplicates(raw) {
  const seen = new Set(), dup = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*"((?:[^"\\]|\\.)*)"\s*:/);
    if (m) { if (seen.has(m[1])) dup.push(m[1]); seen.add(m[1]); }
  }
  return dup;
}

function walk(node, p, out) {
  if (typeof node === 'string') return void out.push([ p, node ]);
  if (Array.isArray(node)) return void node.forEach((v) => walk(v, p + '[]', out));
  if (node && typeof node === 'object') for (const k of Object.keys(node)) walk(node[k], p ? `${p}.${k}` : k, out);
}

const pkg = readJson(path.join(ROOT, 'package.json')).json;
const baseFile = path.join(ROOT, 'package.nls.json');
if (!fs.existsSync(baseFile)) { console.error('FAIL: package.nls.json is missing'); process.exit(1); }
const { raw: baseRaw, json: base } = readJson(baseFile);

// 1. every placeholder in the manifest resolves, and sits somewhere localizable
const strings = [];
walk(pkg, '', strings);
const used = new Set();
for (const [ p, v ] of strings) {
  const m = v.match(EXACT);
  if (m) {
    used.add(m[1]);
    if (!(m[1] in base)) errors.push(`unresolved %${m[1]}% at ${p} — VS Code renders the literal placeholder`);
    const bad = FORBIDDEN.find(([ re ]) => re.test(p));
    if (bad) errors.push(`%${m[1]}% sits at ${p} — ${bad[1]}`);
  } else if (ANY.test(v)) {
    errors.push(`embedded placeholder at ${p}: ${JSON.stringify(v)} — only a whole-value %key% is substituted`);
  }
}

// 2. base bundle integrity
for (const d of duplicates(baseRaw)) errors.push(`package.nls.json: duplicate key "${d}" — the earlier value is silently dead`);
for (const [ k, v ] of Object.entries(base)) {
  if (typeof v !== 'string') errors.push(`package.nls.json: "${k}" is ${typeof v}, expected string`);
  else if (!v.trim()) errors.push(`package.nls.json: "${k}" is empty — renders as a blank label`);
}
for (const k of Object.keys(base)) if (!used.has(k)) warnings.push(`orphan key "${k}" — defined but referenced nowhere in package.json`);

// 3. every locale carries exactly the base key set
const baseKeys = Object.keys(base);
const args = (s) => (String(s).match(/\{\d+\}/g) || []).sort().join(',');
for (const loc of LOCALES) {
  const f = path.join(ROOT, `package.nls.${loc}.json`);
  if (!fs.existsSync(f)) { errors.push(`package.nls.${loc}.json is missing`); continue; }
  let r;
  try { r = readJson(f); } catch (e) { errors.push(`package.nls.${loc}.json: invalid JSON — ${e.message}`); continue; }
  for (const d of duplicates(r.raw)) errors.push(`package.nls.${loc}.json: duplicate key "${d}"`);
  const missing = baseKeys.filter((k) => !(k in r.json));
  const extra = Object.keys(r.json).filter((k) => !baseKeys.includes(k));
  if (missing.length) errors.push(`package.nls.${loc}.json: missing ${missing.length} key(s) — ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ' …' : ''} (falls back to English, which reads as a broken translation)`);
  if (extra.length) errors.push(`package.nls.${loc}.json: ${extra.length} stale key(s) — ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? ' …' : ''}`);
  for (const [ k, v ] of Object.entries(r.json)) {
    if (typeof v !== 'string') errors.push(`package.nls.${loc}.json: "${k}" is ${typeof v}, expected string`);
    else if (!v.trim()) errors.push(`package.nls.${loc}.json: "${k}" is empty`);
    else if (k in base && args(base[k]) !== args(v)) errors.push(`package.nls.${loc}.json: "${k}" placeholder args differ from base (${args(base[k]) || 'none'} vs ${args(v) || 'none'})`);
  }
}

// 4. the bundles must actually ship. A .vscodeignore glob that matches them is
//    fatal: the extension would install with every string unresolved. The `*` has
//    to be inside the character class — "package.nls*.json" is the natural way to
//    write the mistake, and omitting it made this check silently unable to fire.
const ignore = path.join(ROOT, '.vscodeignore');
if (fs.existsSync(ignore)) {
  for (const line of fs.readFileSync(ignore, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('!')) continue;
    if (/(^|\/)(\*\*?|package\.nls[\w.*\-]*)\.json$/.test(t)) {
      errors.push(`.vscodeignore excludes the nls bundles via "${t}" — they must ship inside the VSIX or every string renders unresolved`);
    }
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`\nFAILED — ${errors.length} localization error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`OK — ${baseKeys.length} key(s) × ${LOCALES.length} locale(s), all placeholders resolve, no forbidden positions.`);
