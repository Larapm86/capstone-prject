/** Step definition per level. stepKey is the field name(s) used in form. */
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

/** Ordered steps for each level (1-based). Level N has steps 0..N-1. */
export const STEPS_BY_LEVEL: StepDef[][] = [
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
	/* Level 4: 4 steps (mindSaying introduced at L5) */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' }
	],
	/* Level 5: 5 steps */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' },
		{ stepKey: 'mindSaying', label: 'What is your mind saying right now?', optional: true }
	],
	/* Level 6: 6 steps */
	[
		{ stepKey: 'text', label: 'What is your body asking for?' },
		{ stepKey: 'triggers', label: 'What arrived before this feeling?' },
		{ stepKey: 'emotion', label: 'What is this craving trying to tell you?' },
		{ stepKey: 'familiar', label: 'Does this feel familiar?' },
		{ stepKey: 'mindSaying', label: 'What is your mind saying right now?', optional: true },
		{ stepKey: 'needs', label: 'What does your body actually need?' }
	],
	/* Level 7: 7 steps */
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

export function getStepsForLevel(level: number): StepDef[] {
	const index = Math.max(0, Math.min(level - 1, STEPS_BY_LEVEL.length - 1));
	return STEPS_BY_LEVEL[index];
}
