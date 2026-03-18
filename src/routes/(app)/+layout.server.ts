import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getLevel } from '$lib/server/level';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const level = await getLevel(event.locals.user.id);
	return { level };
};
