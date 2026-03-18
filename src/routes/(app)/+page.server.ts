import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { logCraving as logCravingService, parseLogCravingFormData } from '$lib/server/log-craving';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return {};
	}
	const parentData = await event.parent();
	const rows = await db
		.select({ value: count(craving.id) })
		.from(craving)
		.where(eq(craving.userId, event.locals.user.id));
	const cravingCount = Number(rows[0]?.value ?? 0);
	return { ...parentData, cravingCount };
};

export const actions: Actions = {
	logCraving: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const payload = parseLogCravingFormData(formData);
		try {
			const { cravingCount, level } = await logCravingService(event.locals.user.id, payload);
			return { success: true, cravingCount, level };
		} catch (err) {
			return fail(400, { message: err instanceof Error ? err.message : 'Invalid input.' });
		}
	}
};
