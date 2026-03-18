import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';

/** Most frequent value in array; returns null if empty. */
function mode(values: (string | null | undefined)[]): string | null {
	const filtered = values.filter((v): v is string => typeof v === 'string' && v.length > 0);
	if (filtered.length === 0) return null;
	const counts: Record<string, number> = {};
	for (const v of filtered) counts[v] = (counts[v] ?? 0) + 1;
	let maxCount = 0;
	let maxKey: string | null = null;
	for (const [k, c] of Object.entries(counts)) {
		if (c > maxCount) {
			maxCount = c;
			maxKey = k;
		}
	}
	return maxKey;
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const cravings = await db.query.craving.findMany({
		where: eq(craving.userId, event.locals.user.id),
		orderBy: desc(craving.createdAt)
	});

	const triggersFlat = cravings.flatMap((c) => c.triggers ?? []);
	const emotionsFlat = cravings.map((c) => c.emotion).filter(Boolean);
	const needsFlat = cravings.flatMap((c) => c.needs ?? []);

	const topTriggerRaw = mode(triggersFlat);
	const topEmotionRaw = mode(emotionsFlat);
	const mostCommonNeedRaw = mode(needsFlat);

	const sessionsCount = cravings.length;
	const topTrigger = topTriggerRaw ? capitalize(topTriggerRaw) : null;
	const topEmotion = topEmotionRaw ? capitalize(topEmotionRaw) : null;
	const mostCommonNeed = mostCommonNeedRaw ? capitalize(mostCommonNeedRaw) : null;

	const recentSessions = cravings.slice(0, 10).map((c) => ({
		trigger: c.triggers?.[0] ? capitalize(c.triggers[0]) : null,
		emotion: c.emotion ? capitalize(c.emotion) : null
	}));

	return {
		cravings,
		insights: {
			sessionsCount,
			topTrigger,
			topEmotion,
			mostCommonNeed
		},
		recentSessions
	};
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
