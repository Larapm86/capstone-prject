<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { stars } from '$lib/starsData';
	import {
		REGISTER_Q1,
		REGISTER_Q2,
		REGISTER_ONBOARDING_PREPARING_STEPS
	} from '$lib/constants/register-onboarding';

	type Phase = 'splash' | 'q1' | 'q2' | 'preparing';

	const PREP_RING_R = 44;
	const PREP_RING_C = 2 * Math.PI * PREP_RING_R;
	/** Fake “preparing” ring + checklist — higher = slower. */
	const PREP_DURATION_MS = 9000;
	/** Brief pause at 100% before navigating to app loading. */
	const PREP_TO_APP_DELAY_MS = 500;
	/** Splash: logo animation then auto-advance (no Continue), aligned with /loading feel. */
	const SPLASH_AUTO_ADVANCE_MS = 2800;

	let { data }: { data: { userId: string } } = $props();

	const copyrightYear = new Date().getFullYear();

	let phase = $state<Phase>('splash');
	let q1Id = $state<string | null>(null);
	let q2Id = $state<string | null>(null);

	let loadProgress = $state(0);
	let prepChecks = $state<[boolean, boolean, boolean]>([false, false, false]);

	function storageKey() {
		return `becom-register-onboarding-done:${data.userId}`;
	}

	onMount(() => {
		if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey()) === '1') {
			goto('/loading', { replaceState: true });
		}
	});

	$effect(() => {
		if (phase !== 'splash') return;
		if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(storageKey()) === '1') {
			return;
		}
		const t = setTimeout(() => {
			phase = 'q1';
		}, SPLASH_AUTO_ADVANCE_MS);
		return () => clearTimeout(t);
	});

	$effect(() => {
		if (phase !== 'preparing') return;

		loadProgress = 0;
		prepChecks = [false, false, false];

		let cancelled = false;
		let raf = 0;
		let welcomeTimeout: ReturnType<typeof setTimeout> | undefined;
		const start = performance.now();

		function frame(now: number) {
			if (cancelled) return;
			const t = Math.min(1, (now - start) / PREP_DURATION_MS);
			const eased = 1 - (1 - t) ** 2;
			const p = Math.min(100, Math.round(eased * 100));
			loadProgress = p;
			prepChecks = [p >= 34, p >= 67, p >= 100];

			if (t < 1) {
				raf = requestAnimationFrame(frame);
			} else {
				loadProgress = 100;
				prepChecks = [true, true, true];
				welcomeTimeout = setTimeout(() => {
					if (!cancelled) goToSplash();
				}, PREP_TO_APP_DELAY_MS);
			}
		}

		raf = requestAnimationFrame(frame);
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			if (welcomeTimeout !== undefined) clearTimeout(welcomeTimeout);
		};
	});

	function goToSplash() {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem(storageKey(), '1');
		}
		goto('/loading', { replaceState: true });
	}

	function continueFromQ2() {
		phase = 'preparing';
	}
</script>

<svelte:head>
	<title>Becom — Welcome</title>
</svelte:head>

