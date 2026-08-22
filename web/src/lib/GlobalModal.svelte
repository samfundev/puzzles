<script lang="ts">
	import { globalModal } from '$lib/utils';
	import { useModal } from 'svelte-supermodals';

	const modal = useModal();
	globalModal.context = modal;
</script>
