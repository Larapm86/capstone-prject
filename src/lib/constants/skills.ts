/** Skills per level: name and description for Me tab. */
export const SKILLS = [
	{
		level: 1,
		name: 'Acknowledgement',
		description:
			'Your craving is an impulse. This level is about learning to pause and observe it before you follow it.'
	},
	{
		level: 2,
		name: 'Awareness',
		description: 'Every craving has a before. This level is about finding what triggers yours.'
	},
	{
		level: 3,
		name: 'Literacy',
		description: 'Your craving is carrying an emotion. This level is about learning to read the message.'
	},
	{
		level: 4,
		name: 'Recognition',
		description: 'Your cravings follow patterns. This level is about understanding the story behind them.'
	},
	{
		level: 5,
		name: 'Acceptance',
		description: 'Underneath every craving is a real need. This level is about finding what yours actually is.'
	},
	{
		level: 6,
		name: 'Agency',
		description: 'You have the full picture now. This level is about deciding consciously how to act.'
	},
	{
		level: 7,
		name: 'Freedom',
		description: 'Cravings are just part of being human. This level is about living that truth.'
	}
] as const;

export const MAX_LEVEL = 7;
