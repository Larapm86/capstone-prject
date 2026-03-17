<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { stars } from '$lib/starsData';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	/** Form action for craving log – absolute URL so mobile/PWA always posts to the right route. */
	const logCravingAction = $derived(
		$page.url.origin + ($page.url.pathname || '/') + '?/logCraving'
	);
	/** Hold button is always shown (no "Tap to open" intro). */
	let introOpened = $state(true);
	let introLanding = $state(false);

	$effect(() => {
		const active = phase === 'holding' || phase === 'complete';
		if (typeof document !== 'undefined') {
			document.body.classList.toggle('hold-active', active);
		}
		return () => {
			if (typeof document !== 'undefined') document.body.classList.remove('hold-active');
		};
	});

	const HOLD_DURATION_MS = 3200;
	const WIN_STATE_DURATION_MS = 1600;
	const ERROR_DISPLAY_MS = 5000;
	let phase = $state<'idle' | 'holding' | 'complete'>('idle');
	let holdProgress = $state(0);
	let spreadOrigin = $state({ x: 0, y: 0 });
	let holdIntervalId: ReturnType<typeof setInterval> | null = null;
	let holdReleaseCleanup: (() => void) | null = null;
	let holdStartTime = 0;
	let showWinState = $state(false);
	let trackFormMessage = $state<string | null>(null);
	let hasCompletedOnce = $state(false);

	function startHold(e: PointerEvent) {
		if (phase !== 'idle') return;
		// On mobile, prevent default touch behavior (scroll, context menu) so the hold can complete
		if (e.pointerType === 'touch') {
			e.preventDefault();
		}
		const target = e.currentTarget as HTMLElement;
		const pointerId = e.pointerId;
		try {
			target.setPointerCapture(pointerId);
		} catch (_) {
			// Some mobile browsers restrict setPointerCapture; document listeners still run
		}
		const rect = target.getBoundingClientRect();
		spreadOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		phase = 'holding';
		holdProgress = 0;
		holdStartTime = Date.now();
		const start = holdStartTime;

		const releaseCapture = () => {
			try {
				target.releasePointerCapture(pointerId);
			} catch (_) {}
		};
		const onRelease = (ev: PointerEvent) => {
			if (ev.pointerId !== pointerId) return;
			holdReleaseCleanup?.();
			holdReleaseCleanup = null;
			cancelHold();
		};
		const cleanup = () => {
			releaseCapture();
			document.removeEventListener('pointerup', onRelease, true);
			document.removeEventListener('pointercancel', onRelease, true);
		};
		holdReleaseCleanup = cleanup;
		document.addEventListener('pointerup', onRelease, true);
		document.addEventListener('pointercancel', onRelease, true);

		holdIntervalId = setInterval(() => {
			const elapsed = Date.now() - start;
			holdProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
			if (holdProgress >= 100) {
				if (holdIntervalId) clearInterval(holdIntervalId);
				holdIntervalId = null;
				holdReleaseCleanup?.();
				holdReleaseCleanup = null;
				phase = 'complete';
				hasCompletedOnce = true;
			}
		}, 16);
	}

	function cancelHold() {
		holdReleaseCleanup?.();
		holdReleaseCleanup = null;
		if (phase === 'holding' && holdIntervalId) {
			clearInterval(holdIntervalId);
			holdIntervalId = null;
			// On mobile, pointercancel often fires near the end of a long press; treat near-complete as success
			const elapsed = Date.now() - holdStartTime;
			if (elapsed >= 0.95 * HOLD_DURATION_MS) {
				holdProgress = 100;
				phase = 'complete';
				hasCompletedOnce = true;
				return;
			}
		}
		if (phase === 'holding') {
			phase = 'idle';
			holdProgress = 0;
		}
	}

	function closeWhite() {
		phase = 'idle';
		holdProgress = 0;
		showWinState = false;
		trackFormMessage = null;
	}

	function handleTrackResult(result: { type: string; data?: { success?: boolean; message?: string } }) {
		trackFormMessage = result.data?.message ?? null;
		if (result.type === 'success' && result.data?.success) {
			showWinState = true;
			hasNewCravingForStats.set(true);
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.setItem('becom-new-craving', '1');
			}
			setTimeout(() => {
				closeWhite();
			}, WIN_STATE_DURATION_MS);
		} else if (result.type === 'failure') {
			setTimeout(() => {
				closeWhite();
			}, ERROR_DISPLAY_MS);
		}
	}
</script>

