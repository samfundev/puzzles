import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		}
	},
	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			// The emscripten puzzle runtime binds to the DOM once at startup
			// and can't survive HMR swapping those elements, so fall back to
			// a full page reload for the puzzle pages.
			if (filename.includes('routes/js/')) return { hmr: false };
		},
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
