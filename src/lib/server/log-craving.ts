import { count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { craving } from '$lib/server/db/schema';
import { isReflectSkillColumnMissingError } from '$lib/server/craving-queries';
import { evaluateAndBumpSkill, getSkill } from '$lib/server/skill';

const MAX_CRAVING_LENGTH = 500;

export interface LogCravingPayload {
	text: string;
	triggers?: string[] | null;
	emotion?: string | null;
	familiar?: string | null;
	mindSaying?: string | null;
	needs?: string[] | null;
	choice?: string | null;
	beforeDuringAfter?: string | null;
}

/**
 * Insert a craving and run progression. Returns new cravingCount and skill.
 */
export async function logCraving(userId: string, payload: LogCravingPayload): Promise<{ cravingCount: number; skill: number }> {
	const { text, triggers, emotion, familiar, mindSaying, needs, choice, beforeDuringAfter } = payload;
	if (!text || text.length > MAX_CRAVING_LENGTH) {
		throw new Error(text ? `Keep it under ${MAX_CRAVING_LENGTH} characters.` : "Please enter what you're craving.");
	}
	const reflectSkill = await getSkill(userId);
	const baseRow = {
		userId,
		text: text.trim(),
		triggers: triggers?.length ? triggers : null,
		emotion: emotion || null,
		familiar: familiar || null,
		mindSaying: mindSaying?.trim() || null,
		needs: needs?.length ? needs : null,
		choice: choice || null,
		beforeDuringAfter: beforeDuringAfter?.trim() || null
	};
	try {
		await db.insert(craving).values({ ...baseRow, reflectSkill });
	} catch (error) {
		if (!isReflectSkillColumnMissingError(error)) {
			throw error;
		}
		await db.insert(craving).values(baseRow);
	}
	const skill = await evaluateAndBumpSkill(userId);
	const rows = await db.select({ value: count(craving.id) }).from(craving).where(eq(craving.userId, userId));
	const cravingCount = Number(rows[0]?.value ?? 0);
	return { cravingCount, skill };
}

/** Parse form data into LogCravingPayload. */
export function parseLogCravingFormData(formData: FormData): LogCravingPayload {
	const text = formData.get('text')?.toString()?.trim() ?? '';
	const triggers = formData.getAll('triggers').filter((v): v is string => typeof v === 'string' && v.length > 0);
	const emotion = formData.get('emotion')?.toString()?.trim() || undefined;
	const familiar = formData.get('familiar')?.toString()?.trim() || undefined;
	const mindSaying = formData.get('mindSaying')?.toString()?.trim() || undefined;
	const needs = formData.getAll('needs').filter((v): v is string => typeof v === 'string' && v.length > 0);
	const choice = formData.get('choice')?.toString()?.trim() || undefined;
	const beforeDuringAfter = formData.get('beforeDuringAfter')?.toString()?.trim() || undefined;
	return {
		text,
		triggers: triggers.length ? triggers : undefined,
		emotion,
		familiar,
		mindSaying,
		needs: needs.length ? needs : undefined,
		choice,
		beforeDuringAfter
	};
}
