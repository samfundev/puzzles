import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type ViteDevServer } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'vite-plugin-websocket',
			apply: 'serve',
			configureServer(server: ViteDevServer) {
				server.ssrLoadModule('src/lib/ws.ts').then(({ ws }) => {
					if (!server.httpServer) throw new Error('httpServer not available');

					server.httpServer.on('upgrade', (req, socket, head) => {
						if (
							req.headers.upgrade === 'websocket' &&
							req.headers['sec-websocket-protocol'] !== 'vite-hmr'
						) {
							ws.handleUpgrade(req, socket, head);
						}
					});
				});
			}
		}
	]
});
