import type { Lobby } from '$lib/types';

export const lobbies: Record<string, Lobby> = {};

export function randomLobbyId() {
	let lobbyId = undefined;
	while (lobbyId === undefined || lobbies[lobbyId]) {
		lobbyId = '';
		for (let i = 0; i < 4; i++) {
			lobbyId += String.fromCharCode(65 + Math.floor(Math.random() * 26));
		}
	}

	return lobbyId;
}
