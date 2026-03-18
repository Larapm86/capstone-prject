<script lang="ts">
	import { enhance } from '$app/forms';
	import { SKILLS } from '$lib/constants/skills';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const level = $derived(data?.level ?? 1);
	const progress = $derived(data?.progress ?? { current: 0, required: 1, label: 'sessions' });
	const progressPercent = $derived(
		progress.required > 0 ? Math.min(100, (progress.current / progress.required) * 100) : 0
	);
</script>

<svelte:head>
	<title>Becom — Me</title>
</svelte:head>

<section class="me-section" aria-labelledby="me-heading">
	<h1 id="me-heading" class="page-title me-title">Me</h1>
	<p class="me-subtitle">Your journey</p>

	<div class="map-perspective" role="list" aria-label="Skills progression map">
		{#each SKILLS as skill}
			{@const isCompleted = skill.level < level}
			{@const isCurrent = skill.level === level}
			{@const isLocked = skill.level > level}
			<article
				class="map-node"
				class:node--completed={isCompleted}
				class:node--current={isCurrent}
				class:node--locked={isLocked}
				class:node--alt={skill.level % 2 === 0}
				role="listitem"
				aria-current={isCurrent ? 'step' : undefined}
				aria-label="Level {skill.level}: {skill.name}{isLocked ? ' (locked)' : ''}{isCurrent ? '. Current level.' : ''}"
			>
				<div class="node-spacer"></div>
				<div class="island-cell">
					<div
						class="island"
						tabindex="{isLocked ? -1 : 0}"
					>
						<!-- Badge with optional progress ring around number -->
						<div class="island-badge-wrap" aria-hidden="true">
							{#if !isLocked}
								<div
									class="island-badge-ring"
									role="progressbar"
									aria-valuenow={isCurrent ? progress.current : progress.required}
									aria-valuemin={0}
									aria-valuemax={progress.required}
									aria-label="{isCurrent ? progress.label + ': ' + progress.current + ' of ' + progress.required : 'Completed'}"
									style="--progress: {isCompleted ? 100 : progressPercent}"
								></div>
							{/if}
							<div class="island-badge">
								{#if isLocked}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
										<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
										<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
									</svg>
								{:else}
									<span class="island-badge__num">{skill.level}</span>
								{/if}
							</div>
						</div>
						<!-- Isometric tile: single SVG, seamless joins (paths from reference) -->
						<div class="island__block">
							<svg
								class="island__tile"
								viewBox="0 0 170.004 160"
								fill="none"
								preserveAspectRatio="xMidYMid meet"
								aria-hidden="true"
							>
								<g>
									<!-- Top face (lighter) -->
									<path
										d="M167.983 46.6236L89.7354 1.33516C86.6521 -0.449418 82.8659 -0.444754 79.7869 1.34741L2.0082 46.6186C0.666493 47.3995 -0.00279171 48.7714 8.7518e-06 50.1421C0.0028008 51.5086 0.673645 52.8739 2.01221 53.6509L37.8067 74.4295L51.5274 82.3943L80.0337 98.9421C81.5745 99.8365 83.2915 100.284 85.0085 100.284C86.7256 100.284 88.4426 99.8365 89.9833 98.9421L132.092 74.498L167.988 53.6608C169.327 52.8833 169.998 51.5172 170 50.1502C170 50.1475 170 50.1448 170 50.1421C170 48.7716 169.327 47.4014 167.983 46.6236Z"
										fill="var(--island-top)"
									/>
									<!-- Left side + subtle shade -->
									<path
										clip-rule="evenodd"
										fill-rule="evenodd"
										d="M0.00630481 89.0568L8.7518e-06 98.7724V70.9436C0.0028008 72.3101 0.673645 73.6754 2.01221 74.4524L37.8067 95.231L51.5274 103.196L80.0337 119.744C81.5745 120.638 83.2915 121.085 85.0085 121.085V100.284C83.2915 100.284 81.5745 99.8365 80.0337 98.9421L51.5274 82.3943L37.8067 74.4295L2.01221 53.6509C0.673645 52.8739 0.0028008 51.5086 8.7518e-06 50.1421V70.9436L0.00630481 109.841V89.0568Z"
										fill="var(--island-side)"
									/>
									<path
										clip-rule="evenodd"
										fill-rule="evenodd"
										d="M0.00630481 89.0568L8.7518e-06 98.7724V70.9436C0.0028008 72.3101 0.673645 73.6754 2.01221 74.4524L37.8067 95.231L51.5274 103.196L80.0337 119.744C81.5745 120.638 83.2915 121.085 85.0085 121.085V100.284C83.2915 100.284 81.5745 99.8365 80.0337 98.9421L51.5274 82.3943L37.8067 74.4295L2.01221 53.6509C0.673645 52.8739 0.0028008 51.5086 8.7518e-06 50.1421V70.9436L0.00630481 109.841V89.0568Z"
										fill="var(--island-shade-light)"
									/>
									<!-- Right side + shade -->
									<path
										d="M89.9833 98.9421C88.4426 99.8365 86.7256 100.284 85.0085 100.284L85.0119 121.085C86.7278 121.085 88.4436 120.637 89.9833 119.744L132.092 95.2995L167.988 74.4623C169.221 73.7465 169.887 72.5318 169.987 71.2768L170 50.1502C169.998 51.5172 169.327 52.8833 167.988 53.6608L132.092 74.498L89.9833 98.9421Z"
										fill="var(--island-side)"
									/>
									<path
										d="M89.9833 98.9421C88.4426 99.8365 86.7256 100.284 85.0085 100.284L85.0119 121.085C86.7278 121.085 88.4436 120.637 89.9833 119.744L132.092 95.2995L167.988 74.4623C169.221 73.7465 169.887 72.5318 169.987 71.2768L170 50.1502C169.998 51.5172 169.327 52.8833 167.988 53.6608L132.092 74.498L89.9833 98.9421Z"
										fill="var(--island-shade-medium)"
									/>
									<!-- Front faces (darker) -->
									<path
										d="M2.0185 113.367L80.04 158.658C81.5807 159.553 83.2978 160 85.0148 160L85.0085 121.085C83.2915 121.085 81.5745 120.638 80.0337 119.744L51.5274 103.196L37.8067 95.231L2.01221 74.4524C0.673645 73.6754 0.0028008 72.3101 8.7518e-06 70.9436L0.00630481 89.0568V109.841C0.00350103 111.213 0.674347 112.587 2.0185 113.367Z"
										fill="var(--island-side-dark)"
									/>
									<path
										d="M89.9896 158.658L167.994 113.377C169.17 112.694 169.831 111.558 169.976 110.365L169.976 109.36L169.983 97.8858C169.98 98.179 169.975 98.3324 169.97 98.2909L169.975 89.5656L169.987 71.2768C169.887 72.5318 169.221 73.7465 167.988 74.4623L132.092 95.2995L89.9833 119.744C88.4436 120.637 86.7278 121.085 85.0119 121.085L85.0148 139.198V160C86.7318 160 88.4489 159.553 89.9896 158.658Z"
										fill="var(--island-side-dark)"
									/>
									<path
										d="M89.9896 158.658L167.994 113.377C169.17 112.694 169.831 111.558 169.976 110.365L169.976 109.36L169.983 97.8858C169.98 98.179 169.975 98.3324 169.97 98.2909L169.975 89.5656L169.987 71.2768C169.887 72.5318 169.221 73.7465 167.988 74.4623L132.092 95.2995L89.9833 119.744C88.4436 120.637 86.7278 121.085 85.0119 121.085L85.0148 139.198V160C86.7318 160 88.4489 159.553 89.9896 158.658Z"
										fill="var(--island-shade-medium)"
									/>
								</g>
							</svg>
							<!-- Content on top face (locked message only) -->
							<div class="island__top-content">
								{#if isLocked}
									<p class="island__locked-label">Complete previous levels to unlock</p>
								{/if}
							</div>
						</div>
					</div>
					<h2 class="island__name">{skill.name}</h2>
				</div>
				<div class="node-desc">
					<p class="island-desc">{skill.description}</p>
				</div>
			</article>
		{/each}
	</div>

	<form method="post" action="?/signOut" use:enhance class="sign-out-form">
		<button type="submit" aria-label="Sign out of your account">Sign out</button>
	</form>
</section>

<style>
	.me-section {
		padding-bottom: 3rem;
	}
	.me-title {
		font-size: 1.5rem;
		margin-bottom: 0.25rem;
	}
	.me-subtitle {
		font-size: 0.9rem;
		color: var(--text-muted);
		margin: 0 0 2rem 0;
	}

	/* Isometric container: 30–45° top-down perspective */
	.map-perspective {
		position: relative;
		list-style: none;
		margin: 0;
		padding: 0;
		perspective: 900px;
		transform-style: preserve-3d;
	}
	/* Staggered row: spacer | island | description */
	.map-node {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr minmax(200px, 260px) 1fr;
		align-items: start;
		gap: 0;
		margin-bottom: 1.75rem;
		min-height: 4rem;
	}
	.map-node:last-child {
		margin-bottom: 0;
	}
	.map-node.node--alt .node-spacer {
		grid-column: 2;
	}
	.map-node.node--alt .island-cell {
		grid-column: 1;
	}
	.map-node.node--alt .node-desc {
		grid-column: 3;
		text-align: left;
		padding-left: 0.75rem;
	}
	.node-spacer {
		grid-column: 1;
	}
	.island-cell {
		grid-column: 2;
		padding: 0 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.node-desc {
		grid-column: 3;
		padding: 0 0.5rem;
		text-align: right;
	}
	.island-desc {
		font-size: 0.8125rem;
		color: var(--text-muted);
		line-height: 1.45;
		margin: 0;
	}
	.map-node.node--alt .island-desc {
		text-align: left;
	}

	/* Island: badge + SVG isometric tile (single shape, seamless joins) */
	.island {
		position: relative;
		padding-top: 1.5rem;
		transition: transform 0.25s ease, filter 0.25s ease;
	}
	.island:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.4);
		outline-offset: 4px;
		border-radius: 8px;
	}
	.island__block {
		position: relative;
		width: 120px;
		height: 113px;
		margin: 0 auto;
		--island-top: var(--island-top);
		--island-side: var(--island-side);
		--island-side-dark: var(--island-side-dark);
		--island-shade-light: var(--island-shade-light);
		--island-shade-medium: var(--island-shade-medium);
	}
	/* Current level: Hold-to-log style blues + soft glow, less transparent */
	.map-node.node--current .island__block {
		--island-top: var(--island-current-top);
		--island-side: var(--island-current-side);
		--island-side-dark: var(--island-current-side-dark);
		filter: drop-shadow(0 0 16px rgba(180, 210, 255, 0.4))
			drop-shadow(0 0 32px rgba(160, 195, 240, 0.25));
	}
	.island__tile {
		display: block;
		width: 100%;
		height: 100%;
	}
	.island__top-content {
		position: absolute;
		left: 50%;
		top: 28%;
		transform: translate(-50%, 0);
		width: 72%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}
	/* Side faces: gradient starts with top’s bottom color for seamless join */

	/* Badge wrapper: centers badge + optional ring */
	.island-badge-wrap {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}
	/* Circular progress ring around the number (unlocked only) */
	.island-badge-ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			var(--island-progress-fill) 0deg,
			var(--island-progress-fill) calc(var(--progress, 0) * 3.6deg),
			var(--island-progress-track) calc(var(--progress, 0) * 3.6deg),
			var(--island-progress-track) 360deg
		);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
	}
	.island-badge-ring::after {
		content: '';
		position: absolute;
		inset: 4px;
		border-radius: 50%;
		background: var(--bg);
	}
	/* Badge (number or lock) sits on top of ring */
	.island-badge {
		position: relative;
		z-index: 1;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--island-badge-bg);
		color: var(--text);
		font-weight: 700;
		font-size: 1rem;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.35),
			0 0 0 3px rgba(255, 255, 255, 0.08);
	}
	.island-badge__num {
		line-height: 1;
	}
	.map-node.node--locked .island-badge {
		background: var(--island-badge-locked-bg);
		color: var(--text-muted);
	}
	/* Active level: more visible track so empty progress ring is obvious */
	.map-node.node--current .island-badge-ring {
		--island-progress-track: rgba(255, 255, 255, 0.22);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
	}

	/* Level name: outside the block, below the island */
	.island__name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		margin: 0.6rem 0 0;
		line-height: 1.3;
		text-align: center;
	}
	.island__locked-label {
		position: relative;
		font-size: 0.7rem;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
		text-align: center;
	}

	/* Completed: calmer blue (app palette) */
	.map-node.node--completed .island__block {
		--island-top: var(--island-completed-top);
		--island-side: var(--island-completed-side);
		--island-side-dark: var(--island-completed-side-dark);
	}

	/* Locked: muted blue-gray (app palette) */
	.map-node.node--locked .island__block {
		--island-top: var(--island-locked-top);
		--island-side: var(--island-locked-side);
		--island-side-dark: var(--island-locked-side-dark);
	}

	.sign-out-form {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
	.sign-out-form button {
		background: transparent;
		color: var(--text-muted);
		border: 1px solid var(--border);
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		cursor: pointer;
		min-height: var(--min-touch);
	}
	.sign-out-form button:hover {
		color: var(--text);
		border-color: rgba(255, 255, 255, 0.2);
	}
	.sign-out-form button:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.4);
		outline-offset: 2px;
		color: var(--text);
	}

	@media (max-width: 520px) {
		.map-node {
			grid-template-columns: 1fr;
			grid-template-areas: "island" "desc";
			gap: 0.6rem;
		}
		.map-node .node-spacer {
			display: none;
		}
		.map-node.node--alt .node-spacer {
			display: none;
		}
		.island-cell {
			grid-column: 1;
			grid-area: island;
			max-width: 260px;
			margin: 0 auto;
		}
		.map-node.node--alt .island-cell {
			grid-column: 1;
		}
		.node-desc {
			grid-column: 1;
			grid-area: desc;
			text-align: center;
			padding: 0 0.5rem;
		}
		.map-node.node--alt .island-desc {
			text-align: center;
		}
	}
</style>
