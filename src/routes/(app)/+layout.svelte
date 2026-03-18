<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { hasNewCravingForStats } from '$lib/stores/newCraving';
	import { reflectHoldState } from '$lib/stores/reflectHold';
	import { stars } from '$lib/starsData';

	let { children }: { children: import('svelte').Snippet } = $props();
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
		{ href: '/', label: 'Reflect', path: '/', icon: 'reflect' },
		{ href: '/stats', label: 'Insights', path: '/stats', showNewBadge: true, icon: 'insights' },
		{ href: '/settings', label: 'Me', path: '/settings', icon: 'me' }
	];
</script>

<svg aria-hidden="true" focusable="false" style="position: absolute; width: 0; height: 0; overflow: hidden;">
	<defs>
		<clipPath id="hold-button-drop" clipPathUnits="objectBoundingBox">
			<!-- Top 3/4 of circle: arc over the top, flat chord at bottom (y=0.75) -->
			<path d="M 0.067 0.75 L 0.933 0.75 A 0.5 0.5 0 1 0 0.067 0.75 Z" />
		</clipPath>
	</defs>
</svg>
<div class="cravings-shell" class:landing class:craving-route={$page.url.pathname === '/craving'}>
	{#if $page.url.pathname === '/'}
		<!-- Tree/horizon full-bleed: rendered here so it's never inside the scroll container -->
		<div
			class="reflect-bg-layer"
			class:holding={$reflectHoldState.phase === 'holding' || $reflectHoldState.phase === 'complete'}
			aria-hidden="true"
			style={$reflectHoldState.phase !== 'idle' ? `--hold-progress: ${$reflectHoldState.phase === 'complete' ? 100 : $reflectHoldState.holdProgress}` : ''}
		>
			<div class="reflect-bg-track-below">
				<div class="reflect-bg-grass"></div>
			</div>
			<div class="reflect-bg-stars">
				{#each stars as star}
					<span
						class="reflect-bg-star reflect-bg-star--s{star.s}"
						style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
					></span>
				{/each}
			</div>
			<div class="reflect-bg-horizon"></div>
			<div class="reflect-bg-silhouette">
				<svg class="reflect-bg-silhouette-svg" viewBox="0 0 400 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
					<polygon points="0,200 0,132 25,145 50,120 80,132 110,112 140,125 170,105 200,118 230,102 260,114 290,98 320,110 350,94 380,104 400,100 400,200" fill="#051a12" />
					<polygon points="0,200 0,152 30,162 60,148 95,155 130,138 165,146 200,128 235,138 270,124 305,134 340,120 370,128 400,126 400,200" fill="#041510" />
					<polygon points="0,200 15,168 45,174 75,160 108,168 140,152 175,160 208,144 242,154 275,140 308,148 342,136 375,144 400,142 400,200" fill="#031812" />
					<polygon points="0,200 22,176 55,182 88,168 120,174 155,160 190,166 225,152 260,160 295,148 330,156 365,144 400,152 400,200" fill="#030d0a" />
					<polygon points="0,200 28,180 62,184 95,172 128,178 162,166 198,172 232,162 268,168 302,158 338,164 400,170 400,200" fill="#020a08" />
					<polygon points="0,200 0,188 80,191 160,187 240,190 320,188 400,191 400,200" fill="#031812" fill-opacity="0.7" />
				</svg>
			</div>
		</div>
	{/if}
	{#if $page.url.pathname === '/stats' || $page.url.pathname === '/settings'}
		<!-- Stars background on Insights and Me (Reflect has its own in reflect-bg-layer) -->
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
	{/if}

	<main class="app-page screen-content">
		<div class="page-transition-container">
			{#key $page.url.pathname}
				<div class="page-transition-wrap" in:fade={{ duration: 220 }} out:fade={{ duration: 160 }}>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	{#if $page.url.pathname !== '/craving'}
	<nav class="bottom-nav" aria-label="Main">
		{#each navItems as item}
			<a
				href={item.href}
				class="nav-item"
				class:active={$page.url.pathname === item.path}
				aria-label={item.showNewBadge && $hasNewCravingForStats ? `${item.label} — new craving logged` : item.label}
			>
				<span class="nav-icon" aria-hidden="true" style="opacity: {$page.url.pathname === item.path ? 1 : 0.55};">
					<img
						src="/icons/nav/icon_{item.icon}_{$page.url.pathname === item.path ? 'selected' : 'unselected'}.svg"
						alt=""
						width="24"
						height="24"
						class="nav-icon-img"
					/>
				</span>
				<span class="nav-label">{item.label}</span>
				{#if item.showNewBadge && $hasNewCravingForStats}
					<span class="nav-badge" aria-hidden="true"></span>
				{/if}
			</a>
		{/each}
	</nav>
	{/if}
</div>

<style>
	:global(body.hold-active) .bottom-nav {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
	}
	.cravings-shell.craving-route {
		background: #fff;
	}
	.cravings-shell {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		max-height: 100dvh;
		/* No overflow: hidden so Reflect tree/horizon (sibling of main) can span full width */
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
	/* Reflect page: tree/horizon full-bleed (sibling of main, so never clipped) */
	.reflect-bg-layer {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: visible;
	}
	.reflect-bg-layer .reflect-bg-track-below {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 28vh;
		min-height: 100px;
		z-index: 1;
		overflow: hidden;
		clip-path: polygon(
			0% 100%, 0% 58%, 5% 52%, 10% 56%, 15% 50%, 20% 54%, 25% 49%, 30% 53%, 35% 48%,
			40% 52%, 45% 47%, 50% 51%, 55% 49%, 60% 53%, 65% 48%, 70% 52%, 75% 50%, 80% 54%,
			85% 49%, 90% 53%, 95% 51%, 100% 55%, 100% 100%
		);
		background: linear-gradient(to top, #031a20 0%, #041e24 22%, #052228 45%, #051D26 70%, #041b22 100%);
	}
	.reflect-bg-layer .reflect-bg-grass {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to top, transparent 0%, transparent 35%, rgba(0, 30, 28, 0.15) 100%),
			repeating-linear-gradient(88deg, transparent 0, transparent 2px, rgba(0, 48, 46, 0.32) 2px, rgba(0, 48, 46, 0.32) 3px),
			repeating-linear-gradient(92deg, transparent 0, transparent 3px, rgba(0, 44, 42, 0.22) 3px, rgba(0, 44, 42, 0.22) 4px),
			repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(0, 40, 38, 0.14) 4px, rgba(0, 40, 38, 0.14) 5px),
			repeating-linear-gradient(86deg, transparent 0, transparent 5px, rgba(0, 42, 40, 0.1) 5px, rgba(0, 42, 40, 0.1) 6px);
	}
	.reflect-bg-layer .reflect-bg-stars {
		position: absolute;
		inset: 0;
		z-index: 0;
		overflow: hidden;
	}
	.reflect-bg-layer .reflect-bg-star {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.95);
		opacity: var(--brightness, 0.9);
		animation: reflect-bg-star-blink 3s ease-in-out infinite;
	}
	.reflect-bg-layer .reflect-bg-star--s1 { width: 1px; height: 1px; }
	.reflect-bg-layer .reflect-bg-star--s2 { width: 2px; height: 2px; }
	.reflect-bg-layer .reflect-bg-star--s3 { width: 3px; height: 3px; }
	@keyframes reflect-bg-star-blink {
		0%, 100% { opacity: calc(var(--brightness, 0.9) * 0.3); transform: scale(1); }
		50% { opacity: var(--brightness, 0.9); transform: scale(1.15); }
	}
	.reflect-bg-layer .reflect-bg-horizon {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 34vh;
		z-index: 1;
		background: linear-gradient(to top, rgba(0, 55, 60, 0.55) 0%, rgba(0, 70, 72, 0.25) 30%, rgba(0, 50, 55, 0.08) 55%, transparent 85%);
	}
	.reflect-bg-layer .reflect-bg-silhouette {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 36vh;
		min-height: 130px;
		z-index: 2;
		background: #041210;
	}
	.reflect-bg-layer .reflect-bg-silhouette-svg {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		object-position: bottom center;
	}
	.reflect-bg-layer.holding .reflect-bg-track-below,
	.reflect-bg-layer.holding .reflect-bg-horizon,
	.reflect-bg-layer.holding .reflect-bg-silhouette {
		opacity: clamp(0, (50 - var(--hold-progress, 0)) / 45, 1);
		transition: opacity 0.28s ease-out;
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
		z-index: 0;
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
		z-index: 0;
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
		z-index: 0;
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
		position: relative;
		min-height: 0;
		z-index: 1;
	}
	.page-transition-container {
		position: absolute;
		inset: 0;
		width: 100%;
		min-height: 100%;
		overflow: hidden;
	}
	.page-transition-wrap {
		position: absolute;
		inset: 0;
		width: 100%;
		min-height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	@media (min-width: 768px) {
		.cravings-shell {
			height: auto;
			min-height: 100vh;
			max-height: none;
		}
		/* Keep tree/horizon fixed to viewport on Reflect when body scrolls */
		.reflect-bg-layer {
			position: fixed;
			inset: 0;
		}
		.screen-content {
			flex: 1 1 auto;
			min-height: auto;
		}
		.page-transition-container {
			position: relative;
			min-height: 100vh;
		}
		.page-transition-wrap {
			position: relative;
			min-height: 0;
			overflow-y: visible;
		}
	}
	.bottom-nav {
		position: fixed;
		bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 2rem);
		max-width: 400px;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		padding: 8px 32px;
		background: rgba(45, 50, 60, 0.4);
		backdrop-filter: blur(20px) saturate(1.2);
		-webkit-backdrop-filter: blur(20px) saturate(1.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 9999px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
		z-index: 100;
	}
	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		min-height: var(--min-touch);
		padding: 2px 4px;
		color: rgba(255, 255, 255, 0.55);
		text-decoration: none;
		font-weight: 500;
		font-size: 14px;
		border-radius: 0.5rem;
		transition: color 0.32s ease-out, font-weight 0.28s ease-out, transform 0.25s ease-out;
	}
	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
		transition: opacity 0.32s ease-out, transform 0.28s ease-out;
	}
	.nav-item.active .nav-icon {
		transform: scale(1.04);
	}
	.nav-icon-img {
		display: block;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}
	.nav-item:hover {
		color: rgba(255, 255, 255, 0.85);
	}
	.nav-item.active {
		color: #ffffff;
		font-weight: 600;
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
	@media (min-width: 768px) {
		.nav-icon-img {
			width: 32px;
			height: 32px;
		}
	}
</style>
