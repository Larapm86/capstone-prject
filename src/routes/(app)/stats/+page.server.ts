import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const cravings = await db.query.craving.findMany({
		where: eq(craving.userId, event.locals.user.id),
		orderBy: desc(craving.createdAt)
	});
	return { cravings };
};

export const actions: Actions = {
	deleteCraving: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const id = formData.get('id');
		const parsed = typeof id === 'string' ? parseInt(id, 10) : NaN;
		if (Number.isNaN(parsed) || parsed < 1) {
			return fail(400, { message: 'Invalid craving.' });
		}
		await db
			.delete(craving)
			.where(and(eq(craving.id, parsed), eq(craving.userId, event.locals.user.id)));
		return { success: true };
	}
};
