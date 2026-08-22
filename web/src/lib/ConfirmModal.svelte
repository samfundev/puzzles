<script lang="ts">
	import { useModal } from 'svelte-supermodals';
	import type { ModalViewConfig } from 'svelte-supermodals';

	let { message, callback }: { message: string; callback: (value: boolean) => void } = $props();

	const modal = useModal();
	const config: ModalViewConfig = { dismissible: true };

	export { title, body, footer, config };
</script>

{#snippet title()}
	{message}
{/snippet}

{#snippet body()}{/snippet}

{#snippet footer()}
	<button
		onclick={() => {
			callback(true);
			modal.close();
		}}
	>
		Confirm
	</button>
	<button
		onclick={() => {
			callback(false);
			modal.close();
		}}
	>
		Cancel
	</button>
{/snippet}
