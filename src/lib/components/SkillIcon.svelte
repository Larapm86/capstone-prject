<script lang="ts">
	/** Level 1–7; determines which Becom skill icon is shown. */
	interface Props {
		level: number;
		/** Visual state: current (active), completed, or locked. Affects color via CSS. */
		state?: 'current' | 'completed' | 'locked';
	}
	let { level = 1, state = 'completed' }: Props = $props();

	const index = $derived(Math.max(0, Math.min(level - 1, 6)));
</script>

<div class="skill-icon" class:current={state === 'current'} class:completed={state === 'completed'} class:locked={state === 'locked'} data-level={level} aria-hidden="true">
	{#if index === 0}
		<!-- L1 Acknowledgement: pause / observe -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<rect x="8" y="6" width="4" height="20" rx="1"/>
			<rect x="20" y="6" width="4" height="20" rx="1"/>
		</svg>
	{:else if index === 1}
		<!-- L2 Awareness: triggers / lightbulb -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M16 4a8 8 0 0 1 5.66 13.66c.4.5.34 1.2-.12 1.66L19 22h-6l-2.54-2.68c-.46-.46-.52-1.16-.12-1.66A8 8 0 0 1 16 4Z"/>
			<path d="M14 26h4"/>
			<path d="M16 22v2"/>
		</svg>
	{:else if index === 2}
		<!-- L3 Literacy: emotion / read the message / heart -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M16 27S6 20 6 12a6 6 0 0 1 10-4.5A6 6 0 0 1 26 12c0 8-10 15-10 15Z"/>
		</svg>
	{:else if index === 3}
		<!-- L4 Recognition: patterns / overlapping circles -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="16" r="8"/>
			<circle cx="20" cy="16" r="8"/>
		</svg>
	{:else if index === 4}
		<!-- L5 Acceptance: real need / leaf -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M16 4C10 10 6 16 6 22c0 3 2 4 4 4s4-1 4-4c0-6 4-12 10-18 0-2-1-4-4-4s-4 2-4 4Z"/>
		</svg>
	{:else if index === 5}
		<!-- L6 Agency: decide / compass or direction -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="16" cy="16" r="10"/>
			<path d="M16 6v6l4 4"/>
			<path d="M16 26v-6l-4-4"/>
			<path d="M26 16h-6l-4 4"/>
			<path d="M6 16h6l4-4"/>
		</svg>
	{:else}
		<!-- L7 Freedom: bird in flight -->
		<svg class="skill-icon__svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M6 18c4-3 8-5 12-5s8 2 12 5"/>
			<path d="M6 14c4-3 8-5 12-5s8 2 12 5"/>
			<path d="M16 6v20M13 10l3-4 3 4"/>
		</svg>
	{/if}
</div>

<style>
	.skill-icon {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--island-side-dark);
		transition: color 0.2s ease, filter 0.2s ease;
	}
	.skill-icon__svg {
		width: 56px;
		height: 56px;
		display: block;
	}
	.skill-icon.current {
		color: var(--island-current-side-dark);
		filter: drop-shadow(0 0 12px rgba(180, 210, 255, 0.35));
	}
	.skill-icon.completed {
		color: var(--island-completed-side-dark);
	}
	.skill-icon.locked {
		color: var(--island-locked-side-dark);
		opacity: 0.85;
	}
</style>
