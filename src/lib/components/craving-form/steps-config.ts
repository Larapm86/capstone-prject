/** Step definition per skill step. stepKey is the field name(s) used in form. */
export type StepType =
	| 'text'
	| 'triggers'
	| 'emotion'
	| 'familiar'
	| 'mindSaying'
	| 'needs'
	| 'choice'
	| 'beforeDuringAfter';

export interface StepDef {
	stepKey: StepType;
	label: string;
	optional?: boolean;
}

/** Ordered steps for each skill step (1-based). Step N has steps 0..N-1. */
export const STEPS_BY_SKILL: StepDef[][] = [
	[{ stepKey: 'text', label: 'What is your body asking for?' }],
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' }
	],
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' }
	],
	/* Skill 4: 4 steps (mindSaying introduced at step 5) */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' }
	],
	/* Skill 5: 5 steps */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' },
		{ stepKey: 'mindSaying', label: 'What is your mind saying right now?', optional: true }
	],
	/* Skill 6: 6 steps */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' },
		{ stepKey: 'mindSaying', label: 'What is your mind saying right now?', optional: true },
		{ stepKey: 'needs', label: 'What does your body actually need?' }
	],
	/* Skill 7: 7 steps */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' },
		{ stepKey: 'mindSaying', label: 'What is your mind saying right now?', optional: true },
		{ stepKey: 'needs', label: 'What does your body actually need?' },
		{ stepKey: 'choice', label: 'What do you want to do with it?' }
	]
];

export function getStepsForSkill(skill: number): StepDef[] {
	const index = Math.max(0, Math.min(skill - 1, STEPS_BY_SKILL.length - 1));
	return STEPS_BY_SKILL[index];
}

/** Supportive line shown under each step question while logging a craving. */
export const LOGGING_STEP_SUBHEADLINE: readonly string[] = [
	"Naming what you're craving is the first act of being conscious about them.",
	'Cravings always have a starting point, reflecting what it was will give you willpower.',
	'Underneath every craving is an emotion. This is where you start to read it.',
	'Patterns are not weaknesses. They are information.',
	"The craving is a messenger. Let's write the message it is telling you.",
	"You have the full picture now. The result doesn't matter, because you are finally the one in the driver's seat.",
	'This is where your craving story becomes just a signal. And the signal becomes freedom.'
];

export function getLoggingSubheadline(stepIndex: number): string | null {
	if (stepIndex < 0 || stepIndex >= LOGGING_STEP_SUBHEADLINE.length) return null;
	return LOGGING_STEP_SUBHEADLINE[stepIndex];
}
