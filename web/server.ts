import { Server } from 'node:http';
import { handler } from './build/handler.js';
import { ws } from '$lib/ws';

const server = new Server((req, res) => {
	handler(req, res, () => {});
});

server.on('upgrade', (req, socket, head) => {
	if (req.headers.upgrade === 'websocket') {
		ws.handleUpgrade(req, socket, head);
	}
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
