import type { Message } from '$lib/types';
import { type Peer, defineHooks } from 'crossws';
import type { ServerMessage } from '$lib/types';
import { lobbies, randomLobbyId } from '$lib/lobbies';
import crossws from 'crossws/adapters/node';

const hooks = defineHooks({
	async message(peer, message) {
		const data = message.json() as Message;
		let lobbyId = peer.topics.values().next().value!;
		if (data.type === 'operation') {
			const lobby = lobbies[lobbyId];
			if (!lobby) return;
			console.log('Received operation:', data.operation);
			lobby.log.push(data.operation);

			broadcast(peer, data);
		} else if (data.type === 'join_lobby') {
			lobbyId = data.lobbyId ?? randomLobbyId();
			if (!lobbies[lobbyId]) {
				const desc = data.url.substring(data.url.lastIndexOf('#') + 1);
				lobbies[lobbyId] = { log: [{desc}], peerColors: {}, url: data.url };
			}

			const { log, url } = lobbies[lobbyId];
			peer.subscribe(lobbyId);
			peer.send({ type: 'join_lobby', lobbyId, log, url });
		} else if (data.type === 'cursor') {
			const lobby = lobbies[lobbyId];
			if (!lobby) return;
			if (!lobby.peerColors[peer.id]) {
				const used = new Set(Object.values(lobby.peerColors));
				const available = colors.filter((color) => !used.has(color));
				lobby.peerColors[peer.id] =
					available.length > 0 ? available[0] : colors[Math.floor(Math.random() * colors.length)];
			}

			const color = lobby.peerColors[peer.id];
			broadcast(peer, { ...data, id: peer.id, color }, true);
		} else if (data.type === 'navigate') {
			// If the URL doesn't start with a slash, ignore it (to prevent a malicious client trying to navigate others to external sites)
			if (!data.url.startsWith('/')) {
				return;
			}

			console.log('Received navigate:', data.url);
			const lobby = lobbies[lobbyId];
			lobby.log = [];
			lobby.url = data.url;

			broadcast(peer, data);
		}
	},

	close(peer, details) {
		const lobbyId = peer.topics.values().next().value;
		if (lobbyId) {
			const lobby = lobbies[lobbyId];
			if (!lobby) return;

			delete lobby.peerColors[peer.id];

			broadcast(peer, { type: 'leave', id: peer.id });
		}
	}
});

function broadcast(peer: Peer, message: ServerMessage, excludeSelf = false) {
	const topic = peer.topics.values().next().value;
	if (topic) {
		for (const p of peer.peers) {
			if (p.topics.has(topic)) {
				if (p.id !== peer.id) {
					p.send(message);
				} else if (!excludeSelf) {
					p.send({ ...message, self: true });
				}
			}
		}
	}
}

export const ws = crossws({
	hooks
});

const colors = [
	// https://sashamaps.net/docs/resources/20-colors/
	'#e6194B',
	'#3cb44b',
	'#ffe119',
	'#4363d8',
	'#f58231',
	'#911eb4',
	'#42d4f4',
	'#f032e6',
	'#bfef45',
	'#fabed4',
	'#469990',
	'#dcbeff',
	'#9A6324',
	'#fffac8',
	'#800000',
	'#aaffc3',
	'#808000',
	'#ffd8b1',
	'#000075',
	'#a9a9a9'
];
