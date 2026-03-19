/**
 * Skill step (1–7) to use when styling a craving in Insights.
 * Prefer stored `reflectSkill` from log time; otherwise infer from filled fields (legacy rows).
 */
export function effectiveReflectSkillStep(c: {
	reflectSkill: number | null;
	choice: string | null;
	beforeDuringAfter: string | null;
	needs: string[] | null;
	mindSaying: string | null;
	familiar: string | null;
	emotion: string | null;
	triggers: string[] | null;
}): number {
	const stored = c.reflectSkill;
	if (stored != null && stored >= 1 && stored <= 7) return stored;

	if (c.choice || c.beforeDuringAfter) return 7;
	if (c.needs && c.needs.length > 0) return 6;
	if (c.mindSaying && c.mindSaying.trim().length > 0) return 5;
	if (c.familiar) return 4;
	if (c.emotion) return 3;
	if (c.triggers && c.triggers.length > 0) return 2;
	return 1;
}