<div class="welcome-shell">
	<div class="welcome-milky" aria-hidden="true"></div>
	<div class="welcome-stars" aria-hidden="true">
		{#each stars as star}
			<span
				class="welcome-star welcome-star--s{star.s}"
				style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
			></span>
		{/each}
	</div>

	{#if phase === 'splash'}
		<main
			class="welcome-main welcome-main--splash"
			role="status"
			aria-live="polite"
			aria-label="Welcome"
		>
			<div class="welcome-splash">
				<div class="welcome-splash-logo-wrap">
					<a href="/" class="welcome-splash-brand" aria-label="Go to home">
						<img src="/logo.svg" alt="" class="welcome-splash-logo" width="174" height="79" />
					</a>
				</div>
			</div>
		</main>
	{:else}
		<div class="welcome-onboard-shell">
			<nav class="auth-top-nav auth-top-nav--onboarding" aria-label="Site">
				<a href="/" class="auth-top-nav__brand" aria-label="Go to home">
					<img src="/logo.svg" alt="Becom" width="106" height="48" />
				</a>
			</nav>

			<main class="welcome-onboard-body">
				<div class="welcome-onboard-main-inner">
					{#if phase === 'preparing'}
						<div
							class="welcome-card welcome-card--flow welcome-card--preparing"
							role="status"
							aria-live="polite"
							aria-label="Preparing your experience"
						>
							<p class="welcome-preparing-title">Setting things up for you</p>
							<div class="prep-ring-wrap">
								<svg class="prep-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
									<circle
										class="prep-ring-track"
										cx="50"
										cy="50"
										r={PREP_RING_R}
										fill="none"
										stroke-width="5"
									/>
									<circle
										class="prep-ring-progress"
										cx="50"
										cy="50"
										r={PREP_RING_R}
										fill="none"
										stroke-width="5"
										stroke-linecap="round"
										stroke-dasharray={PREP_RING_C}
										stroke-dashoffset={PREP_RING_C * (1 - loadProgress / 100)}
										transform="rotate(-90 50 50)"
									/>
								</svg>
								<span class="prep-ring-pct" aria-hidden="true">{loadProgress}%</span>
								<span class="sr-only">Progress: {loadProgress} percent</span>
							</div>
							<ul class="prep-checklist">
								{#each REGISTER_ONBOARDING_PREPARING_STEPS as step, i}
									<li class="prep-check-item" class:prep-check-item--done={prepChecks[i]}>
										<span class="prep-check-icon" aria-hidden="true">
											{#if prepChecks[i]}
												<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
													<path d="M20 6L9 17l-5-5" />
												</svg>
											{:else}
												<span class="prep-check-dot"></span>
											{/if}
										</span>
										<span class="prep-check-text">{step}</span>
									</li>
								{/each}
							</ul>
						</div>
					{:else if phase === 'q1'}
						<div class="welcome-card welcome-card--flow">
							<p class="welcome-step">{REGISTER_Q1.title}</p>
							<p id="welcome-q1-heading" class="welcome-flow-question">{REGISTER_Q1.question}</p>
							<div class="welcome-options" role="group" aria-labelledby="welcome-q1-heading">
								{#each REGISTER_Q1.options as opt}
									<button
										type="button"
										class="welcome-option"
										class:selected={q1Id === opt.id}
										onclick={() => (q1Id = opt.id)}
										aria-pressed={q1Id === opt.id}
									>
										{opt.label}
									</button>
								{/each}
							</div>
							<button
								type="button"
								class="welcome-continue welcome-continue--solo cta-3d-primary cta-3d-primary--on-dark"
								disabled={q1Id === null}
								onclick={() => (phase = 'q2')}
							>
								Next
							</button>
						</div>
					{:else if phase === 'q2'}
						<div class="welcome-card welcome-card--flow">
							<p class="welcome-step">{REGISTER_Q2.title}</p>
							<p id="welcome-q2-heading" class="welcome-flow-question">{REGISTER_Q2.question}</p>
							<div class="welcome-options" role="group" aria-labelledby="welcome-q2-heading">
								{#each REGISTER_Q2.options as opt}
									<button
										type="button"
										class="welcome-option"
										class:selected={q2Id === opt.id}
										onclick={() => (q2Id = opt.id)}
										aria-pressed={q2Id === opt.id}
									>
										{opt.label}
									</button>
								{/each}
							</div>
							<button
								type="button"
								class="welcome-continue welcome-continue--solo cta-3d-primary cta-3d-primary--on-dark"
								disabled={q2Id === null}
								onclick={continueFromQ2}
							>
								Next
							</button>
						</div>
					{/if}
				</div>
			</main>

			<footer class="welcome-onboard-footer">
				<p class="welcome-onboard-tagline">
					Every craving tells a story. We use science to help you rewrite them.
				</p>
				<p class="welcome-onboard-legal">
					Copyright © {copyrightYear} Becom. All rights reserved.
				</p>
			</footer>
		</div>
	{/if}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.welcome-shell {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		overflow-x: hidden;
		background: var(--gradient-sky-app);
	}

	.welcome-milky {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: var(--gradient-milky-band);
	}

	.welcome-stars {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.welcome-star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: welcome-star-blink 3s ease-in-out infinite;
	}

	.welcome-star--s1 {
		width: 1px;
		height: 1px;
	}
	.welcome-star--s2 {
		width: 2px;
		height: 2px;
	}
	.welcome-star--s3 {
		width: 3px;
		height: 3px;
	}

	@keyframes welcome-star-blink {
		0%,
		100% {
			opacity: calc(var(--brightness, 0.9) * 0.3);
			transform: scale(1);
		}
		50% {
			opacity: var(--brightness, 0.9);
			transform: scale(1.15);
		}
	}

	/* Yazio-style flow: top logo, progress, centered column, footer */
	.welcome-onboard-shell {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		/* Match /login horizontal gutter (auth-content uses 1rem) */
		padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem env(safe-area-inset-bottom, 0px);
		box-sizing: border-box;
	}

	/* Same top bar as landing (login) page */
	.auth-top-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0 1rem;
		width: 100%;
	}

	.auth-top-nav--onboarding {
		justify-content: flex-start;
	}
	.auth-top-nav__brand {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
		border-radius: 0.5rem;
		-webkit-tap-highlight-color: transparent;
	}
	.auth-top-nav__brand:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-ring-on-dark);
		outline-offset: 2px;
	}
	.auth-top-nav__brand img {
		display: block;
		height: auto;
	}

	.welcome-onboard-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		/* Push step content lower under the top nav */
		padding: clamp(1.75rem, 9vh, 4.5rem) 0 1rem;
		min-height: 0;
	}

	.welcome-onboard-main-inner {
		width: 100%;
		max-width: min(48rem, calc(100vw - 2.5rem));
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.welcome-onboard-footer {
		margin-top: auto;
		padding-top: 1.5rem;
		padding-bottom: 0.75rem;
		text-align: center;
		max-width: min(48rem, calc(100vw - 2.5rem));
		margin-left: auto;
		margin-right: auto;
		width: 100%;
	}

	.welcome-onboard-tagline {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		line-height: 1.45;
		color: color-mix(in srgb, var(--color-text-on-frosted) 88%, transparent);
		font-family: var(--font-sans);
	}

	.welcome-onboard-legal {
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.4;
		color: color-mix(in srgb, var(--color-text-on-frosted) 55%, transparent);
		font-family: var(--font-sans);
	}

	/* Step label: ≥4.5:1 on dark sky (avoid over-muted caption) */
	.welcome-card.welcome-card--flow .welcome-step {
		margin: 0 0 0.35rem 0;
		color: rgba(255, 255, 255, 0.88);
	}

	/* Question: solid white, strong weight for readability on gradient */
	.welcome-flow-question {
		margin: 0 0 1rem 0;
		font-size: clamp(1.125rem, 2.6vw, 1.3125rem);
		font-weight: 700;
		line-height: 1.4;
		color: #ffffff;
		font-family: var(--font-sans);
	}

	.welcome-main {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		min-height: 100dvh;
		padding: calc(1.5rem + env(safe-area-inset-top, 0px)) 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
		box-sizing: border-box;
	}

	.welcome-main--splash {
		flex-direction: column;
	}

	.welcome-splash {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	/* Match /loading logo motion: ease-in, then gentle pulse */
	.welcome-splash-logo-wrap {
		transform-origin: 50% 50%;
		animation: welcome-splash-logo-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.welcome-splash-brand {
		display: inline-block;
		line-height: 0;
		text-decoration: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.welcome-splash-brand:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-text-on-frosted) 55%, transparent);
		outline-offset: 6px;
		border-radius: 0.5rem;
	}

	.welcome-splash-logo {
		display: block;
		max-width: min(200px, 70vw);
		height: auto;
		animation: welcome-splash-logo-pulse 1.8s ease-in-out 0.9s infinite;
	}

	@keyframes welcome-splash-logo-in {
		from {
			opacity: 0;
			transform: scale(0.88);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes welcome-splash-logo-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.92;
			transform: scale(1.02);
		}
	}

	.welcome-card {
		width: 100%;
		max-width: 22rem;
		padding: 1.5rem 1.25rem 1.35rem;
		border-radius: 1rem;
		background: var(--surface-frosted);
		backdrop-filter: var(--blur-frosted);
		-webkit-backdrop-filter: var(--blur-frosted);
		border: 1px solid var(--border-frosted);
		box-shadow: var(--shadow-frosted);
		color: var(--color-text-on-frosted);
	}

	/* Flow shell: no box — content sits on the sky; options/CTA keep their own surfaces */
	.welcome-card.welcome-card--flow {
		align-self: stretch;
		width: 100%;
		max-width: none;
		padding: 1.5rem 0;
		box-sizing: border-box;
		border: none;
		background: transparent;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
		border-radius: 0;
	}

	/* Preparing: same open layout as q1/q2 (transparent shell on sky) */
	.welcome-card.welcome-card--flow.welcome-card--preparing {
		max-width: none;
	}

	/* Wide enough on desktop so question + option labels stay on one line */
	@media (min-width: 768px) {
		.welcome-main {
			padding-left: 2rem;
			padding-right: 2rem;
		}

		.welcome-card:not(.welcome-card--preparing):not(.welcome-card--flow) {
			max-width: min(48rem, calc(100vw - 4rem));
			padding: 1.75rem 1.75rem 1.5rem;
		}

		.welcome-card.welcome-card--flow {
			padding: 1.75rem 0 1.5rem;
		}
	}

	/* Match onboarding question: headline on sky */
	.welcome-preparing-title {
		margin: 0 0 1.25rem 0;
		font-size: clamp(1.125rem, 2.6vw, 1.3125rem);
		font-weight: 700;
		text-align: center;
		line-height: 1.4;
		color: #ffffff;
		font-family: var(--font-sans);
	}

	.prep-ring-wrap {
		position: relative;
		width: 9.5rem;
		height: 9.5rem;
		margin: 0 auto 1.5rem;
	}

	.prep-ring-svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.prep-ring-track {
		stroke: var(--ring-on-sky-track);
	}

	.prep-ring-progress {
		stroke: var(--ring-on-sky-progress);
		transition: stroke-dashoffset 0.08s linear;
	}

	.prep-ring-pct {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		font-size: 1.35rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: #ffffff;
		font-family: var(--font-sans);
	}

	/* Same rhythm + glass rows as `.welcome-options` / `.welcome-option` */
	.prep-checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.prep-check-item {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-on-sky-border);
		background: var(--glass-on-sky-fill);
		color: var(--color-text-on-frosted);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.45;
		font-family: var(--font-sans);
		transition:
			background 0.35s ease,
			border-color 0.35s ease,
			color 0.35s ease;
	}

	.prep-check-item--done {
		background: var(--glass-on-sky-fill-active);
		color: #ffffff;
		border-color: var(--glass-on-sky-border-active);
	}

	.prep-check-icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.12rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.95);
	}

	.prep-check-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--glass-on-sky-dot-fill);
		box-shadow: 0 0 0 1px var(--glass-on-sky-dot-ring);
	}

	.prep-check-item--done .prep-check-dot {
		display: none;
	}

	@media (forced-colors: active) {
		.prep-check-item {
			border: 2px solid CanvasText;
			forced-color-adjust: none;
		}
		.prep-check-item--done {
			background: Highlight;
			color: HighlightText;
			border-color: Highlight;
		}
	}

	.welcome-step {
		margin: 0 0 0.5rem 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-on-frosted-muted);
	}

	/* Same transparent fields as /login `.form-group input` */
	.welcome-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.welcome-option {
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--glass-on-sky-border);
		background: var(--glass-on-sky-fill);
		color: var(--color-text-on-frosted);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.45;
		font-family: var(--font-sans);
		cursor: pointer;
		min-height: var(--min-touch);
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
		transition:
			background var(--duration-press) var(--ease-press),
			border-color var(--duration-press) var(--ease-press),
			color var(--duration-press) var(--ease-press);
	}

	.welcome-option:hover {
		background: var(--glass-on-sky-fill-hover);
		border-color: var(--glass-on-sky-border-hover);
	}

	/* Selected: stronger glass highlight */
	.welcome-option.selected {
		background: var(--glass-on-sky-fill-active);
		color: #ffffff;
		border-color: var(--glass-on-sky-border-active);
	}

	.welcome-option:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-ring-on-dark);
		outline-offset: 2px;
	}

	.welcome-option:focus:not(:focus-visible) {
		outline: none;
	}

	.welcome-option.selected:focus-visible {
		outline-color: #ffffff;
	}

	@media (forced-colors: active) {
		.welcome-option {
			border: 2px solid CanvasText;
			forced-color-adjust: none;
		}
		.welcome-option.selected {
			background: Highlight;
			color: HighlightText;
			border-color: Highlight;
		}
	}

	/* Layout only — 3D surface from global `.cta-3d-primary` */
	.welcome-continue {
		width: 100%;
		flex: none;
	}

	.welcome-continue--solo {
		width: 100%;
	}
</style>
