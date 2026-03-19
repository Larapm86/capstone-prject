/** Skills per step (1–7): name, copy, and flip-card visuals (Me / Skills). */
export const SKILLS = [
	{
		skill: 1,
		name: 'Acknowledgement',
		description:
			'Your craving is an impulse. This skill is about learning to pause and observe it before you follow a craving. The simple act of noticing — without judging — is where everything begins.',
		tagline: 'Pause before you follow',
		longDescription:
			'Your craving is an impulse. This skill is about learning to pause and observe it before you follow a craving. The simple act of noticing — without judging — is where everything begins.',
		cardBg: '#1A7BE8',
		cardIconColor: '#F03820'
	},
	{
		skill: 2,
		name: 'Awareness',
		description:
			'Every craving has a before. This skill is about finding what triggers yours. When you start to see the pattern of what arrives before the craving, you begin to understand yourself in a new way.',
		tagline: 'See what comes before',
		longDescription:
			'Every craving has a before. This skill is about finding what triggers yours. When you start to see the pattern of what arrives before the craving, you begin to understand yourself in a new way.',
		cardBg: '#B0B8B0',
		cardIconColor: '#1A1A1A'
	},
	{
		skill: 3,
		name: 'Literacy',
		description:
			'Your craving is carrying an emotion. This skill is about learning to read the message. Cravings are not failures — they are your body trying to communicate something it doesn\'t have the words for yet.',
		tagline: 'Read the message',
		longDescription:
			'Your craving is carrying an emotion. This skill is about learning to read the message. Cravings are not failures — they are your body trying to communicate something it doesn\'t have the words for yet.',
		cardBg: '#E84820',
		cardIconColor: '#8B00CC'
	},
	{
		skill: 4,
		name: 'Recognition',
		description:
			'Your cravings follow patterns. This skill is about understanding the story behind them. You are not broken — you have been using a habit that no longer serves you. That is different. And that is changeable.',
		tagline: 'Understand the pattern',
		longDescription:
			'Your cravings follow patterns. This skill is about understanding the story behind them. You are not broken — you have been using a habit that no longer serves you. That is different. And that is changeable.',
		cardBg: '#229944',
		cardIconColor: '#F8E020'
	},
	{
		skill: 5,
		name: 'Acceptance',
		description:
			'Underneath every craving is a real need. This skill is about finding what yours actually is. Knowing what you need is not weakness — it is the whole point. The craving was never the enemy.',
		tagline: 'Receive without fighting',
		longDescription:
			'Underneath every craving is a real need. This skill is about finding what yours actually is. Knowing what you need is not weakness — it is the whole point. The craving was never the enemy.',
		cardBg: '#E868A8',
		cardIconColor: '#18A8C8'
	},
	{
		skill: 6,
		name: 'Agency',
		description:
			'You have the full picture now. This skill is about deciding consciously how to act. You are no longer reacting — you are choosing. That shift is everything. The craving is information, not a verdict.',
		tagline: 'Decide, don\'t react',
		longDescription:
			'You have the full picture now. This skill is about deciding consciously how to act. You are no longer reacting — you are choosing. That shift is everything. The craving is information, not a verdict.',
		cardBg: '#162030',
		cardIconColor: '#C8F020'
	},
	{
		skill: 7,
		name: 'Freedom',
		description:
			'Cravings are just part of being human. This skill is about living that truth. Food is your fuel, not your therapist. You know the difference now. And that knowing changes everything quietly, permanently.',
		tagline: 'Just part of being human',
		longDescription:
			'Cravings are just part of being human. This skill is about living that truth. Food is your fuel, not your therapist. You know the difference now. And that knowing changes everything quietly, permanently.',
		cardBg: '#F89820',
		cardIconColor: '#162030'
	}
] as const;

export type SkillDefinition = (typeof SKILLS)[number];

export const MAX_SKILL = 7;

/**
 * What the user must achieve while a skill is **active** (to advance or, at step 7, to stay on track).
 * Copy matches product spec: Sn → S(n+1) requirements; S7 is ongoing.
 */
export const SKILL_ADVANCE_REQUIREMENT: Record<number, string> = {
	1: 'Reflect on 7 cravings',
	2: '3 different triggers',
	3: '10 sessions with a feeling named',
	4: '5 times you recognised a pattern',
	5: '5 sessions fully completed',
	6: '10 conscious choices made',
	7: '20 days out of 30 with a conscious response'
};
