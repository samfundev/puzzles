#!/usr/bin/env nix-shell
/*
#! nix-shell -i bun -p bun pandoc perl emscripten cmake halibut
*/

/**
 * Build the js directory for testing WebAssembly puzzles in a browser.
 * This includes both the standard puzzles and any additional puzzles.
 */

import { $, Glob } from 'bun';
import { exists, mkdir, readdir, rm } from 'node:fs/promises';
import { join, basename, resolve, relative } from 'node:path';
import { availableParallelism } from 'node:os';

const SCRIPT_DIR = import.meta.dir;
const UNFINISHED_PUZZLES = 'group;slide;sokoban';
const MIN_FIREFOX_VERSION = 100;
const MIN_CHROME_VERSION = 100;

process.chdir(SCRIPT_DIR);

/**
 * Build WebAssembly puzzles using emscripten and cmake
 */
console.log('==> Building WebAssembly puzzles...');

// cmake/platforms/emscripten.cmake runs the KaiOS helper scripts through
// PERL_EXECUTABLE, and nothing in the tree ever sets it -- without this the
// scripts are exec'd via their /usr/bin/perl shebang, which doesn't exist here.
const perl = Bun.which('perl');
if (!perl) throw new Error('perl not found on PATH');

// Configure with emcmake
await $`emcmake cmake --fresh -DCMAKE_C_FLAGS="-g2 -Wall -Wextra" -DPERL_EXECUTABLE=${perl} -DMIN_FIREFOX_VERSION=${MIN_FIREFOX_VERSION} -DMIN_CHROME_VERSION=${MIN_CHROME_VERSION} -DPUZZLES_ENABLE_UNFINISHED=${UNFINISHED_PUZZLES} -B web/wasm`.cwd(
	'..'
);

// Build with a default to one job per core and let BUILD_JOBS lower it.
const jobs = process.env.BUILD_JOBS || String(availableParallelism());
await $`cmake --build web/wasm --parallel ${jobs}`.cwd('..');

/**
 * Copy built JS and WASM files to js directory
 */
console.log('==> Copying built files to js directory...');

await $`mkdir -p static/js
find wasm -name "*.js" -exec cp {} static/js/ \;
find wasm -name "*.wasm" -exec cp {} static/js/ \;`;

/**
 * Generate documentation using halibut
 */
console.log('==> Generating documentation...');

const docDir = 'static/doc';
const htmlDir = '../html';

// Remove existing doc directory
await rm(docDir, { recursive: true, force: true });
await mkdir(docDir, { recursive: true });

async function glob(pattern: string): Promise<string[]> {
	return (await Array.fromAsync(new Glob(pattern).scan('..'))).map((path) => resolve('..', path));
}

// Run halibut
const additionalFiles = await glob('sgt-puzzles-aho-extensions/*.but');
await $`halibut --html -Chtml-contents-filename:index.html -Chtml-index-filename:indexpage.html -Chtml-template-filename:%k.html -Chtml-template-fragment:%k ../../../puzzles.but ${additionalFiles}`.cwd(
	docDir
);

/**
 * Process markdown files from additional puzzle directories
 */
console.log('==> Building HTML and doc for additional puzzles...');

const metadata = $`cat wasm/gamedesc.txt`.lines();
for await (const line of metadata) {
	if (!line.trim()) continue;

	const [name, displayName, description, objective] = line.split(':');
	// console.log(name, displayName, description, objective);

	const markdownFile = (await glob(`**/${name}.md`))[0];
	if (markdownFile) {
		await processMarkdownFile(markdownFile, displayName!);
	}

	const directory = (await glob(`**/${name}`))[0];
}

/**
 * Extract relevant content from markdown (skip title, images, and parameter sections)
 */
function extractRelevantContent(content: string): string {
	const lines = content.split('\n');
	const result: string[] = [];
	let skipTitle = true;

	for (const line of lines) {
		// Skip first title
		if (skipTitle && line.startsWith('#')) {
			skipTitle = false;
			continue;
		}

		// Skip image lines
		if (line.match(/^!\[\]\(.*\)/)) {
			continue;
		}

		// Stop at parameters or status sections
		if (line.match(/^## .*[Pp]arameters/) || line.match(/^## Status/)) {
			break;
		}

		result.push(line);
	}

	return result.join('\n');
}

/**
 * Process a markdown file and generate HTML files
 */
async function processMarkdownFile(mdFile: string, displayName: string) {
	console.log(`Processing ${mdFile}...`);

	const puzzleName = basename(mdFile, '.md');
	const content = await Bun.file(mdFile).text();

	// Generate full documentation HTML
	const fullDocPath = join(docDir, `${puzzleName}.html`);
	await $`pandoc -f gfm -t html ${mdFile} > ${fullDocPath}`;

	// Generate HTML for jspage.pl (extract relevant content)
	const relevantContent = extractRelevantContent(content);
	const htmlContent = await $`echo ${relevantContent} | pandoc -f gfm -t html -`.text();

	// Create input file for jspage.pl
	const inputFilePath = join(htmlDir, `${puzzleName}.html`);
	await Bun.write(inputFilePath, `${displayName}\n${htmlContent}`);
}

/**
 * Generate final HTML pages using jspage.pl
 */
console.log('==> Generating JS pages...');

// await $`../../../html/jspage.pl /dev/null ../../../html/*.html`.cwd('static/js');

console.log('==> Done.');
