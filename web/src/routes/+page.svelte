<script lang="ts">
	import puzzlesRaw from '../../wasm/gamedesc.txt?raw';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { docs } = $derived(data);
	const puzzles = puzzlesRaw.split('\n').filter((x) => x);

	function getCollection(directory: string) {
		if (directory.startsWith('puzzles-unreleased')) {
			return 'puzzles-unreleased';
		} else if (directory.startsWith('sgtpuzzles-extended')) {
			return 'sgtpuzzles-extended';
		} else if (directory.startsWith('sgt-puzzles-aho-extensions')) {
			return 'sgt-puzzles-aho-extensions';
		} else if (directory.startsWith('unfinished')) {
			return 'unfinished';
		} else {
			return 'original';
		}
	}

	function puzzleImage(name: string, directory: string) {
		if (name === 'identifier' || name == 'supermaze') directory = 'unfinished';

		const collection = getCollection(directory);
		return collections[collection].image(name);
	}

	let groupByCollection = $state(true);

	const collections = {
		'puzzles-unreleased': {
			name: "Lennard Sprong's puzzles",
			description:
				'These games may lack some functionality like difficulty settings but are otherwise complete.',
			image: (name) =>
				`https://raw.githubusercontent.com/x-sheep/puzzles-unreleased/master/docs/img/${name}.png`
		},
		'sgtpuzzles-extended': {
			name: 'Steffen Bauer’s puzzles',
			description:
				'Steffen Bauer has many enchanced versions of the original puzzles and a few new puzzles.',
			image: (name) =>
				`https://raw.githubusercontent.com/SteffenBauer/sgtpuzzles-extended/master/screenshots/${name}.png`
		},
		'sgt-puzzles-aho-extensions': {
			name: "Anders Holst's puzzles",
			description: 'Anders Holst has created many new puzzles with a mathematical focus.',
			image: (name) =>
				`https://raw.githubusercontent.com/Anders-Holst/sgt-puzzles-aho-extensions/master/${name}.png`
		},
		unfinished: {
			name: 'Unfinished puzzles',
			description:
				'These are the games from the original collection that are considered "unfinished". These puzzles seem to be functional and playable but haven\'t been released due to lack of polish.',
			image: (name) => `img/${name}.png`
		},
		original: {
			name: 'Original puzzles',
			description:
				'The original collection of games is included here so that any modifications mentioned above can be used on the original colleciton.',
			image: (name) => `https://www.chiark.greenend.org.uk/~sgtatham/puzzles/${name}-web.png`
		}
	};
	const collectionOrder = Object.keys(collections);

	function groupBy(array: any[], keyFn: (x: any) => string) {
		const groups: Record<string, any[]> = {};
		for (const item of array) {
			const key = keyFn(item);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
		}
		return groups;
	}
</script>

<svelte:head>
	<title>Simon Tatham's Portable Puzzle Collection - Extended</title>
</svelte:head>

<h1 align="center" style="margin-bottom: 0">Simon Tatham's Portable Puzzle Collection</h1>
<!-- <h2 align="center" style="margin-block: 0">Extended</h2> -->
<b style="text-align: center; display: block; font-size: 150%">Extended</b>

<h2 style="margin-top: 0">Introduction</h2>

This page is an extension to the wonderful web version of
<a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/"
	>Simon Tatham's Portable Puzzle Collection</a
>
with a few
<details style="display: inline">
	<summary style="display: inline">
		<span style="color: blue; text-decoration: underline; cursor: pointer; ">modifications</span>.
	</summary>
	<ul>
		<li>
			Added the puzzles from community collections:
			<ul>
				<li>
					<a href="https://github.com/x-sheep/puzzles-unreleased">puzzles-unreleased</a>
					by Lennard Sprong.
				</li>
				<li>
					<a href="https://github.com/Anders-Holst/sgt-puzzles-aho-extensions"
						>sgt-puzzles-aho-extensions</a
					>
					by Anders Holst.
				</li>
				<li>
					<a href="https://github.com/SteffenBauer/sgtpuzzles-extended">sgtpuzzles-extended</a>
					by Steffen Bauer.
				</li>
			</ul>
		</li>
		<li>Added a few unfinished puzzles from the original collection.</li>
		<li>Puzzles should now fill more of the screen by default.</li>
	</ul>
</details>

<p>
	All credit goes to Simon Tatham, Lennard Sprong, Anders Holst, Steffen Bauer, and the many other
	contributors for their work. Their work is distributed under the
	<a href="https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/licence.html#licence">
		MIT License</a
	>.
</p>

<b>Settings:</b>
<div>
	<input type="checkbox" id="groupByCollection" bind:checked={groupByCollection} />
	<label for="groupByCollection">Group by collection</label>
</div>

{#snippet puzzlesSection(puzzles)}
	<div class="outer">
		{#each puzzles as line}
			{@const [name, displayName, description, objective, directory] = line.split(':')}

			<span class="puzzle">
				<table>
					<tbody>
						<tr>
							<th>{displayName}</th>
						</tr>
						<tr>
							<td>
								<a href={`js/${name}.html`}
									><img title={description} src={puzzleImage(name, directory)} /></a
								>
							</td>
						</tr>
						<tr>
							<td>
								<code>[</code>
								{#if docs.includes(`${name}.html`)}
									<a href={`doc/${name}.html#${name}`}>manual</a>
								{:else}
									<s>manual</s>
								{/if}
								<code>]</code>
							</td>
						</tr>
						<tr>
							<td> {objective} </td>
						</tr>
					</tbody>
				</table>
			</span>
		{/each}
	</div>
{/snippet}

{#if groupByCollection}
	{@const groupedPuzzles = Object.entries(
		groupBy(puzzles, (line) => getCollection(line.split(':')[4]))
	).sort(([a], [b]) => collectionOrder.indexOf(a) - collectionOrder.indexOf(b))}
	{#each groupedPuzzles as [collection, puzzles]}
		<h2>{collections[collection].name}</h2>
		<p>{collections[collection].description}</p>
		{@render puzzlesSection(puzzles)}
	{/each}
{:else}
	<h2>The puzzles</h2>
	{@render puzzlesSection(puzzles)}
{/if}

<style type="text/css">
	span.puzzle {
		display: -moz-inline-box;
		display: inline-block;
		margin-right: 10px;
		margin-bottom: 10px;
		vertical-align: top;
		width: 200px;
	}
	span.puzzle table {
		width: 200px;
		align: top;
		text-align: center;
	}
	span.puzzle table p {
		width: 200px;
	}
	span.puzzle table,
	tr,
	th,
	td {
		border: none;
	}
	img {
		margin: 0.5em;
		width: auto;
		height: 150px;
	}
	table tr:nth-child(3) {
		font-size: 70%;
	}
	p {
		max-width: 66em;
	}
	.outer {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
