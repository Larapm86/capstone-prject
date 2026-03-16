import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

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
