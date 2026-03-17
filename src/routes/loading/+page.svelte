<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { stars } from '$lib/starsData';

	const LOADING_DURATION_MS = 2500;
	const FADE_OUT_MS = 450;
	let exiting = $state(false);

	onMount(() => {
		const startFade = setTimeout(() => {
			exiting = true;
		}, LOADING_DURATION_MS - FADE_OUT_MS);
		const navigate = setTimeout(() => {
			if (typeof sessionStorage !== 'undefined') {
				sessionStorage.setItem('becom-from-loading', '1');
			}
			goto('/', { replaceState: true });
		}, LOADING_DURATION_MS);
		return () => {
			clearTimeout(startFade);
			clearTimeout(navigate);
		};
	});
</script>

<svelte:head>
	<title>Becom</title>
</svelte:head>

<div class="loading-screen" class:exiting role="status" aria-live="polite" aria-label="Loading">
	<div class="loading-sky" aria-hidden="true"></div>
	<div class="loading-milky" aria-hidden="true"></div>
	<div class="loading-stars" aria-hidden="true">
		{#each stars as star}
			<span
				class="loading-star loading-star--s{star.s}"
				style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
			></span>
		{/each}
	</div>
	<div class="loading-logo-wrap">
		<img src="/logo.svg" alt="Becom" class="loading-logo" width="174" height="79" />
	</div>
</div>

<style>
	.loading-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		overflow: hidden;
		opacity: 1;
		transition: opacity 0.45s ease-out;
	}
	.loading-screen.exiting {
		opacity: 0;
	}
	.loading-sky {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			#010810 0%,
			#010d18 18%,
			#011528 35%,
			#011a2e 50%,
			#011F3B 68%,
			#0a1828 85%,
			#0d1524 100%
		);
	}
	.loading-milky {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 120% 40% at 55% 25%,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.012) 40%,
			transparent 70%
		);
	}
	.loading-stars {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.loading-star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: loading-star-blink 3s ease-in-out infinite;
	}
	.loading-star--s1 {
		width: 1px;
		height: 1px;
	}
	.loading-star--s2 {
		width: 2px;
		height: 2px;
	}
	.loading-star--s3 {
		width: 3px;
		height: 3px;
	}
	@keyframes loading-star-blink {
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
	.loading-logo-wrap {
		position: relative;
		z-index: 1;
		transform-origin: 50% 50%;
		animation: loading-logo-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.loading-logo {
		display: block;
		animation: loading-logo-pulse 1.8s ease-in-out 0.9s infinite;
	}
	@keyframes loading-logo-in {
		from {
			opacity: 0;
			transform: scale(0.88);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes loading-logo-pulse {
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
</style>
