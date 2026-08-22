<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import GlobalModal from '$lib/GlobalModal.svelte';
	import ModalHost from '$lib/ModalHost.svelte';
	import { makeToast, toastState } from '$lib/toasts.svelte.js';
	import { betterConfirm } from '$lib/utils';
	import { ModalProvider } from 'svelte-supermodals';
	import { fly } from 'svelte/transition';

	let { children, data } = $props();
	let { lobbyId } = $derived(data);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
	<ModalProvider host={ModalHost}>
		<GlobalModal />

		{@render children()}
	</ModalProvider>
</svelte:boundary>

{#if lobbyId && browser}
	<div class="lobby-ui" transition:fly={{ x: 400, duration: 300 }}>
		<div style="font-weight: bold; font-size: 1.25em; margin-bottom: 0.5em;">Lobby {lobbyId}</div>
		<div style="display: flex; flex-direction: column; gap: 0.5em; align-items: start">
			<button
				onclick={() => {
					navigator.clipboard.writeText(window.location.href);
					makeToast(`Link copied to clipboard.`);
				}}
			>
				Copy link
			</button>
			<button
				onclick={async () => {
					if (await betterConfirm('Leave lobby?')) {
						await goto(page.url.pathname + location.hash, { replaceState: true });
					}
				}}
			>
				Leave
			</button>
		</div>
	</div>
{/if}

{#if toastState.message}
	<div class="toast" transition:fly={{ x: 400, duration: 300 }}>
		{toastState.message}
	</div>
{/if}

<style>
	:global {
		button {
			border: 1px solid rgb(180, 180, 180);
			background: initial;
			font: inherit;
			padding: 0.2em 0.75em;
			font-size: 0.8em;
		}
	}

	.lobby-ui {
		position: fixed;
		bottom: 10px;
		right: 10px;
		background-color: rgba(255, 255, 255, 0.9);
		padding: 10px;
		border: 1px solid #ccc;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		z-index: 1001;
	}

	.toast {
		position: fixed;
		top: 1em;
		right: 1em;
		background: #333;
		color: #fff;
		padding: 0.5em 1em;
		border-radius: 0.25em;
		z-index: 1002;
	}
</style>
