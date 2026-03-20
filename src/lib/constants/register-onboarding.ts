/** Post–sign-up onboarding (before splash). */

export const REGISTER_Q1 = {
	title: 'Step 1 of 2',
	question: 'When a craving hits, what usually happens?',
	options: [
		{ id: 'eat-without-thinking', label: 'I eat it without thinking' },
		{ id: 'resist-then-give-in', label: 'I try to resist but often give in' },
		{ id: 'notice-stuck', label: "I notice it but don't know what to do with it" },
		{ id: 'depends-understand', label: "It depends — I'm trying to understand it better" }
	]
} as const;

export const REGISTER_Q2 = {
	title: 'Step 2 of 2',
	question: 'What would a healthier relationship with food feel like to you?',
	options: [
		{ id: 'free', label: 'Free — not thinking about it all the time' },
		{ id: 'calm', label: 'Calm — no guilt after eating' },
		{ id: 'in-control', label: 'In control — choosing, not reacting' },
		{ id: 'connected', label: 'Connected — understanding what my body needs' }
	]
} as const;

export const REGISTER_WELCOME_MESSAGE =
	'Welcome to your safe space. No judgement. No guilt.';

/** Shown during the fake “preparing your experience” screen after steps 1–2. */
export const REGISTER_ONBOARDING_PREPARING_STEPS = [
	'Building your safe space.',
	'Designing your support program.',
	'Implementing skills that will help you go through this journey.'
] as const;
