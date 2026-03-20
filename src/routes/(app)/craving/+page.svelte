<script lang="ts">
	import { base } from '$app/paths';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import CravingForm from '$lib/components/craving-form/CravingForm.svelte';
	import { dismissLoggedCelebration, loggedCelebration } from '$lib/stores/loggedCelebration';
	import { armPostCravingNavGuard } from '$lib/stores/postCravingNavGuard';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { skillOverride } from '$lib/stores/skillOverride';
	import type { ActionData, PageData } from './$types';

	/** Home page reads this to run the same firefly / tooltip sequence as after logging on Reflect. */
	const CRAVING_RETURN_KEY = 'becom-craving-return';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let trackFormMessage = $state<string | null>(null);
	let submitting = $state(false);

	const currentSkill = $derived($skillOverride ?? data?.skill ?? 1);

	/** Full-opacity “Logged” on /craving before navigating home */
	const WIN_STATE_DURATION_MS = 1300;
	/** Keep “Logged” visible on Reflect after navigation, then fade out */
	const POST_LOG_HOME_HOLD_MS = 900;
	const CELEBRATION_FADEOUT_MS = 450;
	const ERROR_DISPLAY_MS = 5000;

	async function handleResult(result: {
		type: string;
		data?: { success?: boolean; message?: string; skill?: number };
	}) {
		/* Fresh layout skill (merged $page.data), not a stale prop snapshot */
		const prevSkill = Number(get(page).data?.skill ?? data?.skill ?? 1) || 1;
		trackFormMessage = result.data?.message ?? null;
		const payload = result.data;
		const ok =
			result.type === 'success' &&
			payload &&
			typeof payload === 'object' &&
			((payload as { success?: boolean }).success === true ||
				typeof (payload as { skill?: number }).skill === 'number');
		if (ok) {
			const newSkill = (payload as { skill?: number }).skill ?? prevSkill;
			/* Layout-owned overlay survives this page unmounting on goto('/') */
			loggedCelebration.set({ active: true, exiting: false });
			hasNewCravingForStats.set(true);
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.setItem('becom-new-craving', '1');
				sessionStorage.setItem(
					CRAVING_RETURN_KEY,
					JSON.stringify({
						skillLeveledUp: newSkill > prevSkill,
						newSkillAfterLog: newSkill
					})
				);
			}
			setTimeout(async () => {
				armPostCravingNavGuard();
				try {
					await invalidateAll();
					await goto('/', { replaceState: true });
				} catch (e) {
					console.warn('after log craving navigation', e);
				}
				/* Stay full-opacity on home (don’t clear in finally — that removed the overlay instantly). */
				setTimeout(() => {
					loggedCelebration.set({ active: true, exiting: true });
					setTimeout(() => dismissLoggedCelebration(), CELEBRATION_FADEOUT_MS);
				}, POST_LOG_HOME_HOLD_MS);
			}, WIN_STATE_DURATION_MS);
		} else if (result.type === 'failure') {
			setTimeout(() => {
				trackFormMessage = null;
			}, ERROR_DISPLAY_MS);
		}
	}
</script>

<svelte:head>
	<title>Becom — Log a craving</title>
</svelte:head>

<div class="craving-page craving-page--enter">
	<header class="app-nav-chrome craving-page__chrome" aria-label="Page tools">
		<a href="{base}/" class="close-link" aria-label="Back to Reflect">×</a>
	</header>
	<div class="craving-content">
		<CravingForm
			skill={currentSkill}
			action="?/logCraving"
			noRedirect={true}
			submitLabel="Reflect"
			bind:submitting
			errorMessage={trackFormMessage}
			onResult={(result) =>
				handleResult(
					result as {
						type: string;
						data?: { success?: boolean; message?: string; skill?: number; cravingCount?: number };
					}
				)}
		/>
	</div>
</div>

<style>
	.craving-page {
		position: fixed;
		inset: 0;
		background: #fff;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 0 0 calc(1rem + env(safe-area-inset-bottom, 0px)) 0;
	}
	.craving-page__chrome {
		padding-left: calc(1.25rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1.25rem + env(safe-area-inset-right, 0px));
	}
	/* Smooth entrance on mobile */
	.craving-page--enter {
		animation: craving-page-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@keyframes craving-page-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.craving-page--enter .close-link {
		animation: craving-item-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
	}
	.craving-page--enter .craving-content {
		animation: craving-item-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.14s both;
	}
	@keyframes craving-item-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.close-link {
		position: relative;
		inset: auto;
		z-index: 1;
		width: var(--min-touch);
		height: var(--min-touch);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-brand-navy);
		font-size: 2rem;
		line-height: 1;
		text-decoration: none;
		border-radius: var(--radius-sm);
		-webkit-tap-highlight-color: transparent;
	}
	.close-link:hover {
		background: var(--color-brand-navy-hover-fill);
	}
	.craving-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;
		padding: 0 0 2rem;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
		width: 100%;
		max-width: min(56rem, 100%);
		margin: 0 auto;
		box-sizing: border-box;
		padding-left: calc(1.5rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1.5rem + env(safe-area-inset-right, 0px));
	}
	.craving-content :global(.craving-form-inner) {
		width: 100%;
		max-width: 100%;
		flex: 1;
		min-height: 0;
	}
</style>


