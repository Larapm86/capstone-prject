<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { stars } from '$lib/starsData';

	let { children } = $props();
	let shootingStarRun = $state(false);
	let shootingStarTimeout: ReturnType<typeof setTimeout> | null = null;
	let landing = $state(false);

	function scheduleShootingStar() {
		const delay = 8000 + Math.random() * 22000;
		shootingStarTimeout = setTimeout(() => {
			shootingStarRun = true;
			shootingStarTimeout = setTimeout(() => {
				shootingStarRun = false;
				scheduleShootingStar();
			}, 600);
		}, delay);
	}

	onMount(() => {
		const clearShootingStar = () => {
			if (shootingStarTimeout) {
				clearTimeout(shootingStarTimeout);
				shootingStarTimeout = null;
			}
		};
		scheduleShootingStar();
		if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('becom-from-loading')) {
			sessionStorage.removeItem('becom-from-loading');
			landing = true;
			const t = setTimeout(() => {
				landing = false;
			}, 650);
			return () => {
				clearTimeout(t);
				clearShootingStar();
			};
		}
		return clearShootingStar;
	});

	const navItems = [
		{ href: '/', label: 'Reflect', path: '/' },
		{ href: '/stats', label: 'Insights', path: '/stats', showNewBadge: true },
		{ href: '/settings', label: 'Settings', path: '/settings' }
	];
</script>

<div class="cravings-shell" class:landing>
	<div class="milky-band" aria-hidden="true"></div>
	<div class="stars" aria-hidden="true">
		{#each stars as star}
			<span
				class="star star--s{star.s}"
				style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
			></span>
		{/each}
	</div>
	<div class="shooting-star" class:run={shootingStarRun} aria-hidden="true">
		<span class="shooting-star-streak"></span>
	</div>
	<img src="/logo.svg" alt="Becom" class="logo" width="174" height="79" />

	<main class="app-page screen-content">
		{@render children()}
	</main>

	<nav class="bottom-nav" aria-label="Main">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.path}
				aria-label={item.showNewBadge && $hasNewCravingForStats ? `${item.label} — new craving logged` : item.label}
			>
				<span class="nav-label">{item.label}</span>
				{#if item.showNewBadge && $hasNewCravingForStats}
					<span class="nav-badge" aria-hidden="true"></span>
				{/if}
			</a>
		{/each}
	</nav>
</div>

<style>
	:global(body.hold-active) .bottom-nav,
	:global(body.hold-active) .logo {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
	}
	.cravings-shell {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		max-height: 100dvh;
		overflow: hidden;
		/* Deep night sky: darkest at top, lighter toward horizon, hint of purple */
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
		/* Space for floating nav: nav height + gap below nav + safe area */
		padding-bottom: calc(4rem + 1rem + 1rem + env(safe-area-inset-bottom, 0px));
	}
	.cravings-shell.landing {
		animation: cravings-land-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	@keyframes cravings-land-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.milky-band {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		/* Subtle milky way band: diagonal brighter streak */
		background: radial-gradient(
			ellipse 120% 40% at 55% 25%,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.012) 40%,
			transparent 70%
		);
	}
	.stars {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		overflow: hidden;
	}
	.star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: star-blink 3s ease-in-out infinite;
	}
	.star--s1 {
		width: 1px;
		height: 1px;
	}
	.star--s2 {
		width: 2px;
		height: 2px;
	}
	.star--s3 {
		width: 3px;
		height: 3px;
	}
	@keyframes star-blink {
		0%, 100% { opacity: calc(var(--brightness, 0.9) * 0.3); transform: scale(1); }
		50% { opacity: var(--brightness, 0.9); transform: scale(1.15); }
	}
	.shooting-star {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		overflow: hidden;
	}
	.shooting-star-streak {
		position: absolute;
		left: 0;
		top: 18%;
		width: 80px;
		height: 2px;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 40%, rgba(255, 255, 255, 0.95) 100%);
		border-radius: 1px;
		opacity: 0;
	}
	.shooting-star.run .shooting-star-streak {
		animation: shooting-star 0.5s ease-out forwards;
	}
	@keyframes shooting-star {
		0% {
			opacity: 0;
			transform: translate(20vw, 0);
		}
		15% {
			opacity: 0;
			transform: translate(24vw, 0);
		}
		20% {
			opacity: 1;
			transform: translate(26vw, 0);
		}
		50% {
			opacity: 1;
			transform: translate(50vw, -12px);
		}
		80% {
			opacity: 1;
			transform: translate(74vw, 8px);
		}
		88% {
			opacity: 0;
			transform: translate(78vw, 10px);
		}
		100% {
			opacity: 0;
			transform: translate(80vw, 10px);
		}
	}
	.screen-content {
		flex: 1;
	}
	.bottom-nav {
		position: fixed;
		bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 2rem);
		max-width: var(--max-width);
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		gap: 0.25rem;
		padding: 0.5rem;
		background: rgba(45, 50, 60, 0.4);
		backdrop-filter: blur(20px) saturate(1.2);
		-webkit-backdrop-filter: blur(20px) saturate(1.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 9999px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		z-index: 100;
	}
	.nav-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--min-touch);
		padding: 0.5rem 0.25rem;
		color: rgba(255, 255, 255, 0.55);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.9375rem;
		border-radius: 0.5rem;
		transition: color 0.2s ease;
	}
	.nav-item:hover {
		color: rgba(255, 255, 255, 0.85);
	}
	.nav-item.active {
		color: #ffffff;
		font-weight: 600;
	}
	.nav-item:first-child {
		border-radius: 9999px 0 0 9999px;
	}
	.nav-item:last-child {
		border-radius: 0 9999px 9999px 0;
	}
	.nav-label {
		white-space: nowrap;
	}
	.nav-item {
		position: relative;
	}
	.nav-badge {
		position: absolute;
		top: 0.35rem;
		right: 0.35rem;
		width: 0.5rem;
		height: 0.5rem;
		background: #fff;
		border-radius: 50%;
	}
	.nav-item:first-child .nav-badge {
		right: 0.25rem;
	}
	.nav-item:last-child .nav-badge {
		right: 0.35rem;
	}
</style>
