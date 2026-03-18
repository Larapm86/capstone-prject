import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getLevel, getProgressForLevel } from '$lib/server/level';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const level = await getLevel(event.locals.user.id);
	const progress = await getProgressForLevel(event.locals.user.id, level);
	const user = event.locals.user;
	return { level, progress, userName: user?.name ?? null, user };
};
