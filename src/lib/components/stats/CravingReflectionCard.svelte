<script lang="ts">
	import { enhance } from '$app/forms';
	import { SKILLS } from '$lib/constants/skills';
	import { effectiveReflectSkillStep } from '$lib/craving-display-skill';

	interface CravingRow {
		id: number;
		text: string;
		createdAt: Date | string;
		reflectSkill: number | null;
		triggers: string[] | null;
		emotion: string | null;
		familiar: string | null;
		mindSaying: string | null;
		needs: string[] | null;
		choice: string | null;
		beforeDuringAfter: string | null;
	}

	let {
		craving,
		showNew = false
	}: {
		craving: CravingRow;
		showNew?: boolean;
	} = $props();

	const step = $derived(effectiveReflectSkillStep(craving));
	const skillDef = $derived(SKILLS[Math.min(Math.max(step, 1), SKILLS.length) - 1]);

	/** Touch / no-hover: tap card to show or hide delete */
	let tapOpen = $state(false);

	function useTapToRevealDelete(): boolean {
		if (typeof window === 'undefined') return false;
		return (
			window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches
		);
	}

	function onCardClick(e: MouseEvent) {
		if (!useTapToRevealDelete()) return;
		const t = e.target as HTMLElement;
		if (t.closest('.reflect-card__delete-wrap')) return;
		tapOpen = !tapOpen;
	}
</script>

<article
	class="reflect-card"
	class:reflect-card--tap-open={tapOpen}
	style:--skill-card-bg={skillDef.cardBg}
	aria-label="Craving reflection"
	onclick={onCardClick}
>
	<div class="reflect-card__face">
		<div
			class="reflect-card__delete-wrap"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<form method="post" action="?/deleteCraving" use:enhance class="reflect-card__delete-form">
				<input type="hidden" name="id" value={craving.id} />
				<button type="submit" class="reflect-card__delete-btn" aria-label="Delete this reflection">
					Delete
				</button>
			</form>
		</div>

		<div class="reflect-card__body">
			<p class="reflect-card__text">
				{craving.text}
				{#if showNew}
					<span class="reflect-card__new">New</span>
				{/if}
			</p>
			<time class="reflect-card__date" datetime={new Date(craving.createdAt).toISOString()}>
				{new Date(craving.createdAt).toLocaleString()}
			</time>
		</div>
	</div>
</article>

<style>
	.reflect-card {
		position: relative;
		width: 100%;
		max-width: 100%;
		margin: 0;
		-webkit-tap-highlight-color: transparent;
		cursor: default;
	}

	/* Touch: indicate card is tappable for delete */
	@media (hover: none), (pointer: coarse) {
		.reflect-card {
			cursor: pointer;
		}
	}

	.reflect-card__face {
		position: relative;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		padding: 14px 16px 14px;
		box-sizing: border-box;
		overflow: hidden;
		min-height: 0;
		background:
			linear-gradient(
				165deg,
				color-mix(in srgb, var(--skill-card-bg) 22%, transparent) 0%,
				color-mix(in srgb, var(--skill-card-bg) 10%, transparent) 100%
			),
			rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(10px) saturate(1.05);
		-webkit-backdrop-filter: blur(10px) saturate(1.05);
		border: 1px solid color-mix(in srgb, var(--skill-card-bg) 28%, rgba(255, 255, 255, 0.08));
		box-shadow: none;
		color: var(--color-text-on-frosted);
	}

	/* Delete: hidden until hover (mouse) or tap-open (touch) */
	.reflect-card__delete-wrap {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 2;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.18s ease-out,
			visibility 0.18s ease-out;
	}

	/* Desktop / fine pointer: show on card hover */
	@media (hover: hover) and (pointer: fine) {
		.reflect-card:hover .reflect-card__delete-wrap {
			opacity: 1;
			visibility: visible;
		}
	}

	/* Touch or no-hover devices: show after tap on card */
	@media (hover: none), (pointer: coarse) {
		.reflect-card.reflect-card--tap-open .reflect-card__delete-wrap {
			opacity: 1;
			visibility: visible;
		}
	}

	.reflect-card__delete-form {
		margin: 0;
	}

	.reflect-card__delete-btn {
		margin: 0;
		padding: 5px 9px;
		font-size: 11px;
		font-weight: 500;
		font-family: system-ui, -apple-system, sans-serif;
		color: var(--color-text-on-frosted);
		opacity: 0.9;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 6px;
		cursor: pointer;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: opacity 0.2s, background 0.2s;
	}

	.reflect-card__delete-btn:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.14);
	}

	.reflect-card__delete-btn:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--skill-card-bg) 50%, rgba(255, 255, 255, 0.5));
		outline-offset: 2px;
	}

	.reflect-card__body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
		padding-right: 0.5rem;
	}

	@media (hover: hover) and (pointer: fine) {
		.reflect-card__body {
			padding-right: 4.5rem;
		}
	}

	.reflect-card--tap-open .reflect-card__body {
		padding-right: 4.5rem;
	}

	.reflect-card__text {
		margin: 0;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--color-text-on-frosted);
		font-weight: 400;
	}

	.reflect-card__date {
		margin: 0;
		font-size: 11px;
		font-weight: 500;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		color: var(--color-text-on-frosted-muted);
		letter-spacing: 0.02em;
		opacity: 0.9;
	}

	.reflect-card__new {
		display: inline-block;
		margin-left: 0.5rem;
		font-size: 0.65rem;
		font-weight: 600;
		font-family: system-ui, -apple-system, sans-serif;
		color: var(--color-text-on-frosted-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
</style>
