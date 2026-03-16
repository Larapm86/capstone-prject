<script lang="ts">
	import { enhance } from '$app/forms';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

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
	let phase = $state<'idle' | 'holding' | 'complete'>('idle');
	let holdProgress = $state(0);
	let spreadOrigin = $state({ x: 0, y: 0 });
	let holdIntervalId: ReturnType<typeof setInterval> | null = null;
	let showWinState = $state(false);
	let trackFormMessage = $state<string | null>(null);

	function startHold(e: PointerEvent) {
		if (phase !== 'idle') return;
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		spreadOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		phase = 'holding';
		holdProgress = 0;
		const start = Date.now();
		holdIntervalId = setInterval(() => {
			const elapsed = Date.now() - start;
			holdProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
			if (holdProgress >= 100) {
				if (holdIntervalId) clearInterval(holdIntervalId);
				holdIntervalId = null;
				phase = 'complete';
			}
		}, 16);
	}

	function cancelHold() {
		if (phase === 'holding' && holdIntervalId) {
			clearInterval(holdIntervalId);
			holdIntervalId = null;
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
		}
	}
</script>

<svelte:head>
	<title>Becom — Log a craving</title>
</svelte:head>

<section
	aria-labelledby="log-heading"
	class="track-section"
	class:holding={phase === 'holding' || phase === 'complete'}
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
	<div
		class="hold-button-wrap"
		class:holding={phase === 'holding' || phase === 'complete'}
		aria-hidden="true"
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
			aria-label={phase === 'holding' ? 'Keep holding until the tracking screen appears' : 'Hold to open tracking screen'}
		>
			{#key phase}
				<span class="hold-button-label" class:holding-text={phase === 'holding'}>
					{#if phase === 'holding'}
						Keep holding until the tracking screen appears
					{:else}
						Hold to log
					{/if}
				</span>
			{/key}
		</button>
	</div>

	<div class="track-below-area" aria-hidden="true"></div>

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
	<div class="white-screen visible" role="dialog" aria-label="Tracking a craving">
		<button type="button" class="close-button" onclick={closeWhite} aria-label="Close">
			<span class="close-icon" aria-hidden="true">×</span>
		</button>
		<div class="white-screen-content">
			<form
				method="post"
				action="?/logCraving"
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
				<button type="submit" class="track-submit">Track it</button>
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
	.track-below-area {
		flex: 1;
		min-height: 40vh;
		margin: 0 calc(50% - 50vw);
		margin-top: -8rem;
		width: 100vw;
		background: #051D26;
		/* Stays behind the floating nav (nav is z-index 100) */
		z-index: 0;
	}
	.track-section.holding {
		z-index: 202;
	}
	/* Dark area blends into white in sync with the button */
	.track-section.holding .track-below-area {
		opacity: clamp(0, (75 - var(--hold-progress, 0)) / 60, 1);
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
	.hold-button-wrap {
		position: relative;
		width: calc(100% - 2rem);
		max-width: var(--max-width);
		aspect-ratio: 1 / 1;
		margin: 2.5rem auto 0 0;
		/* Don’t clip so the halo layer’s drop-shadow can extend outside */
		overflow: visible;
	}
	.hold-button-wrap.holding {
		z-index: 201;
		position: relative;
	}
	/* Blend button into white earlier and smoothly (fade starts ~15%, done by ~75%) */
	.hold-button-wrap.holding .hold-button-halo,
	.hold-button-wrap.holding .hold-button {
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
	.hold-button:active {
		opacity: 0.95;
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
		transition: transform 0.15s ease-out, opacity 0.15s ease-out;
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
		transition: transform 0.15s ease-out, opacity 0.15s ease-out;
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
