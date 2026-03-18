<script lang="ts">
	import CravingForm from '$lib/components/craving-form/CravingForm.svelte';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { levelOverride } from '$lib/stores/levelOverride';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let trackFormMessage = $state<string | null>(null);
	let showWinState = $state(false);
	let winStateExiting = $state(false);
	let submitting = $state(false);

	const level = $derived($levelOverride ?? data?.level ?? 1);

	const WIN_STATE_DURATION_MS = 1300;
	const WIN_STATE_FADEOUT_MS = 450;
	const ERROR_DISPLAY_MS = 5000;

	function handleResult(result: { type: string; data?: { success?: boolean; message?: string } }) {
		trackFormMessage = result.data?.message ?? null;
		if (result.type === 'success' && result.data?.success) {
			showWinState = true;
			hasNewCravingForStats.set(true);
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.setItem('becom-new-craving', '1');
			}
			setTimeout(() => {
				winStateExiting = true;
				setTimeout(() => window.history.back(), WIN_STATE_FADEOUT_MS);
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
	<a href="/" class="close-link" aria-label="Back to Reflect">×</a>
	<div class="craving-content">
		<CravingForm
			level={level}
			action="?/logCraving"
			noRedirect={true}
			submitLabel="Reflect it"
			bind:submitting
			errorMessage={trackFormMessage}
			onResult={(result) => handleResult(result as { type: string; data?: { success?: boolean; message?: string } })}
		/>
	</div>
</div>

{#if showWinState}
	<div class="win-state" class:exiting={winStateExiting} role="status" aria-live="polite">
		<span class="win-check">✓</span>
		<p class="win-text">Logged</p>
	</div>
{/if}

<style>
	.craving-page {
		position: fixed;
		inset: 0;
		background: #fff;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: 1rem 1.25rem;
		padding-top: calc(1rem + env(safe-area-inset-top, 0px));
		padding-right: calc(1.25rem + env(safe-area-inset-right, 0px));
		padding-left: calc(1.25rem + env(safe-area-inset-left, 0px));
		padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
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
		position: absolute;
		top: calc(1rem + env(safe-area-inset-top, 0px));
		right: calc(1rem + env(safe-area-inset-right, 0px));
		width: var(--min-touch);
		height: var(--min-touch);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #011f3b;
		font-size: 2rem;
		line-height: 1;
		text-decoration: none;
		border-radius: 0.5rem;
		-webkit-tap-highlight-color: transparent;
	}
	.close-link:hover {
		background: rgba(1, 31, 59, 0.08);
	}
	.craving-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 1rem 0 2rem;
		min-height: 0;
		width: 100%;
		max-width: 22rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
	.craving-content :global(.craving-form-inner) {
		width: 100%;
		max-width: 100%;
		flex: 1;
		min-height: 0;
	}
	.win-state {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		animation: win-fade 0.3s ease;
	}
	.win-state.exiting {
		opacity: 0;
		transition: opacity 0.4s ease-out;
		pointer-events: none;
	}
	@keyframes win-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.win-check {
		width: 4rem;
		height: 4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #011f3b;
		color: #fff;
		font-size: 2rem;
		font-weight: 600;
		border-radius: 50%;
	}
	.win-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: #011f3b;
		margin: 0;
	}
</style>
