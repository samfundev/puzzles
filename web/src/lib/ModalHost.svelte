<script lang="ts">
	import type { ModalHostProps } from 'svelte-supermodals';

	let { open, modal }: ModalHostProps = $props();
</script>

{#if open && modal}
	<dialog {open} class={modal.config?.ui?.className ?? ''} popover>
		<header>
			{#if modal.title}
				<b>
					{@render modal.title()}
				</b>
			{/if}
			{#if modal.body}
				<p>
					{@render modal.body()}
				</p>
			{/if}
		</header>
		{#if modal.footer}
			<footer>
				{@render modal.footer()}
			</footer>
		{/if}
	</dialog>
{/if}

<style>
	dialog {
		z-index: 1;
		padding: 1em;
	}
</style>
