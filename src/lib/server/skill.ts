import { and, count, eq, gte, isNotNull, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { craving, userProfile } from '$lib/server/db/schema';
import { MAX_SKILL } from '$lib/constants/skills';

const SKILL_RULES = {
	1: { required: 7, type: 'sessions' as const },
	2: { required: 3, type: 'distinct_triggers' as const },
	3: { required: 10, type: 'emotion_named' as const },
	4: { required: 5, type: 'familiar_yes' as const },
	5: { required: 5, type: 'fully_completed' as const },
	6: { required: 10, type: 'conscious_choice' as const },
	7: { required: 20, type: 'days_conscious_30' as const } // 20 of 30 days; for display only
} as const;

/** Get user skill step (1–7). Ensures profile exists (skill 1) for new users. */
export async function getSkill(userId: string): Promise<number> {
	await ensureUserProfile(userId);
	const rows = await db.select({ skill: userProfile.skill }).from(userProfile).where(eq(userProfile.userId, userId));
	return rows[0]?.skill ?? 1;
}

/** Ensure user has a profile row (skill 1). Idempotent. */
export async function ensureUserProfile(userId: string): Promise<void> {
	await db.insert(userProfile).values({ userId, skill: 1 }).onConflictDoNothing({ target: userProfile.userId });
}

/** Get progress toward the next skill for the given skill step. */
export async function getProgressForSkill(
	userId: string,
	skill: number
): Promise<{ current: number; required: number; label: string }> {
	if (skill >= MAX_SKILL) {
		// Skill 7: show 20/30 days
		const days = await countConsciousDaysInLast30(userId);
		return { current: days, required: 20, label: 'days with conscious response (last 30)' };
	}

	const rule = SKILL_RULES[skill as keyof typeof SKILL_RULES];
	if (!rule) return { current: 0, required: 1, label: 'sessions' };

	switch (rule.type) {
		case 'sessions': {
			const rows = await db.select({ value: count(craving.id) }).from(craving).where(eq(craving.userId, userId));
			return { current: Number(rows[0]?.value ?? 0), required: rule.required, label: 'sessions completed' };
		}
		case 'distinct_triggers': {
			const rows = await db.select({ triggers: craving.triggers }).from(craving).where(eq(craving.userId, userId));
			const all = rows.flatMap((r) => r.triggers ?? []);
			const distinct = new Set(all).size;
			return { current: distinct, required: rule.required, label: 'distinct triggers identified' };
		}
		case 'emotion_named': {
			const rows = await db
				.select({ value: count(craving.id) })
				.from(craving)
				.where(and(eq(craving.userId, userId), isNotNull(craving.emotion)));
			return {
				current: Number(rows[0]?.value ?? 0),
				required: rule.required,
				label: 'sessions with emotion named'
			};
		}
		case 'familiar_yes': {
			const rows = await db
				.select({ value: count(craving.id) })
				.from(craving)
				.where(and(eq(craving.userId, userId), eq(craving.familiar, 'yes')));
			return { current: Number(rows[0]?.value ?? 0), required: rule.required, label: 'times marked as familiar' };
		}
		case 'fully_completed': {
			const countRows = await db
				.select({ value: count(craving.id) })
				.from(craving)
				.where(
					and(
						eq(craving.userId, userId),
						isNotNull(craving.triggers),
						isNotNull(craving.emotion),
						isNotNull(craving.familiar),
						isNotNull(craving.needs)
					)
				);
			return {
				current: Number(countRows[0]?.value ?? 0),
				required: rule.required,
				label: 'fully completed sessions'
			};
		}
		case 'conscious_choice': {
			const rows = await db
				.select({ value: count(craving.id) })
				.from(craving)
				.where(and(eq(craving.userId, userId), isNotNull(craving.choice)));
			return {
				current: Number(rows[0]?.value ?? 0),
				required: rule.required,
				label: 'conscious choices made'
			};
		}
		default:
			return { current: 0, required: 1, label: 'sessions' };
	}
}

/** Count distinct days in last 30 where user had at least one craving with choice or beforeDuringAfter set. */
async function countConsciousDaysInLast30(userId: string): Promise<number> {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const rows = await db
		.select({ createdAt: craving.createdAt })
		.from(craving)
		.where(
			and(
				eq(craving.userId, userId),
				gte(craving.createdAt, thirtyDaysAgo),
				or(isNotNull(craving.choice), isNotNull(craving.beforeDuringAfter))
			)
		);
	const days = new Set(rows.map((r) => new Date(r.createdAt).toDateString()));
	return days.size;
}

/** If the user has satisfied the rule for the next skill, bump skill. Call after inserting a craving. */
export async function evaluateAndBumpSkill(userId: string): Promise<number> {
	await ensureUserProfile(userId);
	const current = await getSkill(userId);
	if (current >= MAX_SKILL) return current;

	const { current: progress, required } = await getProgressForSkill(userId, current);
	if (progress < required) return current;

	const nextSkill = current + 1;
	await db.update(userProfile).set({ skill: nextSkill, updatedAt: new Date() }).where(eq(userProfile.userId, userId));
	return nextSkill;
}
