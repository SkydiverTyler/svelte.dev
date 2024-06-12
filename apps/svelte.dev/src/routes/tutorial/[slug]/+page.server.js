import { get_exercise } from '$lib/server/tutorial/content.js';
import { error, redirect } from '@sveltejs/kit';
import { load_exercise } from './content.server';

export function entries() {
	return [{ slug: 'local-transitions' }];
}

export async function load({ params }) {
	const e = await load_exercise(params.slug);

	if (params.slug === 'local-transitions') {
		redirect(307, '/tutorial/global-transitions');
	}

	const exercise = await get_exercise(params.slug);

	if (!exercise) {
		error(404, 'No such tutorial found');
	}

	return {
		exercise: e
	};
}
