import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSkill, getProgressForSkill } from '$lib/server/skill';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const skill = await getSkill(event.locals.user.id);
	const progress = await getProgressForSkill(event.locals.user.id, skill);
	const user = event.locals.user;
	return { skill, progress, userName: user?.name ?? null, user };
};
