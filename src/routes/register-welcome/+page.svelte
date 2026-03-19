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
					<img src="/logo.svg" alt="Becom" class="welcome-splash-logo" width="174" height="79" />
				</div>
			</div>
		</main>
	{:else if phase === 'preparing'}
		<main class="welcome-main">
			<div
				class="welcome-card welcome-card--preparing"
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
		</main>
	{:else}
		<main class="welcome-main">
			<div class="welcome-card">
				{#if phase === 'q1'}
					<p class="welcome-step">{REGISTER_Q1.title}</p>
					<h1 class="welcome-question">{REGISTER_Q1.question}</h1>
					<div class="welcome-options" role="group" aria-labelledby="welcome-q1-heading">
						<span id="welcome-q1-heading" class="sr-only">{REGISTER_Q1.question}</span>
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
						class="welcome-continue welcome-continue--solo"
						disabled={q1Id === null}
						onclick={() => (phase = 'q2')}
					>
						Continue
					</button>
				{:else if phase === 'q2'}
					<p class="welcome-step">{REGISTER_Q2.title}</p>
					<h1 class="welcome-question">{REGISTER_Q2.question}</h1>
					<div class="welcome-options" role="group" aria-labelledby="welcome-q2-heading">
						<span id="welcome-q2-heading" class="sr-only">{REGISTER_Q2.question}</span>
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
						class="welcome-continue welcome-continue--solo"
						disabled={q2Id === null}
						onclick={continueFromQ2}
					>
						Continue
					</button>
				{/if}
			</div>
		</main>
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

	.welcome-card--preparing {
		max-width: 24rem;
	}

	@media (min-width: 768px) {
		.welcome-card--preparing {
			max-width: min(32rem, calc(100vw - 4rem));
		}
	}

	/* Wide enough on desktop so question + option labels stay on one line */
	@media (min-width: 768px) {
		.welcome-main {
			padding-left: 2rem;
			padding-right: 2rem;
		}

		.welcome-card:not(.welcome-card--preparing) {
			max-width: min(48rem, calc(100vw - 4rem));
			padding: 1.75rem 1.75rem 1.5rem;
		}
	}

	.welcome-preparing-title {
		margin: 0 0 1.25rem 0;
		font-size: 1.05rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.35;
		color: var(--color-text-on-frosted);
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
		stroke: color-mix(in srgb, var(--color-text-on-frosted) 18%, transparent);
	}

	.prep-ring-progress {
		stroke: rgba(255, 255, 255, 0.92);
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
		color: var(--color-text-on-frosted);
		font-family: var(--font-sans);
	}

	.prep-checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.prep-check-item {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.875rem;
		line-height: 1.4;
		color: color-mix(in srgb, var(--color-text-on-frosted) 72%, transparent);
		font-family: var(--font-sans);
		transition: color 0.35s ease;
	}

	.prep-check-item--done {
		color: var(--color-text-on-frosted);
	}

	.prep-check-icon {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		margin-top: 0.1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.95);
	}

	.prep-check-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-text-on-frosted) 35%, transparent);
	}

	.prep-check-item--done .prep-check-dot {
		display: none;
	}

	.welcome-step {
		margin: 0 0 0.5rem 0;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-on-frosted-muted);
	}

	.welcome-question {
		margin: 0 0 1.25rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.35;
		color: var(--color-text-on-frosted);
		font-family: var(--font-sans);
	}

	.welcome-options {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.welcome-option {
		width: 100%;
		text-align: left;
		padding: 0.75rem 0.9rem;
		border-radius: 0.65rem;
		border: 1px solid color-mix(in srgb, var(--color-text-on-frosted) 22%, transparent);
		background: color-mix(in srgb, var(--color-text-on-frosted) 8%, transparent);
		color: var(--color-text-on-frosted);
		font-size: 0.9375rem;
		font-weight: 400;
		line-height: 1.4;
		font-family: var(--font-sans);
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.welcome-option:hover {
		background: color-mix(in srgb, var(--color-text-on-frosted) 14%, transparent);
	}

	.welcome-option.selected {
		border-color: color-mix(in srgb, var(--color-text-on-frosted) 45%, transparent);
		background: color-mix(in srgb, var(--color-text-on-frosted) 18%, transparent);
	}

	.welcome-option:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-text-on-frosted) 55%, transparent);
		outline-offset: 2px;
	}

	.welcome-continue {
		flex: 1;
		min-height: var(--min-touch);
		padding: 0.65rem 1rem;
		border: none;
		border-radius: 0.65rem;
		background: rgba(255, 255, 255, 0.92);
		color: var(--color-sky-850);
		font-size: 0.95rem;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
	}

	.welcome-continue:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.welcome-continue--solo {
		width: 100%;
		flex: none;
	}
</style>
