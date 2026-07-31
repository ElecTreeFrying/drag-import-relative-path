const esbuild = require("esbuild");
const nodePath = require("node:path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

/** Options shared by both targets; each one adds only its platform, outfile, and alias. */
const common = {
	entryPoints: [
		'src/extension.ts'
	],
	bundle: true,
	format: 'cjs',
	minify: production,
	sourcemap: !production,
	sourcesContent: false,
	external: ['vscode'],
	logLevel: 'silent',
	plugins: [
		/* add to the end of plugins array */
		esbuildProblemMatcherPlugin,
	],
};

/**
 * The web bundle (package.json "browser") runs in the web extension host's worker on
 * vscode.dev / github.dev. `platform: 'browser'` makes esbuild REJECT any Node built-in
 * at build time — that rejection is the web-cleanliness gate, and it is the reason the
 * alias below exists rather than a runtime feature check.
 *
 * `path` is the ONLY Node built-in the runtime code imports, so it is the only thing
 * aliased: in the web target the bare 'path' specifier resolves to src/path/_browser.ts,
 * a POSIX-only stand-in verified byte-identical to Node's path.posix. The node target
 * gets no alias at all, so the desktop bundle keeps Node's own `path` — including its
 * platform-correct Windows behaviour — completely untouched.
 *
 * If a future change imports another built-in (fs, os, crypto…), the web build fails
 * loudly here instead of shipping something broken. That is intended: it forces a
 * decision rather than a silent regression.
 */
const browserPathShim = nodePath.resolve(__dirname, 'src/path/_browser.ts');

async function main() {
	const contexts = await Promise.all([
		esbuild.context({
			...common,
			platform: 'node',
			outfile: 'dist/extension.js',
		}),
		esbuild.context({
			...common,
			platform: 'browser',
			outfile: 'dist/web/extension.js',
			alias: { path: browserPathShim },
		}),
	]);
	if (watch) {
		await Promise.all(contexts.map((ctx) => ctx.watch()));
	} else {
		await Promise.all(contexts.map((ctx) => ctx.rebuild()));
		await Promise.all(contexts.map((ctx) => ctx.dispose()));
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
