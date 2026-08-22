export let toastState = $state<{ message: string | null }>({
	message: null
});

export function makeToast(message: string) {
	toastState.message = message;
	setTimeout(() => {
		toastState.message = null;
	}, 3000);
}
