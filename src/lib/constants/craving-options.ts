/** Chip options for "What arrived before this feeling?" (L2). Multi-select. */
export const CRAVING_TRIGGERS = [
	'stress',
	'boredom',
	'habit',
	'emotion',
	'social',
	'tired',
	'hunger',
	'other'
] as const;

/** 3×3 grid options for "What is this craving trying to tell you?" (L3). Single select. */
export const CRAVING_EMOTIONS = [
	'sad',
	'anxious',
	'angry',
	'lonely',
	'bored',
	'tired',
	'stressed',
	'empty',
	'overwhelmed'
] as const;

/** Chip options for "What does your body actually need?" (L5). Multi-select; needs, not foods. */
export const CRAVING_NEEDS = [
	'rest',
	'connection',
	'comfort',
	'movement',
	'calm',
	'safety',
	'fun',
	'clarity'
] as const;

/** Suggestion tiles for "What is your mind saying right now?" (L4). Optional + free text. */
export const MIND_SAYING_SUGGESTIONS = [
	"I deserve this",
	"I'll just have a little",
	"I've already messed up",
	"I need to feel something",
	"Nothing else works",
	"Tomorrow I'll do better"
] as const;

export type TriggerOption = (typeof CRAVING_TRIGGERS)[number];
export type EmotionOption = (typeof CRAVING_EMOTIONS)[number];
export type NeedOption = (typeof CRAVING_NEEDS)[number];
