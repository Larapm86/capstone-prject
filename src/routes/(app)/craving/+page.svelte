<script lang="ts">
	import { enhance } from '$app/forms';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let trackFormMessage = $state<string | null>(null);
	let showWinState = $state(false);

	const WIN_STATE_DURATION_MS = 1600;
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
				window.history.back();
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

<div class="craving-page">
	<a href="/" class="close-link" aria-label="Back to Reflect">×</a>
	<div class="craving-content">
		<form
			method="post"
			action="?/logCraving"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data) {
						handleResult({ type: result.type, data: result.data as { success?: boolean; message?: string } });
					} else if (result.type === 'failure' && result.data) {
						handleResult({ type: result.type, data: result.data as { message?: string } });
					}
				};
			}}
			class="craving-form"
		>
			<input type="hidden" name="noRedirect" value="1" />
			<label for="craving-text" class="craving-label">What are you craving?</label>
			<input
				id="craving-text"
				type="text"
				name="text"
				placeholder="e.g. chocolate, chips"
				inputmode="text"
				autocomplete="off"
				maxlength={500}
				class="craving-input"
			/>
			{#if trackFormMessage}
				<p class="craving-error" role="alert">{trackFormMessage}</p>
			{/if}
			<button type="submit" class="craving-submit">Reflect it</button>
		</form>
	</div>
</div>

{#if showWinState}
	<div class="win-state" role="status" aria-live="polite">
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
		padding: 1rem;
		padding-top: calc(1rem + env(safe-area-inset-top, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
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
		align-items: center;
		justify-content: center;
		padding: 2rem 0;
	}
	.craving-form {
		width: 100%;
		max-width: 24rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.craving-label {
		font-size: 1rem;
		font-weight: 600;
		color: #011f3b;
	}
	.craving-input {
		font-size: 16px;
		padding: 0.875rem 1rem;
		background: rgba(1, 31, 59, 0.06);
		color: #011f3b;
		border: 1px solid rgba(1, 31, 59, 0.2);
		border-radius: 0.75rem;
		font-family: var(--font-sans);
	}
	.craving-input::placeholder {
		color: rgba(1, 31, 59, 0.5);
	}
	.craving-error {
		color: #c00;
		font-size: 0.875rem;
		margin: 0;
	}
	.craving-submit {
		min-height: var(--min-touch);
		padding: 0.75rem 1.5rem;
		background: #011f3b;
		color: #fff;
		border: none;
		border-radius: 0.75rem;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
	}
	.craving-submit:hover {
		opacity: 0.95;
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
