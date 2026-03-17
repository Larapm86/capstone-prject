import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';

const MAX_CRAVING_LENGTH = 500;

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	logCraving: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const text = formData.get('text')?.toString()?.trim() ?? '';
		const noRedirect = formData.get('noRedirect') === '1';
		if (!text) {
			return fail(400, { message: "Please enter what you're craving." });
		}
		if (text.length > MAX_CRAVING_LENGTH) {
			return fail(400, { message: `Keep it under ${MAX_CRAVING_LENGTH} characters.` });
		}
		await db.insert(craving).values({
			userId: event.locals.user.id,
			text
		});
		if (noRedirect) {
			return { success: true };
		}
		return redirect(302, '/stats');
	}
};
