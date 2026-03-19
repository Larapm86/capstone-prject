import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Auth gate for the splash route. Must export `load` exactly once (duplicate
 * `export const load` breaks Netlify/esbuild: "Multiple exports with the same name 'load'").
 */
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	return {};
};
