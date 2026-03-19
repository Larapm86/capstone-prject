import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { logCraving as logCravingService, parseLogCravingFormData } from '$lib/server/log-craving';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const parentData = await event.parent();
	return { ...parentData };
};

export const actions: Actions = {
	logCraving: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const payload = parseLogCravingFormData(formData);
		try {
			const { cravingCount, skill } = await logCravingService(event.locals.user.id, payload);
			return { success: true, cravingCount, skill };
		} catch (err) {
			return fail(400, { message: err instanceof Error ? err.message : 'Invalid input.' });
		}
	}
};
