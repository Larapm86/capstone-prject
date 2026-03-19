import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';

/** Columns we can always read if the base `craving` table exists (migration 0002+). */
const cravingSelectWithoutReflectSkill = {
	id: craving.id,
	userId: craving.userId,
	text: craving.text,
	createdAt: craving.createdAt,
	triggers: craving.triggers,
	emotion: craving.emotion,
	familiar: craving.familiar,
	mindSaying: craving.mindSaying,
	needs: craving.needs,
	choice: craving.choice,
	beforeDuringAfter: craving.beforeDuringAfter
} as const;

/**
 * True when Postgres failed because `reflect_skill` is missing (migration 0004/0005 not applied).
 */
export function isReflectSkillColumnMissingError(error: unknown): boolean {
	let e: unknown = error;
	for (let depth = 0; depth < 10 && e != null; depth++) {
		const msg = e instanceof Error ? e.message : String(e);
		if (/reflect_skill/i.test(msg) && /does not exist|undefined column|42703/i.test(msg)) {
			return true;
		}
		const code =
			typeof e === 'object' && e !== null && 'code' in e
				? String((e as { code: unknown }).code)
				: '';
		if (code === '42703' && /reflect_skill/i.test(msg)) {
			return true;
		}
		e =
			e instanceof Error && e.cause != null
				? e.cause
				: typeof e === 'object' && e !== null && 'cause' in e
					? (e as { cause: unknown }).cause
					: null;
	}
	return false;
}

/**
 * Load cravings for Insights / stats. Uses full row when `reflect_skill` exists; otherwise
 * falls back so older databases don’t 500 (step is inferred in the UI).
 */
export async function loadUserCravingsNewestFirst(userId: string) {
	try {
		return await db
			.select()
			.from(craving)
			.where(eq(craving.userId, userId))
			.orderBy(desc(craving.createdAt));
	} catch (error) {
		if (!isReflectSkillColumnMissingError(error)) {
			throw error;
		}
		console.warn(
			'[becom] craving.reflect_skill column missing — run `pnpm db:migrate` or `pnpm db:push`. Loading cravings without it.'
		);
		const rows = await db
			.select(cravingSelectWithoutReflectSkill)
			.from(craving)
			.where(eq(craving.userId, userId))
			.orderBy(desc(craving.createdAt));
		return rows.map((r) => ({ ...r, reflectSkill: null as number | null }));
	}
}