<svelte:head>
	<title>Becom — Reflect</title>
</svelte:head>

<section
	aria-labelledby="log-heading"
	class="track-section"
	class:holding={phase === 'holding' || phase === 'complete'}
	class:returned={phase === 'idle' && hasCompletedOnce}
	style={phase === 'holding' || phase === 'complete' ? `--hold-progress: ${phase === 'complete' ? 100 : holdProgress}` : ''}
>
	<h2 id="log-heading">Log a craving</h2>
	<p class="section-intro">Hold the button until the screen fills — then you’re in.</p>

	<svg width="0" height="0" aria-hidden="true" focusable="false">
		<defs>
			<clipPath id="hold-button-drop" clipPathUnits="objectBoundingBox">
				<!-- Top 3/4 of circle: arc over the top, flat chord at bottom (y=0.75) -->
				<path d="M 0.067 0.75 L 0.933 0.75 A 0.5 0.5 0 1 0 0.067 0.75 Z" />
			</clipPath>
		</defs>
	</svg>
	<div class="hold-intro-wrap">
		<div
			class="hold-button-wrap"
			class:holding={phase === 'holding' || phase === 'complete'}
			class:revealed={introOpened}
			class:landing={introLanding}
			style={phase === 'holding' || phase === 'complete' ? `--hold-progress: ${phase === 'complete' ? 100 : holdProgress}` : ''}
		>
			<div
				class="hold-button-halo"
				class:flicker={phase === 'idle'}
				style="clip-path: url(#hold-button-drop)"
				aria-hidden="true"
			></div>
			<button
				type="button"
				class="hold-button"
				class:flicker={phase === 'idle'}
				style="clip-path: url(#hold-button-drop)"
				onpointerdown={startHold}
				onpointerup={cancelHold}
				onpointerleave={cancelHold}
				onpointercancel={cancelHold}
				oncontextmenu={(e) => e.preventDefault()}
				aria-label={phase === 'holding' ? 'Keep holding until the Reflect screen appears' : 'Hold to open Reflect screen'}
			>
				{#key phase}
					<span class="hold-button-label" class:holding-text={phase === 'holding'}>
						{#if phase === 'holding'}
							Keep holding until the Reflect screen appears
						{:else}
							Hold to log
						{/if}
					</span>
				{/key}
			</button>
		</div>
	</div>

	<div class="track-below-area" aria-hidden="true">
		<div class="track-below-grass" aria-hidden="true"></div>
	</div>
	<div class="reflect-stars-layer" aria-hidden="true">
		<div class="reflect-milky"></div>
		{#each stars as star}
			<span
				class="reflect-star reflect-star--s{star.s}"
				style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
			></span>
		{/each}
	</div>
	<div class="horizon-glow" aria-hidden="true"></div>
	<div class="night-silhouette" aria-hidden="true">
		<svg class="silhouette-svg" viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Back: distant range, peaks pulled up a bit -->
			<polygon points="0,200 0,132 25,145 50,120 80,132 110,112 140,125 170,105 200,118 230,102 260,114 290,98 320,110 350,94 380,104 400,100 400,200" fill="#051a12" />
			<!-- Mid-back: ridges a bit higher -->
			<polygon points="0,200 0,152 30,162 60,148 95,155 130,138 165,146 200,128 235,138 270,124 305,134 340,120 370,128 400,126 400,200" fill="#041510" />
			<!-- Mid: trees pulled up -->
			<polygon points="0,200 15,168 45,174 75,160 108,168 140,152 175,160 208,144 242,154 275,140 308,148 342,136 375,144 400,142 400,200" fill="#031812" />
			<!-- Front: a bit higher -->
			<polygon points="0,200 22,176 55,182 88,168 120,174 155,160 190,166 225,152 260,160 295,148 330,156 365,144 400,152 400,200" fill="#030d0a" />
			<!-- Foreground: peaks pulled up -->
			<polygon points="0,200 28,180 62,184 95,172 128,178 162,166 198,172 232,162 268,168 302,158 338,164 400,170 400,200" fill="#020a08" />
			<!-- Last row: subtle, soft undulation -->
			<polygon points="0,200 0,188 80,191 160,187 240,190 320,188 400,191 400,200" fill="#031812" fill-opacity="0.7" />
		</svg>
	</div>

	{#if form?.message}
		<p class="error" role="alert">{form.message}</p>
	{/if}
</section>

{#if phase === 'holding' || phase === 'complete'}
	<div
		class="light-spread"
		class:complete={phase === 'complete'}
		role="presentation"
		aria-hidden="true"
		style="
			--origin-x: {spreadOrigin.x}px;
			--origin-y: {spreadOrigin.y}px;
			--progress: {phase === 'complete' ? 100 : holdProgress};
		"
	></div>
	<div
		class="white-spread"
		class:complete={phase === 'complete'}
		role="presentation"
		aria-hidden="true"
		style="
			--origin-x: {spreadOrigin.x}px;
			--origin-y: {spreadOrigin.y}px;
			--progress: {phase === 'complete' ? 100 : holdProgress};
		"
	></div>
{/if}

{#if phase === 'complete'}
	<div class="white-screen visible" role="dialog" aria-label="Reflecting on a craving">
		<button type="button" class="close-button" onclick={closeWhite} aria-label="Close">
			<span class="close-icon" aria-hidden="true">×</span>
		</button>
		<div class="white-screen-content">
			<form
				method="post"
				action={logCravingAction}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success' && result.data) {
							handleTrackResult({ type: result.type, data: result.data as { success?: boolean; message?: string } });
						} else if (result.type === 'failure' && result.data) {
							handleTrackResult({ type: result.type, data: result.data as { message?: string } });
						}
					};
				}}
				class="track-form"
			>
				<input type="hidden" name="noRedirect" value="1" />
				<label for="white-craving-text" class="white-label">What are you craving?</label>
				<input
					id="white-craving-text"
					type="text"
					name="text"
					placeholder="e.g. chocolate, chips"
					inputmode="text"
					autocomplete="off"
					maxlength={500}
					class="white-input"
				/>
				{#if trackFormMessage}
					<p class="white-form-error" role="alert">{trackFormMessage}</p>
				{/if}
				<button type="submit" class="track-submit">Reflect it</button>
			</form>
		</div>
	</div>
{/if}

{#if showWinState}
	<div class="win-state" role="status" aria-live="polite">
		<span class="win-check">✓</span>
		<p class="win-text">Logged</p>
	</div>
{/if}

<style>
	.track-section {
		position: relative;
		z-index: 0;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 100%;
	}
	.track-section > h2,
	.track-section > .section-intro,
	.track-section > .error,
	.track-section > svg {
		position: relative;
		z-index: 3;
	}
	.hold-intro-wrap {
		position: relative;
		z-index: 4;
		width: calc(100% - 2rem);
		max-width: var(--max-width);
		margin: 2.5rem auto 0 auto;
		aspect-ratio: 1 / 1;
	}
	@media (max-width: 480px) {
		.hold-intro-wrap {
			max-width: 18rem;
			width: min(calc(100% - 2rem), 18rem);
			margin-top: 5rem;
		}
		.track-below-area {
			margin-top: -8rem;
		}
	}
	.intro-jar-tap-area {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		cursor: pointer;
		background: transparent;
		border: none;
		padding: 0;
		appearance: none;
		-webkit-appearance: none;
		color: inherit;
		outline: none;
	}
	.intro-jar-tap-area:focus-visible {
		outline: 2px solid rgba(180, 220, 255, 0.9);
		outline-offset: 4px;
	}
	/* No shrink on tap – keep same size as production */
	.intro-jar-bubble {
		position: relative;
		padding: 0.5rem 0.85rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(255, 252, 245, 0.95);
		text-shadow: 0 0 12px rgba(150, 210, 230, 0.35);
		background: linear-gradient(180deg, rgba(1, 26, 40, 0.92) 0%, rgba(1, 20, 35, 0.95) 100%);
		border: none;
		border-radius: 0.5rem;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(80, 160, 180, 0.08);
		white-space: nowrap;
	}
	.intro-jar-bubble::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 100%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: rgba(1, 22, 38, 0.95);
	}
	/* Intro: same shape, size and aesthetics as Hold to log button */
	.intro-shape-wrap {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.intro-shape-halo {
		position: absolute;
		inset: 0;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 50%;
		filter: drop-shadow(6px -6px 16px rgba(220, 235, 255, 0.7))
			drop-shadow(6px -6px 1.5rem rgba(220, 235, 255, 0.65))
			drop-shadow(6px -6px 3.5rem rgba(200, 220, 245, 0.5))
			drop-shadow(6px -6px 5.5rem rgba(180, 205, 235, 0.35));
	}
	.intro-shape-body {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(
			ellipse 70% 55% at 28% 22%,
			rgba(255, 255, 255, 1),
			rgba(235, 242, 252, 0.95) 35%,
			rgba(195, 210, 230, 0.98) 70%,
			rgba(175, 190, 212, 1) 100%
		);
		box-shadow:
			inset -0.6rem -0.6rem 2rem rgba(150, 170, 200, 0.35),
			inset 0.5rem 0.45rem 1.25rem rgba(255, 255, 255, 0.85),
			inset 0.15rem 0.15rem 0.5rem rgba(255, 255, 255, 0.9);
	}
	.intro-shape-body.flicker::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(
			ellipse 55% 45% at 50% 50%,
			rgba(255, 255, 255, 0.22),
			rgba(255, 255, 255, 0.05) 45%,
			transparent 70%
		);
		animation: light-drift 8s ease-in-out infinite;
		pointer-events: none;
	}
	/* Wrap hidden until intro opened; when shown, never scale so button stays same size on tap */
	.hold-intro-wrap .hold-button-wrap {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		overflow: visible;
		transform: scale(1);
		transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
		transition-property: opacity;
	}
	.hold-intro-wrap .hold-button-wrap.revealed {
		pointer-events: auto;
		opacity: 1;
		transform: scale(1);
	}
	.track-below-area {
		position: relative;
		flex: 1;
		min-height: 18vh;
		margin: 0 calc(50% - 50vw);
		margin-top: -10rem;
		width: 100vw;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
		/* Jagged treeline at top instead of straight edge */
		clip-path: polygon(
			0% 100%, 0% 58%, 5% 52%, 10% 56%, 15% 50%, 20% 54%, 25% 49%, 30% 53%, 35% 48%,
			40% 52%, 45% 47%, 50% 51%, 55% 49%, 60% 53%, 65% 48%, 70% 52%, 75% 50%, 80% 54%,
			85% 49%, 90% 53%, 95% 51%, 100% 55%, 100% 100%
		);
		/* Depth: darker at bottom, slight variation toward horizon */
		background: linear-gradient(
			to top,
			#031a20 0%,
			#041e24 22%,
			#052228 45%,
			#051D26 70%,
			#041b22 100%
		);
	}
	.track-below-grass {
		position: absolute;
		inset: 0;
		/* Grass: blades + extra angle for clumps/depth, stronger toward bottom */
		background-image:
			linear-gradient(to top, transparent 0%, transparent 35%, rgba(0, 30, 28, 0.15) 100%),
			repeating-linear-gradient(
				88deg,
				transparent 0,
				transparent 2px,
				rgba(0, 48, 46, 0.32) 2px,
				rgba(0, 48, 46, 0.32) 3px
			),
			repeating-linear-gradient(
				92deg,
				transparent 0,
				transparent 3px,
				rgba(0, 44, 42, 0.22) 3px,
				rgba(0, 44, 42, 0.22) 4px
			),
			repeating-linear-gradient(
				90deg,
				transparent 0,
				transparent 4px,
				rgba(0, 40, 38, 0.14) 4px,
				rgba(0, 40, 38, 0.14) 5px
			),
			repeating-linear-gradient(
				86deg,
				transparent 0,
				transparent 5px,
				rgba(0, 42, 40, 0.1) 5px,
				rgba(0, 42, 40, 0.1) 6px
			);
	}
	.reflect-stars-layer {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}
	.reflect-milky {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 120% 40% at 55% 25%,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.012) 40%,
			transparent 70%
		);
	}
	.reflect-star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: reflect-star-blink 3s ease-in-out infinite;
	}
	.reflect-star--s1 {
		width: 1px;
		height: 1px;
	}
	.reflect-star--s2 {
		width: 2px;
		height: 2px;
	}
	.reflect-star--s3 {
		width: 3px;
		height: 3px;
	}
	@keyframes reflect-star-blink {
		0%, 100% { opacity: calc(var(--brightness, 0.9) * 0.3); transform: scale(1); }
		50% { opacity: var(--brightness, 0.9); transform: scale(1.15); }
	}
	.horizon-glow {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 50vh;
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(
			to top,
			rgba(0, 55, 60, 0.55) 0%,
			rgba(0, 70, 72, 0.25) 30%,
			rgba(0, 50, 55, 0.08) 55%,
			transparent 85%
		);
	}
	.night-silhouette {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 36vh;
		min-height: 130px;
		z-index: 2;
		pointer-events: none;
		background: #041210;
	}
	.silhouette-svg {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: bottom center;
	}
	.track-section.holding {
		z-index: 202;
	}
	/* Dark area and green bottom fade in sync with the button (blend earlier) */
	.track-section.holding .track-below-area,
	.track-section.holding .horizon-glow,
	.track-section.holding .night-silhouette {
		opacity: clamp(0, (50 - var(--hold-progress, 0)) / 45, 1);
		transition: opacity 0.28s ease-out;
	}
	.track-section.holding h2,
	.track-section.holding .section-intro,
	.track-section.holding .error {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
	}
	h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}
	.section-intro {
		margin: 0 0 1.5rem 0;
		color: var(--text-muted);
	}
	/* Keep same size when holding: do NOT override position (was position: relative and made wrap shrink) */
	.hold-button-wrap.holding {
		z-index: 201;
		position: absolute;
		inset: 0;
		transform: scale(1);
	}
	/* Fade button and halo into the white spread for a smooth, elegant transition */
	.hold-button-wrap.holding .hold-button-halo,
	.hold-button-wrap.holding .hold-button,
	.hold-button-wrap.holding .hold-button-label {
		opacity: clamp(0, (75 - var(--hold-progress, 0)) / 60, 1);
		transition: opacity 0.28s ease-out;
	}
	.hold-button-label {
		animation: hold-label-fade-in 0.4s ease-out forwards;
	}
	.hold-button-label.holding-text {
		font-weight: 300;
	}
	.hold-button-wrap.holding .hold-button-label {
		animation: none;
	}
	.track-section.returned .hold-button-label {
		animation: none;
		opacity: 1;
	}
	@keyframes hold-label-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.hold-button-halo {
		position: absolute;
		inset: 0;
		/* Same 3/4 shape; needs a fill so drop-shadow has something to cast from */
		background: rgba(255, 255, 255, 0.02);
		border-radius: 50%;
		/* Halo – this layer isn’t clipped by parent so shadow is visible */
		filter: drop-shadow(6px -6px 16px rgba(220, 235, 255, 0.7))
			drop-shadow(6px -6px 1.5rem rgba(220, 235, 255, 0.65))
			drop-shadow(6px -6px 3.5rem rgba(200, 220, 245, 0.5))
			drop-shadow(6px -6px 5.5rem rgba(180, 205, 235, 0.35));
		pointer-events: none;
	}
	.hold-button-halo.flicker {
		animation: fluorescent-flicker 4.5s ease-in-out infinite;
	}
	.hold-button.flicker {
		animation: fluorescent-flicker 4.5s ease-in-out infinite;
	}
	.hold-button.flicker::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(
			ellipse 55% 45% at 50% 50%,
			rgba(255, 255, 255, 0.22),
			rgba(255, 255, 255, 0.05) 45%,
			transparent 70%
		);
		animation: light-drift 8s ease-in-out infinite;
		pointer-events: none;
	}
	@keyframes fluorescent-flicker {
		/* Delicate irregular brightness – like a bulb gently warming */
		0%, 100% { opacity: 0.97; }
		12% { opacity: 1; }
		24% { opacity: 0.96; }
		36% { opacity: 0.99; }
		48% { opacity: 0.95; }
		60% { opacity: 1; }
		74% { opacity: 0.96; }
		88% { opacity: 0.98; }
	}
	@keyframes light-drift {
		/* Soft highlight drifting inside – very subtle */
		0%, 100% { transform: translate(-3%, -4%); opacity: 0.88; }
		30% { transform: translate(4%, 2%); opacity: 1; }
		55% { transform: translate(-2%, 4%); opacity: 0.9; }
		80% { transform: translate(2%, -3%); opacity: 0.92; }
	}
	.hold-button {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		padding: 1.5rem;
		font-size: 1.125rem;
		transform: scale(1);
		background: radial-gradient(
			ellipse 70% 55% at 28% 22%,
			rgba(255, 255, 255, 1),
			rgba(235, 242, 252, 0.95) 35%,
			rgba(195, 210, 230, 0.98) 70%,
			rgba(175, 190, 212, 1) 100%
		);
		color: var(--bg);
		border: none;
		border-radius: 50%;
		box-shadow:
			inset -0.6rem -0.6rem 2rem rgba(150, 170, 200, 0.35),
			inset 0.5rem 0.45rem 1.25rem rgba(255, 255, 255, 0.85),
			inset 0.15rem 0.15rem 0.5rem rgba(255, 255, 255, 0.9);
		font-family: var(--font-sans);
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		touch-action: none;
		-webkit-tap-highlight-color: transparent;
	}
	/* Same size before and after tap – no shrink, no dim */
	.hold-button:active {
		transform: scale(1);
		opacity: 1;
	}
	.error {
		color: var(--error);
		margin-top: 1rem;
		margin-bottom: 0;
	}
	.light-spread {
		position: fixed;
		left: var(--origin-x);
		top: var(--origin-y);
		width: 200vmax;
		height: 200vmax;
		margin-left: -100vmax;
		margin-top: -100vmax;
		background: radial-gradient(
			circle at center,
			rgba(255, 255, 255, 0.75) 0%,
			rgba(250, 252, 255, 0.5) 30%,
			rgba(235, 242, 252, 0.22) 55%,
			rgba(220, 232, 248, 0.06) 80%,
			transparent 100%
		);
		border-radius: 50%;
		transform: scale(calc(var(--progress) / 100));
		opacity: calc(var(--progress) / 100);
		transition: transform 0.12s ease-out, opacity 0.12s ease-out;
		z-index: 199;
		pointer-events: none;
	}
	.light-spread.complete {
		transform: scale(1);
		opacity: 1;
	}
	.white-spread {
		position: fixed;
		left: var(--origin-x);
		top: var(--origin-y);
		width: 200vmax;
		height: 200vmax;
		margin-left: -100vmax;
		margin-top: -100vmax;
		background: #fff;
		border-radius: 50%;
		transform: scale(calc(var(--progress) / 100));
		opacity: calc(var(--progress) / 100);
		transition: transform 0.12s ease-out, opacity 0.12s ease-out;
		z-index: 200;
		pointer-events: none;
	}
	.white-spread.complete {
		transform: scale(1);
		opacity: 1;
		transition: transform 0.2s ease-out, opacity 0.25s ease-out;
		pointer-events: none;
	}
	.white-screen {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 210;
		opacity: 0;
		transition: opacity 0.5s ease-out;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 1rem;
		padding-top: calc(1rem + env(safe-area-inset-top, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
	}
	.white-screen.visible {
		opacity: 1;
	}
	.white-screen.visible .close-button {
		animation: white-screen-in 0.4s ease-out 0.15s both;
	}
	.white-screen.visible .white-label {
		animation: white-screen-in 0.4s ease-out 0.25s both;
	}
	.white-screen.visible .white-input {
		animation: white-screen-in 0.4s ease-out 0.35s both;
	}
	.white-screen.visible .track-submit {
		animation: white-screen-in 0.4s ease-out 0.45s both;
	}
	.white-screen.visible .white-form-error {
		animation: white-screen-in 0.3s ease-out 0.4s both;
	}
	@keyframes white-screen-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.close-button {
		position: absolute;
		top: calc(1rem + env(safe-area-inset-top, 0px));
		right: calc(1rem + env(safe-area-inset-right, 0px));
		width: var(--min-touch);
		height: var(--min-touch);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: #011F3B;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		opacity: 0;
	}
	.close-button:hover {
		background: rgba(1, 31, 59, 0.08);
	}
	.close-icon {
		font-size: 2rem;
		line-height: 1;
		font-weight: 300;
	}
	.white-screen-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 0;
	}
	.track-form {
		width: 100%;
		max-width: 24rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.white-label {
		font-size: 1rem;
		font-weight: 600;
		color: #011F3B;
		opacity: 0;
	}
	.white-input {
		font-size: 16px;
		padding: 0.875rem 1rem;
		background: rgba(1, 31, 59, 0.06);
		color: #011F3B;
		border: 1px solid rgba(1, 31, 59, 0.2);
		border-radius: 0.75rem;
		font-family: var(--font-sans);
		opacity: 0;
	}
	.white-input::placeholder {
		color: rgba(1, 31, 59, 0.5);
	}
	.white-form-error {
		color: #c00;
		font-size: 0.875rem;
		margin: 0;
	}
	.track-submit {
		min-height: var(--min-touch);
		padding: 0.75rem 1.5rem;
		background: #011F3B;
		color: #fff;
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		opacity: 0;
	}
	.track-submit:hover {
		opacity: 0.9;
	}
	.win-state {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 220;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		animation: win-fade 0.3s ease;
	}
	@keyframes win-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	.win-check {
		width: 4rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #011F3B;
		color: #fff;
		font-size: 2rem;
		font-weight: 600;
		border-radius: 50%;
	}
	.win-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: #011F3B;
		margin: 0;
	}
</style>
