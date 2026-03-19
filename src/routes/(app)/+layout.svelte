<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { loggedCelebration } from '$lib/stores/loggedCelebration';
	import { reflectHoldState } from '$lib/stores/reflectHold';
	import { stars } from '$lib/starsData';
	import ReflectProgressPill from '$lib/components/ReflectProgressPill.svelte';

	let { data, children }: { data: { skill?: number; progress?: { current: number; required: number; label: string } }; children: import('svelte').Snippet } = $props();
	let shootingStarRun = $state(false);
	let shootingStarTimeout: ReturnType<typeof setTimeout> | null = null;
	let landing = $state(false);
	/** Block bottom bar briefly after /craving → / so the same tap doesn’t hit the Skills link (ghost click). */
	let bottomBarNavFrozen = $state(false);
	let bottomBarFreezeTimer: ReturnType<typeof setTimeout> | null = null;

	afterNavigate(({ from, to }) => {
		if (from?.url.pathname === '/craving' && to?.url.pathname === '/') {
			if (bottomBarFreezeTimer) clearTimeout(bottomBarFreezeTimer);
			bottomBarNavFrozen = true;
			bottomBarFreezeTimer = setTimeout(() => {
				bottomBarNavFrozen = false;
				bottomBarFreezeTimer = null;
			}, 1200);
		}
	});

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

</script>

<svg aria-hidden="true" focusable="false" style="position: absolute; width: 0; height: 0; overflow: hidden;">
	<defs>
		<clipPath id="hold-button-drop" clipPathUnits="objectBoundingBox">
			<!-- Top 3/4 of circle: arc over the top, flat chord at bottom (y=0.75) -->
			<path d="M 0.067 0.75 L 0.933 0.75 A 0.5 0.5 0 1 0 0.067 0.75 Z" />
		</clipPath>
	</defs>
</svg>
<div
	class="cravings-shell"
	class:landing
	class:craving-route={$page.url.pathname === '/craving'}
