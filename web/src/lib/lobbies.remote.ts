import { command } from '$app/server';
import { randomLobbyId } from '$lib/lobbies';

export const getRandomLobbyId = command(() => {
	return randomLobbyId();
});
