<script lang="ts">
	import becomLogoSvg from '$lib/assets/becom-logo.svg?raw';
	import { SKILLS, type SkillDefinition } from '$lib/constants/skills';
	import SkillCardIcon from './SkillCardIcon.svelte';

	let {
		skill,
		isLocked,
		isCurrent,
		isCompleted,
		progressCurrent,
		progressRequired,
		progressPercent,
		progressLabel,
		requirementCaption
	}: {
		skill: SkillDefinition;
		isLocked: boolean;
		isCurrent: boolean;
		isCompleted: boolean;
		progressCurrent: number;
		progressRequired: number;
		progressPercent: number;
		progressLabel: string;
		requirementCaption: string | null;
	} = $props();

	let flipped = $state(false);
	let animating = $state(false);

	$effect(() => {
		if (isLocked) flipped = false;
	});

	function toggleFlip(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		if (isLocked) return;
		if (animating) return;
		animating = true;
		flipped = !flipped;
		setTimeout(() => {
			animating = false;
		}, 560);
	}
</script>

<div
	class="skill-flip-card"
	class:skill-flip-card--locked={isLocked}
	style:--skill-card-bg={skill.cardBg}
>
	<div class="skill-flip-card__scene">
		<div class="skill-flip-card__inner" class:skill-flip-card__inner--flipped={flipped}>
			<!-- Front -->
			<div class="skill-flip-card__face skill-flip-card__face--front" aria-hidden={flipped}>
				{#if isLocked}
					<div class="skill-flip-card__corner skill-flip-card__corner--lock" role="img" aria-label="Locked">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
							<rect x="3" y="11" width="18" height="11" rx="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
				{:else}
					<button
						type="button"
						class="skill-flip-card__corner skill-flip-card__flip-btn"
						onclick={toggleFlip}
						aria-label="Show more about this skill"
					>
						<svg
							class="skill-flip-card__flip-icon"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M4 12H18M18 12L13 7M18 12L13 17"
								stroke="currentColor"
								stroke-width="1.8"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
				<div class="skill-flip-card__header">
					<div class="skill-flip-card__title">{skill.name}</div>
					<p class="skill-flip-card__tagline">{skill.tagline}</p>
				</div>
				<div class="skill-flip-card__icon-wrap">
					<div
						class="skill-flip-card__icon-inner"
						class:skill-flip-card__icon-inner--dim={isLocked}
					>
						<div class="skill-flip-card__icon-art">
							<SkillCardIcon skill={skill.skill} color={skill.cardIconColor} domeFill />
						</div>
					</div>
				</div>
				<div class="skill-flip-card__mid">
					{#if isLocked}
						<p class="skill-flip-card__footer-msg">
							{#if skill.skill > 1}
								Learn skill {SKILLS[skill.skill - 2].name} to continue
							{:else}
								Complete the previous step to continue
							{/if}
						</p>
					{:else if isCompleted}
						<p class="skill-flip-card__footer-msg skill-flip-card__footer-msg--learnt">Skill learnt.</p>
					{:else}
						{#if requirementCaption}
							<p class="skill-flip-card__requirement" id="skill-req-{skill.skill}">
								{requirementCaption}
							</p>
						{/if}
						<div
							class="skill-flip-card__progress"
							role="progressbar"
							aria-valuenow={progressCurrent}
							aria-valuemin={0}
							aria-valuemax={progressRequired}
							aria-label="{progressLabel + ': ' + progressCurrent + ' of ' + progressRequired}"
							aria-describedby={requirementCaption ? `skill-req-${skill.skill}` : undefined}
						>
							<div class="skill-flip-card__progress-track">
								<div
									class="skill-flip-card__progress-fill"
									style:width="{progressPercent}%"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Back (only reachable when not locked) -->
			<div class="skill-flip-card__face skill-flip-card__face--back" aria-hidden={!flipped}>
				<button
					type="button"
					class="skill-flip-card__corner skill-flip-card__corner--back skill-flip-card__flip-btn"
					onclick={toggleFlip}
					aria-label="Show front of card"
				>
					<svg
						class="skill-flip-card__flip-icon skill-flip-card__flip-icon--back"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M4 12H18M18 12L13 7M18 12L13 17"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<div class="skill-flip-card__long-wrap">
					<p class="skill-flip-card__long">{skill.longDescription}</p>
				</div>
				<div class="skill-flip-card__brand skill-flip-card__brand--back" role="img" aria-label="Becom">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- project asset -->
					{@html becomLogoSvg}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.skill-flip-card {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		cursor: default;
		-webkit-tap-highlight-color: transparent;
	}

	.skill-flip-card--locked {
		filter: grayscale(0.35) brightness(0.94);
	}

	.skill-flip-card__scene {
		width: 100%;
		height: 100%;
		min-height: 0;
		perspective: 800px;
	}

	.skill-flip-card__inner {
		width: 100%;
		height: 100%;
		min-height: 0;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.skill-flip-card__inner--flipped {
		transform: rotateY(180deg);
	}

	/* Only the visible face should receive clicks (backface is hidden visually but can still hit-test in some browsers). */
	.skill-flip-card__inner--flipped .skill-flip-card__face--front {
		pointer-events: none;
	}
	.skill-flip-card__inner:not(.skill-flip-card__inner--flipped) .skill-flip-card__face--back {
		pointer-events: none;
	}

	.skill-flip-card__face {
		position: absolute;
		inset: 0;
		border-radius: 14px;
		display: flex;
		flex-direction: column;
		padding: 18px 18px 16px;
		box-sizing: border-box;
		overflow: hidden;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		/* Translucent frosted glass (same tokens as Reflect progress pill) + per-skill tint */
		background:
			linear-gradient(
				168deg,
				color-mix(in srgb, var(--skill-card-bg) 50%, transparent) 0%,
				color-mix(in srgb, var(--skill-card-bg) 24%, transparent) 100%
			),
			var(--surface-frosted);
		backdrop-filter: var(--blur-frosted);
		-webkit-backdrop-filter: var(--blur-frosted);
		border: 1px solid var(--border-frosted);
		/* Flat surface — no lip / heavy drop shadow (avoids 3D “trading card” depth) */
		box-shadow: none;
		color: var(--color-text-on-frosted);
	}

	.skill-flip-card__face--back {
		transform: rotateY(180deg);
	}

	.skill-flip-card__header {
		flex: 0 0 auto;
		min-height: 58px;
		padding-right: 2.75rem;
		box-sizing: border-box;
	}

	.skill-flip-card__title {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 17px;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--color-text-on-frosted);
	}

	.skill-flip-card__tagline {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 11px;
		line-height: 1.3;
		color: var(--color-text-on-frosted-muted);
		margin: 4px 0 0;
	}

	.skill-flip-card__icon-wrap {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
		position: relative;
		min-height: 0;
		/* Keep dome mask compositing out of preserve-3d issues */
		transform: translateZ(0);
		transform-style: flat;
		isolation: isolate;
	}

	/*
	 * Square box; --skill-dome-mask-image crops to top ¾ circle (works with 3D flip; clip-path url() often does not).
	 */
	.skill-flip-card__icon-inner {
		position: relative;
		box-sizing: border-box;
		flex: 0 0 auto;
		/* Larger dome so card illustrations read clearly (was 168px / 46vw) */
		width: min(204px, 56vw);
		max-width: 100%;
		aspect-ratio: 1 / 1;
		height: auto;
		overflow: hidden;
		padding: 0;
		border-radius: 0;
		border: none;
		-webkit-mask-image: var(--skill-dome-mask-image);
		mask-image: var(--skill-dome-mask-image);
		-webkit-mask-size: 100% 100%;
		mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		/* Frosted “plate” inside the dome */
		background:
			linear-gradient(
				168deg,
				color-mix(in srgb, var(--skill-card-bg) 48%, transparent) 0%,
				color-mix(in srgb, var(--skill-card-bg) 22%, transparent) 100%
			),
			var(--surface-frosted);
		backdrop-filter: var(--blur-frosted);
		-webkit-backdrop-filter: var(--blur-frosted);
		filter: drop-shadow(0 0 0.5px color-mix(in srgb, var(--border-frosted) 80%, transparent));
	}

	/* Fill the square; mask reveals dome — gentle inset so slice doesn’t over-crop */
	.skill-flip-card__icon-art {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2% 4% 12% 4%;
		box-sizing: border-box;
		/* Slightly smaller art inside the dome */
		transform: scale(0.84);
		transform-origin: 50% 40%;
	}

	.skill-flip-card__icon-art :global(.skill-card-icon) {
		display: block;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
		min-width: 0;
	}

	.skill-flip-card__icon-inner--dim {
		opacity: 0.55;
	}

	.skill-flip-card__corner {
		position: absolute;
		top: 12px;
		right: 12px;
		z-index: 2;
	}

	/* Back face is rotateY(180deg); pin control to local `left` so it stays top-right on screen. */
	.skill-flip-card__flip-icon--back {
		transform: scaleX(-1);
	}

	.skill-flip-card__corner--back {
		left: 12px;
		right: auto;
	}

	.skill-flip-card__corner--lock {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		color: var(--color-text-on-frosted);
		opacity: 0.92;
		pointer-events: none;
	}

	.skill-flip-card__corner.skill-flip-card__flip-btn {
		width: 36px;
		height: 36px;
		margin: 0;
		padding: 0;
		border-radius: 10px;
	}

	.skill-flip-card__mid {
		flex: 0 0 auto;
		min-height: 52px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 6px;
	}

	.skill-flip-card__footer-msg {
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 12px;
		line-height: 1.4;
		color: var(--color-text-on-frosted-muted);
		margin: 0;
		text-align: center;
	}

	.skill-flip-card__footer-msg--learnt {
		color: var(--color-text-on-frosted);
		opacity: 0.92;
	}

	.skill-flip-card__progress {
		width: 100%;
	}

	.skill-flip-card__progress-track {
		height: 12px;
		border-radius: 999px;
		overflow: hidden;
		background: color-mix(in srgb, var(--color-text-on-frosted) 16%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-text-on-frosted) 22%, transparent);
	}

	.skill-flip-card__progress-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--color-text-on-frosted);
		opacity: 0.92;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 4px;
	}

	.skill-flip-card__requirement {
		margin: 0;
		text-align: center;
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--color-text-on-frosted-muted);
	}

	.skill-flip-card__brand {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		flex-shrink: 0;
		color: #ffffff;
	}

	.skill-flip-card__brand--back {
		margin-top: auto;
		padding-top: 0.35rem;
		width: 100%;
	}

	.skill-flip-card__brand :global(svg) {
		display: block;
		height: 22px;
		width: auto;
		max-width: min(204px, 56vw);
	}

	.skill-flip-card__flip-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--color-text-on-frosted);
		cursor: pointer;
		opacity: 0.88;
		transition: opacity 0.2s, transform 0.2s, background 0.2s;
	}

	.skill-flip-card__flip-btn:hover {
		opacity: 1;
	}

	.skill-flip-card__flip-btn:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-text-on-frosted) 55%, transparent);
		outline-offset: 2px;
	}

	.skill-flip-card__long-wrap {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2.75rem 0 16px;
		min-height: 0;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}

	.skill-flip-card__long {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 13px;
		line-height: 1.75;
		font-style: italic;
		color: var(--color-text-on-frosted);
		opacity: 0.92;
		margin: 0;
		text-align: center;
	}
</style>