>
	{#if $page.url.pathname !== '/craving' && $page.url.pathname !== '/stats' && $page.url.pathname !== '/settings' && !($page.url.pathname === '/' && $reflectHoldState?.phase === 'complete')}
		<header class="app-nav-chrome shell-top-chrome" aria-label="Account">
			<form method="POST" action="/sign-out" class="exit-button-form">
				<button type="submit" class="exit-button" aria-label="Sign out">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<g clip-path="url(#sign-out-clip)">
							<path d="M2 21V3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H7C7.55228 2 8 1.55228 8 1C8 0.447715 7.55228 0 7 0H3C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3L0 21C0 21.7956 0.31607 22.5587 0.87868 23.1213C1.44129 23.6839 2.20435 24 3 24H7C7.55228 24 8 23.5523 8 23C8 22.4477 7.55228 22 7 22H3C2.73478 22 2.48043 21.8946 2.29289 21.7071C2.10536 21.5196 2 21.2652 2 21Z" fill="currentColor"/>
							<path d="M23.1231 9.87839L19.2441 5.99939C18.8537 5.60892 18.2206 5.60892 17.8301 5.99939C17.4397 6.38985 17.4397 7.02292 17.8301 7.41339L21.3871 10.9704L5.99835 10.9976C5.44676 10.9986 5.00012 11.446 5.00012 11.9976C5.00012 12.5506 5.44891 12.9986 6.00189 12.9976L21.4431 12.9704L17.8281 16.5854C17.4377 16.9759 17.4377 17.6089 17.8281 17.9994C18.2186 18.3899 18.8517 18.3899 19.2421 17.9994L23.1211 14.1204C23.6838 13.5581 24.0001 12.7953 24.0005 11.9998C24.0009 11.2043 23.6853 10.4412 23.1231 9.87839Z" fill="currentColor"/>
						</g>
						<defs>
							<clipPath id="sign-out-clip">
								<rect width="24" height="24" fill="white"/>
							</clipPath>
						</defs>
					</svg>
				</button>
			</form>
		</header>
	{/if}
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
	<main class="app-page screen-content">
		<div
			class="page-transition-container"
			class:page-transition-container--craving={$page.url.pathname === '/craving'}
		>
			{#if $page.url.pathname === '/stats' || $page.url.pathname === '/settings'}
				<!-- Sky + stars sit *between* shell gradient and scroll content so stars stay visible -->
				<div class="page-transition-sky-fill" aria-hidden="true"></div>
				<div class="milky-band milky-band--insights" aria-hidden="true"></div>
				<div class="stars stars--insights" aria-hidden="true">
					{#each stars as star}
						<span
							class="star star--s{star.s}"
							style="left: {star.x}%; top: {star.y}%; animation-delay: {star.d}s; --brightness: {star.b};"
						></span>
					{/each}
				</div>
				<div class="shooting-star shooting-star--insights" class:run={shootingStarRun} aria-hidden="true">
					<span class="shooting-star-streak"></span>
				</div>
			{/if}
			{#key $page.url.pathname}
				<div
					class="page-transition-wrap"
					class:page-transition-wrap--craving={$page.url.pathname === '/craving'}
				>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	{#if $page.url.pathname !== '/craving'}
		<div
			class="bottom-bar-outer"
			class:bottom-bar-outer--nav-frozen={bottomBarNavFrozen || $loggedCelebration.active}
		>
			<div
				class="bottom-bar reflect-progress-bar"
				class:active={$page.url.pathname === '/'}
				aria-hidden={$page.url.pathname !== '/'}
			>
				<ReflectProgressPill skill={data?.skill} progress={data?.progress} />
			</div>
		</div>
	{/if}

	{#if $loggedCelebration.active}
		<div
			class="logged-celebration"
			class:logged-celebration--exiting={$loggedCelebration.exiting}
			role="status"
			aria-live="polite"
			aria-label="Craving logged"
		>
			<span class="logged-celebration__check" aria-hidden="true">✓</span>
			<p class="logged-celebration__text">Logged</p>
		</div>
	{/if}
</div>

<style>
	/* Top row: safe area + exit — not part of main scroll */
	.shell-top-chrome {
		position: relative;
		z-index: 99;
		justify-content: flex-end;
		padding-left: calc(1rem + env(safe-area-inset-left, 0px));
		padding-right: calc(1rem + env(safe-area-inset-right, 0px));
		pointer-events: none;
	}
	.shell-top-chrome .exit-button-form {
		pointer-events: auto;
	}
	.exit-button-form {
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	.exit-button {
		min-width: var(--min-touch);
		min-height: var(--min-touch);
		width: var(--min-touch);
		height: var(--min-touch);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		color: var(--text);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		padding: 0;
	}
	.exit-button svg {
		display: block;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		opacity: 0.8;
	}
	.exit-button:hover svg {
		opacity: 1;
	}
	.exit-button:hover {
		background: var(--surface-hover-light);
	}
	.cravings-shell.craving-route {
		background: var(--color-surface-paper);
	}
	.cravings-shell {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		max-height: 100dvh;
		/* No overflow: hidden so Reflect tree/horizon (sibling of main) can span full width */
		/* Deep night sky — see design-tokens.css */
		background: var(--gradient-sky-app);
		/* Space for progress pill + safe area */
		padding-bottom: calc(4rem + 1rem + env(safe-area-inset-bottom, 0px));
	}
	:global(body.hold-active) .bottom-bar-outer {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.2s ease-out, visibility 0.2s ease-out;
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
		background: var(--gradient-horizon-land);
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
		background: var(--gradient-horizon-glow);
	}
	.reflect-bg-layer .reflect-bg-silhouette {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 36vh;
		min-height: 130px;
		z-index: 2;
		background: var(--color-silhouette-base);
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
		pointer-events: none;
		background: var(--gradient-milky-band);
	}
	/* Insights / Me: layers inside page-transition-container (above sky-fill, below scroll content) */
	.milky-band--insights,
	.stars--insights,
	.shooting-star--insights {
		position: absolute;
		inset: 0;
		z-index: 1;
	}
	.stars {
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
	/* /craving: fixed “Logged” overlay must not be clipped by overflow:hidden */
	.page-transition-container--craving {
		overflow: visible;
	}
	.page-transition-sky-fill {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: var(--gradient-sky-app);
	}
	.page-transition-wrap {
		position: absolute;
		inset: 0;
		z-index: 2;
		width: 100%;
		min-height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	.page-transition-wrap--craving {
		overflow: visible;
		-webkit-overflow-scrolling: auto;
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
			z-index: 2;
			min-height: 0;
			overflow-y: visible;
		}
		.bottom-bar-outer {
			bottom: calc(4rem + env(safe-area-inset-bottom, 0px));
		}
		/* Sit the pill a bit higher on large screens (mobile keeps 1.75rem) */
		.reflect-progress-bar {
			bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
		}
	}
	.logged-celebration {
		position: fixed;
		inset: 0;
		z-index: 2147483000;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: #fff;
		animation: logged-celebration-in 0.3s ease;
		pointer-events: auto;
		touch-action: none;
	}
	.logged-celebration--exiting {
		opacity: 0;
		transition: opacity 0.4s ease-out;
		pointer-events: none;
	}
	@keyframes logged-celebration-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.logged-celebration__check {
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
	.logged-celebration__text {
		font-size: 1.25rem;
		font-weight: 600;
		color: #011f3b;
		margin: 0;
	}
	.bottom-bar-outer--nav-frozen {
		pointer-events: none;
	}
	.bottom-bar-outer {
		position: fixed;
		/* Mobile: sit a bit lower; desktop overrides in min-width: 768px */
		bottom: calc(2.65rem + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 2rem);
		max-width: 400px;
		min-height: 5rem;
		z-index: 100;
		pointer-events: none;
	}
	.bottom-bar-outer > .active {
		pointer-events: auto;
	}
	.reflect-progress-bar {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: calc(1.35rem + env(safe-area-inset-bottom, 0px));
		width: 100%;
		max-width: 400px;
		display: flex;
		align-items: stretch;
		justify-content: center;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition: opacity 0.22s ease-out, visibility 0.22s ease-out;
	}
	.reflect-progress-bar.active {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}
</style>
