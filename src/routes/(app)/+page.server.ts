import { fail, redirect } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';

const MAX_CRAVING_LENGTH = 500;

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return {};
	}
	const rows = await db
		.select({ value: count(craving.id) })
		.from(craving)
		.where(eq(craving.userId, event.locals.user.id));
	return { cravingCount: Number(rows[0]?.value ?? 0) };
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
			const rows = await db
				.select({ value: count(craving.id) })
				.from(craving)
				.where(eq(craving.userId, event.locals.user.id));
			return { success: true, cravingCount: Number(rows[0]?.value ?? 0) };
		}
		return redirect(302, '/stats');
	}
};
