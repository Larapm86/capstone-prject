<script lang="ts">
	import { get } from 'svelte/store';
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import CravingForm from '$lib/components/craving-form/CravingForm.svelte';
	import BecomLogo from '$lib/components/BecomLogo.svelte';
	import { MAX_SKILL, SKILLS } from '$lib/constants/skills';
	import { dismissLoggedCelebration, loggedCelebration } from '$lib/stores/loggedCelebration';
	import { armPostCravingNavGuard } from '$lib/stores/postCravingNavGuard';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { skillOverride } from '$lib/stores/skillOverride';
	import { reflectHoldState } from '$lib/stores/reflectHold';
	import type { ActionData } from './$types';

	let { data, form }: { data: { skill?: number; cravingCount?: number; userName?: string | null; user?: { name?: string | null }; progress?: { current: number; required: number; label: string } }; form: ActionData } = $props();

	/** Use $page.data so skill/progress stay in sync after invalidate (destructured `data` can lag behind). */
	const layoutSkill = $derived(
		typeof $page.data?.skill === 'number' && $page.data.skill >= 1 ? $page.data.skill : (data?.skill ?? 1)
	);
	const layoutProgress = $derived(
		$page.data?.progress ??
			data?.progress ?? { current: 0, required: 1, label: 'sessions' }
	);
	const currentSkill = $derived($skillOverride ?? layoutSkill);
	const skillName = $derived(SKILLS[Math.min(currentSkill, SKILLS.length) - 1]?.name ?? 'Reflect');
	const progress = $derived(layoutProgress);
	const progressPercent = $derived(
		progress.required > 0 ? Math.min(100, (progress.current / progress.required) * 100) : 0
	);

	function getTimeBasedGreeting() {
		const h = new Date().getHours();
		if (h >= 5 && h < 12) return 'Good morning';
		if (h >= 12 && h < 18) return 'Good afternoon';
		if (h >= 18 && h < 21) return 'Good evening';
		return 'Good night';
	}
	const greeting = $derived(getTimeBasedGreeting());
	const userName = $derived(data?.userName ?? data?.user?.name ?? '');
	const greetingLine = $derived(userName ? `${greeting}, ${userName}` : greeting);

	/** On mobile we use tap + smooth fill; on desktop, hold. */
	let isTouchDevice = $state(false);

	/**
	 * Fireflies on the hold dome:
	 * - Skill 1: one blue fly per session logged toward this tier (up to required), so progress is visible.
	 * - Skill 2+: one fly per unlocked tier, each skill’s card color.
	 * Keys use `slot` (not `step`) so multiple skill-1 flies don’t collapse in {#each} (was keyed by pos.step → only one blue dot).
	 */
	const skillForFireflies = $derived($skillOverride ?? layoutSkill);
	const completedSkillFireflies = $derived.by(() => {
		const sk = Math.min(Math.max(skillForFireflies, 1), MAX_SKILL);
		const prog = layoutProgress;
		const req = Math.max(1, prog.required || 1);
		const cur = Math.max(0, prog.current ?? 0);

		if (sk === 1) {
			const n = Math.max(1, Math.min(cur, req));
			return Array.from({ length: n }, (_, i) => ({
				step: 1,
				slot: i,
				cardBg: SKILLS[0].cardBg
			}));
		}

		return Array.from({ length: sk }, (_, i) => ({
			step: i + 1,
			slot: i,
			cardBg: SKILLS[i].cardBg
		}));
	});

	onMount(() => {
		isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
		/** After logging from /craving, run firefly celebration + insights flag (same as closeWhite on Reflect). */
		if (typeof sessionStorage !== 'undefined') {
			const raw = sessionStorage.getItem('becom-craving-return');
			if (raw) {
				try {
					const parsed = JSON.parse(raw) as {
						skillLeveledUp?: boolean;
						newSkillAfterLog?: number;
					};
					sessionStorage.removeItem('becom-craving-return');
					if (typeof parsed.newSkillAfterLog === 'number') {
						void (async () => {
							await tick();
							await closeWhite(true, parsed.skillLeveledUp === true, parsed.newSkillAfterLog);
						})();
					}
				} catch {
					sessionStorage.removeItem('becom-craving-return');
				}
			}
		}
	});

	/**
	 * Reflect white-screen (desktop) must post to this app’s root action — same as /craving uses `?/logCraving`.
	 * Use path + base only (no `origin`) so desktop PWAs / embedded shells don’t mis-resolve absolute URLs.
	 */
	const logCravingAction = $derived(`${base}/?/logCraving`);
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

	/** Sync hold state to layout so tree/horizon (rendered in layout) can fade when holding */
	$effect(() => {
		reflectHoldState.set({ phase, holdProgress });
	});

	const HOLD_DURATION_MS = 3200;
	/** Mobile: tap triggers white spread from button to full screen over this duration, then goto /craving */
	const TAP_SPREAD_MS = 1200;
	const WIN_STATE_DURATION_MS = 1300;
	const WIN_STATE_FADEOUT_MS = 450;
	const ERROR_DISPLAY_MS = 5000;
	let phase = $state<'idle' | 'holding' | 'complete'>('idle');
	let holdProgress = $state(0);
	let spreadOrigin = $state({ x: 0, y: 0 });
	let holdIntervalId: ReturnType<typeof setInterval> | null = null;
	let holdCompleteTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let holdReleaseCleanup: (() => void) | null = null;
	let holdStartTime = 0;
	let trackFormMessage = $state<string | null>(null);
	let submitting = $state(false);
	let hasCompletedOnce = $state(false);
	let showFireflyFlash = $state(false);
	/** While non-null, only this index uses hidden / fly-in / flash; others stay drifting. */
	let fireflyIntroForIndex = $state<number | null>(null);
	/** Color of the skill just completed (for flash / glow). */
	let celebrationFireflyColor = $state<string | null>(null);
	const FIREFLY_DISPLAY_MAX = 12;
	/** Sequence for the *new* firefly: hidden → flying-in → idle + flash */
	let fireflyPhase = $state<'hidden' | 'flying-in' | 'idle'>('idle');

	const fireflyRows = $derived.by(() => {
		const flies = completedSkillFireflies.slice(0, FIREFLY_DISPLAY_MAX);
		const n = flies.length;
		return flies.map((f, i) => {
			const baseAngle = (i / Math.max(n, 1)) * 2 * Math.PI - Math.PI / 2;
			const restRadius = 6;
			const pathRadiusX = 28;
			const pathRadiusY = 22;
			const seed = i * 0.97 + 0.5;
			const a1 = seed * 2 * Math.PI;
			const a2 = seed * 2 * Math.PI + 2.1;
			const a3 = seed * 2 * Math.PI + 4.2;
			const duration = 7 + (i % 8) * 0.95;
			const reverse = i % 2 === 1;
			const phaseOffset = (i * 2.3) % 12;
			return {
				step: f.step,
				slot: f.slot,
				cardBg: f.cardBg,
				dx: Math.cos(baseAngle) * restRadius,
				dy: Math.sin(baseAngle) * restRadius,
				delay: -phaseOffset,
				duration,
				reverse,
				x1: Math.round(Math.cos(a1) * pathRadiusX),
				y1: Math.round(Math.sin(a1) * pathRadiusY),
				x2: Math.round(Math.cos(a2) * pathRadiusX),
				y2: Math.round(Math.sin(a2) * pathRadiusY),
				x3: Math.round(Math.cos(a3) * pathRadiusX),
				y3: Math.round(Math.sin(a3) * pathRadiusY)
			};
		});
	});

	function fireflyHidden(i: number) {
		/* Only hide when a specific index is in the intro “hidden” beat — never hide all flies when intro is null
		   (stuck fireflyPhase === 'hidden' would otherwise zero out every firefly). */
		if (fireflyIntroForIndex === null) return false;
		if (i !== fireflyIntroForIndex) return false;
		return fireflyPhase === 'hidden';
	}

	function fireflyFlyIn(i: number) {
		return fireflyIntroForIndex === i && fireflyPhase === 'flying-in';
	}

	function fireflyIdle(i: number) {
		if (showFireflyFlash && fireflyIntroForIndex === i) return false;
		if (fireflyIntroForIndex !== null && i === fireflyIntroForIndex) {
			return fireflyPhase === 'idle' && !showFireflyFlash;
		}
		if (fireflyHidden(i) || fireflyFlyIn(i)) return false;
		return true;
	}

	function fireflyFlash(i: number) {
		return showFireflyFlash && fireflyIntroForIndex === i;
	}

	function finishHold() {
		if (holdIntervalId) clearInterval(holdIntervalId);
		holdIntervalId = null;
		if (holdCompleteTimeoutId) clearTimeout(holdCompleteTimeoutId);
		holdCompleteTimeoutId = null;
		holdReleaseCleanup?.();
		holdReleaseCleanup = null;
		holdProgress = 100;
		phase = 'complete';
		hasCompletedOnce = true;
	}

	function startHold(e: PointerEvent) {
		if (phase !== 'idle') return;
		const isTouch = e.pointerType === 'touch';
		if (isTouch) {
			e.preventDefault();
			// Mobile: white spread grows from button to full screen, then navigate to /craving
			const target = e.currentTarget as HTMLElement;
			const rect = target.getBoundingClientRect();
			spreadOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
			phase = 'holding';
			holdProgress = 0;
			const start = Date.now();

			holdIntervalId = setInterval(() => {
				const elapsed = Date.now() - start;
				const t = Math.min(1, elapsed / TAP_SPREAD_MS);
				// Ease-out cubic: faster at start, smooth deceleration at full screen
				const eased = 1 - (1 - t) ** 3;
				holdProgress = eased * 100;
				if (holdProgress >= 100) {
					if (holdIntervalId) clearInterval(holdIntervalId);
					holdIntervalId = null;
					if (holdCompleteTimeoutId) clearTimeout(holdCompleteTimeoutId);
					holdCompleteTimeoutId = null;
					goto('/craving');
				}
			}, 16);

			holdCompleteTimeoutId = setTimeout(() => {
				if (phase === 'holding') {
					holdProgress = 100;
					if (holdIntervalId) clearInterval(holdIntervalId);
					holdIntervalId = null;
					holdCompleteTimeoutId = null;
					goto('/craving');
				}
			}, TAP_SPREAD_MS + 80);
			return;
		}

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		spreadOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
		phase = 'holding';
		holdProgress = 0;
		holdStartTime = Date.now();
		const start = holdStartTime;

		const durationMs = HOLD_DURATION_MS;

		{
			const pointerId = e.pointerId;
			try {
				target.setPointerCapture(pointerId);
			} catch (_) {}
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
		}

		holdIntervalId = setInterval(() => {
			const elapsed = Date.now() - start;
			holdProgress = Math.min(100, (elapsed / durationMs) * 100);
			if (holdProgress >= 100) {
				finishHold();
			}
		}, 16);

		holdCompleteTimeoutId = setTimeout(() => {
			if (phase === 'holding') finishHold();
		}, durationMs + 100);
	}

	function cancelHold() {
		holdReleaseCleanup?.();
		holdReleaseCleanup = null;
		if (phase === 'holding') {
			if (holdCompleteTimeoutId) {
				clearTimeout(holdCompleteTimeoutId);
				holdCompleteTimeoutId = null;
			}
			if (holdIntervalId) {
				clearInterval(holdIntervalId);
				holdIntervalId = null;
			}
			const elapsed = Date.now() - holdStartTime;
			if (elapsed >= 0.85 * HOLD_DURATION_MS) {
				holdProgress = 100;
				phase = 'complete';
				hasCompletedOnce = true;
				return;
			}
			phase = 'idle';
			holdProgress = 0;
		}
	}

	const FIREFLY_DELAY_MS = 500;
	const FIREFLY_FLY_IN_MS = 600;
	const FIREFLY_FLASH_MS = 1000;
	/** Show tooltip again this long after the firefly flash ends */
	const TOOLTIP_AFTER_FLASH_MS = 500;

	/** When false, tooltip is hidden until 0.5s after firefly flash (after logging a craving). */
	let showHoldTooltip = $state(true);

	async function closeWhite(fromSuccess?: boolean, skillLeveledUp?: boolean, newSkillAfterLog?: number) {
		phase = 'idle';
		holdProgress = 0;
		dismissLoggedCelebration();
		trackFormMessage = null;
		if (fromSuccess) {
			await invalidateAll();
			showHoldTooltip = false;
			hasNewCravingForStats.set(true);
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.setItem('becom-new-craving', '1');
			}

			const canCelebrate =
				skillLeveledUp === true && typeof newSkillAfterLog === 'number' && newSkillAfterLog >= 2;

			if (canCelebrate) {
				/* New firefly index = newly unlocked step (1-based → 0-based). Clamp to SKILLS length. */
				const newIdx = Math.min(Math.max(newSkillAfterLog, 2), MAX_SKILL) - 1;
				fireflyIntroForIndex = newIdx;
				fireflyPhase = 'hidden';
				const unlockedTier = SKILLS[Math.min(newSkillAfterLog, SKILLS.length) - 1];
				celebrationFireflyColor = unlockedTier?.cardBg ?? null;
				setTimeout(() => {
					fireflyPhase = 'flying-in';
					setTimeout(() => {
						fireflyPhase = 'idle';
						showFireflyFlash = true;
						setTimeout(() => {
							showFireflyFlash = false;
							celebrationFireflyColor = null;
							fireflyIntroForIndex = null;
							fireflyPhase = 'idle';
							setTimeout(() => {
								showHoldTooltip = true;
							}, TOOLTIP_AFTER_FLASH_MS);
						}, FIREFLY_FLASH_MS);
					}, FIREFLY_FLY_IN_MS);
				}, FIREFLY_DELAY_MS);
			} else if (typeof newSkillAfterLog === 'number' && newSkillAfterLog >= 1) {
				/* Every successful log: brief dome glow so feedback isn’t tied only to leveling (fixes “no fireflies” after log). */
				fireflyIntroForIndex = null;
				fireflyPhase = 'idle';
				celebrationFireflyColor =
					SKILLS[Math.min(newSkillAfterLog, SKILLS.length) - 1]?.cardBg ?? null;
				showFireflyFlash = true;
				setTimeout(() => {
					showFireflyFlash = false;
					celebrationFireflyColor = null;
					setTimeout(() => {
						showHoldTooltip = true;
					}, TOOLTIP_AFTER_FLASH_MS);
				}, FIREFLY_FLASH_MS);
			} else {
				fireflyIntroForIndex = null;
				fireflyPhase = 'idle';
				showHoldTooltip = true;
			}
		} else {
			showHoldTooltip = true;
		}
	}

	async function handleTrackResult(result: {
		type: string;
		data?: { success?: boolean; message?: string; cravingCount?: number; skill?: number };
		error?: unknown;
	}) {
		submitting = false;
		const msg = result.data?.message ?? (result.type === 'error' && result.error instanceof Error ? result.error.message : null);
		trackFormMessage = msg ?? (result.type === 'failure' || result.type === 'error' ? 'Something went wrong. Try again.' : null);
		const payload = result.data;
		const rawSkill = payload && typeof payload === 'object' ? (payload as { skill?: unknown }).skill : undefined;
		const newSkillNum =
			typeof rawSkill === 'number' && Number.isFinite(rawSkill)
				? rawSkill
				: typeof rawSkill === 'string' && rawSkill !== ''
					? Number(rawSkill)
					: NaN;
		const successPayload =
			result.type === 'success' &&
			payload &&
			typeof payload === 'object' &&
			((payload as { success?: boolean }).success === true || Number.isFinite(newSkillNum));
		if (successPayload) {
			armPostCravingNavGuard();
			loggedCelebration.set({ active: true, exiting: false });
			const prevSkill = Number(get(page).data?.skill ?? data?.skill ?? 1) || 1;
			const newSkill = Number.isFinite(newSkillNum) ? newSkillNum : prevSkill;
			const skillLeveledUp = newSkill > prevSkill;
			setTimeout(() => {
				loggedCelebration.set({ active: true, exiting: true });
				setTimeout(() => {
					void closeWhite(true, skillLeveledUp, newSkill);
				}, WIN_STATE_FADEOUT_MS);
			}, WIN_STATE_DURATION_MS);
		} else if (result.type === 'failure' || result.type === 'error') {
			setTimeout(() => {
				void closeWhite();
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
	<h2 id="log-heading" class="page-title">{greetingLine}</h2>
	<p class="section-intro">
		This is your space. When you're ready, tap and hold. This pause is already your first step.
	</p>
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
			{#if phase === 'idle' && showHoldTooltip}
				<span
					id="hold-to-log-tooltip"
					class="hold-tooltip"
					role="tooltip"
				>
					Tap and hold to enter
				</span>
			{/if}
			<button
				type="button"
				class="hold-button"
				class:flicker={phase === 'idle'}
				class:firefly-flash={showFireflyFlash}
				style={`clip-path: url(#hold-button-drop)${showFireflyFlash && celebrationFireflyColor ? `; --celebration-tint: ${celebrationFireflyColor}` : ''}`}
				aria-describedby={phase === 'idle' && showHoldTooltip ? 'hold-to-log-tooltip' : undefined}
				onpointerdown={startHold}
				onpointerup={cancelHold}
				onpointerleave={cancelHold}
				onpointercancel={cancelHold}
				oncontextmenu={(e) => e.preventDefault()}
				aria-label={phase === 'holding' ? (isTouchDevice ? 'Screen is opening' : 'Keep holding until the Reflect screen appears') : 'Tap and hold to enter Reflect screen'}
			>
				{#if phase === 'holding'}
					<span class="hold-button-label holding-text">
						{isTouchDevice ? 'Opening…' : 'Keep holding until the Reflect screen appears'}
					</span>
				{/if}
				{#each fireflyRows as pos, i (pos.slot)}
					<span
						class="hold-button-firefly"
						class:hidden={fireflyHidden(i)}
						class:fly-in={fireflyFlyIn(i)}
						class:flash={fireflyFlash(i)}
						class:idle={fireflyIdle(i)}
						style="--dx: {pos.dx}px; --dy: {pos.dy}px; --drift-delay: {pos.delay}s; --drift-duration: {pos.duration}s; --x1: {pos.x1}px; --y1: {pos.y1}px; --x2: {pos.x2}px; --y2: {pos.y2}px; --x3: {pos.x3}px; --y3: {pos.y3}px; --firefly-fill: {pos.cardBg}; --firefly-glow: {pos.cardBg};"
						class:drift-reverse={pos.reverse}
						aria-hidden="true"
					></span>
				{/each}
				{#if showFireflyFlash}
					<span class="hold-button-flash-overlay" aria-hidden="true"></span>
				{/if}
			</button>
		</div>
	</div>

	<!-- Spacer: tree/horizon are rendered in layout (full-bleed) when on Reflect -->
	<div class="track-below-spacer" aria-hidden="true"></div>

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
	<div
		class="white-screen visible"
		class:exiting={$loggedCelebration.exiting}
		class:hide-content={$loggedCelebration.active}
		role="dialog"
		aria-label="Reflecting on a craving"
	>
		<header class="app-nav-chrome white-screen__chrome" aria-label="Dialog tools">
			<button type="button" class="close-button" onclick={() => closeWhite()} aria-label="Close">
				<span class="close-icon" aria-hidden="true">×</span>
			</button>
		</header>
		<div class="white-screen-content">
			<CravingForm
				skill={currentSkill}
				action={logCravingAction}
				noRedirect={true}
				submitLabel="Reflect"
				bind:submitting
				errorMessage={trackFormMessage}
				onResult={(result) =>
					handleTrackResult(
						result as {
							type: string;
							data?: { success?: boolean; message?: string; cravingCount?: number; skill?: number };
						}
					)}
			/>
		</div>
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
	.track-section > h2.page-title,
	.track-section > .section-intro {
		text-align: center;
	}
	.hold-intro-wrap {
		position: relative;
		z-index: 4;
		width: calc(100% - 2rem);
		max-width: 22rem;
		margin: 7rem auto 0 auto;
		aspect-ratio: 1 / 1;
	}
	.track-below-spacer {
		flex: 1;
		min-height: 18vh;
	}
	@media (max-width: 480px) {
		.hold-intro-wrap {
			max-width: 13rem;
			width: min(calc(100% - 2rem), 13rem);
			margin-top: 9rem;
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
	.track-section.holding {
		z-index: 202;
	}
	/* Dark area and green bottom fade in sync with the button (blend earlier) */
	.track-section.holding h2,
	.track-section.holding .section-intro,
	.track-section.holding .error {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
	}
	h2:not(.page-title) {
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
	.hold-tooltip {
		position: absolute;
		left: 50%;
		bottom: 100%;
		transform: translateX(-50%);
		margin-bottom: 0.75rem;
		padding: 0.5rem 0.875rem;
		white-space: nowrap;
		font-size: 14px;
		font-weight: 600;
		font-family: 'Noto Sans', sans-serif;
		color: rgba(255, 255, 255, 0.95);
		background: rgba(20, 28, 38, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
		pointer-events: none;
		animation: hold-label-fade-in 0.4s ease-out forwards, hold-tooltip-float 2.8s ease-in-out 0.5s infinite;
	}
	@keyframes hold-tooltip-float {
		0%, 100% { transform: translateX(-50%) translateY(0); }
		50% { transform: translateX(-50%) translateY(-5px); }
	}
	/* Tooltip arrow pointing down at the button */
	.hold-tooltip::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 100%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: rgba(20, 28, 38, 0.95);
		filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.12));
	}
	.hold-button-label {
		animation: hold-label-fade-in 0.4s ease-out forwards;
	}
	.hold-button-label.holding-text {
		font-size: 16px;
		font-weight: 500;
	}
	.hold-button-wrap.holding .hold-button-label {
		animation: none;
		position: relative;
		z-index: 4;
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
		/* Same 3/4 shape from clip-path; soft blue glow so ball has fuzzy luminous edge */
		background: transparent;
		border-radius: 0;
		filter: drop-shadow(0 0 20px rgba(180, 210, 255, 0.45))
			drop-shadow(0 0 40px rgba(160, 195, 240, 0.3))
			drop-shadow(0 0 60px rgba(140, 180, 230, 0.2));
		pointer-events: none;
	}
	.hold-button-halo.flicker {
		animation: fluorescent-flicker 4.5s ease-in-out infinite;
	}
	.hold-button.flicker {
		animation: fluorescent-flicker 4.5s ease-in-out infinite;
	}
	/* Glossy: prominent upper-left oval highlight + bright horizontal glow at bottom */
	.hold-button::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: 0;
		background:
			/* Elongated oval highlight, upper-left – glossy reflection */
			radial-gradient(
				ellipse 55% 28% at 20% 18%,
				rgba(255, 255, 255, 0.85) 0%,
				rgba(235, 245, 255, 0.5) 35%,
				rgba(210, 228, 255, 0.2) 55%,
				transparent 75%
			),
			/* Bright horizontal glow at bottom where ball meets ground */
			linear-gradient(
				to top,
				transparent 0%,
				transparent 45%,
				rgba(255, 255, 255, 0.35) 70%,
				rgba(255, 255, 255, 0.5) 85%,
				rgba(255, 255, 255, 0.4) 100%
			);
		pointer-events: none;
	}
	/* Soft inner glow – blue-tinted, translucent */
	.hold-button.flicker::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: 50%;
		background: radial-gradient(
			ellipse 75% 65% at 50% 50%,
			rgba(235, 248, 255, 0.4) 0%,
			rgba(210, 230, 255, 0.22) 35%,
			rgba(190, 215, 248, 0.08) 60%,
			transparent 85%
		);
		animation: light-drift 12s ease-in-out infinite;
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
		/* Lights moving inside – very obvious motion */
		0%, 100% { transform: translate(-14%, -10%) scale(1.12); opacity: 1; }
		25% { transform: translate(12%, -8%) scale(0.95); opacity: 0.9; }
		50% { transform: translate(10%, 14%) scale(1.15); opacity: 1; }
		75% { transform: translate(-10%, 10%) scale(0.92); opacity: 0.95; }
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
		/* Shape is 3/4 dome from clip-path only – no border-radius so we don’t show a full circle */
		border-radius: 0;
		overflow: hidden;
		/* Blue translucent ball: more transparent so sky shows through */
		background: radial-gradient(
			ellipse 75% 60% at 35% 30%,
			rgba(220, 238, 255, 0.42) 0%,
			rgba(200, 222, 248, 0.35) 30%,
			rgba(175, 205, 240, 0.26) 55%,
			rgba(150, 185, 225, 0.18) 75%,
			rgba(120, 160, 210, 0.12) 100%
		);
		color: #0a0c14;
		border: none;
		box-shadow:
			0 0 28px rgba(180, 210, 255, 0.28),
			0 0 56px rgba(160, 195, 240, 0.15),
			inset -0.6rem -0.6rem 2rem rgba(100, 140, 200, 0.14),
			inset 0.5rem 0.45rem 1.4rem rgba(255, 255, 255, 0.28),
			inset 0.2rem 0.2rem 0.6rem rgba(255, 255, 255, 0.35),
			inset 0 0.5rem 1.2rem rgba(255, 255, 255, 0.22);
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
	/* Fireflies inside the dome – above ::before/::after gloss so they stay visible */
	.hold-button-firefly {
		position: absolute;
		z-index: 2;
		left: 50%;
		top: 38%;
		width: 6px;
		height: 6px;
		margin-left: -3px;
		margin-top: -3px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--firefly-fill, #ffffff) 88%, white);
		box-shadow:
			0 0 6px color-mix(in srgb, var(--firefly-glow, #ffffff) 75%, transparent),
			0 0 14px color-mix(in srgb, var(--firefly-glow, #cfe8ff) 45%, transparent);
		pointer-events: none;
		opacity: 0.78;
		transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px));
	}
	/* Each firefly: own route (--x1,--y1 etc), duration (--drift-duration), phase (--drift-delay); .reverse = opposite direction */
	.hold-button-firefly.idle {
		animation: firefly-drift var(--drift-duration, 10s) cubic-bezier(0.45, 0, 0.55, 1) infinite;
		animation-delay: calc(var(--drift-delay, 0) * 1s);
	}
	.hold-button-firefly.idle.drift-reverse {
		animation-direction: reverse;
	}
	@keyframes firefly-drift {
		0%,
		100% {
			transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px));
		}
		25% {
			transform: translate(calc(-50% + var(--dx, 0px) + var(--x1, 0px)), calc(var(--dy, 0px) + var(--y1, 0px)));
		}
		50% {
			transform: translate(calc(-50% + var(--dx, 0px) + var(--x2, 0px)), calc(var(--dy, 0px) + var(--y2, 0px)));
		}
		75% {
			transform: translate(calc(-50% + var(--dx, 0px) + var(--x3, 0px)), calc(var(--dy, 0px) + var(--y3, 0px)));
		}
	}
	.hold-button-firefly.hidden {
		opacity: 0;
		transform: translate(calc(-50% + var(--dx, 0px)), calc(-24px + var(--dy, 0px))) scale(0);
		pointer-events: none;
	}
	.hold-button-firefly.fly-in {
		animation: firefly-fly-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@keyframes firefly-fly-in {
		from {
			opacity: 0;
			transform: translate(calc(-50% + var(--dx, 0px)), calc(-24px + var(--dy, 0px))) scale(0);
		}
		to {
			opacity: 0.7;
			transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px)) scale(1);
		}
	}
	.hold-button-firefly.flash {
		animation: firefly-flash 1s ease-out forwards;
	}
	.hold-button-flash-overlay {
		position: absolute;
		inset: 0;
		z-index: 3;
		border-radius: 0;
		background: radial-gradient(
			ellipse 60% 50% at 50% 40%,
			color-mix(in srgb, var(--celebration-tint, #ffffff) 55%, transparent) 0%,
			color-mix(in srgb, var(--celebration-tint, #ffffff) 22%, transparent) 42%,
			transparent 70%
		);
		pointer-events: none;
		animation: firefly-flash-overlay 1s ease-out forwards;
	}
	@keyframes firefly-flash {
		0% {
			opacity: 1;
			transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px)) scale(1.5);
			box-shadow:
				0 0 10px color-mix(in srgb, var(--firefly-glow, #fff) 95%, white),
				0 0 22px color-mix(in srgb, var(--firefly-glow, #fff) 70%, transparent),
				0 0 34px color-mix(in srgb, var(--firefly-glow, #cfe8ff) 55%, transparent);
		}
		30% {
			opacity: 1;
			transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px)) scale(1.2);
		}
		100% {
			opacity: 0.78;
			transform: translate(calc(-50% + var(--dx, 0px)), var(--dy, 0px)) scale(1);
			box-shadow:
				0 0 6px color-mix(in srgb, var(--firefly-glow, #fff) 75%, transparent),
				0 0 14px color-mix(in srgb, var(--firefly-glow, #cfe8ff) 45%, transparent);
		}
	}
	@keyframes firefly-flash-overlay {
		0% { opacity: 1; }
		100% { opacity: 0; }
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
	@media (max-width: 768px) {
		.light-spread,
		.white-spread {
			transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1);
		}
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
		background: var(--color-surface-paper);
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
	/* Below layout “Logged” overlay (see +layout .logged-celebration z-index) */
	.white-screen {
		position: fixed;
		inset: 0;
		background: var(--color-surface-paper);
		z-index: 2147483640;
		opacity: 0;
		transition: opacity 0.5s ease-out;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 0 0 calc(1rem + env(safe-area-inset-bottom, 0px)) 0;
	}
	.white-screen__chrome {
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		justify-content: flex-start;
	}
	.white-screen.visible {
		opacity: 1;
	}
	.white-screen.visible.exiting {
		opacity: 0;
		transition: opacity 0.4s ease-out;
		/* Don’t let mouseup/click fall through to the progress pill (desktop ghost navigation). */
		pointer-events: auto;
	}
	/* Hide form as soon as "Logged" is shown so it never flashes again during fade-out */
	.white-screen.visible.hide-content .white-screen-content,
	.white-screen.visible.hide-content .close-button {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.15s ease-out, visibility 0.15s ease-out;
	}
	.white-screen.visible .close-button {
		animation: white-screen-in 0.4s ease-out 0.15s both;
	}
	.white-screen.visible .white-screen-content {
		animation: white-screen-in 0.4s ease-out 0.25s both;
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
		position: relative;
		inset: auto;
		z-index: 10;
		width: var(--min-touch);
		height: var(--min-touch);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--color-brand-navy);
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		opacity: 0;
	}
	.close-button:hover {
		background: var(--color-brand-navy-hover-fill);
	}
	.close-icon {
		font-size: 2rem;
		line-height: 1;
		font-weight: 300;
	}
	.white-screen-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 1.25rem 2rem;
		padding-left: calc(1.25rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1.25rem + env(safe-area-inset-right, 0px));
		width: 100%;
		min-height: 0;
		box-sizing: border-box;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}
	.white-screen-content :global(.craving-form-inner) {
		flex: 1;
		min-height: 0;
		width: 100%;
		max-width: 28rem;
	}
</style>
