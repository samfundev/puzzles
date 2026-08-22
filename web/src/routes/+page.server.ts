import type { PageServerLoad } from './$types';
import { readdir } from 'fs/promises';

export const load: PageServerLoad = async ({ params }) => {
	const docs = await readdir(`static/doc/`);
	return {
		docs
	};
};
