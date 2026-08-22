import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const lobbyId = url.searchParams.get('lobby');
	return {
		lobbyId,
		lobbyParam: lobbyId ? `?lobby=${lobbyId}` : ''
	};
};
