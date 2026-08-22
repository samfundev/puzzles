<script lang="ts">
	import { useModal } from 'svelte-supermodals';
	import type { ModalViewConfig } from 'svelte-supermodals';

	let { message, callback }: { message: string; callback: (value: string) => void } = $props();

	const modal = useModal();
	const config: ModalViewConfig = { dismissible: true };

	let inputValue: string = $state('');

	export { title, body, footer, config };
</script>

{#snippet title()}
	{message}
{/snippet}

{#snippet body()}
	<input type="text" bind:value={inputValue} />
{/snippet}

{#snippet footer()}
	<button
		onclick={() => {
			callback(inputValue);
			modal.close();
		}}
	>
		Submit
	</button>
{/snippet}
