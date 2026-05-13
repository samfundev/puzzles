import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export const load: PageServerLoad = async ({ params }) => {
	const file = await readFile(`../html/${params.name}.html`, 'utf-8');
	const hasDoc = existsSync(`../doc/${params.name}.html`);
	return {
		file,
		hasDoc
	};
};