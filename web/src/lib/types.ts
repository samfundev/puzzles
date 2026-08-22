export type Message = OperationMessage | JoinLobbyMessage | CursorMessage | NavigateMessage;

type OperationMessage = {
	type: 'operation';
	operation: Operation;
};

export type BasicOperation = 'restart' | 'undo' | 'redo' | 'solve';
export type Operation = BasicOperation | { desc: string } | { move: string };

type JoinLobbyMessage = {
	type: 'join_lobby';
	lobbyId: string | null;
	url: string;
};

type CursorMessage = {
	type: 'cursor';
	x: number;
	y: number;
	canvas: number | true;
};

type NavigateMessage = {
	type: 'navigate';
	url: string;
};

export type Lobby = {
	log: Operation[];
	peerColors: Record<string, string>;
	url: string;
};

export type ServerMessage =
	| (OperationMessage & { self?: true })
	| (JoinLobbyMessage & { log: Operation[] })
	| (CursorMessage & { id: string; color: string })
	| NavigateMessage
	| { type: 'leave'; id: string };

declare global {
	function play_move_string(move: string): number;
	function set_game_id(game_id: string): void;
	function moveCommitted(move: string): void;
	function UTF8ToString(descPtr: number): string;
	function getWasmImports(): { env: Record<string, Function> };
	const puzzlecanvas: HTMLCanvasElement;

	interface Window {
		onDescUpdated(desc: string): void;
		onCommand(action: number): void;
	}
}

export enum Action {
	NEW_GAME = 5,
	RESTART = 6,
	UNDO = 7,
	REDO = 8,
	SOLVE = 9
}
