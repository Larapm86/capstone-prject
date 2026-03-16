import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

const MAX_CRAVING_LENGTH = 500;

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
	logCraving: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const text = formData.get('text')?.toString()?.trim() ?? '';
		if (!text) {
			return fail(400, { message: 'Please enter what you’re craving.' });
		}
		if (text.length > MAX_CRAVING_LENGTH) {
			return fail(400, { message: `Keep it under ${MAX_CRAVING_LENGTH} characters.` });
		}
		await db.insert(craving).values({
			userId: event.locals.user.id,
			text
		});
		return redirect(302, '/cravings');
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
