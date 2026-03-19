import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Never show splash while unauthenticated; go straight to login/register screen.
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	return {};
};
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	return {};
};
