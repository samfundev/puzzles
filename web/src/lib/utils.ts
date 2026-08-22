import { type ModalContext } from 'svelte-supermodals';
import InputModal from '$lib/InputModal.svelte';
import ConfirmModal from '$lib/ConfirmModal.svelte';

export function betterPrompt(message: string): Promise<string | null> {
	return new Promise((resolve) => {
		globalModal.context.open(InputModal, {
			props: { message, callback: (value: string) => resolve(value) }
		});
	});
}

export function betterConfirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		globalModal.context.open(ConfirmModal, {
			props: { message, callback: (value: boolean) => resolve(value) }
		});
	});
}

export const globalModal = { context: null as unknown as ModalContext };
